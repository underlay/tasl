import { Buffer } from "buffer"

import type { rdf, xsd } from "@underlay/namespaces"

import type { URI, Literal, Product } from "./values.js"

import { floatToString } from "../utils.js"

export default {
	unit: (): Product<{}> => ({ kind: "product", components: {} }),
	string: (value: string): Literal<typeof xsd.string> =>
		Object.freeze({ kind: "literal", value }),
	boolean: (value: boolean): Literal<typeof xsd.boolean> =>
		Object.freeze({ kind: "literal", value: value ? "true" : "false" }),
	float32: (value: number): Literal<typeof xsd.float> =>
		Object.freeze({ kind: "literal", value: floatToString(value) }),
	float64: (value: number): Literal<typeof xsd.double> =>
		Object.freeze({ kind: "literal", value: floatToString(value) }),
	int: (value: bigint): Literal<typeof xsd.integer> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	uint: (value: bigint): Literal<typeof xsd.nonNegativeInteger> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	int64: (value: bigint): Literal<typeof xsd.long> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	int32: (value: number): Literal<typeof xsd.int> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	int16: (value: number): Literal<typeof xsd.short> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	int8: (value: number): Literal<typeof xsd.byte> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	uint64: (value: bigint): Literal<typeof xsd.unsignedLong> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	uint32: (value: number): Literal<typeof xsd.unsignedInt> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	uint16: (value: number): Literal<typeof xsd.unsignedShort> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	uint8: (value: number): Literal<typeof xsd.unsignedByte> =>
		Object.freeze({ kind: "literal", value: value.toString() }),
	bytes: (value: Uint8Array): Literal<typeof xsd.hexBinary> =>
		Object.freeze({
			kind: "literal",
			value: Buffer.from(value).toString("hex"),
		}),
	JSON: (value: any): Literal<typeof rdf.JSON> =>
		Object.freeze({ kind: "literal", value: JSON.stringify(value) }),
}
