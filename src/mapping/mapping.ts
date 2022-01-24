import { mapEntries, mapKeys } from "../keys.js"
import { signalInvalidType } from "../utils.js"

import type { Type, Value } from "../types.js"
import type { Schema } from "../schema/index.js"
import { Instance, values } from "../instance/index.js"

export namespace Mapping {
	export type Map = {
		source: string
		target: string
		id: string
		value: Expression
	}

	export type Expression = URI | Literal | Product | Coproduct | Term | Match

	export type URI = { kind: "uri"; value: string }

	export type Literal = { kind: "literal"; value: string }

	export type Product = {
		kind: "product"
		components: { [K in string]: Expression }
	}

	export type Coproduct = {
		kind: "coproduct"
		key: string
		value: Expression
	}

	export type Term = Variable | Projection | Dereference

	export type Variable = { kind: "variable"; id: string }

	export type Projection = { kind: "projection"; key: string; value: Term }

	export type Dereference = { kind: "dereference"; key: string; value: Term }

	export type Case = { id: string; value: Expression }

	export type Match = {
		kind: "match"
		value: Term
		cases: { [K in string]: Case }
	}
}

export class Mapping<
	S extends { [K in string]: Type } = { [K in string]: Type },
	T extends { [K in string]: Type } = { [K in string]: Type }
> {
	constructor(
		readonly source: Schema<S>,
		readonly target: Schema<T>,
		readonly maps: Mapping.Map[]
	) {}

	get(target: keyof T): Mapping.Map {
		const map = this.maps.find((map) => map.target === target)
		if (map === undefined) {
			throw new Error(`mapping does not have a map with target ${target}`)
		} else {
			return map
		}
	}

	apply(instance: Instance<S>): Instance<T> {
		if (!this.source.isEqualTo(instance.schema)) {
			throw new Error(
				"a mapping can only be applied to an instance of its source schema"
			)
		}

		const elements: { [K in string]: Value[] } = mapEntries(
			this.target.classes,
			([key, targetType]) => {
				const { value: expression, id, source } = this.get(key)
				const sourceType = this.source.get(source)

				const elements: Value[] = []
				for (const element of instance.values(source)) {
					elements.push(
						this.applyExpression(instance, expression, targetType, {
							[id]: [sourceType, element],
						})
					)
				}

				return elements
			}
		)

		return new Instance(
			this.target,
			elements as { [K in keyof T]: Value<T[K]>[] }
		)
	}

	private applyExpression(
		instance: Instance<S>,
		expression: Mapping.Expression,
		targetType: Type,
		environment: Record<string, [Type, Value]>
	): Value {
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

			const components = mapEntries(targetType.components, ([key, target]) => {
				const source = expression.components[key]
				if (source === undefined) {
					throw new Error(`missing component ${key}`)
				} else {
					return this.applyExpression(instance, source, target, environment)
				}
			})

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
		instance: Instance<S>,
		term: Mapping.Term,
		environment: Record<string, [Type, Value]>
	): [Type, Value] {
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

	private project([t, v]: [Type, Value], targetType: Type): Value {
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

			return values.product(
				mapKeys(targetType.components, (key) => {
					if (t.components[key] === undefined) {
						throw new Error(`invalid type - missing component ${key}`)
					}

					return this.project(
						[t.components[key], v.components[key]],
						targetType.components[key]
					)
				})
			)
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
