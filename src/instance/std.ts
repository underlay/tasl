import { Buffer } from "buffer"

import type { rdf, xsd } from "@underlay/namespaces"

import type { Literal, Product } from "./instance.js"

import { floatToString } from "../utils.js"

/**
 * make a new unit value
 * @returns {Product}
 */
export const unit = (): Product<{}> => ({ kind: "product", components: {} })

/**
 * make a new literal value with datatype xsd:string
 * @param {string} value
 * @returns {Literal}
 */
export const string = (value: string): Literal<typeof xsd.string> => ({
	kind: "literal",
	value,
})

/**
 * make a new literal value with datatype xsd:boolean
 * @param {boolean} value
 * @returns {Literal}
 */
export const boolean = (value: boolean): Literal<typeof xsd.boolean> => ({
	kind: "literal",
	value: value ? "true" : "false",
})

/**
 * make a new literal value with datatype xsd:float
 * @param {number} value
 * @returns {Literal}
 */
export const float32 = (value: number): Literal<typeof xsd.float> => ({
	kind: "literal",
	value: floatToString(value),
})

/**
 * make a new literal value with datatype xsd:double
 * @param {number} value
 * @returns {Literal}
 */
export const float64 = (value: number): Literal<typeof xsd.double> => ({
	kind: "literal",
	value: floatToString(value),
})

/**
 * make a new literal value with datatype xsd:integer
 * @param {bigint} value
 * @returns {Literal}
 */
export const int = (value: bigint): Literal<typeof xsd.integer> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:nonNegativeInteger
 * @param {bigint} value
 * @returns {Literal}
 */
export const uint = (
	value: bigint
): Literal<typeof xsd.nonNegativeInteger> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:long
 * @param {bigint} value
 * @returns {Literal}
 */
export const int64 = (value: bigint): Literal<typeof xsd.long> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:int
 * @param {number} value
 * @returns {Literal}
 */
export const int32 = (value: number): Literal<typeof xsd.int> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:short
 * @param {number} value
 * @returns {Literal}
 */
export const int16 = (value: number): Literal<typeof xsd.short> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:byte
 * @param {number} value
 * @returns {Literal}
 */
export const int8 = (value: number): Literal<typeof xsd.byte> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:unsignedLong
 * @param {number} value
 * @returns {Literal}
 */
export const uint64 = (value: bigint): Literal<typeof xsd.unsignedLong> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:unsignedInt
 * @param {number} value
 * @returns {Literal}
 */
export const uint32 = (value: number): Literal<typeof xsd.unsignedInt> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:unsignedShort
 * @param {number} value
 * @returns {Literal}
 */
export const uint16 = (value: number): Literal<typeof xsd.unsignedShort> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:unsignedByte
 * @param {number} value
 * @returns {Literal}
 */
export const uint8 = (value: number): Literal<typeof xsd.unsignedByte> => ({
	kind: "literal",
	value: value.toString(),
})

/**
 * make a new literal value with datatype xsd:hexBinary
 * @param {Uint8Array} value
 * @returns {Literal}
 */
export const bytes = (value: Uint8Array): Literal<typeof xsd.hexBinary> => ({
	kind: "literal",
	value: Buffer.from(value).toString("hex"),
})

const json = (value: any): Literal<typeof rdf.JSON> => ({
	kind: "literal",
	value: JSON.stringify(value),
})

export { json as JSON }
