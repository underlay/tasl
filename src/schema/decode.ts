import { ul } from "@underlay/namespaces"

import type { Value } from "../values/index.js"
import { Instance } from "../instance/instance.js"

import {
	Type,
	uri,
	literal,
	product,
	coproduct,
	reference,
} from "../types/index.js"
import { Schema, schema } from "./schema.js"
import { schemaSchema, SchemaSchema, TypeType } from "./schemaSchema.js"

import { iota } from "../instance/utils.js"
import { signalInvalidType } from "../utils.js"

/**
 *
 * @param instance an instance of the schema schema
 * @returns a schema
 */
export function toSchema(instance: Instance<SchemaSchema>): Schema {
	// this is also responsible for validating the schema constraints:
	// - no duplicate class keys
	// - no duplicate component keys
	// - no duplicate option keys
	// - no re-use of product/coproduct elements

	const productCount = instance.count(ul.product)
	const productMaps = new Map<number, Map<string, Value<TypeType>>>(
		iota(productCount, (i) => [i, new Map()])
	)

	for (const [_, element] of instance.elements(ul.component)) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const components = productMaps.get(index)
		if (components === undefined) {
			throw new Error("broken product element reference")
		} else if (components.has(key)) {
			throw new Error("duplicate component key")
		} else {
			components.set(key, value)
		}
	}

	const coproductCount = instance.count(ul.coproduct)
	const coproductMaps = new Map<number, Map<string, Value<TypeType>>>(
		iota(coproductCount, (i) => [i, new Map()])
	)

	for (const [_, element] of instance.elements(ul.option)) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const coproductMap = coproductMaps.get(index)
		if (coproductMap === undefined) {
			throw new Error("broken coproduct element reference")
		} else if (coproductMap.has(key)) {
			throw new Error("duplicate option key")
		} else {
			coproductMap.set(key, value)
		}
	}

	function parseValue(value: Value<TypeType>): Type {
		if (value.key === ul.uri) {
			return uri()
		} else if (value.key === ul.literal) {
			return literal(value.value.value)
		} else if (value.key === ul.product) {
			const { index } = value.value
			const productMap = productMaps.get(index)

			// this is how we check for product element re-use.
			// once we "visit" an element we delete its index.
			// it's important that the deletion happens before
			// we call parseValue() on the components or else
			// reference cycles will cause infinite loops.
			if (productMap === undefined) {
				throw new Error("re-used product element")
			} else {
				productMaps.delete(index)
			}

			const components: Record<string, Type> = {}
			for (const [key, component] of productMap.entries()) {
				components[key] = parseValue(component)
			}

			return product(components)
		} else if (value.key === ul.coproduct) {
			const { index } = value.value
			const coproductMap = coproductMaps.get(index)

			// same for coproducts here...
			if (coproductMap === undefined) {
				throw new Error("re-used coproduct element")
			} else {
				coproductMaps.delete(index)
			}

			const options: Record<string, Type> = {}
			for (const [key, option] of coproductMap.entries()) {
				options[key] = parseValue(option)
			}

			return coproduct(options)
		} else if (value.key === ul.reference) {
			const { index } = value.value
			const element = instance.get(ul.class, index)
			const { value: key } = element.components[ul.key]
			return reference(key)
		} else {
			signalInvalidType(value)
		}
	}

	const classes: Record<string, Type> = {}
	for (const [_, element] of instance.elements(ul.class)) {
		const { value: key } = element.components[ul.key]
		if (key in classes) {
			throw new Error("duplicate class key")
		} else {
			classes[key] = parseValue(element.components[ul.value])
		}
	}

	return schema(classes)
}

export function decodeSchema(data: Uint8Array): Schema {
	const instance = Instance.decode<SchemaSchema>(schemaSchema, data)
	return toSchema(instance)
}
