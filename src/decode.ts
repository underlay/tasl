import * as Instance from "./instance/index.js"
import type * as Schema from "./schema/index.js"

import { decodeLiteral, decodeString } from "./decodeLiteral.js"
import { getKeyAtIndex, mapValues } from "./keys.js"
import { version } from "./version.js"
import {
	signalInvalidType,
	DecodeState,
	decodeUnsignedVarint,
} from "./utils.js"

export function decode<S extends Schema.Schema>(
	schema: S,
	data: Uint8Array
): Instance.Instance<S> {
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
	const state: DecodeState = { data, view, offset: 0 }

	const v = decodeUnsignedVarint(state)
	if (v !== version) {
		throw new Error(`unsupported version: ${v}`)
	}

	return mapValues(schema, (type) => {
		const length = decodeUnsignedVarint(state)
		return Array.from(decodeElements(state, type, length))
	})
}

function* decodeElements<X extends Schema.Type>(
	state: DecodeState,
	type: X,
	length: number
): Iterable<Instance.Value<X>> {
	for (let i = 0; i < length; i++) {
		yield decodeElement(state, type)
	}
}

function decodeElement<X extends Schema.Type>(
	state: DecodeState,
	type: X
): Instance.Value<X> {
	if (type.kind === "uri") {
		const value = decodeString(state)
		return { kind: "uri", value } as Instance.Value<X>
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type)
		return { kind: "literal", value } as Instance.Value<X>
	} else if (type.kind === "product") {
		const components = mapValues(type.components, (component) =>
			decodeElement(state, component)
		)
		return { kind: "product", components } as Instance.Value<X>
	} else if (type.kind === "coproduct") {
		const index = decodeUnsignedVarint(state)
		const key = getKeyAtIndex(type.options, index)
		const value = decodeElement(state, type.options[key])
		return { kind: "coproduct", key, value } as Instance.Value<X>
	} else if (type.kind === "reference") {
		const index = decodeUnsignedVarint(state)
		return { kind: "reference", index } as Instance.Value<X>
	} else {
		signalInvalidType(type)
	}
}
