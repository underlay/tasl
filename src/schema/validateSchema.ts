import type { Type } from "../types.js"
import * as types from "./types/index.js"

import { signalInvalidType, validateURI } from "../utils.js"

export function validateSchema(classes: Record<string, Type>) {
	for (const [key, value] of Object.entries(classes)) {
		validateURI(key)
		validateType(classes, value)
	}
}

function validateType(classes: Record<string, Type>, type: Type) {
	if (types.isURI(type)) {
		return
	} else if (types.isLiteral(type)) {
		validateURI(type.datatype)
	} else if (types.isProduct(type)) {
		for (const [key, value] of Object.entries(type.components)) {
			validateURI(key)
			validateType(classes, value)
		}
	} else if (types.isCoproduct(type)) {
		for (const [key, value] of Object.entries(type.options)) {
			validateURI(key)
			validateType(classes, value)
		}
	} else if (types.isReference(type)) {
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
