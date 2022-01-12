import { Buffer } from "buffer"

import type { rdf, xsd } from "@underlay/namespaces"
import type { Value, Product, Literal } from "../../types.js"

import { floatToString } from "../../utils.js"

/**
 * make a new unit value
 * @returns {Value}
 */
export function unit(): Value<Product<{}>> {
	return { kind: "product", components: {} }
}

/**
 * make a new literal value with datatype xsd:string
 * @param {string} value
 * @returns {Value}
 */
export function string(value: string): Value<Literal<typeof xsd.string>> {
	return { kind: "literal", value }
}

/**
 * make a new literal value with datatype xsd:boolean
 * @param {boolean} value
 * @returns {Value}
 */
export function boolean(value: boolean): Value<Literal<typeof xsd.boolean>> {
	return { kind: "literal", value: value ? "true" : "false" }
}

/**
 * make a new literal value with datatype xsd:float
 * @param {number} value
 * @returns {Value}
 */
export function float32(value: number): Value<Literal<typeof xsd.float>> {
	return { kind: "literal", value: floatToString(value) }
}

/**
 * make a new literal value with datatype xsd:double
 * @param {number} value
 * @returns {Value}
 */
export function float64(value: number): Value<Literal<typeof xsd.double>> {
	return { kind: "literal", value: floatToString(value) }
}

/**
 * make a new literal value with datatype xsd:long
 * @param {bigint} value
 * @returns {Value}
 */
export function i64(value: bigint): Value<Literal<typeof xsd.long>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:int
 * @param {number} value
 * @returns {Value}
 */
export function i32(value: number): Value<Literal<typeof xsd.int>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:short
 * @param {number} value
 * @returns {Value}
 */
export function i16(value: number): Value<Literal<typeof xsd.short>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:byte
 * @param {number} value
 * @returns {Value}
 */
export function i8(value: number): Value<Literal<typeof xsd.byte>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:unsignedLong
 * @param {number} value
 * @returns {Value}
 */
export function u64(value: bigint): Value<Literal<typeof xsd.unsignedLong>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:unsignedInt
 * @param {number} value
 * @returns {Value}
 */
export function u32(value: number): Value<Literal<typeof xsd.unsignedInt>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:unsignedShort
 * @param {number} value
 * @returns {Value}
 */
export function u16(value: number): Value<Literal<typeof xsd.unsignedShort>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:unsignedByte
 * @param {number} value
 * @returns {Value}
 */
export function u8(value: number): Value<Literal<typeof xsd.unsignedByte>> {
	return { kind: "literal", value: value.toString() }
}

/**
 * make a new literal value with datatype xsd:hexBinary
 * @param {Uint8Array} value
 * @returns {Value}
 */
export function bytes(value: Uint8Array): Value<Literal<typeof xsd.hexBinary>> {
	return { kind: "literal", value: Buffer.from(value).toString("hex") }
}

/**
 * make a new literal value with datatype rdf:JSON
 * @param value
 * @returns {Value}
 */
function json(value: any): Value<Literal<typeof rdf.JSON>> {
	return { kind: "literal", value: JSON.stringify(value) }
}

export { json as JSON }
