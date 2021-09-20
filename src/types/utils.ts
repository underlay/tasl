import { Type, Product, Coproduct, product, coproduct } from "./types.js"

import { forKeys } from "../keys.js"

/**
 * Check whether the type X is equal to the type Y.
 * Equality is associative, commutative, and symmetric.
 * @param x
 * @param y
 * @returns true if X and Y are equal to each other, false otherwise
 */
export function isTypeEqual<T extends Type>(x: T, y: Type): y is T {
	if (x.kind === "uri" && y.kind === "uri") {
		return true
	} else if (x.kind === "literal" && y.kind === "literal") {
		return x.datatype === y.datatype
	} else if (x.kind === "product" && y.kind === "product") {
		for (const key of forKeys(x.components)) {
			if (
				key in y.components &&
				isTypeEqual(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(y.components)) {
			if (
				key in x.components &&
				isTypeEqual(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		for (const key of forKeys(x.options)) {
			if (key in y.options && isTypeEqual(x.options[key], y.options[key])) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(y.options)) {
			if (key in x.options && isTypeEqual(x.options[key], y.options[key])) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (x.kind === "reference" && y.kind === "reference") {
		return x.key === y.key
	} else {
		return false
	}
}

/**
 * Check whether the type X is assignable to the type Y.
 * Intuitively, assignability means that X is a "superset" of Y,
 * or that you can freely use values of type X as if they were values of type Y.
 * URIs, literals, and references are assignable if they are strictly equal.
 * A product type X is assignable to the product type Y if for every key K in Y,
 * X has a component with key K and the type X(K) is assignable to the type Y(K).
 * A coproduct type X is assignable to the coproduct type Y if for every key K in X,
 * Y has a component with key K and the type X(K) is assignable to the type Y(K).
 * Types of different kinds are never assignable.
 * Assignability is associative and commutative, but not symmetric.
 * @param x
 * @param y
 * @returns true if X is assignable to Y, false otherwise
 */
export function isTypeAssignable(x: Type, y: Type): boolean {
	if (x.kind === "uri" && y.kind === "uri") {
		return true
	} else if (x.kind === "literal" && y.kind === "literal") {
		return x.datatype === y.datatype
	} else if (x.kind === "product" && y.kind === "product") {
		for (const key of forKeys(y.components)) {
			if (
				key in x.components &&
				isTypeAssignable(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		for (const key of forKeys(x.options)) {
			if (
				key in y.options &&
				isTypeAssignable(x.options[key], y.options[key])
			) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (x.kind === "reference" && y.kind === "reference") {
		return x.key === y.key
	} else {
		return false
	}
}

/**
 *
 * @param x
 * @param y
 * @returns
 */
export function unifyTypes(x: Type, y: Type): Type {
	if (x.kind === "uri" && y.kind === "uri") {
		return y
	} else if (x.kind === "literal" && y.kind === "literal") {
		if (x.datatype === y.datatype) {
			return y
		} else {
			throw new Error("cannot unify unassignable types")
		}
	} else if (x.kind === "product" && y.kind === "product") {
		return product(Object.fromEntries(unifyComponents(x, y)))
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		return coproduct(Object.fromEntries(unifyOptions(x, y)))
	} else if (x.kind === "reference" && y.kind === "reference") {
		if (x.key === y.key) {
			return y
		} else {
			throw new Error("cannot unify unassignable types")
		}
	} else {
		throw new Error("cannot unify unassignable types")
	}
}

function* unifyComponents(x: Product, y: Product): Iterable<[string, Type]> {
	for (const key of forKeys(y.components)) {
		if (key in x.components) {
			yield [key, unifyTypes(x.components[key], y.components[key])]
		} else {
			throw new Error("cannot unify unassignable types")
		}
	}
}

function* unifyOptions(x: Coproduct, y: Coproduct): Iterable<[string, Type]> {
	const A = new Set(forKeys(x.options))
	const B = new Set(forKeys(y.options))
	const K = new Set([...A, ...B])
	const keys = Array.from(K).sort()
	for (const key of keys) {
		if (A.has(key) && B.has(key)) {
			yield [key, unifyTypes(x.options[key], y.options[key])]
		} else if (A.has(key)) {
			yield [key, x.options[key]]
		} else if (B.has(key)) {
			yield [key, y.options[key]]
		}
	}
}
