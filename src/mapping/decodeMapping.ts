import { ul } from "@underlay/namespaces"

import { iota, signalInvalidType } from "../utils.js"
import { map, mapValues } from "../keys.js"

import type { Type, Value } from "../types.js"
import type { Schema } from "../schema/index.js"
import { decodeInstance } from "../instance/index.js"

import { ExpressionType, TermType, mappingSchema } from "./mappingSchema.js"
import { Mapping } from "./mapping.js"
import * as expressions from "./expressions/index.js"

/**
 * Convert an encoded instance of the mapping schema to a mapping
 * @param {Schema} source
 * @param {Schema} garget
 * @param {Uint8Array} data
 * @returns {Mapping}
 */
export function decodeMapping<
	S extends { [K in string]: Type },
	T extends { [K in string]: Type }
>(source: Schema<S>, target: Schema<T>, data: Uint8Array): Mapping<S, T> {
	const instance = decodeInstance(mappingSchema, data)

	const products: Record<string, Value<ExpressionType>>[] = Array.from(
		iota(instance.count(ul.product), (_) => ({}))
	)

	for (const element of instance.values(ul.component)) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const components = products[index]
		if (components === undefined) {
			throw new Error("broken construction reference value")
		} else if (key in components) {
			throw new Error("duplicate slot keys")
		} else {
			components[key] = value
		}
	}

	const matches: Record<
		string,
		{ index: number; value: Value<ExpressionType> }
	>[] = Array.from(iota(instance.count(ul.match), (_) => ({})))

	for (const [i, element] of instance.entries(ul.case)) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const cases = matches[index]
		if (cases === undefined) {
			throw new Error("broken match reference value")
		} else if (key in cases) {
			throw new Error("duplicate case keys")
		} else {
			cases[key] = { index: i, value }
		}
	}

	function toTerm(
		value: Value<TermType>,
		projections = new Set<number>(),
		dereferences = new Set<number>()
	): Mapping.Term {
		if (value.key === ul.map) {
			const { index } = value.value
			return expressions.variable(`m${index}`)
		} else if (value.key === ul.case) {
			const { index } = value.value
			return expressions.variable(`c${index}`)
		} else if (value.key === ul.projection) {
			const { index } = value.value
			if (projections.has(index)) {
				throw new Error("projection cycle detected")
			} else {
				projections.add(index)
			}

			const element = instance.get(ul.projection, index)
			const { value: key } = element.components[ul.key]
			const term = toTerm(
				element.components[ul.value],
				projections,
				dereferences
			)
			return expressions.projection(key, term)
		} else if (value.key === ul.dereference) {
			const { index } = value.value
			if (dereferences.has(index)) {
				throw new Error("dereference cycle detected")
			} else {
				dereferences.add(index)
			}

			const element = instance.get(ul.dereference, index)
			const { value: key } = element.components[ul.key]
			const term = toTerm(
				element.components[ul.value],
				projections,
				dereferences
			)
			return expressions.dereference(key, term)
		} else {
			signalInvalidType(value)
		}
	}

	function toExpression(
		expression: Value<ExpressionType>,
		context = {
			match: new Set<number>(),
			product: new Set<number>(),
			coproduct: new Set<number>(),
		}
	): Mapping.Expression {
		if (expression.key === ul.uri) {
			return expressions.uri(expression.value.value)
		} else if (expression.key === ul.literal) {
			const { value } = expression.value
			return expressions.literal(value)
		} else if (expression.key === ul.match) {
			const { index } = expression.value
			const element = instance.get(ul.match, index)
			const value = element.components[ul.value]
			const cases = mapValues(matches[index], ({ index, value }) => ({
				id: `c${index}`,
				value: toExpression(value),
			}))

			return expressions.match(toTerm(value), cases)
		} else if (expression.key === ul.product) {
			const { index } = expression.value
			return expressions.product(
				mapValues(products[index], (value) => toExpression(value, context))
			)
		} else if (expression.key === ul.coproduct) {
			const { index } = expression.value
			if (context.coproduct.has(index)) {
				throw new Error("injection cycle detected")
			} else {
				context.coproduct.add(index)
			}

			const element = instance.get(ul.coproduct, index)
			const { value: key } = element.components[ul.key]
			const value = element.components[ul.value]
			return expressions.coproduct(key, toExpression(value, context))
		} else {
			return toTerm(expression)
		}
	}

	return new Mapping(
		source,
		target,
		Array.from(
			map(instance.entries(ul.map), ([i, element]) => {
				const { value: source } = element.components[ul.source]
				const { value: target } = element.components[ul.target]
				const expression = toExpression(element.components[ul.value])
				return { source, target, id: `m${i}`, value: expression }
			})
		)
	)
}
