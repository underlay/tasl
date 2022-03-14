import { componentAtIndex, optionAtIndex } from "../keys.js"
import type { Schema, types } from "../schema/index.js"

import { validateInstance } from "./validateInstance.js"
import { values } from "./values.js"

export class Instance {
	readonly #elements: Record<string, Map<number, values.Value>>

	// #ids[key] is the max element id in the class + 1, or 0 if there are no elements
	readonly #ids: Record<string, number>

	constructor(
		readonly schema: Schema,
		elements?: Record<string, values.Element[]>
	) {
		this.#elements = {}
		this.#ids = {}
		for (const key of schema.keys()) {
			this.#elements[key] = new Map()
			this.#ids[key] = 0

			if (elements !== undefined && elements[key] !== undefined) {
				elements[key].sort(({ id: a }, { id: b }) =>
					a < b ? -1 : a > b ? 1 : 0
				)

				for (const { id, value } of elements[key]) {
					if (this.#elements[key].has(id)) {
						throw new Error(`duplicate id ${id} in class ${key}`)
					}

					this.#ids[key] = Math.max(this.#ids[key], id + 1)
					this.#elements[key].set(id, value)
				}
			}
		}

		validateInstance(schema, this.#elements, (key, id) =>
			this.#elements[key].has(id)
		)
	}

	count(key: string): number {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		return elements.size
	}

	has(key: string, id: number): boolean {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		return elements.has(id)
	}

	get(key: string, id: number): values.Value {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		const value = elements.get(id)
		if (value === undefined) {
			throw new Error(`id ${id} not found`)
		}

		return value
	}

	resolve(key: string, id: number, path: number[]): null | values.Value {
		return this.resolveValue(this.schema.get(key), this.get(key, id), path)
	}

	private resolveValue(
		type: types.Type,
		value: values.Value,
		path: number[]
	): null | values.Value {
		if (path.length === 0) {
			return value
		}

		const [first, ...rest] = path
		if (type.kind === "product" && value.kind === "product") {
			const [key, component] = componentAtIndex(type, first)
			return this.resolveValue(component, value.components[key], rest)
		} else if (type.kind === "coproduct" && value.kind === "coproduct") {
			const [key, option] = optionAtIndex(type, first)
			if (key === value.key) {
				return this.resolveValue(option, value.value, rest)
			} else {
				return null
			}
		} else {
			throw new Error("invalid path")
		}
	}

	*keys(key: string): Iterable<number> {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		yield* elements.keys()
	}

	*values(key: string): Iterable<values.Value> {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		yield* elements.values()
	}

	*entries(key: string): Iterable<[number, values.Value]> {
		const elements = this.#elements[key]
		if (elements === undefined) {
			throw new Error(`key not found: ${key}`)
		}

		yield* elements.entries()
	}

	isEqualTo(instance: Instance): boolean {
		if (this === instance) {
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

	toJSON(): Record<string, values.Element[]> {
		return Object.fromEntries(
			Object.entries(this.#elements).map(([key, map]) => {
				const elements: values.Element[] = []
				for (const [id, value] of map) {
					elements.push({ id, value })
				}
				return [key, elements]
			})
		)
	}
}
