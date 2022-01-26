import { encodeLiteral } from "./literals/index.js"
import { forComponents, indexOfOption } from "../keys.js"

import { version } from "../version.js"

import {
	signalInvalidType,
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
		process(encodeUnsignedVarint(state, instance.count(key)))

		for (const value of instance.values(key)) {
			process(encodeValue(state, instance, type, value))
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

function* encodeValue(
	state: EncodeState,
	instance: Instance,
	type: types.Type,
	value: values.Value
): Iterable<Uint8Array> {
	if (type.kind === "reference") {
		if (instance.schema.has(type.key)) {
			if (value.kind === "reference") {
				const count = instance.count(type.key)
				if (0 <= value.index && value.index < count) {
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
			yield* encodeLiteral(state, type.datatype, value.value)
		} else {
			throw new Error("expected a literal value")
		}
	} else if (type.kind === "product") {
		if (value.kind == "product") {
			for (const [key, component] of forComponents(type)) {
				if (value.components[key] === undefined) {
					throw new Error("key not found")
				}
				yield* encodeValue(state, instance, component, value.components[key])
			}
		} else {
			throw new Error("expected a product value")
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct") {
			const index = indexOfOption(type, value.key)
			yield* encodeUnsignedVarint(state, index)
			yield* encodeValue(state, instance, type.options[value.key], value.value)
		} else {
			throw new Error("expected a coproduct value")
		}
	} else {
		signalInvalidType(type)
	}
}
