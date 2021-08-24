import {
	Type,
	URI,
	Literal,
	Product,
	Coproduct,
	Reference,
} from "../types/types.js"

namespace V {
	type Types = { [key in string]: Type }

	export type URI = Readonly<{ kind: "uri"; value: string }>

	export type Literal<Datatype extends string> = Readonly<{
		kind: "literal"
		value: string
	}>

	export type Product<Components extends Types> = Readonly<{
		kind: "product"
		components: { readonly [K in keyof Components]: Value<Components[K]> }
	}>

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

	export type Reference<Key extends string> = Readonly<{
		kind: "reference"
		index: number
	}>
}

export type Value<A extends Type = Type> = A extends URI
	? V.URI
	: A extends Literal<infer Datatype>
	? V.Literal<Datatype>
	: A extends Product<infer Components>
	? V.Product<Components>
	: A extends Coproduct<infer Options>
	? V.Coproduct<Options>
	: A extends Reference<infer Key>
	? V.Reference<Key>
	: never
