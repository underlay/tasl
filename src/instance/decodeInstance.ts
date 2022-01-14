import { decodeLiteral, decodeString } from "./literals/index.js"
import { version } from "../version.js"
import {
	signalInvalidType,
	DecodeState,
	decodeUnsignedVarint,
} from "../utils.js"
import { getKeyAtIndex, mapValues } from "../keys.js"

import type { Type, Value } from "../types.js"
import type { Schema } from "../schema/schema.js"

import { Instance } from "./instance.js"
import * as values from "./values/index.js"

/**
 * Decode an instance from a byte array
 * @param {Schema} schema
 * @param {Uint8Array} data
 * @returns {Instance}
 */
export function decodeInstance<S extends { [K in string]: Type }>(
	schema: Schema<S>,
	data: Uint8Array
): Instance<S> {
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
	const state: DecodeState = { data, view, offset: 0 }

	const v = decodeUnsignedVarint(state)
	if (v !== version) {
		throw new Error(`unsupported version: ${v}`)
	}

	return new Instance(
		schema,
		mapValues(schema.classes, (type) => {
			const length = decodeUnsignedVarint(state)
			return Array.from(decodeElements(state, type, length))
		})
	)
}

function* decodeElements<T extends Type>(
	state: DecodeState,
	type: T,
	length: number
): Iterable<Value<T>> {
	for (let i = 0; i < length; i++) {
		yield decodeValue(state, type) as Value<T>
	}
}

function decodeValue(state: DecodeState, type: Type): Value {
	if (type.kind === "uri") {
		const value = decodeString(state)
		return values.uri(value)
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type)
		return values.literal(value)
	} else if (type.kind === "product") {
		const components = mapValues(type.components, (type) =>
			decodeValue(state, type)
		)
		return values.product(components)
	} else if (type.kind === "coproduct") {
		const index = decodeUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		const value = decodeValue(state, type.options[key])
		return values.coproduct(key, value)
	} else if (type.kind === "reference") {
		const index = decodeUnsignedVarint(state)
		return values.reference(index)
	} else {
		signalInvalidType(type)
	}
}
