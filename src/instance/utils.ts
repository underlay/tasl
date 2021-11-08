import type * as Schema from "../schema/index.js"
import { coproduct, product, Value } from "./instance.js"
import type { Instance } from "./instance.js"

import { validateLiteral } from "../literals/validate.js"
import { forEntries, forKeys, mapEntries } from "../keys.js"
import { signalInvalidType, validateURI } from "../utils.js"

export function validateInstance<S extends Schema.Schema>(
	schema: S,
	instance: Instance<S>
) {
	const keys = new Set(forKeys(instance))
	for (const [key, type] of forEntries(schema)) {
		const elements = instance[key]
		if (elements === undefined) {
			throw new Error(`instance is missing class ${key}`)
		}

		keys.delete(key)
		for (const element of elements) {
			validateValue(type, element)
		}
	}

	if (keys.size > 0) {
		throw new Error(
			`instance has extranous classes ${JSON.stringify([...keys])}`
		)
	}
}

function validateValue(type: Schema.Type, value: Value) {
	if (type.kind === "uri") {
		if (value.kind !== "uri") {
			throw new Error("value is not a URI")
		}
		validateURI(value.value)
	} else if (type.kind === "literal") {
		if (value.kind !== "literal") {
			throw new Error("value is not a literal")
		}
		validateLiteral(type.datatype, value.value)
	} else if (type.kind === "product") {
		if (value.kind !== "product") {
			throw new Error("value is not a product")
		}

		const keys = new Set(forKeys(value.components))
		for (const [key, component] of forEntries(type.components)) {
			if (key in value.components) {
				keys.delete(key)
				validateValue(component, value.components[key])
			} else {
				throw new Error(`product value is missing component with key ${key}`)
			}
		}

		if (keys.size > 0) {
			throw new Error(
				`product value has extraneous components ${JSON.stringify([...keys])}`
			)
		}
	} else if (type.kind === "coproduct") {
		if (value.kind !== "coproduct") {
			throw new Error("value is not a coproduct")
		}

		if (value.key in type.options) {
			validateValue(type.options[value.key], value.value)
		} else {
			throw new Error(`no option for coproduct value key ${value.key}`)
		}
	} else if (type.kind === "reference") {
		if (value.kind !== "reference") {
			throw new Error("value is not a reference")
		}
	} else {
		signalInvalidType(type)
	}
}

/**
 * Check whether two values X and Y of the same type are equal.
 * @param type a type T
 * @param x a value X of type T
 * @param y a value Y of type T
 * @throws an error if either of X or Y are not of type T
 * @returns {boolean} true if X is equal to Y, false otherwise
 */
export function isValueEqualTo<T extends Schema.Type>(
	type: T,
	x: Value<T>,
	y: Value<T>
): boolean {
	if (type.kind === "uri" && x.kind === "uri" && y.kind === "uri") {
		return x.value === y.value
	} else if (
		type.kind === "literal" &&
		x.kind === "literal" &&
		y.kind === "literal"
	) {
		return x.value === y.value
	} else if (
		type.kind === "product" &&
		x.kind === "product" &&
		y.kind === "product"
	) {
		for (const key of forKeys(type.components)) {
			if (key in x.components && key in y.components) {
				if (
					isValueEqualTo(
						type.components[key],
						x.components[key],
						y.components[key]
					)
				) {
					continue
				} else {
					return false
				}
			} else {
				throw new Error("one of the values is not of the provided type")
			}
		}
		return true
	} else if (
		type.kind === "coproduct" &&
		x.kind === "coproduct" &&
		y.kind === "coproduct"
	) {
		if (x.key in type.options && y.key in type.options) {
			return (
				x.key === y.key && isValueEqualTo(type.options[x.key], x.value, y.value)
			)
		} else {
			throw new Error("one of the values is not of the provided type")
		}
	} else if (
		type.kind === "reference" &&
		x.kind === "reference" &&
		y.kind === "reference"
	) {
		return x.index === y.index
	} else {
		throw new Error("one of the values is not of the provided type")
	}
}

/**
 * Cast a value of one type to another type.
 * The target type must be a subtype of the source type.
 * A subtype of a type can only differ by (recursively)
 * adding coproduct options and removing product components.
 * This means the only way that casting actually changes the input
 * value is by (again recursively) stripping extraneous product
 * components that are present in the source type but not in the
 * target type.
 * @param type the source type
 * @param value a value of the source type
 * @param target the target type
 * @throws an error if the target type is not a subtype of the source type
 * @returns {Value} a value of the target type
 */
export function cast(
	type: Schema.Type,
	value: Value,
	target: Schema.Type
): Value {
	if (type.kind === "uri") {
		if (value.kind !== "uri" || target.kind !== "uri") {
			throw new Error("values cannot be cast to different kinds of types")
		}

		return value
	} else if (type.kind === "literal") {
		if (value.kind !== "literal" || target.kind !== "literal") {
			throw new Error("values cannot be cast to different kinds of types")
		} else if (type.datatype !== target.datatype) {
			throw new Error(
				"a literal value cannot be cast to a different literal datatype"
			)
		}

		return value
	} else if (type.kind === "product") {
		if (value.kind !== "product" || target.kind !== "product") {
			throw new Error("values cannot be cast to different kinds of types")
		}

		return product(
			target,
			mapEntries(target.components, ([key, component]) => {
				if (type.components[key] === undefined) {
					throw new Error(`the product value has no component key ${key}`)
				}

				return cast(type.components[key], value.components[key], component)
			})
		)
	} else if (type.kind === "coproduct") {
		if (value.kind !== "coproduct" || target.kind !== "coproduct") {
			throw new Error("values cannot be cast to different kinds of types")
		}

		const option = target.options[value.key]
		if (option === undefined) {
			throw new Error(
				`the target coproduct type has no option with key ${value.key}`
			)
		}

		return coproduct(
			target,
			value.key,
			cast(type.options[value.key], value.value, option)
		)
	} else if (type.kind === "reference") {
		if (value.kind !== "reference" || target.kind !== "reference") {
			throw new Error("values cannot be cast to different kinds of types")
		} else if (type.key !== target.key) {
			throw new Error(
				"a reference value cannot be cast to a different reference key"
			)
		}

		return value
	} else {
		signalInvalidType(type)
	}
}
