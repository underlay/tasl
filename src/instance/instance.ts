import type { Schema } from "../schema/schema.js"

import { validateInstance } from "./validateInstance.js"
import { values } from "./values.js"

export class Instance {
	constructor(
		readonly schema: Schema,
		readonly elements: Record<string, values.Value[]>
	) {
		validateInstance(schema, elements)
	}

	count(key: string): number {
		const elements = this.elements[key]
		if (elements === undefined) {
			throw new Error("key not found")
		}

		return elements.length
	}

	get(key: string, index: number): values.Value {
		const elements = this.elements[key]
		if (elements === undefined) {
			throw new Error("key not found")
		}

		if (elements[index] === undefined) {
			throw new Error("index out of range")
		}

		return elements[index]
	}

	*keys(key: string): Iterable<number> {
		const elements = this.elements[key]
		if (elements === undefined) {
			throw new Error("key not found")
		}

		yield* elements.keys()
	}

	*values(key: string): Iterable<values.Value> {
		const elements = this.elements[key]
		if (elements === undefined) {
			throw new Error("key not found")
		}

		yield* elements.values()
	}

	*entries(key: string): Iterable<[number, values.Value]> {
		const elements = this.elements[key]
		if (elements === undefined) {
			throw new Error("key not found")
		}

		yield* elements.entries()
	}

	isEqualTo(instance: Instance): boolean {
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
				const y = instance.get(key, index)
				if (!values.isEqualTo(type, x, y)) {
					return false
				} else {
					continue
				}
			}
		}

		return true
	}
}
