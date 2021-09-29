import varint from "varint"

import type { Type } from "../types/index.js"
import type { Value } from "../values/index.js"
import type { Schema } from "../schema/schema.js"

import {
	forEntries,
	forKeys,
	getIndexOfKey,
	getKeyAtIndex,
	mapKeys,
} from "../keys.js"
import { signalInvalidType, validateURI } from "../utils.js"
import { version } from "../version.js"

import { decodeLiteral, decodeString } from "./decodeLiteral.js"
import { encodeLiteral } from "./encodeLiteral.js"
import {
	decodeUnsignedVarint,
	DecodeState,
	EncodeState,
	encodeString,
	encodeUnsignedVarint,
	makeEncodeState,
} from "./utils.js"

type Types = { [key in string]: Type }

export class Instance<S extends Types> {
	private constructor(
		public readonly schema: Schema<S>,
		private readonly offsets: { [K in keyof S]: number[] },
		private readonly data: Uint8Array
	) {}

	static decode<S extends Types>(
		schema: Schema<S>,
		data: Uint8Array
	): Instance<S> {
		const v = varint.decode(data)
		if (v !== version) {
			throw new Error(`unsupported version: ${v}`)
		}

		const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
		const state: DecodeState = { data, view, offset: varint.encodingLength(v) }
		const offsets = mapKeys(schema, (type, key) => {
			const valuesLength = decodeUnsignedVarint(state)
			const values: number[] = new Array(valuesLength)
			for (let i = 0; i < valuesLength; i++) {
				values[i] = state.offset
				scan(state, type)
			}
			return values
		})

		return new Instance(schema, offsets, data)
	}

	static fromJSON<S extends Types>(
		schema: Schema<S>,
		classes: { [K in keyof S]: Value<S[K]>[] }
	): Instance<S> {
		const chunks: Uint8Array[] = []

		const offsets = mapKeys(classes, ({ length }) => new Array<number>(length))

		let byteLength = 0

		const state = makeEncodeState()

		function process(iter: Iterable<Uint8Array>) {
			for (const chunk of iter) {
				chunks.push(chunk)
				byteLength += chunk.byteLength
			}
		}

		// write the version uvarint
		process(encodeUnsignedVarint(state, version))

		for (const key of forKeys(schema)) {
			const type = schema[key]

			// write the number of elements in the class
			process(encodeUnsignedVarint(state, classes[key].length))

			for (const [i, value] of classes[key].entries()) {
				offsets[key][i] = byteLength + state.offset
				process(fromJSON(state, schema, classes, type, value))
			}
		}

		if (state.offset > 0) {
			process([new Uint8Array(state.buffer, 0, state.offset)])
		}

		const buffer = new ArrayBuffer(byteLength)

		let byteOffset = 0
		for (const chunk of chunks) {
			const target = new Uint8Array(buffer, byteOffset, chunk.byteLength)
			target.set(chunk)
			byteOffset += chunk.byteLength
		}

		const data = new Uint8Array(buffer)
		return new Instance(schema, offsets, data)
	}

	toJSON(): { [K in keyof S]: Value<S[K]>[] } {
		return mapKeys(this.offsets, (offsets, key) =>
			offsets.map((byteOffset) => {
				const data = this.data.subarray(byteOffset)
				const view = new DataView(
					this.data.buffer,
					this.data.byteOffset + byteOffset
				)
				return toJSON(this.schema[key], { data, view, offset: 0 })
			})
		)
	}

	encode(): Uint8Array {
		return this.data
	}

	count<K extends keyof S>(key: K): number {
		return this.offsets[key].length
	}

	get<K extends keyof S>(key: K, index: number): Value<S[K]> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}

		const byteOffset = this.offsets[key][index]
		if (byteOffset === undefined) {
			throw new RangeError("element index out of range")
		}

		const data = this.data.subarray(byteOffset)
		const view = new DataView(
			this.data.buffer,
			this.data.byteOffset + byteOffset
		)
		return toJSON(type, { data, view, offset: 0 })
	}

	*keys(): Iterable<string> {
		yield* forKeys(this.schema)
	}

	*elements<K extends keyof S>(key: K): Iterable<[number, Value<S[K]>]> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}

		for (const [i, byteOffset] of this.offsets[key].entries()) {
			const data = this.data.subarray(byteOffset)
			const view = new DataView(
				this.data.buffer,
				this.data.byteOffset + byteOffset
			)
			yield [i, toJSON(type, { data, view, offset: 0 })]
		}
	}
}

function* fromJSON<S extends Schema, T extends Type>(
	state: EncodeState,
	schema: S,
	elements: { [K in keyof S]: Value<S[K]>[] },
	type: T,
	value: Value
): Iterable<Uint8Array> {
	if (type.kind === "reference") {
		if (type.key in schema && type.key in elements) {
			if (value.kind === "reference") {
				if (0 <= value.index && value.index < elements[type.key].length) {
					yield* encodeUnsignedVarint(state, value.index)
				} else {
					throw new Error("broken reference value")
				}
			} else {
				throw new Error("expected a reference value")
			}
		} else {
			throw new Error("broken reference type")
		}
	} else if (type.kind === "uri") {
		if (value.kind === "uri") {
			yield* encodeString(state, value.value)
		} else {
			throw new Error("expected a uri value")
		}
	} else if (type.kind === "literal") {
		if (value.kind === "literal") {
			yield* encodeLiteral(state, type, value)
		} else {
			throw new Error("expected a literal value")
		}
	} else if (type.kind === "product") {
		if (value.kind == "product") {
			for (const [key, component] of forEntries(type.components)) {
				if (key in value.components) {
					yield* fromJSON(
						state,
						schema,
						elements,
						component,
						value.components[key]
					)
				}
			}
		} else {
			throw new Error("expected a product value")
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct") {
			const index = getIndexOfKey(type.options, value.key)
			yield* encodeUnsignedVarint(state, index)
			yield* fromJSON(
				state,
				schema,
				elements,
				type.options[value.key],
				value.value
			)
		} else {
			throw new Error("expected a coproduct value")
		}
	} else {
		signalInvalidType(type)
	}
}

function toJSON<A extends Type>(type: A, state: DecodeState): Value<A> {
	if (type.kind === "uri") {
		const value = decodeString(state)
		return { kind: "uri", value } as Value<A>
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type)
		return { kind: "literal", value } as Value<A>
	} else if (type.kind === "product") {
		const components = mapKeys(type.components, (component) =>
			toJSON(component, state)
		)
		return { kind: "product", components } as Value<A>
	} else if (type.kind === "coproduct") {
		const index = decodeUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		const value = toJSON(type.options[key], state)
		return { kind: "coproduct", key, value } as Value<A>
	} else if (type.kind === "reference") {
		const index = decodeUnsignedVarint(state)
		return { kind: "reference", index } as Value<A>
	} else {
		signalInvalidType(type)
	}
}

function scan(state: DecodeState, type: Type) {
	if (type.kind === "uri") {
		const value = decodeString(state)
		validateURI(value)
	} else if (type.kind === "literal") {
		const _ = decodeLiteral(state, type)
	} else if (type.kind === "product") {
		for (const key of forKeys(type.components)) {
			scan(state, type.components[key])
		}
	} else if (type.kind === "coproduct") {
		const index = decodeUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		scan(state, type.options[key])
	} else if (type.kind === "reference") {
		const _ = decodeUnsignedVarint(state)
	} else {
		signalInvalidType(type)
	}
}
