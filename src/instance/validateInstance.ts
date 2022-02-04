import { Schema, types } from "../schema/index.js"
import { values } from "./values.js"
import { validateLiteral } from "./literals/index.js"

import { signalInvalidType, validateURI } from "../utils.js"

export function validateInstance(
	schema: Schema,
	elements: Record<string, values.Value[]>
) {
	for (const [key, type] of schema.entries()) {
		if (key in elements) {
			for (const value of elements[key as string]) {
				validateValue(elements, type, value)
			}
		} else {
			throw new Error(`missing element array for class ${key}`)
		}
	}
}

function validateValue(
	elements: Record<string, values.Value[]>,
	type: types.Type,
	value: values.Value
) {
	if (type.kind === "uri") {
		if (value.kind !== "uri") {
			throw new Error(`type error: expected a URI value`)
		}

		validateURI(value.value)
	} else if (type.kind === "literal") {
		if (value.kind !== "literal") {
			throw new Error(`type error: expected a literal value`)
		}

		validateLiteral(type.datatype, value.value)
	} else if (type.kind === "product") {
		if (value.kind !== "product") {
			throw new Error(`type error: expected a product value`)
		}

		for (const key of Object.keys(value.components)) {
			if (type.components[key] === undefined) {
				throw new Error(
					`type error: product value has an extra component with key ${key}`
				)
			}
		}

		for (const key of Object.keys(type.components)) {
			if (value.components[key] === undefined) {
				throw new Error(
					`type error: product value is missing a component with key ${key}`
				)
			}

			validateValue(elements, type.components[key], value.components[key])
		}
	} else if (type.kind === "coproduct") {
		if (value.kind !== "coproduct") {
			throw new Error(`type error: expected a coproduct value`)
		}

		if (type.options[value.key] === undefined) {
			throw new Error(
				`type error: the coproduct value key ${value.key} is not an option in the coproduct type`
			)
		}

		validateValue(elements, type.options[value.key], value.value)
	} else if (type.kind === "reference") {
		if (value.kind !== "reference") {
			throw new Error(`type error: expected a reference value`)
		}

		if (Math.floor(value.index) !== value.index) {
			throw new Error(`type error: reference value index is not an integer`)
		}

		if (value.index < 0) {
			throw new Error(`type error: reference value index is negative`)
		}

		if (value.index >= elements[type.key].length) {
			throw new Error(`reference error: index ${value.index} is out of range`)
		}
	} else {
		signalInvalidType(type)
	}
}
