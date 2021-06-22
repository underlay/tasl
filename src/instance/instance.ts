import { Buffer } from "buffer"
import varint from "varint"

import type * as Schema from "../schema/index.js"
import { forTypes } from "../schema/index.js"
import { getKeyIndex, getKeys, mapKeys, signalInvalidType } from "../utils.js"

import { decodeLiteral } from "./decodeLiteral.js"
import { encodeLiteral } from "./encodeLiteral.js"
import { version } from "./version.js"
import { getVarint, resolveValue } from "./utils.js"

export type Value<T extends Schema.Type = Schema.Type> = T extends Schema.URI
	? URI
	: T extends Schema.Literal<infer Datatype>
	? Literal<Datatype>
	: T extends Schema.Product<infer Components>
	? Product<Components>
	: T extends Schema.Coproduct<infer Options>
	? Coproduct<Options>
	: T extends Schema.Reference<infer Key>
	? Reference<Key>
	: never

export type Reference<Key extends string> = { kind: "reference"; index: number }

export type URI = { kind: "uri"; value: string }

export type Literal<Datatype extends string> = {
	kind: "literal"
	value: string
}

export type Product<Components extends Record<string, Schema.Type>> = {
	kind: "product"
	components: { [K in keyof Components]: Value<Components[K]> }
}

export type Coproduct<
	Options extends Record<string, Schema.Type>,
	Option extends keyof Options = keyof Options
> = { kind: "coproduct"; key: Option; value: Value<Options[Option]> }

export class Instance<S extends Record<string, Schema.Type>> {
	private constructor(
		public readonly schema: Schema.Schema<S>,
		private readonly _uris: string[],
		private readonly _elements: { [K in keyof S]: Uint8Array[] }
	) {}

	static decode<S extends Record<string, Schema.Type>>(
		schema: Schema.Schema<S>,
		data: Buffer
	): Instance<S> {
		let offset = 0

		const v = varint.decode(data, offset)
		if (v !== version) {
			throw new Error(`unsupported version: ${v}`)
		}

		offset += varint.encodingLength(v)

		const uriCount = varint.decode(data, offset)
		offset += varint.encodingLength(uriCount)

		const uriValues: string[] = new Array(uriCount)

		const decoder = new TextDecoder()

		for (let i = 0; i < uriCount; i++) {
			const length = varint.decode(data, offset)
			offset += varint.encodingLength(length)
			const value = decoder.decode(data.slice(offset, offset + length))
			offset += length
			uriValues[i] = value
		}

		const state: State = { uris: uriValues, data, offset }
		const elements = mapKeys(schema, (type) => {
			const valuesLength = getVarint(state)
			const values: Uint8Array[] = new Array(valuesLength)
			for (let i = 0; i < valuesLength; i++) {
				const start = state.offset
				scan(type, state)
				const end = state.offset
				values[i] = data.slice(start, end)
			}
			return values
		})

		return new Instance(schema, uriValues, elements)
	}

	static fromJSON<S extends Record<string, Schema.Type>>(
		schema: Schema.Schema<S>,
		elements: { [K in keyof S]: Value<S[K]>[] }
	) {
		const uris = new Set<string>()
		for (const [type, [key, ...path]] of forTypes(schema)) {
			if (type.kind === "uri") {
				for (const element of elements[key]) {
					for (const { value } of resolveValue<URI>(
						schema[key],
						element,
						path
					)) {
						uris.add(value)
					}
				}
			}
		}

		const uriValues = Array.from(uris).sort()
		const uriIDs = new Map<string, number>()
		for (const [index, value] of uriValues.entries()) {
			uriIDs.set(value, index)
		}

		return new Instance(
			schema,
			uriValues,
			mapKeys(schema, (type, key) =>
				elements[key].map((value) => pack(fromJSON(type, value, uriIDs)))
			)
		)
	}

	toJSON(): { [K in keyof S]: Value<S[K]>[] } {
		return mapKeys(this._elements, (elements, key) =>
			elements.map((data) =>
				toJSON(this.schema[key], { uris: this._uris, data, offset: 0 })
			)
		)
	}

	encode(): Buffer {
		const data: Uint8Array[] = [
			new Uint8Array(varint.encode(version)),
			new Uint8Array(varint.encode(this._uris.length)),
		]

		for (const value of this._uris) {
			data.push(
				new Uint8Array(varint.encode(value.length)),
				new Uint8Array(new TextEncoder().encode(value))
			)
		}

		for (const key of getKeys(this.schema)) {
			const elements = this._elements[key]
			data.push(new Uint8Array(varint.encode(elements.length)))
			for (const element of elements) {
				data.push(element)
			}
		}

		return Buffer.concat(data)
	}

