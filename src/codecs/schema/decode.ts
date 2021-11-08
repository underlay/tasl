import { ul } from "@underlay/namespaces"

import * as Schema from "../../schema/index.js"
import type * as Instance from "../../instance/index.js"

import { schemaSchema, SchemaSchema, TypeType } from "./schema.js"

import { decode } from "../../decode.js"
import { signalInvalidType, iota } from "../../utils.js"
import { mapValues } from "../../keys.js"

/**
 * Convert an encoded instance of the schema schema to a schema
 * @param {Uint8Array} data
 * @returns {Schema} a schema
 */
export function decodeSchema(data: Uint8Array): Schema.Schema {
	const instance = decode(schemaSchema, data)
	return toSchema(instance)
}

/**
 * Convert an instance of the schema schema to a schema
 * @param {Instance} instance an instance of the schema schema
 * @returns {Schema} a schema
 */
export function toSchema(
	instance: Instance.Instance<SchemaSchema>
): Schema.Schema {
	// this is also responsible for validating the schema constraints:
	// - no duplicate class keys
	// - no duplicate component keys
	// - no duplicate option keys
	// - no re-use of product/coproduct elements

	const products: Record<string, Instance.Value<TypeType>>[] = Array.from(
		iota(instance[ul.product].length, (_) => ({}))
	)

	for (const element of instance[ul.component]) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const components = products[index]
		if (components === undefined) {
			throw new Error("broken reference value")
		} else if (key in components) {
			throw new Error("duplicate component key")
		} else {
			components[key] = value
		}
	}

	const coproducts: Record<string, Instance.Value<TypeType>>[] = Array.from(
		iota(instance[ul.coproduct].length, (_) => ({}))
	)

	for (const element of instance[ul.option]) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const options = coproducts[index]
		if (options === undefined) {
			throw new Error("broken reference value")
		} else if (key in options) {
			throw new Error("duplicate option key")
		} else {
			options[key] = value
		}
	}

	function parseValue(value: Instance.Value<TypeType>): Schema.Type {
		if (value.key === ul.uri) {
			return Schema.uri()
		} else if (value.key === ul.literal) {
			return Schema.literal(value.value.value)
		} else if (value.key === ul.product) {
			const { index } = value.value
			const components = products[index]

			// this is how we check for product element re-use.
			// once we "visit" an element we delete its index.
			// it's important that the deletion happens before
			// we call parseValue() on the components or else
			// reference cycles will cause infinite loops.
			if (components === undefined) {
				throw new Error("re-used product element")
			} else {
				delete products[index]
			}

			return Schema.product(mapValues(components, parseValue))
		} else if (value.key === ul.coproduct) {
			const { index } = value.value
			const options = coproducts[index]

			// same for coproducts here...
			if (options === undefined) {
				throw new Error("re-used coproduct element")
			} else {
				delete options[index]
			}

			return Schema.coproduct(mapValues(options, parseValue))
		} else if (value.key === ul.reference) {
			const { index } = value.value
			const element = instance[ul.class][index]
			const { value: key } = element.components[ul.key]
			return Schema.reference(key)
		} else {
			signalInvalidType(value)
		}
	}

	const schema: Schema.Schema = {}
	for (const element of instance[ul.class]) {
		const { value: key } = element.components[ul.key]
		if (key in schema) {
			throw new Error("duplicate class key")
		} else {
			schema[key] = parseValue(element.components[ul.value])
		}
	}

	return schema
}
