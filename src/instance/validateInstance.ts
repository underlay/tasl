import { Schema, types } from "../schema/index.js"
import { values } from "./values.js"
import { validateLiteral } from "./literals/index.js"

import { signalInvalidType, validateURI } from "../utils.js"

export function validateInstance(
	schema: Schema,
	elements: Record<string, Map<number, values.Value>>,
	has: (key: string, id: number) => boolean
) {
	for (const [key, type] of schema.entries()) {
		for (const value of elements[key].values()) {
			validateValue(type, value, has)
		}
	}
}

export function validateValue(
	type: types.Type,
	value: values.Value,
	has: (key: string, id: number) => boolean
	// callback?: (value: values.Value) => void
) {
	// if (callback !== undefined) {
	// 	callback(value)
	// }

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

			validateValue(type.components[key], value.components[key], has)
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

		validateValue(type.options[value.key], value.value, has)
	} else if (type.kind === "reference") {
		if (value.kind !== "reference") {
			throw new Error(`type error: expected a reference value`)
		}

		if (Math.floor(value.id) !== value.id) {
			throw new Error(`type error: reference id ${value.id} is not an integer`)
		}

		if (value.id < 0) {
			throw new Error(`type error: reference id is negative`)
		}

		if (!has(type.key, value.id)) {
			throw new Error(`reference error: no element with id ${value.id}`)
		}
	} else {
		signalInvalidType(type)
	}
}
