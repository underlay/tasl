import { Buffer } from "buffer"
import CBOR from "cbor-web"
import { signed, unsigned } from "big-varint"

import { rdf, xsd } from "@underlay/namespaces"

import { State, getUnsignedVarint } from "./utils.js"

import type { Literal } from "../types/index.js"

export function decodeLiteral(state: State, { datatype }: Literal): string {
	if (datatype === xsd.boolean) {
		const view = getView(state, 1)
		const value = view.getUint8(0)
		if (value === 0) {
			return "false"
		} else if (value === 1) {
			return "true"
		} else {
			console.error(value)
			throw new Error(`invalid boolean value`)
		}
	} else if (datatype === xsd.double) {
		const view = getView(state, 8)
		const value = view.getFloat64(0)
		return floatToString(value)
	} else if (datatype === xsd.float) {
		const view = getView(state, 4)
		const value = view.getFloat32(0)
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
		const view = getView(state, 8)
		const value = view.getBigInt64(0)
		return value.toString()
	} else if (datatype === xsd.int) {
		const view = getView(state, 4)
		const value = view.getInt32(0)
		return value.toString()
	} else if (datatype === xsd.short) {
		const view = getView(state, 2)
		const value = view.getInt16(0)
		return value.toString()
	} else if (datatype === xsd.byte) {
		const view = getView(state, 1)
		const value = view.getInt8(0)
		return value.toString()
	} else if (datatype === xsd.unsignedLong) {
		const view = getView(state, 8)
		const value = view.getBigUint64(0)
		return value.toString()
	} else if (datatype === xsd.unsignedInt) {
		const view = getView(state, 4)
		const value = view.getUint32(0)
		return value.toString()
	} else if (datatype === xsd.unsignedShort) {
		const view = getView(state, 2)
		const value = view.getUint16(0)
		return value.toString()
	} else if (datatype === xsd.unsignedByte) {
		const view = getView(state, 1)
		const value = view.getUint8(0)
		return value.toString()
	} else if (datatype === xsd.hexBinary) {
		const byteLength = getUnsignedVarint(state)
		const array = state.data.slice(state.offset, state.offset + byteLength)
		const value = Buffer.from(array).toString("hex")
		state.offset += byteLength
		return value
	} else if (datatype === xsd.base64Binary) {
		const byteLength = getUnsignedVarint(state)
		const array = state.data.slice(state.offset, state.offset + byteLength)
		const value = Buffer.from(array).toString("base64")
		state.offset += byteLength
		return value
	} else if (datatype === rdf.JSON) {
		const byteLength = getUnsignedVarint(state)
		const { buffer } = new Uint8Array(
			state.data.slice(state.offset, state.offset + byteLength)
		)
		const value = CBOR.decodeFirstSync(buffer)
		state.offset += byteLength
		return JSON.stringify(value)
	} else {
		return decodeString(state)
	}
}

export function decodeString(state: {
	data: Uint8Array
	offset: number
}): string {
	const byteLength = getUnsignedVarint(state)
	const value = new TextDecoder().decode(getView(state, byteLength))
	return value
}

function getView(
	state: { data: Uint8Array; offset: number },
	byteLength: number
): DataView {
	const view = new DataView(
		state.data.buffer,
		state.data.byteOffset + state.offset,
		byteLength
	)
	state.offset += byteLength
	return view
}

function floatToString(value: number) {
	if (isNaN(value)) {
		return "NaN"
	} else if (value === 0) {
		return 1 / value > 0 ? "0.0E0" : "-0.0E0"
	} else if (value === Infinity) {
		return "INF"
	} else if (value === -Infinity) {
		return "-INF"
	} else {
		return value.toString()
	}
}
