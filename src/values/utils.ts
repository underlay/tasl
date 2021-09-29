import { Type } from "../types/index.js"
import { Value } from "./values.js"

import { forKeys } from "../keys.js"

// export function* resolveValue<T extends Type = Type>(
// 	type: Type,
// 	value: Value,
// 	path: string[]
// ): Iterable<Value<T>> {
// 	if (path.length === 0) {
// 		yield value as Value<T>
// 	} else {
// 		const [key, ...rest] = path
// 		if (type.kind === "product" && value.kind === "product") {
// 			if (key in type.components) {
// 				yield* resolveValue(type.components[key], value.components[key], rest)
// 			} else {
// 				throw new Error(`invalid product component ${key}`)
// 			}
// 		} else if (type.kind === "coproduct" && value.kind === "coproduct") {
// 			if (key in type.options) {
// 				if (value.key === key) {
// 					yield* resolveValue(type.options[key], value.value, rest)
// 				} else {
// 					return
// 				}
// 			} else {
// 				throw new Error(`invalid coproduct option ${key}`)
// 			}
// 		} else {
// 			throw new Error(`path too long`)
// 		}
// 	}
// }

// /**
//  * Check whether a value is of a given type.
//  * You should rarely, if ever, need to use this method.
//  * Try to always keep values and their types together.
//  * @param type a type T
//  * @param value a value
//  * @returns {boolean} whether the value is of type T
//  */
// export function validateValue<T extends Type>(
// 	type: T,
// 	value: Value
// ): value is Value<T> {
// 	if (type.kind === "uri") {
// 		return value.kind === "uri"
// 	} else if (type.kind === "literal") {
// 		return value.kind === "literal"
// 	} else if (type.kind === "product") {
// 		if (value.kind === "product") {
// 			for (const key of forKeys(type.components)) {
// 				if (key in value.components) {
// 					if (validateValue(type.components[key], value.components[key])) {
// 						continue
// 					}
// 				}
// 				return false
// 			}
// 			return true
// 		} else {
// 			return false
// 		}
// 	} else if (type.kind === "coproduct") {
// 		if (value.kind === "coproduct" && value.key in type.options) {
// 			return validateValue(type.options[value.key], value.value)
// 		} else {
// 			return false
// 		}
// 	} else if (type.kind === "reference") {
// 		return value.kind === "reference"
// 	}
// 	return true
// }

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
					isEqualTo(type.components[key], x.components[key], y.components[key])
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
			return x.key === y.key && isEqualTo(type.options[x.key], x.value, y.value)
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
