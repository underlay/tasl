import type { Type } from "../types.js"

import * as types from "./types/index.js"

export class Schema<
	S extends { [K in string]: Type } = { [K in string]: Type }
> {
	private readonly _keys: readonly (keyof S)[]
	constructor(readonly classes: S) {
		this._keys = Object.freeze(
			Object.keys(classes).sort()
		) as readonly (keyof S)[]
	}

	get<K extends keyof S>(key: K): S[K] {
		const type = this.classes[key]
		if (type === undefined) {
			throw new Error(`schema does not have a class with key ${key}`)
		} else {
			return type
		}
	}

	has(key: string | number | symbol): key is keyof S {
		return key in this.classes
	}

	*keys(): Iterable<keyof S> {
		for (const key of this._keys) {
			yield key
		}
	}

	*values(): Iterable<S[keyof S]> {
		for (const key of this._keys) {
			yield this.classes[key]
		}
	}

	*entries(): Iterable<[keyof S, S[keyof S]]> {
		for (const key of this._keys) {
			yield [key, this.classes[key]]
		}
	}

	isEqualTo<S extends { [K in string]: Type }>(schema: Schema<S>): boolean {
		if (Object.is(this, schema)) {
			return true
		}

		for (const key of this.keys()) {
			if (schema.has(key as string)) {
				continue
			} else {
				return false
			}
		}

		for (const [key, type] of schema.entries()) {
			if (this.has(key) && types.isEqualTo(this.get(key), type)) {
				continue
			} else {
				return false
			}
		}

		return true
	}
}
