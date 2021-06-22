import { Buffer } from "buffer"
import varint from "varint"
import signedVarint from "signed-varint"
import CBOR from "cbor-web"

import { rdf, xsd } from "@underlay/namespaces"

import { getVarint } from "./utils.js"

export function decodeLiteral(
	state: { data: Uint8Array; offset: number },
	datatype: string
): string {
	if (datatype === xsd.boolean) {
		const value = varint.decode(state.data, state.offset)
		state.offset += varint.encodingLength(value)
		if (value === 0) {
			return "false"
		} else if (value === 1) {
			return "true"
		} else {
			throw new Error(`Invalid boolean value ${value}`)
		}
	} else if (datatype === xsd.integer) {
		const i = signedVarint.decode(state.data, state.offset)
		state.offset += signedVarint.encodingLength(i)
		return i.toString()
	} else if (datatype === xsd.nonNegativeInteger) {
		const i = varint.decode(state.data, state.offset)
		state.offset += varint.encodingLength(i)
		return i.toString()
	} else if (datatype === xsd.double) {
		const view = getView(state, 8)
		const value = view.getFloat64(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:double value")
		}
		return value.toString()
	} else if (datatype === xsd.float) {
		const view = getView(state, 4)
		const value = view.getFloat32(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:float value")
		}
		return value.toString()
	} else if (datatype === xsd.long) {
		const view = getView(state, 8)
		const value = view.getBigInt64(0)
		return value.toString()
	} else if (datatype === xsd.int) {
		const view = getView(state, 4)
		const value = view.getInt32(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:int value")
		}
		return value.toString()
	} else if (datatype === xsd.short) {
		const view = getView(state, 2)
		const value = view.getInt16(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:short value")
		}
		return value.toString()
	} else if (datatype === xsd.byte) {
		const view = getView(state, 1)
		const value = view.getInt8(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:byte value")
		}
		return value.toString()
	} else if (datatype === xsd.unsignedLong) {
		const view = getView(state, 8)
		const value = view.getBigUint64(0)
		return value.toString()
	} else if (datatype === xsd.unsignedInt) {
		const view = getView(state, 4)
		const value = view.getUint32(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:unsignedInt value")
		}
		return value.toString()
	} else if (datatype === xsd.unsignedShort) {
		const view = getView(state, 2)
		const value = view.getUint16(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:unsignedShort value")
		}
		return value.toString()
	} else if (datatype === xsd.unsignedByte) {
		const view = getView(state, 1)
		const value = view.getUint8(0)
		if (isNaN(value)) {
			throw new Error("Invalid xsd:unsignedByte value")
		}
		return value.toString()
	} else if (datatype === xsd.hexBinary) {
		const length = getVarint(state)
		const array = state.data.slice(state.offset, state.offset + length)
		const value = Buffer.from(array).toString("hex")
		state.offset += length
		return value
	} else if (datatype === xsd.base64Binary) {
		const length = getVarint(state)
		const array = state.data.slice(state.offset, state.offset + length)
		const value = Buffer.from(array).toString("base64")
		state.offset += length
		return value
	} else if (datatype === rdf.JSON) {
		const length = getVarint(state)
		const { buffer } = new Uint8Array(
			state.data.slice(state.offset, state.offset + length)
		)
		const value = CBOR.decodeFirstSync(buffer)
		state.offset += length
		return JSON.stringify(value)
	} else {
		const length = getVarint(state)
		const value = new TextDecoder().decode(getView(state, length))
		return value
	}
}

function getView(
	state: { data: Uint8Array; offset: number },
	length: number
): DataView {
	const view = new DataView(
		state.data.buffer,
		state.data.byteOffset + state.offset,
		length
	)
	state.offset += length
	return view
}
