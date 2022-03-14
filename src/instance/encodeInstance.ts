import { encodeLiteral } from "./literals/index.js"
import { forComponents, indexOfOption } from "../keys.js"

import { version } from "../version.js"

import {
	EncodeState,
	encodeString,
	encodeUnsignedVarint,
	makeEncodeState,
} from "../utils.js"

import { types } from "../schema/index.js"

import { Instance } from "./instance.js"
import { values } from "./values.js"

/**
 * Encode an instance to a byte array
 * @param {Instance} instance
 * @returns {Uint8Array}
 */
export function encodeInstance(instance: Instance): Uint8Array {
	const chunks: Uint8Array[] = []

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

	for (const [key, type] of instance.schema.entries()) {
		// write the number of elements in the class
		const count = instance.count(key)
		process(encodeUnsignedVarint(state, count))

		let previous = 0
		for (const [id, value] of instance.entries(key)) {
			process(encodeUnsignedVarint(state, id - previous))
			previous = id + 1
			process(encodeValue(state, type, value))
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

	return new Uint8Array(buffer)
}

export function* encodeValue(
	state: EncodeState,
	type: types.Type,
	value: values.Value
): Iterable<Uint8Array> {
	if (type.kind === "uri" && value.kind === "uri") {
		yield* encodeString(state, value.value)
	} else if (type.kind === "literal" && value.kind == "literal") {
		yield* encodeLiteral(state, type.datatype, value.value)
	} else if (type.kind === "product" && value.kind === "product") {
		for (const [key, component] of forComponents(type)) {
			if (value.components[key] === undefined) {
				throw new Error("key not found")
			}
			yield* encodeValue(state, component, value.components[key])
		}
	} else if (type.kind === "coproduct" && value.kind === "coproduct") {
		const index = indexOfOption(type, value.key)
		yield* encodeUnsignedVarint(state, index)
		yield* encodeValue(state, type.options[value.key], value.value)
	} else if (type.kind === "reference" && value.kind === "reference") {
		yield* encodeUnsignedVarint(state, value.id)
	} else {
		throw new Error("internal type error")
	}
}
