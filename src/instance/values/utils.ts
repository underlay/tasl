import { signalInvalidType } from "../../utils.js"

import { types } from "../../schema/index.js"
import * as values from "./values.js"
import {
	Type,
	Value,
	URI,
	Literal,
	Product,
	Coproduct,
	Reference,
} from "../../types.js"

/**
 * Check whether two values X and Y of the same type are equal.
 * @param type a type T
 * @param x a value X of type T
 * @param y a value Y of type T
 * @throws an error if either of X or Y are not of type T
 * @returns {boolean} true if X is equal to Y, false otherwise
 */
export function isEqualTo<T extends Type>(
	type: T,
	x: Value<T>,
	y: Value<T>
): boolean {
	if (types.isURI(type) && values.isURI(x) && values.isURI(y)) {
		return x.value === y.value
	} else if (
		types.isLiteral(type) &&
		values.isLiteral(x) &&
		values.isLiteral(y)
	) {
		return x.value === y.value
	} else if (
		types.isProduct(type) &&
		values.isProduct(x) &&
		values.isProduct(y)
	) {
		for (const [key, component] of Object.entries(type.components)) {
			if (key in x.components && key in y.components) {
				if (isEqualTo(component, x.components[key], y.components[key])) {
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
		types.isCoproduct(type) &&
		values.isCoproduct(x) &&
		values.isCoproduct(y)
	) {
		if (x.key in type.options && y.key in type.options) {
			return x.key === y.key && isEqualTo(type.options[x.key], x.value, y.value)
		} else {
			throw new Error("one of the values is not of the provided type")
		}
	} else if (
		types.isReference(type) &&
		values.isReference(x) &&
		values.isReference(y)
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
export function cast<X extends Type, Y extends Type>(
	type: X,
	value: Value<X>,
	target: Y
): Value<Y> {
	if (type.kind === "uri") {
		if (value.kind !== "uri" || target.kind !== "uri") {
			throw new Error("values cannot be cast to different kinds of types")
		}

		return value as Value<URI> as Value<Y>
	} else if (type.kind === "literal") {
		if (value.kind !== "literal" || target.kind !== "literal") {
			throw new Error("values cannot be cast to different kinds of types")
		} else if (type.datatype !== target.datatype) {
			throw new Error(
				"a literal value cannot be cast to a different literal datatype"
			)
		}

		return value as Value<Literal> as Value<Y>
	} else if (type.kind === "product") {
		if (value.kind !== "product" || target.kind !== "product") {
			throw new Error("values cannot be cast to different kinds of types")
		}

		return values.product(
			Object.fromEntries(
				Object.entries(target.components).map(([key, component]) => {
					if (type.components[key] === undefined) {
						throw new Error(`the product value has no component key ${key}`)
					} else if (value.components[key] === undefined) {
						throw new Error("the product value is not of the provided type")
					}

					return [
						key,
						cast(type.components[key], value.components[key], component),
					]
				})
			)
		) as Value<Product> as Value<Y>
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

		return values.coproduct(
			value.key,
			cast(type.options[value.key], value.value, option)
		) as Value<Coproduct> as Value<Y>
	} else if (type.kind === "reference") {
		if (value.kind !== "reference" || target.kind !== "reference") {
			throw new Error("values cannot be cast to different kinds of types")
		} else if (type.key !== target.key) {
			throw new Error(
				"a reference value cannot be cast to a different reference key"
			)
		}

		return value as Value<Reference> as Value<Y>
	} else {
		signalInvalidType(type)
	}
}
