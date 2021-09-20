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

export type Value<T extends Type = Type> = T extends URI
	? V.URI
	: T extends Literal<infer Datatype>
	? V.Literal<Datatype>
	: T extends Product<infer Components>
	? V.Product<Components>
	: T extends Coproduct<infer Options>
	? V.Coproduct<Options>
	: T extends Reference<infer Key>
	? V.Reference<Key>
	: never
