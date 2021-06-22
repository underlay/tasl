import type { Type } from "./type.js"

export interface Reference<Key extends string = string> {
	readonly kind: "reference"
	readonly key: Key
}

export const reference = <Key extends string>(key: Key): Reference<Key> =>
	Object.freeze({ kind: "reference", key })

export const isReference = (type: Type): type is Reference =>
	type.kind === "reference"
