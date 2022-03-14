import { ul } from "@underlay/namespaces"

import { iota } from "../utils.js"

import { decodeInstance, values } from "../instance/index.js"

import { Schema } from "./schema.js"
import { types } from "./types.js"
import { schemaSchema } from "./schemaSchema.js"

/**
 * Convert an encoded instance of the schema schema to a Schema
 * @param {Uint8Array} data
 * @returns {Schema}
 */
export function decodeSchema(data: Uint8Array): Schema {
	// this is also responsible for validating the schema constraints:
	// - no duplicate class keys
	// - no duplicate component keys
	// - no duplicate option keys
	// - no re-use of product/coproduct elements

	const instance = decodeInstance(schemaSchema, data)

	const products = new Map<number, Record<string, values.Value>>()
	for (const id of instance.keys(ul.product)) {
		products.set(id, {})
	}

	for (const element of instance.values(ul.component)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding schema")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding schema")
		} else if (source.kind !== "reference") {
			throw new Error("internal error decoding schema")
		} else if (key === undefined) {
			throw new Error("internal error decoding schema")
		} else if (key.kind !== "uri") {
			throw new Error("internal error decoding schema")
		} else if (value === undefined) {
			throw new Error("internal error decoding schema")
		} else if (value.kind !== "coproduct") {
			throw new Error("internal error decoding schema")
		}

		const components = products.get(source.id)
		if (components === undefined) {
			throw new Error("broken reference value")
		} else if (key.value in components) {
			throw new Error("duplicate component key")
		} else {
			components[key.value] = value
		}
	}

	const coproducts = new Map<number, Record<string, values.Value>>()
	for (const id of instance.keys(ul.coproduct)) {
		coproducts.set(id, {})
	}

	for (const element of instance.values(ul.option)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding schema")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding schema")
		} else if (source.kind !== "reference") {
			throw new Error("internal error decoding schema")
		} else if (key === undefined) {
			throw new Error("internal error decoding schema")
		} else if (key.kind !== "uri") {
			throw new Error("internal error decoding schema")
		} else if (value === undefined) {
			throw new Error("internal error decoding schema")
		} else if (value.kind !== "coproduct") {
			throw new Error("internal error decoding schema")
		}

		const options = coproducts.get(source.id)
		if (options === undefined) {
			throw new Error("broken reference value")
		} else if (key.value in options) {
			throw new Error("duplicate option key")
		} else {
			options[key.value] = value
		}
	}

	function toType(value: values.Coproduct): types.Type {
		if (value.key === ul.uri) {
			return types.uri()
		} else if (value.key === ul.literal) {
			if (value.value.kind !== "uri") {
				throw new Error("internal error decoding schema")
			}
			return types.literal(value.value.value)
		} else if (value.key === ul.product) {
			if (value.value.kind !== "reference") {
				throw new Error("internal error decoding schema")
			}
			const { id } = value.value

			// this is how we check for product element re-use.
			// once we "visit" an element we delete its index.
			// it's important that the deletion happens before
			// we call parseValue() on the components or else
			// reference cycles will cause infinite loops.
			const product = products.get(id)
			if (product === undefined) {
				throw new Error("re-used product element")
			} else {
				products.delete(id)
			}

			const components: Record<string, types.Type> = {}
			for (const [key, value] of Object.entries(product)) {
				if (value.kind !== "coproduct") {
					throw new Error("internal error decoding schema")
				}

				components[key] = toType(value)
			}

			return types.product(components)
		} else if (value.key === ul.coproduct) {
			if (value.value.kind !== "reference") {
				throw new Error("internal error decoding schema")
			}

			const { id } = value.value

			// same for coproducts here...
			const coproduct = coproducts.get(id)
			if (coproduct === undefined) {
				throw new Error("re-used coproduct element")
			} else {
				coproducts.delete(id)
			}

			const options: Record<string, types.Type> = {}
			for (const [key, value] of Object.entries(coproduct)) {
				if (value.kind !== "coproduct") {
					throw new Error("internal error decoding schema")
				}

				options[key] = toType(value)
			}

			return types.coproduct(options)
		} else if (value.key === ul.reference) {
			if (value.value.kind !== "reference") {
				throw new Error("internal error decoding schema")
			}

			const { id } = value.value
			const element = instance.get(ul.class, id)
			if (element.kind !== "product") {
				throw new Error("internal error decoding schema")
			}

			const key = element.components[ul.key]
			if (key === undefined) {
				throw new Error("internal error decoding schema")
			}

			if (key.kind !== "uri") {
				throw new Error("internal error decoding schema")
			}

			return types.reference(key.value)
		} else {
			throw new Error("internal error decoding instance")
		}
	}

	const classes: Record<string, types.Type> = {}
	for (const element of instance.values(ul.class)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding schema")
		}

		const key = element.components[ul.key]
		if (key === undefined) {
			throw new Error("internal error decoding schema")
		}

		if (key.kind !== "uri") {
			throw new Error("internal error decoding schema")
		}

		if (key.value in classes) {
			throw new Error("duplicate class key")
		}

		const value = element.components[ul.value]
		if (value === undefined) {
			throw new Error("internal error decoding schema")
		}

		if (value.kind !== "coproduct") {
			throw new Error("internal error decoding schema")
		}

		classes[key.value] = toType(value)
	}

	return new Schema(classes)
}
