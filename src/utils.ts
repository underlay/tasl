export function signalInvalidType(type: never): never {
	console.error(type)
	throw new Error("invalid type")
}

export function validateURI(value: string) {
	const _ = new URL(value)
}

export function floatToString(value: number) {
	if (isNaN(value)) {
		return "NaN"
	} else if (value === 0) {
		return 1 / value > 0 ? "0" : "-0"
	} else if (value === Infinity) {
		return "INF"
	} else if (value === -Infinity) {
		return "-INF"
	} else {
		return value.toString()
	}
}
