import { types } from "./types.js"

import { signalInvalidType, validateURI, getKeys } from "../utils.js"
import { cache } from "../keys.js"

export function validateSchema(
	classes: Record<string, types.Type>
): readonly string[] {
	Object.freeze(classes)
	const keys = getKeys(classes)
	for (const key of keys) {
		validateURI(key)
		validateType(classes, classes[key])
	}
	return keys
}

function validateType(classes: Record<string, types.Type>, type: types.Type) {
	Object.freeze(type)
	if (type.kind === "uri") {
		return
	} else if (type.kind === "literal") {
		validateURI(type.datatype)
	} else if (type.kind === "product") {
		Object.freeze(type.components)
		const keys = getKeys(type.components)
		cache.product.set(type, keys)
		for (const key of keys) {
			validateURI(key)
			validateType(classes, type.components[key])
		}
	} else if (type.kind === "coproduct") {
		Object.freeze(type.options)
		const keys = getKeys(type.options)
		cache.coproduct.set(type, keys)
		for (const key of keys) {
			validateURI(key)
			validateType(classes, type.options[key])
		}
	} else if (type.kind === "reference") {
		if (type.key in classes) {
			return
		} else {
			throw new Error(
				`invalid reference type: there is no class with key ${type.key} in the schema`
			)
		}
	} else {
		signalInvalidType(type)
	}
}
