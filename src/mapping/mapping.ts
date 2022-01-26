import { signalInvalidType } from "../utils.js"

import type { Schema, types } from "../schema/index.js"
import { Instance, values } from "../instance/index.js"
import { validateMapping } from "./validateMapping.js"

import type { expressions } from "./expressions.js"
import { forComponents } from "../keys.js"

export class Mapping {
	constructor(
		readonly source: Schema,
		readonly target: Schema,
		readonly maps: expressions.Map[]
	) {
		validateMapping(source, target, maps)
	}

	get(target: string): expressions.Map {
		const map = this.maps.find((map) => map.target === target)
		if (map === undefined) {
			throw new Error(`mapping does not have a map with target ${target}`)
		} else {
			return map
		}
	}

	*values(): Iterable<expressions.Map> {
		for (const map of this.maps) {
			yield map
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
			const { value: expression, id, source: sourceKey } = this.get(key)
			const sourceType = this.source.get(sourceKey)
			elements[key] = new Array(instance.count(sourceKey))
			for (const [index, value] of instance.entries(sourceKey)) {
				elements[key][index] = this.applyExpression(
					instance,
					expression,
					targetType,
					{ [id]: [sourceType, value] }
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
		} else if (expression.kind === "match") {
			const [t, v] = this.evaluateTerm(instance, expression.value, environment)
			if (t.kind !== "coproduct") {
				throw new Error("the value of a match expression must be a coproduct")
			} else if (v.kind !== "coproduct") {
				throw new Error("internal type error")
			}

			if (v.key in expression.cases) {
				const { value: expr, id } = expression.cases[v.key]
				return this.applyExpression(instance, expr, targetType, {
					...environment,
					[id]: [t.options[v.key], v.value],
				})
			} else {
				throw new Error(`missing case for option ${v.key}`)
			}
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
			const [t, v] = this.evaluateTerm(instance, expression, environment)
			return this.project([t, v], targetType)
		}
	}

	private evaluateTerm(
		instance: Instance,
		term: expressions.Term,
		environment: Record<string, [types.Type, values.Value]>
	): [types.Type, values.Value] {
		if (term.kind === "projection") {
			const [t, v] = this.evaluateTerm(instance, term.value, environment)

			if (t.kind !== "product") {
				throw new Error("invalid projection - value is not a product")
			} else if (v.kind !== "product") {
				throw new Error("internal type error")
			}

			if (t.components[term.key] === undefined) {
				throw new Error(
					`invalid projection - no component with key ${term.key}`
				)
			} else if (v.components[term.key] === undefined) {
				throw new Error("internal type error")
			}

			return [t.components[term.key], v.components[term.key]]
		} else if (term.kind === "dereference") {
			const [t, v] = this.evaluateTerm(instance, term.value, environment)

			if (t.kind !== "reference") {
				throw new Error("invalid dereference - value is not a reference")
			} else if (v.kind !== "reference") {
				throw new Error("internal type error")
			}

			return [this.source.get(term.key), instance.get(term.key, v.index)]
		} else if (term.kind === "variable") {
			if (term.id in environment) {
				return environment[term.id]
			} else {
				throw new Error(`unbound variable ${term.id}`)
			}
		} else {
			signalInvalidType(term)
		}
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

			const { source } = this.get(targetType.key)
			if (t.key !== source) {
				throw new Error(
					`invalid type - expected a reference to ${source}, but got a reference to ${t.key}`
				)
			}

			return values.reference(v.index)
		} else {
			signalInvalidType(targetType)
		}
	}
}
