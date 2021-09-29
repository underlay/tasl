import type * as types from "../types/types.js"

type Types = { [key in string]: types.Type }

export type URI = Readonly<{ kind: "uri"; value: string }>

export const uri = (type: types.URI, value: string): URI =>
	Object.freeze({ kind: "uri", value })

export type Literal<Datatype extends string> = Readonly<{
	kind: "literal"
	value: string
}>

export const literal = <Datatype extends string>(
	type: types.Literal<Datatype>,
	value: string
): Literal<Datatype> => Object.freeze({ kind: "literal", value })

export type Product<Components extends Types> = Readonly<{
	kind: "product"
	components: { readonly [K in keyof Components]: Value<Components[K]> }
}>

export const product = <Components extends Types>(
	type: types.Product<Components>,
	components: { [K in keyof Components]: Value<Components[K]> }
): Product<Components> =>
	Object.freeze({ kind: "product", components: Object.freeze(components) })

export type Coproduct<
	Options extends Types,
	Key extends keyof Options = keyof Options
> = {
	[k in keyof Options]: Readonly<{
		kind: "coproduct"
		key: k
		value: Value<Options[k]>
	}>
}[Key]

export const coproduct = <Options extends Types, Key extends keyof Options>(
	type: types.Coproduct<Options>,
	key: Key,
	value: Value<Options[Key]>
): Coproduct<Options, Key> => Object.freeze({ kind: "coproduct", key, value })

export type Reference<Key extends string> = Readonly<{
	kind: "reference"
	index: number
}>

export const reference = <Key extends string>(
	type: types.Reference<Key>,
	index: number
): Reference<Key> => Object.freeze({ kind: "reference", index })

export type Value<T extends types.Type = types.Type> = T extends types.URI
	? URI
	: T extends types.Literal<infer Datatype>
	? Literal<Datatype>
	: T extends types.Product<infer Components>
	? Product<Components>
	: T extends types.Coproduct<infer Options>
	? Coproduct<Options>
	: T extends types.Reference<infer Key>
	? Reference<Key>
	: never
