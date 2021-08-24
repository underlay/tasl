export type Type = URI | Literal | Product | Coproduct | Reference

type Types = { [key in string]: Type }

export type URI = Readonly<{ kind: "uri" }>

export const uri = (): URI => Object.freeze({ kind: "uri" })

export const isURI = (type: Type): type is URI => type.kind === "uri"

export type Literal<Datatype extends string = string> = Readonly<{
	kind: "literal"
	datatype: Datatype
}>

export const literal = <Datatype extends string>(
	datatype: Datatype
): Literal<Datatype> => Object.freeze({ kind: "literal", datatype })

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

export const product = <Components extends Types = Types>(
	components: Components
): Product<Components> =>
	Object.freeze({ kind: "product", components: Object.freeze(components) })

export const isProduct = (type: Type): type is Product =>
	type.kind === "product"

export type Coproduct<Options extends Types = Types> = Readonly<{
	kind: "coproduct"
	options: Readonly<Options>
}>

export const coproduct = <Options extends Types = Types>(
	options: Options
): Coproduct<Options> =>
	Object.freeze({ kind: "coproduct", options: Object.freeze(options) })

export const isCoproduct = (type: Type): type is Coproduct =>
	type.kind === "coproduct"

export const reference = <Key extends string>(key: Key): Reference<Key> =>
	Object.freeze({ kind: "reference", key })

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
