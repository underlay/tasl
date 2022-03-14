import { ul } from "@underlay/namespaces"

import type { Schema } from "../schema/index.js"
import { decodeInstance, values } from "../instance/index.js"

import { mappingSchema } from "./mappingSchema.js"
import { Mapping } from "./mapping.js"
import { expressions } from "./expressions.js"

/**
 * Convert an encoded instance of the mapping schema to a mapping
 * @param {Schema} source
 * @param {Schema} target
 * @param {Uint8Array} data
 * @returns {Mapping}
 */
export function decodeMapping(
	source: Schema,
	target: Schema,
	data: Uint8Array
): Mapping {
	const instance = decodeInstance(mappingSchema, data)

	const products = new Map<number, Record<string, values.Value>>()
	for (const id of instance.keys(ul.product)) {
		products.set(id, {})
	}

	for (const element of instance.values(ul.component)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (source.kind !== "reference") {
			throw new Error("internal error decoding mapping")
		} else if (key === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (key.kind !== "uri") {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (value.kind !== "coproduct") {
			throw new Error("internal error decoding mapping")
		}

		const components = products.get(source.id)
		if (components === undefined) {
			throw new Error("broken construction reference value")
		} else if (key.value in components) {
			throw new Error("duplicate slot keys")
		} else {
			components[key.value] = value
		}
	}

	const matches = new Map<
		number,
		Record<string, { id: number; value: values.Value }>
	>()

	for (const id of instance.keys(ul.match)) {
		matches.set(id, {})
	}

	for (const [id, element] of instance.entries(ul.case)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (source.kind !== "reference") {
			throw new Error("internal error decoding mapping")
		} else if (key === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (key.kind !== "uri") {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (value.kind !== "coproduct") {
			throw new Error("internal error decoding mapping")
		}

		const cases = matches.get(source.id)
		if (cases === undefined) {
			throw new Error("broken match reference value")
		} else if (key.value in cases) {
			throw new Error("duplicate case keys")
		} else {
			cases[key.value] = { id, value }
		}
	}

	interface TermContext {
		projection: Set<number>
		dereference: Set<number>
	}

	function toTerm(
		term: values.Coproduct,
		context: TermContext
	): expressions.Term {
		if (term.key === ul.map) {
			if (term.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			return expressions.term(`m${term.value.id}`, [])
		} else if (term.key === ul.case) {
			if (term.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			return expressions.term(`c${term.value.id}`, [])
		} else if (term.key === ul.projection) {
			if (term.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			if (context.projection.has(term.value.id)) {
				throw new Error("projection cycle detected")
			} else {
				context.projection.add(term.value.id)
			}

			const element = instance.get(ul.projection, term.value.id)
			if (element.kind !== "product") {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components

			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (key.kind !== "uri") {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (value.kind !== "coproduct") {
				throw new Error("internal error decoding mapping")
			}

			const rest = toTerm(value, context)
			rest.path.push(expressions.projection(key.value))
			return rest
		} else if (term.key === ul.dereference) {
			if (term.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			if (context.dereference.has(term.value.id)) {
				throw new Error("dereference cycle detected")
			} else {
				context.dereference.add(term.value.id)
			}

			const element = instance.get(ul.dereference, term.value.id)
			if (element.kind !== "product") {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components

			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (key.kind !== "uri") {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (value.kind !== "coproduct") {
				throw new Error("internal error decoding mapping")
			}

			const rest = toTerm(value, context)
			rest.path.push(expressions.dereference(key.value))
			return rest
		} else {
			throw new Error("internal error decoding mapping")
		}
	}

	interface ExpressionContext {
		match: Set<number>
		product: Set<number>
		coproduct: Set<number>
	}

	function toExpression(
		expression: values.Coproduct,
		context: ExpressionContext
	): expressions.Expression {
		if (expression.key === ul.uri) {
			if (expression.value.kind !== "uri") {
				throw new Error("internal error decoding mapping")
			}

			return expressions.uri(expression.value.value)
		} else if (expression.key === ul.literal) {
			if (expression.value.kind !== "literal") {
				throw new Error("internal error decoding mapping")
			}

			return expressions.literal(expression.value.value)
		} else if (expression.key === ul.match) {
			if (expression.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			const element = instance.get(ul.match, expression.value.id)
			if (element.kind !== "product") {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.value]: value } = element.components
			if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (value.kind !== "coproduct") {
				throw new Error("internal error decoding mapping")
			}

			const match = matches.get(expression.value.id)
			if (match === undefined) {
				throw new Error("internal error decoding mapping")
			}

			const cases = Object.fromEntries(
				Object.entries(match).map(([key, { id, value }]) => {
					if (value.kind !== "coproduct") {
						throw new Error("internal error decoding mapping")
					}
					return [key, { id: `c${id}`, value: toExpression(value, context) }]
				})
			)

			const term = toTerm(value, {
				dereference: new Set(),
				projection: new Set(),
			})

			return expressions.match(term.id, term.path, cases)
		} else if (expression.key === ul.product) {
			if (expression.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			const product = products.get(expression.value.id)
			if (product === undefined) {
				throw new Error("internal error decoding mapping")
			}

			const components = Object.fromEntries(
				Object.entries(product).map(([key, value]) => {
					if (value.kind !== "coproduct") {
						throw new Error("internal error decoding mapping")
					}

					return [key, toExpression(value, context)]
				})
			)

			return expressions.product(components)
		} else if (expression.key === ul.coproduct) {
			if (expression.value.kind !== "reference") {
				throw new Error("internal error decoding mapping")
			}

			if (context.coproduct.has(expression.value.id)) {
				throw new Error("coproduct injection cycle detected")
			} else {
				context.coproduct.add(expression.value.id)
			}

			const element = instance.get(ul.coproduct, expression.value.id)
			if (element.kind !== "product") {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components
			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (key.kind !== "uri") {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (value.kind !== "coproduct") {
				throw new Error("internal error decoding mapping")
			}

			return expressions.coproduct(key.value, toExpression(value, context))
		} else {
			return toTerm(expression, {
				projection: new Set(),
				dereference: new Set(),
			})
		}
	}

	const maps: expressions.Map[] = []
	for (const [i, element] of instance.entries(ul.map)) {
		if (element.kind !== "product") {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.target]: target,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (source.kind !== "uri") {
			throw new Error("internal error decoding mapping")
		} else if (target === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (target.kind !== "uri") {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (value.kind !== "coproduct") {
			throw new Error("internal error decoding mapping")
		}

		if (target.value in maps) {
			throw new Error("duplicate target key")
		}

		const expression = toExpression(value, {
			match: new Set(),
			product: new Set(),
			coproduct: new Set(),
		})

		maps.push({
			source: source.value,
			target: target.value,
			id: `m${i}`,
			value: expression,
		})
	}

	return new Mapping(source, target, maps)
}
