type R<K extends string, V = any> = Readonly<Record<K, V>>

/**
 * Iterate over the keys of an object in lexicographic order
 * @param object
 */
export function* forKeys<K extends string>(object: R<K>): Iterable<K> {
	yield* Object.keys(object).sort() as K[]
}

/**
 * Iterate over the [key, value] entries of an object in lexicographic order
 * @param object
 */
export function* forEntries<K extends string, V>(
	object: R<K, V>
): Iterable<[K, V]> {
	for (const key of Object.keys(object).sort()) {
		yield [key as K, object[key as K] as V]
	}
}

/**
 * Iterate over the values of an object in lexicographic order
 * @param object
 */
export function* forValues<K extends string, V>(object: R<K, V>): Iterable<V> {
	for (const key of Object.keys(object).sort()) {
		yield object[key as K]
	}
}

/**
 * Get the integer lexicographic index of an object key
 * @param object an object
 * @param key a key in the object
 * @throws an error if the key is not a property of the object
 * @returns the integer index of the key in the lexicographic ordering of all the object's keys
 */
export function getIndexOfKey<K extends string>(object: R<K>, key: K): number {
	const keys = Object.keys(object).sort()
	const index = keys.indexOf(key)
	if (index === -1) {
		throw new Error(`key not found: ${JSON.stringify(key)}`)
	}
	return index
}

/**
 * Get the key of an object at a given lexicographic index
 * @param object an object
 * @param index an integer 0 <= index < Object.keys(object).length
 * @throws an error if the index is out of range
 * @returns {string} the key at the index in the lexicographic ordering of all the object's keys
 */
export function getKeyAtIndex<K extends string>(
	object: R<K>,
	index: number
): K {
	const keys = Object.keys(object).sort()
	if (0 <= index && index < keys.length) {
		return keys[index] as K
	} else {
		console.error(object, index, keys)
		throw new Error("index out of range")
	}
}

/**
 * mapEntries is equivalent to Object.fromEntries(Object.entries(object).map(map)),
 * except that it always iterates in lexicographic order.
 * @param object an object
 * @param map a function mapping each entry [key, value] to a new value
 * @returns an object with the same keys as the input but with values from the map function
 */
export function mapEntries<S extends Readonly<Record<string, any>>, T>(
	object: S,
	map: (entry: [keyof S, S[keyof S]]) => T
): { [K in keyof S]: T } {
	const keys = Object.keys(object).sort()
	const result = Object.fromEntries(
		keys.map((key) => [key, map([key, object[key]])])
	)

	return result as { [key in keyof S]: T }
}

/**
 * mapKeys is a wrapper for mapEntries that only calls the provided map
 * function with the key of each entry, not the value.
 * @param object an object
 * @param map a function mapping each key from the input object to a new value
 * @returns an object with the same keys as the input but with values from the map function
 */
export const mapKeys = <S extends Readonly<Record<string, any>>, T>(
	object: S,
	map: (key: keyof S) => T
) => mapEntries(object, ([key, _]) => map(key))

/**
 * mapValues is a wrapper for mapEntries that only calls the provided map
 * function with the value of each entry, not the key.
 * @param object an object
 * @param map a function mapping each value from the input object to a new value
 * @returns an object with the same keys as the input but with values from the map function
 */
export const mapValues = <S extends Readonly<Record<string, any>>, T>(
	object: S,
	map: (value: S[keyof S]) => T
) => mapEntries(object, ([_, value]) => map(value))

export function* map<X, Y>(iter: Iterable<X>, f: (value: X) => Y): Iterable<Y> {
	for (const value of iter) {
		yield f(value)
	}
}
