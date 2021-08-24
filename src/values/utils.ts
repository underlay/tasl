import { Type } from "../types/index.js"
import { Value } from "./values.js"

import { forKeys } from "../keys.js"

export function* resolveValue<T extends Type = Type>(
	type: Type,
	value: Value,
	path: string[]
): Iterable<Value<T>> {
	if (path.length === 0) {
		yield value as Value<T>
	} else {
		const [key, ...rest] = path
		if (type.kind === "product" && value.kind === "product") {
			if (key in type.components) {
				yield* resolveValue(type.components[key], value.components[key], rest)
			} else {
				throw new Error(`invalid product component ${key}`)
			}
		} else if (type.kind === "coproduct" && value.kind === "coproduct") {
			if (key in type.options) {
				if (value.key === key) {
					yield* resolveValue(type.options[key], value.value, rest)
				} else {
					return
				}
			} else {
				throw new Error(`invalid coproduct option ${key}`)
			}
		} else {
			throw new Error(`path too long`)
		}
	}
}

export function validateValue<T extends Type>(
	type: T,
	value: Value
): value is Value<T> {
	if (type.kind === "uri") {
		return value.kind === "uri"
	} else if (type.kind === "literal") {
		return value.kind === "literal"
	} else if (type.kind === "product") {
		if (value.kind === "product") {
			for (const key of forKeys(type.components)) {
				if (key in value.components) {
					if (validateValue(type.components[key], value.components[key])) {
						continue
					}
				}
				return false
			}
			return true
		} else {
			return false
		}
	} else if (type.kind === "coproduct") {
		if (value.kind === "coproduct" && value.key in type.options) {
			return validateValue(type.options[value.key], value.value)
		} else {
			return false
		}
	} else if (type.kind === "reference") {
		return value.kind === "reference"
	}
	return true
}

export function isValueEqual<T extends Type>(
	type: T,
	a: Value<T>,
	b: Value<T>
): boolean {
	if (type.kind === "uri" && a.kind === "uri" && b.kind === "uri") {
		return a.value === b.value
	} else if (
		type.kind === "literal" &&
		a.kind === "literal" &&
		b.kind === "literal"
	) {
		return a.value === b.value
	} else if (
		type.kind === "product" &&
		a.kind === "product" &&
		b.kind === "product"
	) {
		for (const key of forKeys(type.components)) {
			if (key in a.components && key in b.components) {
				if (
					isValueEqual(
						type.components[key],
						a.components[key],
						b.components[key]
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
		a.kind === "coproduct" &&
		b.kind === "coproduct"
	) {
		if (a.key in type.options && b.key in type.options) {
			return (
				a.key === b.key && isValueEqual(type.options[a.key], a.value, b.value)
			)
		} else {
			throw new Error("one of the values is not of the provided type")
		}
	} else if (
		type.kind === "reference" &&
		a.kind === "reference" &&
		b.kind === "reference"
	) {
		return a.index === b.index
	} else {
		throw new Error("one of the values is not of the provided type")
	}
}
