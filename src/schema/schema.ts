import { types } from "./types.js"
import { validateSchema } from "./validateSchema.js"

export class Schema {
	#keys: readonly string[]

	constructor(readonly classes: Record<string, types.Type>) {
		this.#keys = validateSchema(classes)
	}

	get(key: string): types.Type {
		const type = this.classes[key]
		if (type === undefined) {
			throw new Error(`schema does not have a class with key ${key}`)
		} else {
			return type
		}
	}

	has(key: string): boolean {
		return key in this.classes
	}

	*keys(): Iterable<string> {
		yield* this.#keys
	}

	*values(): Iterable<types.Type> {
		for (const key of this.#keys) {
			yield this.classes[key]
		}
	}

	*entries(): Iterable<[string, types.Type]> {
		for (const key of this.#keys) {
			yield [key, this.classes[key]]
		}
	}

	indexOfKey(key: string): number {
		const index = this.#keys.indexOf(key)
		if (index === -1) {
			throw new Error("key not found")
		}

		return index
	}

	keyAtIndex(index: number): string {
		const key = this.#keys[index]
		if (key === undefined) {
			throw new Error("index out of range")
		}

		return key
	}

	isEqualTo(schema: Schema): boolean {
		if (Object.is(this, schema)) {
			return true
		}

		for (const key of this.keys()) {
			if (schema.has(key)) {
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
