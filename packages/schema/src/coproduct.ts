import type { Type } from "./type.js"

export interface Coproduct<
	Options extends { [key in string]: Type } = {
		[key in string]: Type
	}
> {
	readonly kind: "coproduct"
	readonly options: Readonly<Options>
}

export const coproduct = <
	Options extends { [key in string]: Type } = {
		[key in string]: Type
	}
>(
	options: Options
): Coproduct<Options> =>
	Object.freeze({ kind: "coproduct", options: Object.freeze(options) })

export const isCoproduct = (type: Type): type is Coproduct =>
	type.kind === "coproduct"
