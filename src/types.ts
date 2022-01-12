export type Type = URI | Literal | Product | Coproduct | Reference

export type URI = { kind: "uri" }

export type Literal<Datatype extends string = string> = {
	kind: "literal"
	datatype: Datatype
}

type Components = { [K in string]: Type }

export type Product<C extends Components = Components> = {
	kind: "product"
	components: C
}

type Options = { [K in string]: Type }

export type Coproduct<O extends Options = Options> = {
	kind: "coproduct"
	options: O
}

export type Reference<K extends string = string> = { kind: "reference"; key: K }

export type Value<X extends Type = Type> = X extends URI
	? { kind: "uri"; value: string }
	: X extends Literal<string>
	? { kind: "literal"; value: string }
	: X extends Product<infer Components>
	? {
			kind: "product"
			components: { [K in keyof Components]: Value<Components[K]> }
	  }
	: X extends Coproduct<infer Options>
	? {
			[K in keyof Options]: {
				kind: "coproduct"
				key: K
				value: Value<Options[K]>
			}
	  }[keyof Options]
	: X extends Reference<string>
	? { kind: "reference"; index: number }
	: never
