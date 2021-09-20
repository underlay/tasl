import { rdf, xsd } from "@underlay/namespaces"
import { getFloat32Precision } from "fp16"
import type { Literal } from "../types/index.js"

const integerPattern = /^(\+|\-)?[0-9]+$/
const floatPattern = /^(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)([Ee](\+|-)?[0-9]+)?$/
const hexPattern = /^([0-9a-fA-F]{2})*$/

export function parseBoolean(value: string) {
	if (value === "true" || value === "1") {
		return true
	} else if (value === "false" || value === "0") {
		return false
	} else {
		throw new Error(`invalid xsd:boolean value ${JSON.stringify(value)}`)
	}
}

export function parseFloat(value: string) {
	if (value === "NaN") {
		return NaN
	} else if (value === "INF" || value === "+INF") {
		return Infinity
	} else if (value === "-INF") {
		return -Infinity
	} else if (floatPattern.test(value)) {
		const f = Number(value)
		return f
	} else {
		throw new Error(`invalid floating-point value ${JSON.stringify(value)}`)
	}
}

export function parseInteger(value: string) {
	if (integerPattern.test(value)) {
		return BigInt(value)
	} else {
		throw new Error(`invalid integer value ${JSON.stringify(value)}`)
	}
}

export const floatValidators: Record<string, (f: number) => void> = {
	[xsd.double](f: number) {},
	[xsd.float](f: number) {
		if (getFloat32Precision(f) !== "exact") {
			throw new Error(`xsd:float value ${f} out of precision`)
		}
	},
}

export const integerValidators: Record<string, (i: BigInt) => void> = {
	[xsd.integer](i: BigInt) {},
	[xsd.nonNegativeInteger](i: BigInt) {
		if (i < 0n) {
			throw new Error(
				`integer value ${i} out of range for xsd:nonNegativeInteger datatype`
			)
		}
	},
	[xsd.long](i: BigInt) {
		if (i < -9223372036854775808n || 9223372036854775807n < i) {
			throw new Error(`integer value ${i} out of range for xsd:long datatype`)
		}
	},
	[xsd.int](i: BigInt) {
		if (i < -2147483648n || 2147483647n < i) {
			throw new Error(`integer value ${i} out of range for xsd:int datatype`)
		}
	},
	[xsd.short](i: BigInt) {
		if (i < -32768n || 32767n < i) {
			throw new Error(`integer value ${i} out of range for xsd:short datatype`)
		}
	},
	[xsd.byte](i: BigInt) {
		if (i < -128n || 127n < i) {
			throw new Error(`integer value ${i} out of range for xsd:byte datatype`)
		}
	},
	[xsd.unsignedLong](i: BigInt) {
		if (i < 0n || 18446744073709551615n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedLong datatype`
			)
		}
	},
	[xsd.unsignedInt](i: BigInt) {
		if (i < 0n || 4294967295n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedInt datatype`
			)
		}
	},
	[xsd.unsignedShort](i: BigInt) {
		if (i < 0n || 65535n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedShort datatype`
			)
		}
	},
	[xsd.unsignedByte](i: BigInt) {
		if (i < 0n || 255n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedByte datatype`
			)
		}
	},
}

export function validateLiteral(type: Literal, value: string) {
	if (type.datatype === xsd.boolean) {
		parseBoolean(value)
	} else if (type.datatype in floatValidators) {
		const f = parseFloat(value)
		floatValidators[type.datatype](f)
	} else if (type.datatype in integerValidators) {
		const i = parseInteger(value)
		integerValidators[type.datatype](i)
	} else if (type.datatype === xsd.hexBinary) {
		if (hexPattern.test(value)) {
			return
		} else {
			console.error(value)
			throw new Error(`invalid xsd:hexBinary value`)
		}
	} else if (type.datatype === rdf.JSON) {
		const _ = JSON.parse(value)
	} else {
		return
	}
}

export function validateURI(value: string) {
	const _ = new URL(value)
}
