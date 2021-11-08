import { forKeys } from "../keys.js"
import { validateURI } from "../utils.js"

export type Schema = { [K in string]: Type }

export type Type = URI | Literal | Product | Coproduct | Reference

export type URI = { kind: "uri" }

export function uri(): URI {
	return { kind: "uri" }
}

export const isURI = (type: Type): type is URI => type.kind === "uri"

export type Literal<Datatype extends string = string> = {
	kind: "literal"
	datatype: Datatype
}

export function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype> {
	validateURI(datatype)
	return { kind: "literal", datatype }
}

export const isLiteral = (type: Type): type is Literal =>
	type.kind === "literal"

export const isLiteralDatatype = <Datatype extends string>(
	type: Type,
	datatype: Datatype
): type is Literal<Datatype> =>
	type.kind === "literal" && type.datatype === datatype

export type Components = { [K in string]: Type }

export type Product<T extends Components = Components> = {
	kind: "product"
	components: T
}

export function product<T extends Components = Components>(
	components: T
): Product<T> {
	for (const key of forKeys(components)) {
		validateURI(key)
	}

	return { kind: "product", components }
}

export const isProduct = (type: Type): type is Product =>
	type.kind === "product"

export type Options = { [key in string]: Type }

export type Coproduct<T extends Options = Options> = {
	kind: "coproduct"
	options: T
}

export function coproduct<T extends Options = Options>(
	options: T
): Coproduct<T> {
	for (const key of forKeys(options)) {
		validateURI(key)
	}

	return { kind: "coproduct", options }
}

export const isCoproduct = (type: Type): type is Coproduct =>
	type.kind === "coproduct"

export type Reference<Key extends string = string> = {
	kind: "reference"
	key: Key
}

export function reference<Key extends string>(key: Key): Reference<Key> {
	validateURI(key)
	return { kind: "reference", key }
}

export const isReference = (type: Type): type is Reference =>
	type.kind === "reference"

export const isReferenceKey = <Key extends string>(
	type: Type,
	key: Key
): type is Reference<Key> => type.kind === "reference" && type.key === key
