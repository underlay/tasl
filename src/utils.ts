import varint from "varint"

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

export function* iota<T>(n: number, f: (i: number) => T): Iterable<T> {
	for (let i = 0; i < n; i++) {
		yield f(i)
	}
}

export interface DecodeState {
	data: Uint8Array
	view: DataView
	offset: number
}

export const defaultChunkSize = 512

export interface EncodeState {
	buffer: ArrayBuffer
	view: DataView
	offset: number
}

export function makeEncodeState(): EncodeState {
	const buffer = new ArrayBuffer(defaultChunkSize)
	const view = new DataView(buffer, 0, defaultChunkSize)
	return { buffer, view, offset: 0 }
}

export function* allocate(
	state: EncodeState,
	size: number
): Iterable<Uint8Array> {
	if (state.buffer.byteLength < state.offset + size) {
		yield new Uint8Array(state.buffer, 0, state.offset)
		const byteLength = Math.max(defaultChunkSize, size)
		state.buffer = new ArrayBuffer(byteLength)
		state.offset = 0
		state.view = new DataView(state.buffer, 0, byteLength)
	}
}

export function* encodeUnsignedVarint(
	state: EncodeState,
	value: number
): Iterable<Uint8Array> {
	const byteLength = varint.encodingLength(value)
	yield* allocate(state, byteLength)
	const target = new Uint8Array(state.buffer, state.offset, byteLength)
	varint.encode(value, target, 0)
	state.offset += byteLength
}

export function* encodeString(
	state: EncodeState,
	value: string
): Iterable<Uint8Array> {
	const source = new TextEncoder().encode(value)
	yield* encodeUnsignedVarint(state, source.byteLength)
	yield* allocate(state, source.byteLength)
	const target = new Uint8Array(state.buffer, state.offset, source.byteLength)
	target.set(source)
	state.offset += source.byteLength
}

export function decodeUnsignedVarint(state: DecodeState): number {
	const value = varint.decode(state.data, state.offset)
	state.offset += varint.encodingLength(value)
	return value
}
