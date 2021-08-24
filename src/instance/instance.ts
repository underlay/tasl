import { Buffer } from "buffer"
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
import { signalInvalidType } from "../utils.js"
import { version } from "../version.js"

import { decodeLiteral, decodeString } from "./decodeLiteral.js"
import { encodeLiteral, encodeString } from "./encodeLiteral.js"
import { validateURI } from "./validate.js"
import { State, getUnsignedVarint } from "./utils.js"

type Types = { [key in string]: Type }

export class Instance<S extends Types> {
	private constructor(
		public readonly schema: Schema<S>,
		private readonly classes: { [K in keyof S]: Uint8Array[] }
	) {}

	static decode<S extends Types>(
		schema: Schema<S>,
		data: Uint8Array
	): Instance<S> {
		let offset = 0

		const v = varint.decode(data, offset)
		if (v !== version) {
			throw new Error(`unsupported version: ${v}`)
		}

		offset += varint.encodingLength(v)

		const state: State = { data, offset }
		const elements = mapKeys(schema, (type) => {
			const valuesLength = getUnsignedVarint(state)
			const values: Uint8Array[] = new Array(valuesLength)
			for (let i = 0; i < valuesLength; i++) {
				const start = state.offset
				scan(type, state)
				const end = state.offset
				values[i] = data.subarray(start, end)
			}
			return values
		})

		return new Instance(schema, elements)
	}

	static fromJSON<S extends Types>(
		schema: Schema<S>,
		classes: { [Key in keyof S]: Value<S[Key]>[] }
	): Instance<S> {
		return new Instance(
			schema,
			mapKeys(schema, (type, key) => {
				const elements = new Array<Uint8Array>(classes[key].length)
				for (const [i, value] of classes[key].entries()) {
					elements[i] = pack(fromJSON(type, value))
				}
				return elements
			})
		)
	}

	toJSON(): { [K in keyof S]: Value<S[K]>[] } {
		return mapKeys(this.classes, (elements, key) =>
			elements.map((data) => toJSON(this.schema[key], { data, offset: 0 }))
		)
	}

	encode(): Buffer {
		const data: Uint8Array[] = [new Uint8Array(varint.encode(version))]

		for (const key of forKeys(this.schema)) {
			const elements = this.classes[key]
			data.push(new Uint8Array(varint.encode(elements.length)))
			for (const element of elements) {
				data.push(element)
			}
		}

		return Buffer.concat(data)
	}

	count<K extends keyof S>(key: K): number {
		return this.classes[key].length
	}

	get<K extends keyof S>(key: K, index: number): Value<S[K]> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}

		const element = this.classes[key][index]
		if (element === undefined) {
			throw new Error("element index out of range")
		}

		return toJSON(type, { data: element, offset: 0 })
	}

	*keys(): Iterable<string> {
		yield* forKeys(this.schema)
	}

	*elements<K extends keyof S>(key: K): Iterable<[number, Value<S[K]>]> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}

		for (const [index, element] of this.classes[key].entries()) {
			yield [index, toJSON(type, { data: element, offset: 0 })]
		}
	}
}

function pack(iter: Iterable<ArrayBuffer>): Buffer {
	let byteLength = 0
	const fragments: ArrayBuffer[] = []
	for (const fragment of iter) {
		fragments.push(fragment)
		byteLength += fragment.byteLength
	}

	const buffer = Buffer.from(new ArrayBuffer(byteLength))

	let byteOffset = 0
	for (const fragment of fragments) {
		byteOffset += Buffer.from(fragment).copy(buffer, byteOffset)
	}

	return buffer
}

function* fromJSON<A extends Type>(
	type: A,
	value: Value
): Iterable<ArrayBuffer> {
	if (type.kind === "reference") {
		if (value.kind === "reference") {
			const { buffer } = new Uint8Array(varint.encode(value.index))
			yield buffer
		} else {
			throw new Error("expected a reference value")
		}
	} else if (type.kind === "uri") {
		if (value.kind === "uri") {
			yield encodeString(value.value)
		} else {
			throw new Error("expected a uri value")
		}
	} else if (type.kind === "literal") {
		if (value.kind === "literal") {
			const { buffer } = new Uint8Array(encodeLiteral(type, value))
			yield buffer
		} else {
			throw new Error("expected a literal value")
		}
	} else if (type.kind === "product") {
		if (value.kind == "product") {
			for (const [key, component] of forEntries(type.components)) {
				if (key in value.components) {
					yield* fromJSON(component, value.components[key])
				}
			}
		} else {
			throw new Error("expected a product value")
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct") {
			const index = getIndexOfKey(type.options, value.key)
			const { buffer } = new Uint8Array(varint.encode(index))
			yield buffer
			yield* fromJSON(type.options[value.key], value.value)
		} else {
			throw new Error("expected a coproduct value")
		}
	} else {
		signalInvalidType(type)
	}
}

function toJSON<A extends Type>(type: A, state: State): Value<A> {
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
		const index = getUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		const value = toJSON(type.options[key], state)
		return { kind: "coproduct", key, value } as Value<A>
	} else if (type.kind === "reference") {
		const index = getUnsignedVarint(state)
		return { kind: "reference", index } as Value<A>
	} else {
		signalInvalidType(type)
	}
}

function scan(type: Type, state: State) {
	if (type.kind === "uri") {
		const value = decodeString(state)
		validateURI(value)
	} else if (type.kind === "literal") {
		const _ = decodeLiteral(state, type)
	} else if (type.kind === "product") {
		for (const key of forKeys(type.components)) {
			scan(type.components[key], state)
		}
	} else if (type.kind === "coproduct") {
		const index = getUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		scan(type.options[key], state)
	} else if (type.kind === "reference") {
		const _ = getUnsignedVarint(state)
	} else {
		signalInvalidType(type)
	}
}
