import { ul } from "@underlay/namespaces"

import { signalInvalidType } from "../utils.js"

import { Instance, values, encodeInstance } from "../instance/index.js"

import { Schema } from "./schema.js"
import { types } from "./types.js"
import { schemaSchema } from "./schemaSchema.js"
import { forComponents, forOptions } from "../keys.js"

type SchemaElements = {
	[ul.class]: values.Value[]
	[ul.product]: values.Value[]
	[ul.component]: values.Value[]
	[ul.coproduct]: values.Value[]
	[ul.option]: values.Value[]
}

/**
 * Convert a schema to an encoded instance of the schema schema
 * @param {Schema} schema
 * @returns {Uint8Array} an encoded instance of the schema schema
 */
export function encodeSchema(schema: Schema): Uint8Array {
	const elements: SchemaElements = {
		[ul.class]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
		[ul.option]: [],
	}

	const indices = new Map<string, number>()
	for (const key of schema.keys()) {
		indices.set(key, schema.indexOfKey(key))
	}

	for (const [key, type] of schema.entries()) {
		const value = fromType(elements, indices, type)
		elements[ul.class].push(
			values.product({ [ul.key]: values.uri(key as string), [ul.value]: value })
		)
	}

	const instance = new Instance(
		schemaSchema,
		Object.fromEntries(
			Object.entries(elements).map(([key, values]) => [
				key,
				values.map((value, id) => ({ id, value })),
			])
		)
	)

	return encodeInstance(instance)
}

function fromType(
	elements: SchemaElements,
	indices: Map<string, number>,
	type: types.Type
): values.Value {
	if (type.kind === "uri") {
		return values.coproduct(ul.uri, values.unit())
	} else if (type.kind === "literal") {
		return values.coproduct(ul.literal, values.uri(type.datatype))
	} else if (type.kind === "product") {
		const index = elements[ul.product].length
		elements[ul.product].push(values.unit())

		for (const [key, component] of forComponents(type)) {
			const value = fromType(elements, indices, component)
			elements[ul.component].push(
				values.product({
					[ul.source]: values.reference(index),
					[ul.key]: values.uri(key),
					[ul.value]: value,
				})
			)
		}

		return values.coproduct(ul.product, values.reference(index))
	} else if (type.kind === "coproduct") {
		const index = elements[ul.coproduct].length
		elements[ul.coproduct].push(values.unit())

		for (const [key, option] of forOptions(type)) {
			const value = fromType(elements, indices, option)
			elements[ul.option].push(
				values.product({
					[ul.source]: values.reference(index),
					[ul.key]: values.uri(key),
					[ul.value]: value,
				})
			)
		}

		return values.coproduct(ul.coproduct, values.reference(index))
	} else if (type.kind === "reference") {
		const index = indices.get(type.key)
		if (index === undefined) {
			throw new Error(`internal error`)
		}

		return values.coproduct(ul.reference, values.reference(index))
	} else {
		signalInvalidType(type)
	}
}
