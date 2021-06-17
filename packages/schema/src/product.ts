import type { Type } from "./type.js"

export interface Product<
	Components extends { [key in string]: Type } = {
		[key in string]: Type
	}
> {
	readonly kind: "product"
	readonly components: Readonly<Components>
}

export const product = <
	Components extends { [key in string]: Type } = {
		[key in string]: Type
	}
>(
	components: Components
): Product<Components> =>
	Object.freeze({ kind: "product", components: Object.freeze(components) })

export const isProduct = (type: Type): type is Product =>
	type.kind === "product"
