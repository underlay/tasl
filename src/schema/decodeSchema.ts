import { ul } from "@underlay/namespaces"

import { iota } from "../utils.js"
import { mapValues } from "../keys.js"

import type { Type, Value } from "../types.js"
import { decodeInstance } from "../instance/index.js"

import { Schema } from "./schema.js"
import * as types from "./types/index.js"
import { schemaSchema, TypeType } from "./schemaSchema.js"

export function decodeSchema(data: Uint8Array): Schema {
	// this is also responsible for validating the schema constraints:
	// - no duplicate class keys
	// - no duplicate component keys
	// - no duplicate option keys
	// - no re-use of product/coproduct elements

	const instance = decodeInstance(schemaSchema, data)

	const products: Record<string, Value<TypeType>>[] = Array.from(
		iota(instance.count(ul.product), (_) => ({}))
	)

	for (const element of instance.values(ul.component)) {
		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		const components = products[source.index]
		if (components === undefined) {
			throw new Error("broken reference value")
		} else if (key.value in components) {
			throw new Error("duplicate component key")
		} else {
			components[key.value] = value
		}
	}

	const coproducts: Record<string, Value<TypeType>>[] = Array.from(
		iota(instance.count(ul.coproduct), (_) => ({}))
	)

	for (const element of instance.values(ul.option)) {
		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		const options = coproducts[source.index]
		if (options === undefined) {
			throw new Error("broken reference value")
		} else if (key.value in options) {
			throw new Error("duplicate option key")
		} else {
			options[key.value] = value
		}
	}

	function toType(value: Value<TypeType>): Type {
		if (value.key === ul.uri) {
			return types.uri()
		} else if (value.key === ul.literal) {
			return types.literal(value.value.value)
		} else if (value.key === ul.product) {
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

			return types.product(mapValues(components, toType))
		} else if (value.key === ul.coproduct) {
			const { index } = value.value

			// same for coproducts here...
			const options = coproducts[index]
			if (options === undefined) {
				throw new Error("re-used coproduct element")
			} else {
				delete coproducts[index]
			}

			return types.coproduct(mapValues(options, toType))
		} else if (value.key === ul.reference) {
			const { index } = value.value
			const element = instance.get(ul.class, index)
			const key = element.components[ul.key]
			return types.reference(key.value)
		} else {
			throw new Error("internal error decoding instance")
		}
	}

	const classes: { [K in string]: Type } = {}
	for (const element of instance.values(ul.class)) {
		const key = element.components[ul.key]
		if (key.value in classes) {
			throw new Error("duplicate class key")
		} else {
			classes[key.value] = toType(element.components[ul.value])
		}
	}

	return new Schema(classes)
}
