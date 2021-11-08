import type * as Schema from "./schema/index.js"
import type * as Instance from "./instance/index.js"

import { encodeLiteral } from "./encodeLiteral.js"
import { forEntries, forKeys, getIndexOfKey, mapValues } from "./keys.js"
import { version } from "./version.js"
import {
	signalInvalidType,
	EncodeState,
	encodeString,
	encodeUnsignedVarint,
	makeEncodeState,
} from "./utils.js"

export function encode<S extends Schema.Schema>(
	schema: S,
	instance: Instance.Instance<S>
): Uint8Array {
	const chunks: Uint8Array[] = []

	const offsets = mapValues(instance, ({ length }) => new Array<number>(length))

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
		process(encodeUnsignedVarint(state, instance[key].length))

		for (const [i, value] of instance[key].entries()) {
			offsets[key][i] = byteLength + state.offset
			process(fromJSON(state, schema, instance, type, value))
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

function* fromJSON<S extends Schema.Schema, X extends Schema.Type>(
	state: EncodeState,
	schema: S,
	instance: Instance.Instance<S>,
	type: X,
	value: Instance.Value
): Iterable<Uint8Array> {
	if (type.kind === "reference") {
		if (type.key in schema && type.key in instance) {
			if (value.kind === "reference") {
				const { length } = instance[type.key]
				if (0 <= value.index && value.index < length) {
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
						instance,
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
				instance,
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
