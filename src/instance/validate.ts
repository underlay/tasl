import { rdf, xsd } from "@underlay/namespaces"
import { getFloat32Precision } from "fp16"

const integerPattern = /^(\+|\-)?[0-9]+$/
const floatPattern = /^(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)([Ee](\+|-)?[0-9]+)?$/
const hexPattern = /^([0-9a-fA-F]{2})*$/

export function parseBoolean(value: string): boolean {
	if (value === "true" || value === "1") {
		return true
	} else if (value === "false" || value === "0") {
		return false
	} else {
		throw new Error(`invalid xsd:boolean value ${JSON.stringify(value)}`)
	}
}

export function parseFloat(value: string): number {
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

export function parseInteger(value: string): bigint {
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

export const integerValidators: Record<string, (i: bigint) => void> = {
	[xsd.integer](i: bigint) {},
	[xsd.nonNegativeInteger](i: bigint) {
		if (i < 0n) {
			throw new Error(
				`integer value ${i} out of range for xsd:nonNegativeInteger datatype`
			)
		}
	},
	[xsd.long](i: bigint) {
		if (i < -9223372036854775808n || 9223372036854775807n < i) {
			throw new Error(`integer value ${i} out of range for xsd:long datatype`)
		}
	},
	[xsd.int](i: bigint) {
		if (i < -2147483648n || 2147483647n < i) {
			throw new Error(`integer value ${i} out of range for xsd:int datatype`)
		}
	},
	[xsd.short](i: bigint) {
		if (i < -32768n || 32767n < i) {
			throw new Error(`integer value ${i} out of range for xsd:short datatype`)
		}
	},
	[xsd.byte](i: bigint) {
		if (i < -128n || 127n < i) {
			throw new Error(`integer value ${i} out of range for xsd:byte datatype`)
		}
	},
	[xsd.unsignedLong](i: bigint) {
		if (i < 0n || 18446744073709551615n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedLong datatype`
			)
		}
	},
	[xsd.unsignedInt](i: bigint) {
		if (i < 0n || 4294967295n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedInt datatype`
			)
		}
	},
	[xsd.unsignedShort](i: bigint) {
		if (i < 0n || 65535n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedShort datatype`
			)
		}
	},
	[xsd.unsignedByte](i: bigint) {
		if (i < 0n || 255n < i) {
			throw new Error(
				`integer value ${i} out of range for xsd:unsignedByte datatype`
			)
		}
	},
}

export function validateLiteral(datatype: string, value: string) {
	if (datatype === xsd.boolean) {
		parseBoolean(value)
	} else if (datatype in floatValidators) {
		const f = parseFloat(value)
		floatValidators[datatype](f)
	} else if (datatype in integerValidators) {
		const i = parseInteger(value)
		integerValidators[datatype](i)
	} else if (datatype === xsd.hexBinary) {
		if (hexPattern.test(value)) {
			return
		} else {
			console.error(value)
			throw new Error(`invalid xsd:hexBinary value`)
		}
	} else if (datatype === rdf.JSON) {
		const _ = JSON.parse(value)
	} else {
		return
	}
}
