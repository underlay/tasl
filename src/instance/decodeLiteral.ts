import { Buffer } from "buffer"
import * as microcbor from "microcbor"
import { signed, unsigned } from "big-varint"

import { rdf, xsd } from "@underlay/namespaces"

import type { Literal } from "../types/index.js"

import { floatToString } from "../utils.js"

import { decodeUnsignedVarint, DecodeState } from "./utils.js"

export function decodeLiteral(
	state: DecodeState,
	{ datatype }: Literal
): string {
	if (datatype === xsd.boolean) {
		const value = state.view.getUint8(state.offset)
		state.offset += 1
		if (value === 0) {
			return "false"
		} else if (value === 1) {
			return "true"
		} else {
			console.error(value)
			throw new Error(`invalid boolean value`)
		}
	} else if (datatype === xsd.float) {
		const value = state.view.getFloat32(state.offset)
		state.offset += 4
		return floatToString(value)
	} else if (datatype === xsd.double) {
		const value = state.view.getFloat64(state.offset)
		state.offset += 8
		return floatToString(value)
	} else if (datatype === xsd.integer) {
		const i = signed.decode(state.data, state.offset)
		state.offset += signed.encodingLength(i)
		return i.toString()
	} else if (datatype === xsd.nonNegativeInteger) {
		const i = unsigned.decode(state.data, state.offset)
		state.offset += unsigned.encodingLength(i)
		return i.toString()
	} else if (datatype === xsd.long) {
		const value = state.view.getBigInt64(state.offset)
		state.offset += 8
		return value.toString()
	} else if (datatype === xsd.int) {
		const value = state.view.getInt32(state.offset)
		state.offset += 4
		return value.toString()
	} else if (datatype === xsd.short) {
		const value = state.view.getInt16(state.offset)
		state.offset += 2
		return value.toString()
	} else if (datatype === xsd.byte) {
		const value = state.view.getInt8(state.offset)
		state.offset += 1
		return value.toString()
	} else if (datatype === xsd.unsignedLong) {
		const value = state.view.getBigUint64(state.offset)
		state.offset += 8
		return value.toString()
	} else if (datatype === xsd.unsignedInt) {
		const value = state.view.getUint32(state.offset)
		state.offset += 4
		return value.toString()
	} else if (datatype === xsd.unsignedShort) {
		const value = state.view.getUint16(state.offset)
		state.offset += 2
		return value.toString()
	} else if (datatype === xsd.unsignedByte) {
		const value = state.view.getUint8(state.offset)
		state.offset += 1
		return value.toString()
	} else if (datatype === xsd.hexBinary) {
		const byteLength = decodeUnsignedVarint(state)
		const array = state.data.slice(state.offset, state.offset + byteLength)
		const value = Buffer.from(array).toString("hex")
		state.offset += byteLength
		return value
	} else if (datatype === rdf.JSON) {
		const byteLength = decodeUnsignedVarint(state)
		const array = state.data.slice(state.offset, state.offset + byteLength)
		state.offset += byteLength
		return JSON.stringify(microcbor.decode(array))
	} else {
		return decodeString(state)
	}
}

export function decodeString(state: DecodeState): string {
	const byteLength = decodeUnsignedVarint(state)
	const source = state.data.subarray(state.offset, state.offset + byteLength)
	state.offset += byteLength
	return new TextDecoder().decode(source)
}
