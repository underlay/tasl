import type { Type } from "./type.js"

import * as Schema from "./schema.js"
import { Product, product } from "./product.js"
import { Coproduct, coproduct } from "./coproduct.js"

import { getKeys, zip } from "../utils.js"

export type Unit = Product<{}>

export const unit = () => product({})

export const isUnit = (type: Type): type is Unit =>
	type.kind === "product" && Object.keys(type.components).length === 0

function* forType(
	type: Type,
	key: string,
	path: string[]
): Generator<[Type, string, string[]], void, undefined> {
	yield [type, key, path]
	if (type.kind === "product") {
		for (const key of Object.keys(type.components)) {
			path.push(key)
			yield* forType(type.components[key], key, path)
			path.pop()
		}
	} else if (type.kind === "coproduct") {
		for (const key of Object.keys(type.options)) {
			path.push(key)
			yield* forType(type.options[key], key, path)
			path.pop()
		}
	}
}

export function* forTypes(
	schema: Schema.Schema
): Generator<[Type, string, string[]], void, undefined> {
	for (const key of Object.keys(schema)) {
		yield* forType(schema[key], key, [])
	}
}

export function isEqual(a: Type, b: Type) {
	if (a === b) {
		return true
	} else if (a.kind !== b.kind) {
		return false
	} else if (a.kind === "reference" && b.kind === "reference") {
		return a.key === b.key
	} else if (a.kind === "uri" && b.kind === "uri") {
		return true
	} else if (a.kind === "literal" && b.kind === "literal") {
		return a.datatype === b.datatype
	} else if (a.kind === "product" && b.kind === "product") {
		for (const [key, component] of Object.entries(a.components)) {
			if (key in b.components && isEqual(component, b.components[key])) {
				continue
			} else {
				return false
			}
		}

		for (const [key, component] of Object.entries(b.components)) {
			if (key in a.components && isEqual(a.components[key], component)) {
				continue
			} else {
				return false
			}
		}

		return true
	} else if (a.kind === "coproduct" && b.kind === "coproduct") {
		for (const [key, option] of Object.entries(a.options)) {
			if (key in b.options && isEqual(option, b.options[key])) {
				continue
			} else {
				return false
			}
		}

		for (const [key, option] of Object.entries(b.options)) {
			if (key in a.options && isEqual(a.options[key], option)) {
				continue
			} else {
				return false
			}
		}

		return true
	} else {
		return false
	}
}

export function isAssignable(a: Type, b: Type): boolean {
	if (a === b) {
		return true
	} else if (a.kind !== b.kind) {
		return false
	} else if (a.kind === "reference" && b.kind === "reference") {
		return a.key === b.key
	} else if (a.kind === "uri" && b.kind === "uri") {
		return true
	} else if (a.kind === "literal" && b.kind === "literal") {
		return a.datatype === b.datatype
	} else if (a.kind === "product" && b.kind === "product") {
		for (const [key, component] of Object.entries(b.components)) {
			if (key in a.components && isAssignable(a.components[key], component)) {
				continue
			} else {
				return false
			}
		}
		return true
	} else if (a.kind === "coproduct" && b.kind === "coproduct") {
		for (const [key, option] of Object.entries(a.options)) {
			if (key in b.options && isAssignable(option, b.options[key])) {
				continue
			} else {
				return false
			}
		}
		return true
	} else {
		return false
	}
}

export function unify(a: Type, b: Type): Type {
	if (a === b) {
		return b
	} else if (a.kind === "reference" && b.kind === "reference") {
		if (a.key === b.key) {
			return b
		}
	} else if (a.kind === "uri" && b.kind === "uri") {
		return b
	} else if (a.kind === "literal" && b.kind === "literal") {
		if (a.datatype === b.datatype) {
			return b
		}
	} else if (a.kind === "product" && b.kind === "product") {
		return product(Object.fromEntries(unifyComponents(a, b)))
	}
	if (a.kind === "coproduct" && b.kind === "coproduct") {
		return coproduct(Object.fromEntries(unifyOptions(a, b)))
	} else {
		throw new Error("Cannot unify unassignable types")
	}
}

function* unifyComponents(
	a: Product,
	b: Product
): Generator<[string, Type], void, undefined> {
	for (const [key, component] of Object.entries(b.components)) {
		if (key in a.components) {
			yield [key, unify(a.components[key], component)]
		} else {
			throw new Error("Cannot unify unassignable types")
		}
	}
}

function* unifyOptions(
	a: Coproduct,
	b: Coproduct
): Generator<[string, Type], void, undefined> {
	const keys = Array.from(
		new Set([...getKeys(a.options), ...getKeys(b.options)])
	).sort()
	for (const key of keys) {
		const A = a.options[key]
		const B = b.options[key]
		if (A !== undefined && B === undefined) {
			yield [key, A]
		} else if (A === undefined && B !== undefined) {
			yield [key, B]
		} else if (A !== undefined && B !== undefined) {
			yield [key, unify(A, B)]
		} else {
			throw new Error("Error unifying options")
		}
	}
}
