import type { Type } from "./type.js"

export interface Literal<T extends string = string> {
	readonly kind: "literal"
	readonly datatype: T
}

export const literal = <T extends string>(datatype: T): Literal<T> =>
	Object.freeze({ kind: "literal", datatype })

export const isLiteral = (type: Type): type is Literal =>
	type.kind === "literal"
