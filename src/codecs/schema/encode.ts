import { ul } from "@underlay/namespaces"

import type * as Schema from "../../schema/index.js"
import * as Instance from "../../instance/index.js"

import { SchemaSchema, TypeType, schemaSchema } from "./schema.js"

import { encode } from "../../encode.js"
import { forEntries, getIndexOfKey } from "../../keys.js"
import { signalInvalidType } from "../../utils.js"

/**
 * Convert a schema to an encoded instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Uint8Array} an encoded instance of the schema schema
 */
export function encodeSchema(schema: Schema.Schema): Uint8Array {
	const instance = fromSchema(schema)
	return encode(schemaSchema, instance)
}

/**
 * Convert a schema to an instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Instance} an instance of the schema schema
 */
export function fromSchema(
	schema: Schema.Schema
): Instance.Instance<SchemaSchema> {
	const instance: Instance.Instance<SchemaSchema> = {
		[ul.class]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
		[ul.option]: [],
	}

	for (const [key, type] of forEntries(schema)) {
		const value = parseType(schema, instance, type)
		instance[ul.class].push({
			kind: "product",
			components: {
				[ul.key]: { kind: "uri", value: key },
				[ul.value]: value,
			},
		})
	}

	return instance
}

function parseType(
	schema: Schema.Schema,
	instance: Instance.Instance<SchemaSchema>,
	type: Schema.Type
): Instance.Value<TypeType> {
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
		const index = instance[ul.product].length
		instance[ul.product].push({ kind: "product", components: {} })

		for (const [key, component] of forEntries(type.components)) {
			const value = parseType(schema, instance, component)
			instance[ul.component].push({
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
		const index = instance[ul.coproduct].length
		instance[ul.coproduct].push({ kind: "product", components: {} })

		for (const [key, option] of forEntries(type.options)) {
			const value = parseType(schema, instance, option)
			instance[ul.option].push({
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
