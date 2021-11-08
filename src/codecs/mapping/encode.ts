import { ul } from "@underlay/namespaces"

import * as Instance from "../../instance/index.js"
import type * as Mapping from "../../mapping/index.js"

import {
	MappingSchema,
	ExpressionType,
	ValueType,
	mappingSchema,
} from "./schema.js"

import { encode } from "../../encode.js"
import { forEntries } from "../../keys.js"
import { signalInvalidType } from "../../utils.js"

/**
 * Convert a mapping to an encoded instance of the mapping schema
 * @param {Mapping} mapping a mapping
 * @returns {Uint8Array} an encoded instance of the mapping schema
 */
export function encodeMapping(mapping: Mapping.Mapping): Uint8Array {
	const instance = fromMapping(mapping)
	return encode(mappingSchema, instance)
}

/**
 * Convert a mapping to an instance of the mapping schema
 * @param {Mapping} mapping a mapping
 * @returns {Instance} an instance of the mapping schema
 */
export function fromMapping(
	mapping: Mapping.Mapping
): Instance.Instance<MappingSchema> {
	const instance: Instance.Instance<MappingSchema> = {
		[ul.map]: [],
		[ul.projection]: [],
		[ul.dereference]: [],
		[ul.match]: [],
		[ul.case]: [],
		[ul.construction]: [],
		[ul.slot]: [],
		[ul.injection]: [],
	}

	for (const [target, { source, id, expression }] of forEntries(mapping)) {
		const { length: index } = instance[ul.map]
		const value: Instance.Value<ValueType> = {
			kind: "coproduct",
			key: ul.map,
			value: { kind: "reference", index },
		}

		instance[ul.map].push({
			kind: "product",
			components: {
				[ul.source]: { kind: "uri", value: source },
				[ul.target]: { kind: "uri", value: target },
				[ul.value]: fromExpression(instance, expression, { [id]: value }),
			},
		})
	}

	return instance
}

function fromExpression(
	classes: Instance.Instance<MappingSchema>,
	expression: Mapping.Expression,
	environment: Record<string, Instance.Value<ValueType>>
): Instance.Value<ExpressionType> {
	if (expression.kind === "uri") {
		return {
			kind: "coproduct",
			key: ul.uri,
			value: { kind: "uri", value: expression.value },
		}
	} else if (expression.kind === "literal") {
		return {
			kind: "coproduct",
			key: ul.literal,
			value: { kind: "literal", value: expression.value },
		}
	} else if (expression.kind === "match") {
		const value = fromValue(classes, expression.value, environment)
		const { length: index } = classes[ul.match]
		classes[ul.match].push({
			kind: "product",
			components: { [ul.value]: value },
		})

		for (const [key, c] of forEntries(expression.cases)) {
			const reference: Instance.Reference<typeof ul.case> = {
				kind: "reference",
				index: NaN,
			}

			const value = fromExpression(classes, c.expression, {
				...environment,
				[c.id]: { kind: "coproduct", key: ul.case, value: reference },
			})

			reference.index = classes[ul.case].length

			classes[ul.case].push({
				kind: "product",
				components: {
					[ul.source]: { kind: "reference", index },
					[ul.key]: { kind: "uri", value: key },
					[ul.value]: value,
				},
			})
		}

		return {
			kind: "coproduct",
			key: ul.match,
			value: { kind: "reference", index },
		}
	} else if (expression.kind === "construction") {
		const { length: index } = classes[ul.construction]
		classes[ul.construction].push({ kind: "product", components: {} })

		for (const [key, s] of forEntries(expression.slots)) {
			classes[ul.slot].push({
				kind: "product",
				components: {
					[ul.source]: { kind: "reference", index },
					[ul.key]: { kind: "uri", value: key },
					[ul.value]: fromExpression(classes, s, environment),
				},
			})
		}

		return {
			kind: "coproduct",
			key: ul.construction,
			value: { kind: "reference", index },
		}
	} else if (expression.kind === "injection") {
		const value = fromExpression(classes, expression.expression, environment)
		const { length: index } = classes[ul.injection]
		classes[ul.injection].push({
			kind: "product",
			components: {
				[ul.key]: { kind: "uri", value: expression.key },
				[ul.value]: value,
			},
		})

		return {
			kind: "coproduct",
			key: ul.injection,
			value: { kind: "reference", index },
		}
	} else {
		return fromValue(classes, expression, environment)
	}
}

function fromValue(
	classes: Instance.Instance<MappingSchema>,
	value: Mapping.Value,
	environment: Record<string, Instance.Value<ValueType>>
): Instance.Value<ValueType> {
	if (value.kind === "variable") {
		if (value.id in environment) {
			return environment[value.id]
		} else {
			throw new Error(`unbound variable - ${value.id}`)
		}
	} else if (value.kind === "projection") {
		const tail = fromValue(classes, value.value, environment)
		const { length: index } = classes[ul.projection]
		classes[ul.projection].push({
			kind: "product",
			components: {
				[ul.key]: { kind: "uri", value: value.key },
				[ul.value]: tail,
			},
		})

		return {
			kind: "coproduct",
			key: ul.projection,
			value: { kind: "reference", index },
		}
	} else if (value.kind === "dereference") {
		const tail = fromValue(classes, value.value, environment)
		const { length: index } = classes[ul.dereference]
		classes[ul.dereference].push({
			kind: "product",
			components: {
				[ul.key]: { kind: "uri", value: value.key },
				[ul.value]: tail,
			},
		})

		return {
			kind: "coproduct",
			key: ul.dereference,
			value: { kind: "reference", index },
		}
	} else {
		signalInvalidType(value)
	}
}
