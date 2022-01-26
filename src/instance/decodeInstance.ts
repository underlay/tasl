import { decodeLiteral, decodeString } from "./literals/index.js"
import { version } from "../version.js"
import {
	signalInvalidType,
	DecodeState,
	decodeUnsignedVarint,
} from "../utils.js"
import { forComponents, optionAtIndex } from "../keys.js"

import type { Schema, types } from "../schema/index.js"

import { Instance } from "./instance.js"
import { values } from "./values.js"

/**
 * Decode an instance from a byte array
 * @param {Schema} schema
 * @param {Uint8Array} data
 * @returns {Instance}
 */
export function decodeInstance(schema: Schema, data: Uint8Array): Instance {
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
	const state: DecodeState = { data, view, offset: 0 }

	const v = decodeUnsignedVarint(state)
	if (v !== version) {
		throw new Error(`unsupported version: ${v}`)
	}

	const elements: Record<string, values.Value[]> = {}
	for (const [key, type] of schema.entries()) {
		const length = decodeUnsignedVarint(state)
		elements[key] = []
		for (let i = 0; i < length; i++) {
			elements[key].push(decodeValue(state, type))
		}
	}

	return new Instance(schema, elements)
}

function decodeValue(state: DecodeState, type: types.Type): values.Value {
	if (type.kind === "uri") {
		const value = decodeString(state)
		return values.uri(value)
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type.datatype)
		return values.literal(value)
	} else if (type.kind === "product") {
		const components: Record<string, values.Value> = {}
		for (const [key, component] of forComponents(type)) {
			components[key] = decodeValue(state, component)
		}

		return values.product(components)
	} else if (type.kind === "coproduct") {
		const index = decodeUnsignedVarint(state)
		const key = optionAtIndex(type, index)
		const value = decodeValue(state, type.options[key])
		return values.coproduct(key, value)
	} else if (type.kind === "reference") {
		const index = decodeUnsignedVarint(state)
		return values.reference(index)
	} else {
		signalInvalidType(type)
	}
}
