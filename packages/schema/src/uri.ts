import type { Type } from "./type.js"

export interface URI {
	readonly kind: "uri"
}

export const uri = (): URI => Object.freeze({ kind: "uri" })

export const isURI = (type: Type): type is URI => type.kind === "uri"
