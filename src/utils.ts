export type JsonObject = { [Key in string]?: JsonValue }

export interface JsonArray extends Array<JsonValue> {}

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonObject
	| JsonArray

type R<K extends string, V = any> = Readonly<Record<K, V>>

const keyMap = new WeakMap<R<string>, readonly string[]>()

export function* forEntries<K extends string, V>(
	object: R<K, V>
): Generator<[K, V, number], void, undefined> {
	for (const [index, key] of getKeys(object).entries()) {
		yield [key, object[key], index]
	}
}

export function getKeys<K extends string>(object: R<K>): readonly K[] {
	if (keyMap.has(object)) {
		return keyMap.get(object)! as K[]
	} else {
		const keys = Object.keys(object).sort()
		Object.freeze(keys)
		keyMap.set(object, keys)
		return keys as K[]
	}
}

export function getKeyIndex<K extends string>(object: R<K>, key: K): number {
	if (keyMap.has(object)) {
		const index = keyMap.get(object)!.indexOf(key)
		if (index === -1) {
			throw new Error(`Key not found: ${key}`)
		}
		return index
	} else {
		const keys = Object.keys(object).sort()
		Object.freeze(keys)
		keyMap.set(object, keys)
		const index = keys.indexOf(key)
		if (index === -1) {
			throw new Error(`Key not found: ${key}`)
		}
		return index
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
	keyMap.set(result, keys as readonly string[])
	Object.freeze(result)
	return result as { readonly [key in keyof S]: T }
}

export function signalInvalidType(type: never): never {
	console.error(type)
	throw new Error("Invalid type")
}
