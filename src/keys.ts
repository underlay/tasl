// the tasl library needs to do a lot of iterating over the entries of objects,
// like schemas, product components, and coproduct options. in many cases we
// need to do this iteration in lexicographic key order, which we don't get by
// default from JavaScript's Object.entries({...}). most of the objects we need
// to iterate over are just provided to us by the end user.

// we could just get a new key array and sort it every time we need to iterate,
// but this felt wasteful to me (maybe it's not at all, i have no real idea).
// the utilities here are a little homemade system for memoizing sorted arrays of
// keys for *arbirary objects* (as long as they extend Readonly<Record<string, any>>)
// that uses a single WeakMap to avoid needing to clean up after itself.
// they also play nicer with TypeScript than Object.keys() and Object.entries().

type R<K extends string, V = any> = Readonly<Record<K, V>>

const keyMap = new WeakMap<R<string>, readonly string[]>()

// this function is deliberately not exported; i want the external interface
// to this key iteration system to *only* use Iterable<K> and not K[]
function getKeys<K extends string>(object: R<K>): readonly K[] {
	if (keyMap.has(object)) {
		return keyMap.get(object)! as K[]
	} else {
		const keys = Object.keys(object).sort()
		Object.freeze(keys)
		keyMap.set(object, keys)
		return keys as K[]
	}
}

export function* forKeys<K extends string>(object: R<K>): Iterable<K> {
	yield* getKeys(object)
}

export function* forEntries<K extends string, V>(
	object: R<K, V>
): Iterable<[K, V]> {
	for (const key of getKeys(object)) {
		yield [key, object[key]]
	}
}

export function getIndexOfKey<K extends string>(object: R<K>, key: K): number {
	const keys = getKeys(object)
	const index = keys.indexOf(key)
	if (index === -1) {
		throw new Error(`key not found: ${JSON.stringify(key)}`)
	}
	return index
}

export function hasKeyAtIndex(object: R<string>, index: number): boolean {
	const keys = getKeys(object)
	return 0 <= index && index < keys.length
}

export function getKeyAtIndex<K extends string>(
	object: R<K>,
	index: number
): K {
	const keys = getKeys(object)
	if (0 <= index && index < keys.length) {
		return keys[index]
	} else {
		throw new Error("index out of range")
	}
}

export function mapKeys<S extends { readonly [key in string]: any }, T>(
	object: S,
	map: <Key extends keyof S>(value: S[Key], key: Key) => T
): { readonly [key in keyof S]: T } {
	const keys = getKeys(object)
	const result = Object.fromEntries(
		keys.map((key) => [key, map(object[key], key)])
	)

	// sneakily pre-set the result in keyMap since we know its keys already
	keyMap.set(result, keys as readonly string[])
	Object.freeze(result)

	return result as { readonly [key in keyof S]: T }
}
