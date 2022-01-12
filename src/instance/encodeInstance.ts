import { encodeLiteral } from "./literals/index.js"
import { getIndexOfKey } from "../keys.js"

import { version } from "../version.js"

import {
	signalInvalidType,
	EncodeState,
	encodeString,
	encodeUnsignedVarint,
	makeEncodeState,
} from "../utils.js"
import { forEntries, map } from "../keys.js"

import type { Type, Value } from "../types.js"
import { Instance } from "./instance.js"

export function encodeInstance<S extends { [K in string]: Type }>(
	instance: Instance<S>
): Uint8Array {
	const chunks: Uint8Array[] = []

	const offsets = Object.fromEntries(
		map(instance.schema.keys(), (key) => [key, new Array(instance.count(key))])
	) as { [K in keyof S]: number[] }

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

		for (const [i, value] of instance.entries(key)) {
			offsets[key][i] = byteLength + state.offset
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

function* encodeValue<S extends { [K in string]: Type }, T extends Type>(
	state: EncodeState,
	instance: Instance<S>,
	type: T,
	value: Value<T>
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
			yield* encodeLiteral(state, type, value)
		} else {
			throw new Error("expected a literal value")
		}
	} else if (type.kind === "product") {
		if (value.kind == "product") {
			for (const [key, component] of forEntries(type.components)) {
				if (key in value.components) {
					yield* encodeValue(state, instance, component, value.components[key])
				} else {
					throw new Error("missing component")
				}
			}
		} else {
			throw new Error("expected a product value")
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct") {
			const index = getIndexOfKey(type.options, value.key)
			yield* encodeUnsignedVarint(state, index)
			yield* encodeValue(state, instance, type.options[value.key], value.value)
		} else {
			throw new Error("expected a coproduct value")
		}
	} else {
		signalInvalidType(type)
	}
}
