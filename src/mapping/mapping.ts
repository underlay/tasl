import { signalInvalidType } from "../utils.js"

import type { Schema, types } from "../schema/index.js"
import { Instance, values } from "../instance/index.js"

import type { expressions } from "./expressions.js"
import { validateMapping } from "./validateMapping.js"

import { forComponents } from "../keys.js"

export class Mapping {
	#keys: readonly string[]
	constructor(
		readonly source: Schema,
		readonly target: Schema,
		readonly maps: Record<string, expressions.Map>
	) {
		this.#keys = validateMapping(source, target, maps)
	}

	get(key: string): expressions.Map {
		const map = this.maps[key]
		if (map === undefined) {
			throw new Error(`mapping does not have a map with key ${key}`)
		}

		return map
	}

	has(key: string): boolean {
		return key in this.maps
	}

	*keys(): Iterable<string> {
		yield* this.#keys
	}

	*values(): Iterable<expressions.Map> {
		for (const key of this.#keys) {
			yield this.maps[key]
		}
	}

	*entries(): Iterable<[string, expressions.Map]> {
		for (const key of this.#keys) {
			yield [key, this.maps[key]]
		}
	}

	apply(instance: Instance): Instance {
		if (!this.source.isEqualTo(instance.schema)) {
			throw new Error(
				"a mapping can only be applied to an instance of its source schema"
			)
		}

		const elements: Record<string, values.Value[]> = {}
		for (const [key, targetType] of this.target.entries()) {
			const { value: expression, id, source: sourceKey } = this.maps[key]
			const sourceType = this.source.get(sourceKey)
			elements[key] = new Array(instance.count(sourceKey))
			for (const [index, element] of instance.entries(sourceKey)) {
				elements[key][index] = this.applyExpression(
					instance,
					expression,
					targetType,
					{ [id]: [sourceType, element] }
				)
			}
		}

		return new Instance(this.target, elements)
	}

	private applyExpression(
		instance: Instance,
		expression: expressions.Expression,
		targetType: types.Type,
		environment: Record<string, [types.Type, values.Value]>
	): values.Value {
		if (expression.kind === "uri") {
			if (targetType.kind !== "uri") {
				throw new Error("unexpected URI expression")
			}

			return values.uri(expression.value)
		} else if (expression.kind === "literal") {
			if (targetType.kind !== "literal") {
				throw new Error("unexpected URI expression")
			}

			return values.literal(expression.value)
		} else if (expression.kind === "product") {
			if (targetType.kind !== "product") {
				throw new Error("unexpected construction expression")
			}

			const components: Record<string, values.Value> = {}
			for (const [key, target] of forComponents(targetType)) {
				const source = expression.components[key]
				if (source === undefined) {
					throw new Error(`missing component ${key}`)
				}

				components[key] = this.applyExpression(
					instance,
					source,
					target,
					environment
				)
			}

			return values.product(components)
		} else if (expression.kind === "term") {
			const { id, path } = expression
			const [t, v] = this.evaluateTerm(instance, id, path, environment)
			return this.project([t, v], targetType)
		} else if (expression.kind === "match") {
			const { id, path, cases } = expression
			const [t, v] = this.evaluateTerm(instance, id, path, environment)
			if (t.kind !== "coproduct") {
				throw new Error(
					"the term value of a match expression must be a coproduct"
				)
			} else if (v.kind !== "coproduct") {
				throw new Error("internal type error")
			} else if (t.options[v.key] === undefined) {
				throw new Error("internal type error")
			}

			if (cases[v.key] === undefined) {
				throw new Error(`missing case for option ${v.key}`)
			}

			return this.applyExpression(instance, cases[v.key].value, targetType, {
				...environment,
				[cases[v.key].id]: [t.options[v.key], v.value],
			})
		} else if (expression.kind === "coproduct") {
			if (targetType.kind !== "coproduct") {
				throw new Error("unexpected injection expression")
			}

			const option = targetType.options[expression.key]
			if (option === undefined) {
				throw new Error(`injection key ${expression.key} is not an option`)
			}

			return values.coproduct(
				expression.key,
				this.applyExpression(instance, expression.value, option, environment)
			)
		} else {
			signalInvalidType(expression)
		}
	}

