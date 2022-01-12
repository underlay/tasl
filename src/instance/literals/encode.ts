import { Buffer } from "buffer"
import * as microcbor from "microcbor"

import { xsd, rdf } from "@underlay/namespaces"

import type { Value, Literal } from "../../types.js"

import {
	parseBoolean,
	parseFloat,
	parseInteger,
	integerValidators,
	floatValidators,
} from "./validate.js"

import {
	allocate,
	EncodeState,
	encodeString,
	encodeUnsignedVarint,
} from "../../utils.js"

export function* encodeLiteral<Datatype extends string>(
	state: EncodeState,
	{ datatype }: Literal<Datatype>,
	{ value }: Value<Literal<Datatype>>
): Iterable<Uint8Array> {
	if (datatype === xsd.boolean) {
		yield* allocate(state, 1)
		state.view.setUint8(state.offset, parseBoolean(value) ? 1 : 0)
		state.offset += 1
	} else if (datatype === xsd.float) {
		const f = parseFloat(value)
		floatValidators[xsd.float](f)
		yield* allocate(state, 4)
		state.view.setFloat32(state.offset, f)
		state.offset += 4
	} else if (datatype === xsd.double) {
		const f = parseFloat(value)
		floatValidators[xsd.double](f)
		yield* allocate(state, 8)
		state.view.setFloat64(state.offset, f)
		state.offset += 8
	} else if (datatype === xsd.long) {
		const i = parseInteger(value)
		integerValidators[xsd.long](i)
		yield* allocate(state, 8)
		state.view.setBigInt64(state.offset, i)
		state.offset += 8
	} else if (datatype === xsd.int) {
		const i = parseInteger(value)
		integerValidators[xsd.int](i)
		yield* allocate(state, 4)
		state.view.setInt32(state.offset, Number(i))
		state.offset += 4
	} else if (datatype === xsd.short) {
		const i = parseInteger(value)
		integerValidators[xsd.short](i)
		yield* allocate(state, 2)
		state.view.setInt16(state.offset, Number(i))
		state.offset += 2
	} else if (datatype === xsd.byte) {
		const i = parseInteger(value)
		integerValidators[xsd.byte](i)
		yield* allocate(state, 1)
		state.view.setInt8(state.offset, Number(i))
		state.offset += 1
	} else if (datatype === xsd.unsignedLong) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedLong](i)
		yield* allocate(state, 8)
		state.view.setBigUint64(state.offset, i)
		state.offset += 8
	} else if (datatype === xsd.unsignedInt) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedInt](i)
		yield* allocate(state, 4)
		state.view.setUint32(state.offset, Number(i))
		state.offset += 4
	} else if (datatype === xsd.unsignedShort) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedShort](i)
		yield* allocate(state, 2)
		state.view.setUint16(state.offset, Number(i))
		state.offset += 2
	} else if (datatype === xsd.unsignedByte) {
		const i = parseInteger(value)
		integerValidators[xsd.unsignedByte](i)
		yield* allocate(state, 1)
		state.view.setUint8(state.offset, Number(i))
		state.offset += 1
	} else if (datatype === xsd.hexBinary) {
		const source = Buffer.from(value, "hex")
		yield* encodeUnsignedVarint(state, source.byteLength)
		yield* allocate(state, source.byteLength)
		const target = new Uint8Array(state.buffer, state.offset, source.byteLength)
		target.set(source)
		state.offset += source.byteLength
	} else if (datatype === rdf.JSON) {
		const source = microcbor.encode(JSON.parse(value))
		yield* encodeUnsignedVarint(state, source.byteLength)
		yield* allocate(state, source.byteLength)
		const target = new Uint8Array(state.buffer, state.offset, source.byteLength)
		target.set(source)
		state.offset += source.byteLength
	} else {
		yield* encodeString(state, value)
	}
}
