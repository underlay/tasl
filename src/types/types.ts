import { forKeys } from "../keys.js"
import { validateURI } from "../utils.js"

export type Type = URI | Literal | Product | Coproduct | Reference

type Types = { [key in string]: Type }

export type URI = Readonly<{ kind: "uri" }>

export function uri(): URI {
	return Object.freeze({ kind: "uri" })
}

export const isURI = (type: Type): type is URI => type.kind === "uri"

export type Literal<Datatype extends string = string> = Readonly<{
	kind: "literal"
	datatype: Datatype
}>

export function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype> {
	validateURI(datatype)
	return Object.freeze({ kind: "literal", datatype })
}

export const isLiteral = (type: Type): type is Literal =>
	type.kind === "literal"

export const isLiteralDatatype = <Datatype extends string>(
	type: Type,
	datatype: Datatype
): type is Literal<Datatype> =>
	type.kind === "literal" && type.datatype === datatype

export type Product<Components extends Types = Types> = Readonly<{
	kind: "product"
	components: Readonly<Components>
}>

export function product<Components extends Types = Types>(
	components: Components
): Product<Components> {
	for (const key of forKeys(components)) {
		validateURI(key)
	}

	return Object.freeze({
		kind: "product",
		components: Object.freeze(components),
	})
}

export const isProduct = (type: Type): type is Product =>
	type.kind === "product"

export type Coproduct<Options extends Types = Types> = Readonly<{
	kind: "coproduct"
	options: Readonly<Options>
}>

export function coproduct<Options extends Types = Types>(
	options: Options
): Coproduct<Options> {
	for (const key of forKeys(options)) {
		validateURI(key)
	}

	return Object.freeze({ kind: "coproduct", options: Object.freeze(options) })
}

export const isCoproduct = (type: Type): type is Coproduct =>
	type.kind === "coproduct"

export function reference<Key extends string>(key: Key): Reference<Key> {
	validateURI(key)
	return Object.freeze({ kind: "reference", key })
}

export type Reference<Key extends string = string> = Readonly<{
	kind: "reference"
	key: Key
}>

export const isReference = (type: Type): type is Reference =>
	type.kind === "reference"

export const isReferenceKey = <Key extends string>(
	type: Type,
	key: Key
): type is Reference<Key> => type.kind === "reference" && type.key === key
