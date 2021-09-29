import { Buffer } from "buffer"

import type { rdf, xsd } from "@underlay/namespaces"

import type { Literal, Product } from "./values.js"

import { floatToString } from "../utils.js"

export const unit = (): Product<{}> => ({ kind: "product", components: {} })

export const string = (value: string): Literal<typeof xsd.string> =>
	Object.freeze({ kind: "literal", value })

export const boolean = (value: boolean): Literal<typeof xsd.boolean> =>
	Object.freeze({ kind: "literal", value: value ? "true" : "false" })

export const float32 = (value: number): Literal<typeof xsd.float> =>
	Object.freeze({ kind: "literal", value: floatToString(value) })

export const float64 = (value: number): Literal<typeof xsd.double> =>
	Object.freeze({ kind: "literal", value: floatToString(value) })

export const int = (value: bigint): Literal<typeof xsd.integer> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const uint = (value: bigint): Literal<typeof xsd.nonNegativeInteger> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const int64 = (value: bigint): Literal<typeof xsd.long> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const int32 = (value: number): Literal<typeof xsd.int> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const int16 = (value: number): Literal<typeof xsd.short> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const int8 = (value: number): Literal<typeof xsd.byte> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const uint64 = (value: bigint): Literal<typeof xsd.unsignedLong> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const uint32 = (value: number): Literal<typeof xsd.unsignedInt> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const uint16 = (value: number): Literal<typeof xsd.unsignedShort> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const uint8 = (value: number): Literal<typeof xsd.unsignedByte> =>
	Object.freeze({ kind: "literal", value: value.toString() })

export const bytes = (value: Uint8Array): Literal<typeof xsd.hexBinary> =>
	Object.freeze({ kind: "literal", value: Buffer.from(value).toString("hex") })

const json = (value: any): Literal<typeof rdf.JSON> =>
	Object.freeze({ kind: "literal", value: JSON.stringify(value) })

export { json as JSON }
