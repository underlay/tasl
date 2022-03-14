import {
	componentAtIndex,
	forComponents,
	forOptions,
	indexOfComponent,
	indexOfOption,
	optionAtIndex,
} from "../keys.js"
import { types } from "./types.js"
import { validateSchema } from "./validateSchema.js"

namespace Schema {
	export type Path = number[]
	export type Link = { source: number; path: Path; target: number }
}

export class Schema {
	readonly #incoming: Schema.Link[][]
	readonly #outgoing: Schema.Link[][]

	readonly #keys: readonly string[]
	readonly #classes: Readonly<Record<string, types.Type>>

	constructor(classes: Record<string, types.Type>) {
		this.#keys = validateSchema(classes)
		this.#classes = classes

		this.#incoming = this.#keys.map(() => [])
		this.#outgoing = this.#keys.map(() => [])

		for (const [source, key] of this.#keys.entries()) {
			for (const [path, type] of this.#paths([], this.#classes[key])) {
				if (type.kind === "reference") {
					const target = this.#keys.indexOf(type.key)
					const link = { source, path, target }
					this.#outgoing[source].push(link)
					this.#incoming[target].push(link)
				}
			}
		}
	}

	public *paths(key: string): Iterable<[Schema.Path, types.Type]> {
		const type = this.get(key)
		yield* this.#paths([], this.#classes[key])
	}

	*#paths(
		path: Schema.Path,
		type: types.Type
	): Iterable<[Schema.Path, types.Type]> {
		yield [path, type]
		if (type.kind === "product") {
			for (const [key, component, index] of forComponents(type)) {
				yield* this.#paths([...path, index], component)
			}
		} else if (type.kind === "coproduct") {
			for (const [key, option, index] of forOptions(type)) {
				yield* this.#paths([...path, index], option)
			}
		}
	}

	public count(): number {
		return this.#keys.length
	}

	public get(key: string): types.Type {
		const type = this.#classes[key]
		if (type === undefined) {
			throw new Error(`schema does not have a class with key ${key}`)
		} else {
			return type
		}
	}

	public has(key: string): boolean {
		return key in this.#classes
	}

	public *keys(): Iterable<string> {
		yield* this.#keys
	}

	public *values(): Iterable<types.Type> {
		for (const key of this.#keys) {
			yield this.#classes[key]
		}
	}

	public *entries(): Iterable<[string, types.Type, number]> {
		for (const [index, key] of this.#keys.entries()) {
			yield [key, this.#classes[key], index]
		}
	}

	public indexOfKey(key: string): number {
		const index = this.#keys.indexOf(key)
		if (index === -1) {
			throw new Error("key not found")
		}

		return index
	}

	public keyAtIndex(index: number): string {
		const key = this.#keys[index]
		if (key === undefined) {
			throw new Error("index out of range")
		}

		return key
	}

	public incomingReferences(key: string): Schema.Link[] {
		const index = this.indexOfKey(key)
		return this.#incoming[index]
	}

	public outgoingReferences(key: string): Schema.Link[] {
		const index = this.indexOfKey(key)
		return this.#outgoing[index]
	}

	public path(key: string, path: string[]): Schema.Path {
		const result: Schema.Path = []

		path.reduce<types.Type>((type, key) => {
			if (type.kind === "product") {
				const index = indexOfComponent(type, key)
				result.push(index)
				return type.components[key]
			} else if (type.kind === "coproduct") {
				const index = indexOfOption(type, key)
				result.push(index)
				return type.options[key]
			} else {
				throw new Error("invalid path")
			}
		}, this.#classes[key])

		return result
	}

	public resolve(key: string, path: Schema.Path): types.Type {
		return this.#resolve(this.#classes[key], path)
	}

	#resolve(type: types.Type, path: Schema.Path): types.Type {
		if (path.length === 0) {
			return type
		}

		const [first, ...rest] = path
		if (type.kind === "product") {
			const [_, component] = componentAtIndex(type, first)
			return this.#resolve(component, rest)
		} else if (type.kind === "coproduct") {
			const [_, option] = optionAtIndex(type, first)
			return this.#resolve(option, rest)
		} else {
			throw new Error("invalid path")
		}
	}

	public isEqualTo(schema: Schema): boolean {
		if (this === schema) {
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

	public toJSON(): Record<string, types.Type> {
		return { ...this.#classes }
	}
}
