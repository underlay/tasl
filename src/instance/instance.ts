import { encodeInstance } from "./encodeInstance.js"
import { decodeInstance } from "./decodeInstance.js"

import type { Type, Value } from "../types.js"
import type { Schema } from "../schema/schema.js"
import { values } from "./index.js"

export class Instance<
	S extends { [K in string]: Type } = { [K in string]: Type }
> {
	constructor(
		readonly schema: Schema<S>,
		readonly elements: { [K in keyof S]: Value<S[K]>[] }
	) {}

	count(key: keyof S): number {
		return this.elements[key].length
	}

	get<K extends keyof S>(key: K, index: number): Value<S[K]> {
		return this.elements[key][index]
	}

	*keys<K extends keyof S>(key: K): Iterable<number> {
		yield* this.elements[key].keys()
	}

	*values<K extends keyof S>(key: K): Iterable<Value<S[K]>> {
		yield* this.elements[key].values()
	}

	*entries<K extends keyof S>(key: K): Iterable<[number, Value<S[K]>]> {
		yield* this.elements[key].entries()
	}

	isEqualTo<T extends { [K in string]: Type }>(instance: Instance<T>): boolean {
		if (Object.is(this, instance)) {
			return true
		}

		if (!this.schema.isEqualTo(instance.schema)) {
			return false
		}

		for (const [key, type] of this.schema.entries()) {
			if (this.count(key) !== instance.count(key as string)) {
				return false
			}

			for (const [index, x] of this.entries(key)) {
				const y = instance.get(key as keyof T, index) as Value
				if (!values.isEqualTo(type, x, y as Value<S[keyof S]>)) {
					return false
				} else {
					continue
				}
			}
		}

		return true
	}
}
