import { Type, Product, Coproduct, product, coproduct } from "./types.js"

import { forKeys } from "../keys.js"

export function isTypeEqual<T extends Type>(a: T, b: Type): b is T {
	if (a.kind === "uri" && b.kind === "uri") {
		return true
	} else if (a.kind === "literal" && b.kind === "literal") {
		return a.datatype === b.datatype
	} else if (a.kind === "product" && b.kind === "product") {
		for (const key of forKeys(a.components)) {
			if (
				key in b.components &&
				isTypeEqual(a.components[key], b.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(b.components)) {
			if (
				key in a.components &&
				isTypeEqual(a.components[key], b.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (a.kind === "coproduct" && b.kind === "coproduct") {
		for (const key of forKeys(a.options)) {
			if (key in b.options && isTypeEqual(a.options[key], b.options[key])) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(b.options)) {
			if (key in a.options && isTypeEqual(a.options[key], b.options[key])) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (a.kind === "reference" && b.kind === "reference") {
		return a.key === b.key
	} else {
		return false
	}
}

export function isTypeAssignable(a: Type, b: Type): boolean {
	if (a.kind === "uri" && b.kind === "uri") {
		return true
	} else if (a.kind === "literal" && b.kind === "literal") {
		return a.datatype === b.datatype
	} else if (a.kind === "product" && b.kind === "product") {
		for (const key of forKeys(b.components)) {
			if (
				key in a.components &&
				isTypeAssignable(a.components[key], b.components[key])
			) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (a.kind === "coproduct" && b.kind === "coproduct") {
		for (const key of forKeys(a.options)) {
			if (
				key in b.options &&
				isTypeAssignable(a.options[key], b.options[key])
			) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (a.kind === "reference" && b.kind === "reference") {
		return a.key === b.key
	} else {
		return false
	}
}

export function unifyTypes(a: Type, b: Type): Type {
	if (a.kind === "uri" && b.kind === "uri") {
		return b
	} else if (a.kind === "literal" && b.kind === "literal") {
		if (a.datatype === b.datatype) {
			return b
		} else {
			throw new Error("cannot unify unassignable types")
		}
	} else if (a.kind === "product" && b.kind === "product") {
		return product(Object.fromEntries(unifyComponents(a, b)))
	} else if (a.kind === "coproduct" && b.kind === "coproduct") {
		return coproduct(Object.fromEntries(unifyOptions(a, b)))
	} else if (a.kind === "reference" && b.kind === "reference") {
		if (a.key === b.key) {
			return b
		} else {
			throw new Error("cannot unify unassignable types")
		}
	} else {
		throw new Error("cannot unify unassignable types")
	}
}

function* unifyComponents(a: Product, b: Product): Iterable<[string, Type]> {
	for (const key of forKeys(b.components)) {
		if (key in a.components) {
			yield [key, unifyTypes(a.components[key], b.components[key])]
		} else {
			throw new Error("cannot unify unassignable types")
		}
	}
}

function* unifyOptions(a: Coproduct, b: Coproduct): Iterable<[string, Type]> {
	const A = new Set(forKeys(a.options))
	const B = new Set(forKeys(b.options))
	const K = new Set([...A, ...B])
	const keys = Array.from(K).sort()
	for (const key of keys) {
		if (A.has(key) && B.has(key)) {
			yield [key, unifyTypes(a.options[key], b.options[key])]
		} else if (A.has(key)) {
			yield [key, a.options[key]]
		} else if (B.has(key)) {
			yield [key, b.options[key]]
		}
	}
}
