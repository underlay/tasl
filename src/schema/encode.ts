import { ul } from "@underlay/namespaces"

import { Instance } from "../instance/instance.js"
import type { Value } from "../values/index.js"

import type { Type } from "../types/index.js"

import type { Schema } from "./schema.js"
import { SchemaSchema, TypeType, schemaSchema } from "./schemaSchema.js"

import { forEntries, getIndexOfKey } from "../keys.js"

import { signalInvalidType } from "../utils.js"

type SchemaInstanceElements = {
	[k in keyof SchemaSchema]: Value<SchemaSchema[k]>[]
}

/**
 *
 * @param schema a schema
 * @returns an instance of the schema schema
 */
export function fromSchema(schema: Schema): Instance<SchemaSchema> {
	const elements: SchemaInstanceElements = {
		[ul.class]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
		[ul.option]: [],
	}

	// function parseType(type: Type): Value<TypeType> {

	// }

	for (const [key, type] of forEntries(schema)) {
		const value = parseType(schema, elements, type)
		elements[ul.class].push({
			kind: "product",
			components: {
				[ul.key]: { kind: "uri", value: key },
				[ul.value]: value,
			},
		})
	}

	return Instance.fromJSON(schemaSchema, elements)
}

function parseType(
	schema: Schema,
	elements: SchemaInstanceElements,
	type: Type
): Value<TypeType> {
	if (type.kind === "uri") {
		return {
			kind: "coproduct",
			key: ul.uri,
			value: { kind: "product", components: {} },
		}
	} else if (type.kind === "literal") {
		return {
			kind: "coproduct",
			key: ul.literal,
			value: { kind: "uri", value: type.datatype },
		}
	} else if (type.kind === "product") {
		const index = elements[ul.product].length
		elements[ul.product].push({ kind: "product", components: {} })

		for (const [key, component] of forEntries(type.components)) {
			const value = parseType(schema, elements, component)
			elements[ul.component].push({
				kind: "product",
				components: {
					[ul.source]: { kind: "reference", index },
					[ul.key]: { kind: "uri", value: key },
					[ul.value]: value,
				},
			})
		}

		return {
			kind: "coproduct",
			key: ul.product,
			value: { kind: "reference", index },
		}
	} else if (type.kind === "coproduct") {
		const index = elements[ul.coproduct].length
		elements[ul.coproduct].push({ kind: "product", components: {} })

		for (const [key, option] of forEntries(type.options)) {
			const value = parseType(schema, elements, option)
			elements[ul.option].push({
				kind: "product",
				components: {
					[ul.source]: { kind: "reference", index },
					[ul.key]: { kind: "uri", value: key },
					[ul.value]: value,
				},
			})
		}

		return {
			kind: "coproduct",
			key: ul.coproduct,
			value: { kind: "reference", index },
		}
	} else if (type.kind === "reference") {
		const index = getIndexOfKey(schema, type.key)
		return {
			kind: "coproduct",
			key: ul.reference,
			value: { kind: "reference", index },
		}
	} else {
		signalInvalidType(type)
	}
}

export function encodeSchema(schema: Schema): Buffer {
	const instance = fromSchema(schema)
	return instance.encode()
}
