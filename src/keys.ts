import type { types } from "./schema/index.js"

type R<K extends string, V = any> = Readonly<Record<K, V>>

export const cache = {
	product: new WeakMap<types.Product, readonly string[]>(),
	coproduct: new WeakMap<types.Coproduct, readonly string[]>(),
}

export function* forComponents(
	type: types.Product
): Iterable<[string, types.Type]> {
	const keys = cache.product.get(type)
	if (keys === undefined) {
		throw new Error("internal error: type not initialized")
	}

	for (const key of keys) {
		const value = type.components[key]
		if (value === undefined) {
			throw new Error("internal error: key not found")
		}

		yield [key, value]
	}
}

export function* forOptions(
	type: types.Coproduct
): Iterable<[string, types.Type]> {
	const keys = cache.coproduct.get(type)
	if (keys === undefined) {
		throw new Error("internal error: type not initialized")
	}

	for (const key of keys) {
		const value = type.options[key]
		if (value === undefined) {
			throw new Error("internal error: key not found")
		}

		yield [key, value]
	}
}

export function indexOfOption(type: types.Coproduct, key: string): number {
	const keys = cache.coproduct.get(type)
	if (keys === undefined) {
		throw new Error("internal error: type not initialized")
	}

	const index = keys.indexOf(key)
	if (index === -1) {
		throw new Error("key not found")
	}

	return index
}

export function optionAtIndex(type: types.Coproduct, index: number): string {
	const keys = cache.coproduct.get(type)
	if (keys === undefined) {
		throw new Error("internal error: type not initialized")
	}

	const key = keys[index]
	if (key === undefined) {
		throw new Error("index out of range")
	}

	return key
}