	get<K extends keyof S>(key: K, index: number): Value<S[K]> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}
		const element = this._elements[key][index]
		if (element === undefined) {
			throw new Error("element not found in instance")
		}
		return toJSON(type, { uris: this._uris, data: element, offset: 0 })
	}

	*elements<K extends keyof S>(
		key: K
	): Generator<Value<S[K]>, void, undefined> {
		const type = this.schema[key]
		if (type === undefined) {
			throw new Error("key not found in schema")
		}
		for (const element of this._elements[key]) {
			yield toJSON(type, { uris: this._uris, data: element, offset: 0 })
		}
	}
}

function pack(iter: Iterable<Uint8Array>): Uint8Array {
	const source = Buffer.concat(Array.from(iter))
	const buffer = new ArrayBuffer(source.length)
	const target = new Uint8Array(buffer)
	source.copy(target)
	return target
}

function* fromJSON(
	type: Schema.Type,
	value: Value,
	uris: Map<string, number>
): Generator<Uint8Array, void, undefined> {
	if (type.kind === "reference") {
		if (value.kind === "reference") {
			yield new Uint8Array(varint.encode(value.index))
		} else {
			throw new Error("expected a reference value")
		}
	} else if (type.kind === "uri") {
		if (value.kind === "uri") {
			const id = uris.get(value.value)
			if (id === undefined) {
				throw new Error(`could not find id for named node ${value.value}`)
			}
			yield new Uint8Array(varint.encode(id))
		} else {
			throw new Error("expected a uri value")
		}
	} else if (type.kind === "literal") {
		if (value.kind === "literal") {
			yield new Uint8Array(encodeLiteral(type, value.value))
		} else {
			throw new Error("expected a literal value")
		}
	} else if (type.kind === "product") {
		if (value.kind == "product") {
			for (const [index, key] of getKeys(type.components).entries()) {
				if (index in value) {
					yield* fromJSON(type.components[key], value.components[key], uris)
				}
			}
		} else {
			throw new Error("expected a product value")
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct") {
			const index = getKeyIndex(type.options, value.key)
			yield new Uint8Array(varint.encode(index))
			yield* fromJSON(type.options[value.key], value.value, uris)
		} else {
			throw new Error("expected a coproduct value")
		}
	} else {
		signalInvalidType(type)
	}
}

type State = { uris: string[]; data: Uint8Array; offset: number }

function toJSON<T extends Schema.Type>(type: T, state: State): Value<T> {
	if (type.kind === "uri") {
		const index = getVarint(state)
		if (index in state.uris) {
			return { kind: "uri", value: state.uris[index] } as Value<T>
		} else {
			throw new Error("invalid uri index")
		}
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type.datatype)
		return { kind: "literal", value } as Value<T>
	} else if (type.kind === "product") {
		const components = mapKeys(type.components, (component) =>
			toJSON(component, state)
		)
		return { kind: "product", components } as Value<T>
	} else if (type.kind === "coproduct") {
		const index = getVarint(state)
		const keys = getKeys(type.options)
		if (index in keys) {
			const key = keys[index]
			const value = toJSON(type.options[key], state)
			return { kind: "coproduct", key, value } as Value<T>
		} else {
			throw new Error("invalid option index")
		}
	} else if (type.kind === "reference") {
		const index = getVarint(state)
		return { kind: "reference", index } as Value<T>
	} else {
		signalInvalidType(type)
	}
}

function scan(type: Schema.Type, state: State) {
	if (type.kind === "uri") {
		const index = getVarint(state)
		if (index in state.uris) {
			return
		} else {
			throw new Error("invalid uri index")
		}
	} else if (type.kind === "literal") {
		const _ = decodeLiteral(state, type.datatype)
	} else if (type.kind === "product") {
		for (const key of getKeys(type.components)) {
			scan(type.components[key], state)
		}
	} else if (type.kind === "coproduct") {
		const index = getVarint(state)
		const keys = getKeys(type.options)
		if (index in keys) {
			const key = keys[index]
			scan(type.options[key], state)
		} else {
			throw new Error("invalid option index")
		}
	} else if (type.kind === "reference") {
		const _ = getVarint(state)
	} else {
		signalInvalidType(type)
	}
}
