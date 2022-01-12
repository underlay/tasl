import type {
	URI,
	Literal,
	Product,
	Coproduct,
	Reference,
	Value,
} from "../../types.js"

/**
 * Make a new URI value.
 * @param {string} value
 * @returns {Instance.URI}
 */
export function uri(value: string): { kind: "uri"; value: string } {
	return { kind: "uri", value }
}

/**
 * Check if a value is a URI.
 * @param {Instance.Value} value
 * @returns {boolean}
 */
export const isURI = (value: Value): value is Value<URI> => value.kind === "uri"

/**
 * Make a new literal value.
 * @param {string} value
 * @returns {Instance.Literal}
 */
export function literal(value: string): { kind: "literal"; value: string } {
	return { kind: "literal", value }
}

/**
 * Check if a value is a literal.
 * @param {Instance.Value} value
 * @returns {boolean}
 */
export const isLiteral = (value: Value): value is Value<Literal> =>
	value.kind === "literal"

/**
 * Make a new product value.
 * @param components
 * @returns {Instance.Product}
 */
export function product<C extends { [K in string]: Value }>(
	components: C
): { kind: "product"; components: C } {
	return { kind: "product", components }
}

/**
 * Check if a value is a product.
 * @param {Value} value
 * @returns {boolean}
 */
export const isProduct = (value: Value): value is Value<Product> =>
	value.kind === "product"

/**
 * Make a new coproduct value.
 * @param {string} key
 * @param value
 * @returns {Coproduct}
 */
export function coproduct<K extends string, V extends Value>(
	key: K,
	value: V
): { kind: "coproduct"; key: K; value: V } {
	return { kind: "coproduct", key, value }
}

/**
 * Check if a value is a coproduct.
 * @param {Value} value
 * @returns {boolean}
 */
export const isCoproduct = (value: Value): value is Value<Coproduct> =>
	value.kind === "coproduct"

/**
 * Make a new reference value.
 * @param {number} index
 * @returns {Reference}
 */
export function reference(index: number): { kind: "reference"; index: number } {
	return { kind: "reference", index }
}

/**
 * Check if a value is a reference.
 * @param {Value} value
 * @returns {boolean}
 */
export const isReference = (value: Value): value is Value<Reference> =>
	value.kind === "reference"
