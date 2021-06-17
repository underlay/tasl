import type { Type } from "./type.js"

export interface Reference<T extends string = string> {
	readonly kind: "reference"
	readonly key: T
}

export const reference = <T extends string>(key: T): Reference<T> =>
	Object.freeze({ kind: "reference", key })

export const isReference = (type: Type): type is Reference =>
	type.kind === "reference"
