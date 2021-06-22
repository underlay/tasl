import { Buffer } from "buffer"
import varint from "varint"
import signedVarint from "signed-varint"
import CBOR from "cbor"

import { xsd, rdf } from "@underlay/namespaces"

import type * as Schema from "../schema/index.js"

const integerPattern = /^(?:\+|\-)?[0-9]+$/

export function encodeLiteral(
	{ datatype }: Schema.Literal,
	value: string
): ArrayBuffer {
	if (datatype === xsd.boolean) {
		if (value === "true") {
			const { buffer } = new Uint8Array([1])
			return buffer
		} else if (value === "false") {
			const { buffer } = new Uint8Array([0])
			return buffer
		} else {
			throw new Error(`Invalid xsd:boolean value: ${value}`)
		}
	} else if (datatype === xsd.integer) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			const { buffer } = new Uint8Array(signedVarint.encode(i))
			return buffer
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.nonNegativeInteger) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && 0 <= i) {
				const { buffer } = new Uint8Array(varint.encode(i))
				return buffer
			} else {
				throw new Error(`xsd:nonNegativeInteger value out of range: ${value}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.double) {
		const f = Number(value)
		if (isNaN(f)) {
			throw new Error(`Invalid xsd:double value: ${value}`)
		}
		const buffer = new ArrayBuffer(8)
		const view = new DataView(buffer)
		view.setFloat64(0, f)
		return buffer
	} else if (datatype === xsd.float) {
		const f = Number(value)
		if (isNaN(f)) {
			throw new Error(`Invalid xsd:float value: ${value}`)
		}
		const buffer = new ArrayBuffer(4)
		const view = new DataView(buffer)
		view.setFloat32(0, f)
		return buffer
	} else if (datatype === xsd.long) {
		if (integerPattern.test(value)) {
			const i = BigInt(value)
			if (-9223372036854775808n <= i && i <= 9223372036854775807n) {
				const buffer = new ArrayBuffer(8)
				const view = new DataView(buffer)
				view.setBigInt64(0, i)
				return buffer
			} else {
				throw new Error(`xsd:long value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.int) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && -2147483648 <= i && i <= 2147483647) {
				const buffer = new ArrayBuffer(4)
				const view = new DataView(buffer)
				view.setInt32(0, i)
				return buffer
			} else {
				throw new Error(`xsd:int value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.short) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && -32768 <= i && i <= 32767) {
				const buffer = new ArrayBuffer(2)
				const view = new DataView(buffer)
				view.setInt16(0, i)
				return buffer
			} else {
				throw new Error(`xsd:int value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.byte) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && -128 <= i && i <= 127) {
				const buffer = new ArrayBuffer(1)
				const view = new DataView(buffer)
				view.setInt8(0, i)
				return buffer
			} else {
				throw new Error(`xsd:int value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.unsignedLong) {
		if (integerPattern.test(value)) {
			const i = BigInt(value)
			if (0n <= i && i <= 18446744073709551615n) {
				const buffer = new ArrayBuffer(8)
				const view = new DataView(buffer)
				view.setBigUint64(0, i)
				return buffer
			} else {
				throw new Error(`xsd:unsignedLong value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.unsignedInt) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && 0 <= i && i <= 4294967295) {
				const buffer = new ArrayBuffer(4)
				const view = new DataView(buffer)
				view.setUint32(0, i)
				return buffer
			} else {
				throw new Error(`xsd:unsignedInt value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.unsignedShort) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && 0 <= i && i <= 65535) {
				const buffer = new ArrayBuffer(2)
				const view = new DataView(buffer)
				view.setUint16(0, i)
				return buffer
			} else {
				throw new Error(`xsd:unsignedSort value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.unsignedByte) {
		if (integerPattern.test(value)) {
			const i = Number(value)
			if (!isNaN(i) && 0 <= i && i <= 255) {
				const buffer = new ArrayBuffer(1)
				const view = new DataView(buffer)
				view.setUint8(0, i)
				return buffer
			} else {
				throw new Error(`xsd:unsignedByte value out of range: ${i}`)
			}
		} else {
			throw new Error(`Invalid integer value: ${value}`)
		}
	} else if (datatype === xsd.hexBinary) {
		const length = Buffer.byteLength(value, "hex")
		const prefixLength = varint.encodingLength(length)
		const array = new Uint8Array(length + prefixLength)
		varint.encode(length, array, 0)
		Buffer.from(value, "hex").copy(array, prefixLength)
		return array.buffer
	} else if (datatype === xsd.base64Binary) {
		const length = Buffer.byteLength(value, "base64")
		const prefixLength = varint.encodingLength(length)
		const array = new Uint8Array(length + prefixLength)
		varint.encode(length, array, 0)
		Buffer.from(value, "base64").copy(array, prefixLength)
		return array.buffer
	} else if (datatype === rdf.JSON) {
		const { buffer } = new Uint8Array(CBOR.encode(JSON.parse(value)))
		return buffer
	} else {
		const length = Buffer.byteLength(value)
		const prefixLength = varint.encodingLength(length)
		const buffer = new ArrayBuffer(prefixLength + length)
		const prefixArray = new Uint8Array(buffer, 0, prefixLength)
		varint.encode(length, prefixArray, 0)
		const array = new Uint8Array(buffer, prefixLength, length)
		new TextEncoder().encodeInto(value, array)
		return buffer
	}
}
