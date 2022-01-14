import { ul } from "@underlay/namespaces"

import { forEntries, map } from "../keys.js"
import { signalInvalidType } from "../utils.js"

import type { Type, Value } from "../types.js"
import { Instance, values, encodeInstance } from "../instance/index.js"

import { Schema } from "./schema.js"
import { SchemaSchema, schemaSchema, TypeType } from "./schemaSchema.js"

/**
 * Convert a schema to an encoded instance of the schema schema
 * @param {Schema} schema
 * @returns {Uint8Array} an encoded instance of the schema schema
 */
export function encodeSchema<S extends { [K in string]: Type }>(
	schema: Schema<S>
): Uint8Array {
	const elements: { [K in keyof SchemaSchema]: Value<SchemaSchema[K]>[] } = {
		[ul.class]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
		[ul.option]: [],
	}

	const indices = new Map(
		map(Array.from(schema.keys()).entries(), ([index, key]) => [key, index])
	)

	for (const [key, type] of schema.entries()) {
		const value = fromType(elements, indices, type)
		elements[ul.class].push(
			values.product({ [ul.key]: values.uri(key as string), [ul.value]: value })
		)
	}

	const instance = new Instance(schemaSchema, elements)
	return encodeInstance(instance)
}

function fromType<S extends { [K in string]: Type }>(
	elements: { [K in keyof SchemaSchema]: Value<SchemaSchema[K]>[] },
	indices: Map<keyof S, number>,
	type: Type
): Value<TypeType> {
	if (type.kind === "uri") {
		return values.coproduct(ul.uri, values.unit())
	} else if (type.kind === "literal") {
		return values.coproduct(ul.literal, values.uri(type.datatype))
	} else if (type.kind === "product") {
		const index = elements[ul.product].length
		elements[ul.product].push(values.unit())

		for (const [key, component] of forEntries(type.components)) {
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

		for (const [key, option] of forEntries(type.options)) {
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
