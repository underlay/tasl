import varint from "varint"

export type State = { data: Uint8Array; offset: number }

export function getUnsignedVarint(state: State) {
	const length = varint.decode(state.data, state.offset)
	state.offset += varint.encodingLength(length)
	return length
}

export function* iota<T>(n: number, f: (i: number) => T): Iterable<T> {
	for (let i = 0; i < n; i++) {
		yield f(i)
	}
}
