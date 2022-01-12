import { ul } from "@underlay/namespaces"

import { iota, signalInvalidType } from "../utils.js"
import { map, mapValues } from "../keys.js"

import type { Type, Value } from "../types.js"
import type { Schema } from "../schema/index.js"
import { decodeInstance } from "../instance/index.js"

import { ExpressionType, TermType, mappingSchema } from "./mappingSchema.js"
import { Mapping } from "./mapping.js"

export function decodeMapping<
	S extends { [K in string]: Type },
	T extends { [K in string]: Type }
>(source: Schema<S>, target: Schema<T>, data: Uint8Array): Mapping<S, T> {
	const instance = decodeInstance(mappingSchema, data)

	const constructions: Record<string, Value<ExpressionType>>[] = Array.from(
		iota(instance.count(ul.construction), (_) => ({}))
	)

	for (const element of instance.values(ul.slot)) {
		const value = element.components[ul.value]
		const { value: key } = element.components[ul.key]
		const { index } = element.components[ul.source]
		const slots = constructions[index]
		if (slots === undefined) {
			throw new Error("broken construction reference value")
		} else if (key in slots) {
			throw new Error("duplicate slot keys")
		} else {
			slots[key] = value
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
			return { kind: "variable", id: `m${index}` }
		} else if (value.key === ul.case) {
			const { index } = value.value
			return { kind: "variable", id: `c${index}` }
		} else if (value.key === ul.projection) {
			const { index } = value.value
			if (projections.has(index)) {
				throw new Error("projection cycle detected")
			} else {
				projections.add(index)
			}

			const element = instance.get(ul.projection, index)
			const { value: key } = element.components[ul.key]
			const path = toTerm(
				element.components[ul.value],
				projections,
				dereferences
			)
			return { kind: "projection", key, value: path }
		} else if (value.key === ul.dereference) {
			const { index } = value.value
			if (dereferences.has(index)) {
				throw new Error("dereference cycle detected")
			} else {
				dereferences.add(index)
			}

			const element = instance.get(ul.dereference, index)
			const { value: key } = element.components[ul.key]
			const path = toTerm(
				element.components[ul.value],
				projections,
				dereferences
			)
			return { kind: "dereference", key, value: path }
		} else {
			signalInvalidType(value)
		}
	}

	function toExpression(
		expression: Value<ExpressionType>,
		context = {
			match: new Set<number>(),
			construction: new Set<number>(),
			injection: new Set<number>(),
		}
	): Mapping.Expression {
		if (expression.key === ul.uri) {
			return { kind: "uri", value: expression.value.value }
		} else if (expression.key === ul.literal) {
			const { value } = expression.value
			return { kind: "literal", value }
		} else if (expression.key === ul.match) {
			const { index } = expression.value
			const element = instance.get(ul.match, index)
			const value = element.components[ul.value]
			const cases = mapValues(matches[index], ({ index, value }) => ({
				id: `c${index}`,
				value: toExpression(value),
			}))

			return { kind: "match", value: toTerm(value), cases }
		} else if (expression.key === ul.construction) {
			const { index } = expression.value
			const slots = mapValues(constructions[index], (value) =>
				toExpression(value, context)
			)
			return { kind: "construction", slots }
		} else if (expression.key === ul.injection) {
			const { index } = expression.value
			if (context.injection.has(index)) {
				throw new Error("injection cycle detected")
			} else {
				context.injection.add(index)
			}

			const element = instance.get(ul.injection, index)
			const { value: key } = element.components[ul.key]
			const value = element.components[ul.value]
			return {
				kind: "injection",
				key,
				value: toExpression(value, context),
			}
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
