import type { Type } from "./type.js"

export type Schema<
	S extends { [key in string]: Type } = { [key in string]: Type }
> = Readonly<S>

export const schema = <S extends { [key in string]: Type }>(
	labels: S
): Schema<S> => Object.freeze(labels)
