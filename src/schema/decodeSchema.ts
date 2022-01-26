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

	const products: Record<string, values.Value>[] = Array.from(
		iota(instance.count(ul.product), (_) => ({}))
	)

	for (const element of instance.values(ul.component)) {
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding schema")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isReference(source)) {
			throw new Error("internal error decoding schema")
		} else if (key === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isURI(key)) {
			throw new Error("internal error decoding schema")
		} else if (value === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding schema")
		}

		const components = products[source.index]
		if (components === undefined) {
			throw new Error("broken reference value")
		} else if (key.value in components) {
			throw new Error("duplicate component key")
		} else {
			components[key.value] = value
		}
	}

	const coproducts: Record<string, values.Value>[] = Array.from(
		iota(instance.count(ul.coproduct), (_) => ({}))
	)

	for (const element of instance.values(ul.option)) {
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding schema")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isReference(source)) {
			throw new Error("internal error decoding schema")
		} else if (key === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isURI(key)) {
			throw new Error("internal error decoding schema")
		} else if (value === undefined) {
			throw new Error("internal error decoding schema")
		} else if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding schema")
		}

		const options = coproducts[source.index]
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
			if (!values.isURI(value.value)) {
				throw new Error("internal error decoding schema")
			}
			return types.literal(value.value.value)
		} else if (value.key === ul.product) {
			if (!values.isReference(value.value)) {
				throw new Error("internal error decoding schema")
			}
			const { index } = value.value

			// this is how we check for product element re-use.
			// once we "visit" an element we delete its index.
			// it's important that the deletion happens before
			// we call parseValue() on the components or else
			// reference cycles will cause infinite loops.
			const components = products[index]
			if (components === undefined) {
				throw new Error("re-used product element")
			} else {
				delete products[index]
			}

			return types.product(
				Object.fromEntries(
					Object.entries(components).map(([key, value]) => {
						if (!values.isCoproduct(value)) {
							throw new Error("internal error decoding schema")
						}
						return [key, toType(value)]
					})
				)
			)
		} else if (value.key === ul.coproduct) {
			if (!values.isReference(value.value)) {
				throw new Error("internal error decoding schema")
			}
			const { index } = value.value

			// same for coproducts here...
			const options = coproducts[index]
			if (options === undefined) {
				throw new Error("re-used coproduct element")
			} else {
				delete coproducts[index]
			}

			return types.coproduct(
				Object.fromEntries(
					Object.entries(options).map(([key, value]) => {
						if (!values.isCoproduct(value)) {
							throw new Error("internal error decoding schema")
						}
						return [key, toType(value)]
					})
				)
			)
		} else if (value.key === ul.reference) {
			if (!values.isReference(value.value)) {
				throw new Error("internal error decoding schema")
			}

			const { index } = value.value
			const element = instance.get(ul.class, index)
			if (!values.isProduct(element)) {
				throw new Error("internal error decoding schema")
			}

			const key = element.components[ul.key]
			if (key === undefined) {
				throw new Error("internal error decoding schema")
			}

			if (!values.isURI(key)) {
				throw new Error("internal error decoding schema")
			}

			return types.reference(key.value)
		} else {
			throw new Error("internal error decoding instance")
		}
	}

	const classes: Record<string, types.Type> = {}
	for (const element of instance.values(ul.class)) {
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding schema")
		}

		const key = element.components[ul.key]
		if (key === undefined) {
			throw new Error("internal error decoding schema")
		}

		if (!values.isURI(key)) {
			throw new Error("internal error decoding schema")
		}

		if (key.value in classes) {
			throw new Error("duplicate class key")
		}

		const value = element.components[ul.value]
		if (value === undefined) {
			throw new Error("internal error decoding schema")
		}

		if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding schema")
		}

		classes[key.value] = toType(value)
	}

	return new Schema(classes)
}
