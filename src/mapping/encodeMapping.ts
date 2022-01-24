import { ul } from "@underlay/namespaces"

import { signalInvalidType } from "../utils.js"
import { forEntries } from "../keys.js"

import type { Value } from "../types.js"
import { Instance, values, encodeInstance } from "../instance/index.js"

import type { Mapping } from "./mapping.js"
import {
	MappingSchema,
	ExpressionType,
	TermType,
	mappingSchema,
} from "./mappingSchema.js"

/**
 * Convert a mapping to an encoded instance of the mapping schema
 * @param {Mapping} mapping
 * @returns {Uint8Array} an encoded instance of the mapping schema
 */
export function encodeMapping(mapping: Mapping): Uint8Array {
	const elements: { [K in keyof MappingSchema]: Value<MappingSchema[K]>[] } = {
		[ul.map]: [],
		[ul.projection]: [],
		[ul.dereference]: [],
		[ul.match]: [],
		[ul.case]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
	}

	for (const { source, target, id, value: expression } of mapping.maps) {
		const { length: index } = elements[ul.map]
		const value = values.coproduct(ul.map, values.reference(index))
		elements[ul.map].push(
			values.product({
				[ul.source]: values.uri(source),
				[ul.target]: values.uri(target),
				[ul.value]: fromExpression(elements, expression, { [id]: value }),
			})
		)
	}

	return encodeInstance(new Instance(mappingSchema, elements))
}

function fromExpression(
	elements: { [K in keyof MappingSchema]: Value<MappingSchema[K]>[] },
	expression: Mapping.Expression,
	environment: Record<string, Value<TermType>>
): Value<ExpressionType> {
	if (expression.kind === "uri") {
		return values.coproduct(ul.uri, values.uri(expression.value))
	} else if (expression.kind === "literal") {
		return values.coproduct(ul.literal, values.literal(expression.value))
	} else if (expression.kind === "match") {
		const value = fromTerm(elements, expression.value, environment)
		const { length: index } = elements[ul.match]
		elements[ul.match].push(values.product({ [ul.value]: value }))

		for (const [key, c] of forEntries(expression.cases)) {
			const reference = values.reference(NaN)
			const value = fromExpression(elements, c.value, {
				...environment,
				[c.id]: values.coproduct(ul.case, reference),
			})

			reference.index = elements[ul.case].length

			elements[ul.case].push(
				values.product({
					[ul.source]: values.reference(index),
					[ul.key]: values.uri(key),
					[ul.value]: value,
				})
			)
		}

		return values.coproduct(ul.match, values.reference(index))
	} else if (expression.kind === "product") {
		const { length: index } = elements[ul.product]
		elements[ul.product].push(values.unit())

		for (const [key, component] of forEntries(expression.components)) {
			elements[ul.component].push(
				values.product({
					[ul.source]: values.reference(index),
					[ul.key]: values.uri(key),
					[ul.value]: fromExpression(elements, component, environment),
				})
			)
		}

		return values.coproduct(ul.product, values.reference(index))
	} else if (expression.kind === "coproduct") {
		const value = fromExpression(elements, expression.value, environment)
		const { length: index } = elements[ul.coproduct]
		elements[ul.coproduct].push(
			values.product({
				[ul.key]: values.uri(expression.key),
				[ul.value]: value,
			})
		)

		return values.coproduct(ul.coproduct, values.reference(index))
	} else {
		return fromTerm(elements, expression, environment)
	}
}

function fromTerm(
	classes: { [K in keyof MappingSchema]: Value<MappingSchema[K]>[] },
	term: Mapping.Term,
	environment: Record<string, Value<TermType>>
): Value<TermType> {
	if (term.kind === "variable") {
		if (term.id in environment) {
			return environment[term.id]
		} else {
			throw new Error(`unbound variable - ${term.id}`)
		}
	} else if (term.kind === "projection") {
		const value = fromTerm(classes, term.value, environment)
		const { length: index } = classes[ul.projection]
		classes[ul.projection].push(
			values.product({ [ul.key]: values.uri(term.key), [ul.value]: value })
		)

		return values.coproduct(ul.projection, values.reference(index))
	} else if (term.kind === "dereference") {
		const value = fromTerm(classes, term.value, environment)
		const { length: index } = classes[ul.dereference]
		classes[ul.dereference].push(
			values.product({ [ul.key]: values.uri(term.key), [ul.value]: value })
		)

		return values.coproduct(ul.dereference, values.reference(index))
	} else {
		signalInvalidType(term)
	}
}
