import { ul } from "@underlay/namespaces"

import type * as Instance from "../../instance/index.js"
import type * as Mapping from "../../mapping/mapping.js"

import {
	MappingSchema,
	ExpressionType,
	ValueType,
	mappingSchema,
} from "./schema.js"

import { iota, signalInvalidType } from "../../utils.js"
import { mapValues } from "../../keys.js"
import { decode } from "../../decode.js"

/**
 * Convert an encoded instance of the mapping schema to a mapping
 * @param {Uint8Array} data
 * @returns {Mapping} a mapping
 */
export function decodeMapping(data: Uint8Array): Mapping.Mapping {
	const instance = decode(mappingSchema, data)
	return toMapping(instance)
}

/**
 * Convert an instance of the mapping schema to a mapping
 * @param {Instance} instance an instance of the mapping schema
 * @returns {Mapping} a mapping
 */
export function toMapping(
	instance: Instance.Instance<MappingSchema>
): Mapping.Mapping {
	const constructions: Record<string, Instance.Value<ExpressionType>>[] =
		Array.from(iota(instance[ul.construction].length, (_) => ({})))

	for (const element of instance[ul.slot]) {
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
		{ index: number; value: Instance.Value<ExpressionType> }
	>[] = Array.from(iota(instance[ul.match].length, (_) => ({})))

	for (const [i, element] of instance[ul.case].entries()) {
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

	function parseValue(
		value: Instance.Value<ValueType>,
		projections = new Set<number>(),
		dereferences = new Set<number>()
	): Mapping.Value {
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

			const element = instance[ul.projection][index]
			const { value: key } = element.components[ul.key]
			const next = parseValue(
				element.components[ul.value],
				projections,
				dereferences
			)
			return { kind: "projection", key, value: next }
		} else if (value.key === ul.dereference) {
			const { index } = value.value
			if (dereferences.has(index)) {
				throw new Error("dereference cycle detected")
			} else {
				dereferences.add(index)
			}

			const element = instance[ul.dereference][index]
			const { value: key } = element.components[ul.key]
			const next = parseValue(
				element.components[ul.value],
				projections,
				dereferences
			)
			return { kind: "dereference", key, value: next }
		} else {
			signalInvalidType(value)
		}
	}

	function parseExpression(
		expression: Instance.Value<ExpressionType>,
		context = {
			match: new Set<number>(),
			construction: new Set<number>(),
			injection: new Set<number>(),
		}
	): Mapping.Expression {
		if (expression.key === ul.uri) {
			return { kind: "uri", value: expression.value.value }
		} else if (expression.key === ul.literal) {
			return { kind: "literal", value: expression.value.value }
		} else if (expression.key === ul.match) {
			const { index } = expression.value
			const element = instance[ul.match][index]
			const value = element.components[ul.value]
			const cases = mapValues(matches[index], ({ index, value }) => ({
				id: `c${index}`,
				expression: parseExpression(value),
			}))

			return { kind: "match", value: parseValue(value), cases }
		} else if (expression.key === ul.construction) {
			const { index } = expression.value
			const slots = mapValues(constructions[index], (value) =>
				parseExpression(value, context)
			)
			return { kind: "construction", slots }
		} else if (expression.key === ul.injection) {
			const { index } = expression.value
			if (context.injection.has(index)) {
				throw new Error("injection cycle detected")
			} else {
				context.injection.add(index)
			}

			const element = instance[ul.injection][index]
			const { value: key } = element.components[ul.key]
			const value = element.components[ul.value]
			return {
				kind: "injection",
				key,
				expression: parseExpression(value, context),
			}
		} else {
			return parseValue(expression)
		}
	}

	const maps: Record<string, Mapping.Map> = {}
	for (const [i, element] of instance[ul.map].entries()) {
		const { value: source } = element.components[ul.source]
		const { value: target } = element.components[ul.target]
		const expression = parseExpression(element.components[ul.value])
		maps[target] = { source, id: `m${i}`, expression }
	}

	return maps
}
