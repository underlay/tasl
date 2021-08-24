import type { Type } from "../types/index.js"

type Types = { [key in string]: Type }

export type Schema<S extends Types = Types> = Readonly<S>

export const schema = <S extends Types>(classes: S): Schema<S> =>
	Object.freeze(classes)
