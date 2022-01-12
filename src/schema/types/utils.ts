import { forKeys } from "../../keys.js"

import type { Type, Product, Coproduct } from "../../types.js"
import * as types from "./types.js"

/**
 * Check whether the type X is equal to the type Y.
 * Equality is reflexive, transitive, and symmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X and Y are equal to each other, false otherwise
 */
export function isEqualTo<X extends Type>(x: X, y: Type): y is X {
	if (x.kind === "uri" && y.kind === "uri") {
		return true
	} else if (x.kind === "literal" && y.kind === "literal") {
		return x.datatype === y.datatype
	} else if (x.kind === "product" && y.kind === "product") {
		for (const key of forKeys(x.components)) {
			if (
				key in y.components &&
				isEqualTo(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(y.components)) {
			if (
				key in x.components &&
				isEqualTo(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		for (const key of forKeys(x.options)) {
			if (key in y.options && isEqualTo(x.options[key], y.options[key])) {
				continue
			} else {
				return false
			}
		}

		for (const key of forKeys(y.options)) {
			if (key in x.options && isEqualTo(x.options[key], y.options[key])) {
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
 * Check whether the type X is a subtype of the type Y.
 * The subtype relation is reflexive, transitive, and antisymmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X ≤ Y, false otherwise
 */
export function isSubtypeOf(x: Type, y: Type): boolean {
	if (x.kind === "uri" && y.kind === "uri") {
		return true
	} else if (x.kind === "literal" && y.kind === "literal") {
		return x.datatype === y.datatype
	} else if (x.kind === "product" && y.kind === "product") {
		for (const key of forKeys(x.components)) {
			if (
				key in y.components &&
				isSubtypeOf(x.components[key], y.components[key])
			) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		for (const key of forKeys(y.options)) {
			if (key in x.options && isSubtypeOf(x.options[key], y.options[key])) {
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
 * Check whether the type X is comparable with the type Y.
 * The comparability relation is reflexive and symmetric, but not necessarily transitive.
 * @param x a type
 * @param y a type
 * @returns {boolean} true if X ≤ Y or Y ≤ X, false otherwise
 */
export function isComparableWith(x: Type, y: Type): boolean {
	if (x.kind === "uri" && y.kind === "uri") {
		return true
	} else if (x.kind === "literal" && y.kind === "literal") {
		return x.datatype === y.datatype
	} else if (x.kind === "product" && y.kind === "product") {
		for (const key of forKeys(y.components)) {
			if (key in x.components) {
				if (isComparableWith(x.components[key], y.components[key])) {
					continue
				} else {
					return false
				}
			}
		}
		return true
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		for (const key of forKeys(y.options)) {
			if (key in x.options) {
				if (isComparableWith(x.options[key], y.options[key])) {
					continue
				} else {
					return false
				}
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
 * Get the supremum of types X and Y.
 * The supremum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that both X and Y are subtypes of Z
 */
export function leastCommonSupertype(x: Type, y: Type): Type {
	if (x.kind === "uri" && y.kind === "uri") {
		return types.uri()
	} else if (x.kind === "literal" && y.kind === "literal") {
		if (x.datatype === y.datatype) {
			return types.literal(y.datatype)
		} else {
			throw new Error("cannot unify unequal literal types")
		}
	} else if (x.kind === "product" && y.kind === "product") {
		return types.product(Object.fromEntries(forComponentSuprema(x, y)))
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		return types.coproduct(Object.fromEntries(forOptionSuprema(x, y)))
	} else if (x.kind === "reference" && y.kind === "reference") {
		if (x.key === y.key) {
			return types.reference(y.key)
		} else {
			throw new Error("cannot unify unequal reference types")
		}
	} else {
		throw new Error("cannot unify types of different kinds")
	}
}

/**
 * @param x a product type
 * @param y a product type
 * @throws an error if X and Y are not comparable
 * @yields entries of the supremum of X and Y
 */
function* forComponentSuprema(
	x: Product,
	y: Product
): Iterable<[string, Type]> {
	// these do *not* need to be in sort order since they
	// are directly passed into Object.fromEntries
	const keys = new Set([...forKeys(y.components), ...forKeys(x.components)])
	for (const key of keys) {
		if (key in x.components && key in y.components) {
			yield [key, leastCommonSupertype(x.components[key], y.components[key])]
		} else if (key in x.components) {
			yield [key, x.components[key]]
		} else if (key in y.components) {
			yield [key, y.components[key]]
		}
	}
}

/**
 * @param x a coproduct type
 * @param y a coproduct type
 * @throws an error if X and Y are not comparable
 * @yields entries of the supremum of X and Y
 */
function* forOptionSuprema(
	x: Coproduct,
	y: Coproduct
): Iterable<[string, Type]> {
	for (const key of forKeys(y.options)) {
		if (key in x.options) {
			yield [key, leastCommonSupertype(x.options[key], y.options[key])]
		}
	}
}

/**
 * Get the infimum of types X and Y.
 * The infimum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that Z is a subtype of both X and Y
 */
export function greatestCommonSubtype(x: Type, y: Type): Type {
	if (x.kind === "uri" && y.kind === "uri") {
		return types.uri()
	} else if (x.kind === "literal" && y.kind === "literal") {
		if (x.datatype === y.datatype) {
			return types.literal(y.datatype)
		} else {
			throw new Error("cannot unify unequal literal types")
		}
	} else if (x.kind === "product" && y.kind === "product") {
		return types.product(Object.fromEntries(forComponentInfima(x, y)))
	} else if (x.kind === "coproduct" && y.kind === "coproduct") {
		return types.coproduct(Object.fromEntries(forOptionInfima(x, y)))
	} else if (x.kind === "reference" && y.kind === "reference") {
		if (x.key === y.key) {
			return types.reference(y.key)
		} else {
			throw new Error("cannot unify unequal reference types")
		}
	} else {
		throw new Error("cannot unify types of different kinds")
	}
}

/**
 * @param x a product type
 * @param y a product type
 * @throws an error if X and Y are not unifiable
 * @yields entries of the infimum of X and Y
 */
function* forComponentInfima(x: Product, y: Product): Iterable<[string, Type]> {
	for (const key of forKeys(y.components)) {
		if (key in x.components) {
			yield [key, greatestCommonSubtype(x.components[key], y.components[key])]
		}
	}
}

/**
 * @param x a coproduct type
 * @param y a coproduct type
 * @throws an error if X and Y are not unifiable
 * @yields entries of the infimum of X and Y
 */
function* forOptionInfima(
	x: Coproduct,
	y: Coproduct
): Iterable<[string, Type]> {
	// these do *not* need to be in sort order since they
	// are directly passed into Object.fromEntries
	const keys = new Set([...forKeys(y.options), ...forKeys(x.options)])
	for (const key of keys) {
		if (key in x.options && key in y.options) {
			yield [key, greatestCommonSubtype(x.options[key], y.options[key])]
		} else if (key in x.options) {
			yield [key, x.options[key]]
		} else if (key in y.options) {
			yield [key, y.options[key]]
		}
	}
}
