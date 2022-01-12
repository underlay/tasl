import type {
	Type,
	URI,
	Literal,
	Product,
	Coproduct,
	Reference,
} from "../../types.js"

/**
 * Make a new URI type.
 * @returns {URI}
 */
export function uri(): URI {
	return { kind: "uri" }
}

/**
 * Check if a type is a URI type.
 * @param {Type} type
 * @returns {boolean}
 */
export const isURI = (type: Type): type is URI => type.kind === "uri"

/**
 * Make a new literal type.
 * @param {string} datatype
 * @returns {Literal}
 */
export function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype> {
	return { kind: "literal", datatype }
}

/**
 * Check if a type is a literal type.
 * @param {Type} type
 * @returns {boolean}
 */
export const isLiteral = (type: Type): type is Literal =>
	type.kind === "literal"

/**
 * Make a new priduct type.
 * @param components
 * @returns {Product}
 */
export function product<Components extends { [K in string]: Type }>(
	components: Components
): Product<Components> {
	return { kind: "product", components }
}

/**
 * Check if a type is a product type.
 * @param {Type} type
 * @returns {boolean}
 */
export const isProduct = (type: Type): type is Product =>
	type.kind === "product"

/**
 * Make a new coproduct type.
 * @param options
 * @returns {Coproduct}
 */
export function coproduct<Options extends { [K in string]: Type }>(
	options: Options
): Coproduct<Options> {
	return { kind: "coproduct", options }
}

/**
 * Check if a type is a coproduct type.
 * @param {Type} type
 * @returns {boolean}
 */
export const isCoproduct = (type: Type): type is Coproduct =>
	type.kind === "coproduct"

/**
 * Make a new reference type.
 * @param {string} key
 * @returns {T.Reference}
 */
export function reference<K extends string>(key: K): Reference<K> {
	return { kind: "reference", key }
}

/**
 * Check if a type is a reference type.
 * @param {Type} type
 * @returns {boolean}
 */
export const isReference = (type: Type): type is Reference =>
	type.kind === "reference"
