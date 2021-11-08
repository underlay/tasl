import { validateLiteral } from "../literals/validate.js"
import type * as Schema from "../schema/index.js"

import { validateURI } from "../utils.js"

export type Instance<S extends Schema.Schema> = {
	[K in keyof S]: Value<S[K]>[]
}

export type Value<T extends Schema.Type = Schema.Type> = T extends Schema.URI
	? URI
	: T extends Schema.Literal<infer Datatype>
	? Literal<Datatype>
	: T extends Schema.Product<infer Components>
	? Product<Components>
	: T extends Schema.Coproduct<infer Options>
	? Coproduct<Options>
	: T extends Schema.Reference<infer Key>
	? Reference<Key>
	: never

export type URI = { kind: "uri"; value: string }

/**
 * Make a new URI value.
 * @param {Schema.URI} type
 * @param {string} value
 * @returns {URI}
 */
export function uri(type: Schema.URI, value: string): URI {
	validateURI(value)
	return { kind: "uri", value }
}

export type Literal<Datatype extends string> = {
	kind: "literal"
	value: string
}

/**
 * Make a new literal value.
 * @param {Schema.Literal} type
 * @param {string} value
 * @returns {Literal}
 */
export function literal<Datatype extends string>(
	type: Schema.Literal<Datatype>,
	value: string
): Literal<Datatype> {
	validateLiteral(type.datatype, value)
	return { kind: "literal", value }
}

export type Product<T extends Schema.Components> = {
	kind: "product"
	components: { [K in keyof T]: Value<T[K]> }
}

/**
 *
 * @param {Schema.Product} type
 * @param components
 * @returns {Product}
 */
export function product<T extends Schema.Components>(
	type: Schema.Product<T>,
	components: { [K in keyof T]: Value<T[K]> }
): Product<T> {
	return { kind: "product", components }
}

export type Coproduct<T extends Schema.Options, K extends keyof T = keyof T> = {
	[k in keyof T]: {
		kind: "coproduct"
		key: k
		value: Value<T[k]>
	}
}[K]

/**
 * Make a new coproduct value.
 * @param {Schema.Coproduct} type
 * @param {string} key
 * @param value
 * @returns {Coproduct}
 */
export function coproduct<T extends Schema.Options, K extends keyof T>(
	type: Schema.Coproduct<T>,
	key: K,
	value: Value<T[K]>
): Coproduct<T, K> {
	return { kind: "coproduct", key, value }
}

export type Reference<Key extends string> = {
	kind: "reference"
	index: number
}

/**
 * Make a new reference value.
 * @param {Schema.Reference} type
 * @param {number} index
 * @returns {Reference}
 */
export function reference<Key extends string>(
	type: Schema.Reference<Key>,
	index: number
): Reference<Key> {
	return { kind: "reference", index }
}
