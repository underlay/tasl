import { ul } from "@underlay/namespaces"

import { iota } from "../utils.js"

import type { Schema } from "../schema/index.js"
import { decodeInstance, values } from "../instance/index.js"

import { mappingSchema } from "./mappingSchema.js"
import { Mapping } from "./mapping.js"
import { expressions } from "./expressions.js"

/**
 * Convert an encoded instance of the mapping schema to a mapping
 * @param {Schema} source
 * @param {Schema} garget
 * @param {Uint8Array} data
 * @returns {Mapping}
 */
export function decodeMapping(
	source: Schema,
	target: Schema,
	data: Uint8Array
): Mapping {
	const instance = decodeInstance(mappingSchema, data)

	const products: Record<string, values.Value>[] = Array.from(
		iota(instance.count(ul.product), (_) => ({}))
	)

	for (const element of instance.values(ul.component)) {
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isReference(source)) {
			throw new Error("internal error decoding mapping")
		} else if (key === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isURI(key)) {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding mapping")
		}

		const components = products[source.index]
		if (components === undefined) {
			throw new Error("broken construction reference value")
		} else if (key.value in components) {
			throw new Error("duplicate slot keys")
		} else {
			components[key.value] = value
		}
	}

	const matches: Record<string, { index: number; value: values.Value }>[] =
		Array.from(iota(instance.count(ul.match), (_) => ({})))

	for (const [i, element] of instance.entries(ul.case)) {
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.key]: key,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isReference(source)) {
			throw new Error("internal error decoding mapping")
		} else if (key === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isURI(key)) {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding mapping")
		}

		const cases = matches[source.index]
		if (cases === undefined) {
			throw new Error("broken match reference value")
		} else if (key.value in cases) {
			throw new Error("duplicate case keys")
		} else {
			cases[key.value] = { index: i, value }
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
			if (!values.isReference(term.value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.variable(`m${term.value.index}`)
		} else if (term.key === ul.case) {
			if (!values.isReference(term.value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.variable(`c${term.value.index}`)
		} else if (term.key === ul.projection) {
			if (!values.isReference(term.value)) {
				throw new Error("internal error decoding mapping")
			}

			if (context.projection.has(term.value.index)) {
				throw new Error("projection cycle detected")
			} else {
				context.projection.add(term.value.index)
			}

			const element = instance.get(ul.projection, term.value.index)
			if (!values.isProduct(element)) {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components

			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isURI(key)) {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isCoproduct(value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.projection(key.value, toTerm(value, context))
		} else if (term.key === ul.dereference) {
			if (!values.isReference(term.value)) {
				throw new Error("internal error decoding mapping")
			}

			if (context.dereference.has(term.value.index)) {
				throw new Error("dereference cycle detected")
			} else {
				context.dereference.add(term.value.index)
			}

			const element = instance.get(ul.dereference, term.value.index)
			if (!values.isProduct(element)) {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components

			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isURI(key)) {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isCoproduct(value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.dereference(key.value, toTerm(value, context))
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
			if (!values.isURI(expression.value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.uri(expression.value.value)
		} else if (expression.key === ul.literal) {
			if (!values.isLiteral(expression.value)) {
				throw new Error("internal error decoding mapping")
			}

			return expressions.literal(expression.value.value)
		} else if (expression.key === ul.match) {
			if (!values.isReference(expression.value)) {
				throw new Error("internal error decoding mapping")
			}

			const element = instance.get(ul.match, expression.value.index)
			if (!values.isProduct(element)) {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.value]: value } = element.components
			if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isCoproduct(value)) {
				throw new Error("internal error decoding mapping")
			}

			const cases = Object.fromEntries(
				Object.entries(matches[expression.value.index]).map(
					([key, { index, value }]) => {
						if (!values.isCoproduct(value)) {
							throw new Error("internal error decoding mapping")
						}
						return [
							key,
							{ id: `c${index}`, value: toExpression(value, context) },
						]
					}
				)
			)

			return expressions.match(
				toTerm(value, { dereference: new Set(), projection: new Set() }),
				cases
			)
		} else if (expression.key === ul.product) {
			if (!values.isReference(expression.value)) {
				throw new Error("internal error decoding mapping")
			}

			const components = Object.fromEntries(
				Object.entries(products[expression.value.index]).map(([key, value]) => {
					if (!values.isCoproduct(value)) {
						throw new Error("internal error decoding mapping")
					}

					return [key, toExpression(value, context)]
				})
			)

			return expressions.product(components)
		} else if (expression.key === ul.coproduct) {
			if (!values.isReference(expression.value)) {
				throw new Error("internal error decoding mapping")
			}

			if (context.coproduct.has(expression.value.index)) {
				throw new Error("coproduct injection cycle detected")
			} else {
				context.coproduct.add(expression.value.index)
			}

			const element = instance.get(ul.coproduct, expression.value.index)
			if (!values.isProduct(element)) {
				throw new Error("internal error decoding mapping")
			}

			const { [ul.key]: key, [ul.value]: value } = element.components
			if (key === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isURI(key)) {
				throw new Error("internal error decoding mapping")
			} else if (value === undefined) {
				throw new Error("internal error decoding mapping")
			} else if (!values.isCoproduct(value)) {
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
		if (!values.isProduct(element)) {
			throw new Error("internal error decoding mapping")
		}

		const {
			[ul.source]: source,
			[ul.target]: target,
			[ul.value]: value,
		} = element.components

		if (source === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isURI(source)) {
			throw new Error("internal error decoding mapping")
		} else if (target === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isURI(target)) {
			throw new Error("internal error decoding mapping")
		} else if (value === undefined) {
			throw new Error("internal error decoding mapping")
		} else if (!values.isCoproduct(value)) {
			throw new Error("internal error decoding mapping")
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