	private evaluateTerm(
		instance: Instance,
		id: string,
		path: (expressions.Projection | expressions.Dereference)[],
		environment: Record<string, [types.Type, values.Value]>
	): [types.Type, values.Value] {
		return path.reduce<[types.Type, values.Value]>(([t, v], segment) => {
			if (segment.kind === "projection") {
				if (t.kind !== "product") {
					throw new Error("invalid projection: term value is not a product")
				} else if (v.kind !== "product") {
					throw new Error("internal type error")
				}

				if (t.components[segment.key] === undefined) {
					throw new Error(
						`invalid projection: no component with key ${segment.key}`
					)
				} else if (v.components[segment.key] === undefined) {
					throw new Error("internal type error")
				}

				return [t.components[segment.key], v.components[segment.key]]
			} else if (segment.kind === "dereference") {
				if (t.kind !== "reference") {
					throw new Error("invalid dereference: term value is not a reference")
				} else if (v.kind !== "reference") {
					throw new Error("internal type error")
				}

				return [
					this.source.get(segment.key),
					instance.get(segment.key, v.index),
				]
			} else {
				signalInvalidType(segment)
			}
		}, environment[id])
	}

	private project(
		[t, v]: [types.Type, values.Value],
		targetType: types.Type
	): values.Value {
		if (targetType.kind === "uri") {
			if (t.kind !== "uri") {
				throw new Error(
					`invalid type - expected a URI value, but got a ${t.kind}`
				)
			} else if (v.kind !== "uri") {
				throw new Error("internal type error")
			}

			return v
		} else if (targetType.kind === "literal") {
			if (t.kind !== "literal") {
				throw new Error(
					`invalid type - expected a literal value, but got a ${t.kind}`
				)
			} else if (v.kind !== "literal") {
				throw new Error("internal type error")
			}

			if (targetType.datatype !== t.datatype) {
				throw new Error(
					`invalid type - expected a literal with datatype ${targetType.datatype}, but got a literal with datatype ${t.datatype}`
				)
			}

			return v
		} else if (targetType.kind === "product") {
			if (t.kind !== "product") {
				throw new Error(
					`invalid type - expected a product value, but got a ${t.kind}`
				)
			} else if (v.kind !== "product") {
				throw new Error("internal type error")
			}

			const components: Record<string, values.Value> = {}
			for (const [key, component] of forComponents(targetType)) {
				if (t.components[key] === undefined) {
					throw new Error(`invalid type - missing component ${key}`)
				}

				components[key] = this.project(
					[t.components[key], v.components[key]],
					component
				)
			}

			return values.product(components)
		} else if (targetType.kind === "coproduct") {
			if (t.kind !== "coproduct") {
				throw new Error(
					`invalid type - expected a coproduct value, but got a ${t.kind}`
				)
			} else if (v.kind !== "coproduct") {
				throw new Error("internal type error")
			}

			if (targetType.options[v.key] === undefined) {
				throw new Error(`invalid type - ${v.key} is not an option`)
			}

			return values.coproduct(
				v.key,
				this.project([t.options[v.key], v.value], targetType.options[v.key])
			)
		} else if (targetType.kind === "reference") {
			if (t.kind !== "reference") {
				throw new Error(
					`invalid type - expected a reference value, but got a ${t.kind}`
				)
			} else if (v.kind !== "reference") {
				throw new Error("internal type error")
			}

			const map = this.maps[targetType.key]
			if (map === undefined) {
				throw new Error("key not found")
			}

			if (t.key !== map.source) {
				throw new Error(
					`invalid type - expected a reference to ${map.source}, but got a reference to ${t.key}`
				)
			}

			return values.reference(v.index)
		} else {
			signalInvalidType(targetType)
		}
	}
}
