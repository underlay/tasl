import { Buffer } from "buffer"
import varint from "varint"
import CBOR from "cbor"
import { signed, unsigned } from "big-varint"

import { xsd, rdf } from "@underlay/namespaces"

import type { Literal } from "../types/index.js"
import type { Value } from "../values/index.js"
import {
	parseBoolean,
	parseFloat,
	parseInteger,
	integerValidators,
	floatValidators,
} from "./validate.js"

export function encodeLiteral(
	{ datatype }: Literal,
	{ value }: Value<Literal>
): ArrayBuffer {
	if (datatype === xsd.boolean) {
		const byte = parseBoolean(value) ? 1 : 0
		const buffer = new ArrayBuffer(1)
		const view = new DataView(buffer)
		view.setUint8(0, byte)
		return buffer
	} else if (datatype === xsd.double) {
		const f = parseFloat(value)
		floatValidators[xsd.double](f)
		const buffer = new ArrayBuffer(8)
		const view = new DataView(buffer)
		view.setFloat64(0, f)
		return buffer
	} else if (datatype === xsd.float) {
		const f = parseFloat(value)
		floatValidators[xsd.float](f)
		const buffer = new ArrayBuffer(4)
		const view = new DataView(buffer)
		view.setFloat32(0, f)
		return buffer
	} else if (datatype === xsd.integer) {
		const i = parseInteger(value)
		integerValidators[xsd.integer](i)
		const { buffer } = signed.encode(i)
		return buffer
	} else if (datatype === xsd.nonNegativeInteger) {
		const i = parseInteger(value)
		integerValidators[xsd.nonNegativeInteger](i)
		const { buffer } = unsigned.encode(i)
		return buffer
	} else if (datatype === xsd.long) {
		const i = parseInteger(value)
		integerValidators[xsd.long](i)
		const buffer = new ArrayBuffer(8)
		const view = new DataView(buffer)
		view.setBigInt64(0, i)
		return buffer
	} else if (datatype === xsd.int) {
		const i = parseInteger(value)
		integerValidators[xsd.int](i)
		const buffer = new ArrayBuffer(4)
		const view = new DataView(buffer)
		view.setInt32(0, Number(i))
		return buffer
	} else if (datatype === xsd.short) {
		const i = parseInteger(value)
		integerValidators[xsd.short](i)
		const buffer = new ArrayBuffer(2)
		const view = new DataView(buffer)
		view.setInt16(0, Number(i))
		return buffer
	} else if (datatype === xsd.byte) {
		const i = parseInteger(value)
		integerValidators[xsd.byte](i)
		const buffer = new ArrayBuffer(1)
		const view = new DataView(buffer)
		view.setInt8(0, Number(i))
		return buffer
	} else if (datatype === xsd.unsignedLong) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedLong](i)
		const buffer = new ArrayBuffer(8)
		const view = new DataView(buffer)
		view.setBigUint64(0, i)
		return buffer
	} else if (datatype === xsd.unsignedInt) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedInt](i)
		const buffer = new ArrayBuffer(4)
		const view = new DataView(buffer)
		view.setUint32(0, Number(i))
		return buffer
	} else if (datatype === xsd.unsignedShort) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedShort](i)
		const buffer = new ArrayBuffer(2)
		const view = new DataView(buffer)
		view.setUint16(0, Number(i))
		return buffer
	} else if (datatype === xsd.unsignedByte) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedByte](i)
		const buffer = new ArrayBuffer(1)
		const view = new DataView(buffer)
		view.setUint8(0, Number(i))
		return buffer
	} else if (datatype === xsd.hexBinary) {
		const data = Buffer.from(value, "hex")
		const prefixLength = varint.encodingLength(data.length)
		const buffer = new ArrayBuffer(prefixLength + data.length)
		const array = new Uint8Array(buffer)
		varint.encode(length, array, 0)
		data.copy(array, prefixLength)
		return buffer
	} else if (datatype === rdf.JSON) {
		const data = CBOR.encode(JSON.parse(value))
		const prefixLength = varint.encodingLength(data.length)
		const buffer = new ArrayBuffer(prefixLength + data.length)
		const array = new Uint8Array(buffer)
		varint.encode(length, array, 0)
		data.copy(array, prefixLength)
		return buffer
	} else {
		return encodeString(value)
	}
}

export function encodeString(value: string): ArrayBuffer {
	const length = Buffer.byteLength(value)
	const prefixLength = varint.encodingLength(length)
	const buffer = new ArrayBuffer(prefixLength + length)
	const prefixArray = new Uint8Array(buffer, 0, prefixLength)
	varint.encode(length, prefixArray, 0)
	const array = new Uint8Array(buffer, prefixLength, length)
	const encoder = new TextEncoder()
	encoder.encodeInto(value, array)
	return buffer
}
