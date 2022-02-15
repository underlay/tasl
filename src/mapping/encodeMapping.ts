import { ul } from "@underlay/namespaces"

import { getKeys, signalInvalidType } from "../utils.js"

import { Instance, values, encodeInstance } from "../instance/index.js"

import type { Mapping } from "./mapping.js"
import { mappingSchema } from "./mappingSchema.js"

import type { expressions } from "./expressions.js"

type MappingElements = {
	[ul.map]: values.Value[]
	[ul.projection]: values.Value[]
	[ul.dereference]: values.Value[]
	[ul.match]: values.Value[]
	[ul.case]: values.Value[]
	[ul.product]: values.Value[]
	[ul.component]: values.Value[]
	[ul.coproduct]: values.Value[]
}

/**
 * Convert a mapping to an encoded instance of the mapping schema
 * @param {Mapping} mapping
 * @returns {Uint8Array} an encoded instance of the mapping schema
 */
export function encodeMapping(mapping: Mapping): Uint8Array {
	const elements: MappingElements = {
		[ul.map]: [],
		[ul.projection]: [],
		[ul.dereference]: [],
		[ul.match]: [],
		[ul.case]: [],
		[ul.product]: [],
		[ul.component]: [],
		[ul.coproduct]: [],
	}

	for (const [target, map] of mapping.entries()) {
		const { source: source, id, value: expression } = map
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
	elements: MappingElements,
	expression: expressions.Expression,
	environment: Record<string, values.Value>
): values.Value {
	if (expression.kind === "uri") {
		return values.coproduct(ul.uri, values.uri(expression.value))
	} else if (expression.kind === "literal") {
		return values.coproduct(ul.literal, values.literal(expression.value))
	} else if (expression.kind === "product") {
		const { length: index } = elements[ul.product]
		elements[ul.product].push(values.unit())

		const keys = getKeys(expression.components)
		for (const key of keys) {
			const component = expression.components[key]
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
	} else if (expression.kind === "match") {
		const { id, path } = expression
		const value = fromTerm(elements, id, path, environment)
		const { length: index } = elements[ul.match]
		elements[ul.match].push(values.product({ [ul.value]: value }))

		const keys = getKeys(expression.cases)
		for (const key of keys) {
			const c = expression.cases[key]
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
	} else if (expression.kind === "term") {
		const { id, path } = expression
		return fromTerm(elements, id, path, environment)
	} else {
		signalInvalidType(expression)
	}
}

function fromTerm(
	elements: MappingElements,
	id: string,
	path: expressions.Path,
	environment: Record<string, values.Value>
): values.Value {
	const value = environment[id]
	if (value === undefined) {
		throw new Error(`unbound variable: ${id}`)
	}

	return path.reduce((value, segment) => {
		if (segment.kind === "projection") {
			const { length: index } = elements[ul.projection]
			elements[ul.projection].push(
				values.product({ [ul.key]: values.uri(segment.key), [ul.value]: value })
			)
			return values.coproduct(ul.projection, values.reference(index))
		} else if (segment.kind === "dereference") {
			const { length: index } = elements[ul.dereference]
			elements[ul.dereference].push(
				values.product({ [ul.key]: values.uri(segment.key), [ul.value]: value })
			)
			return values.coproduct(ul.dereference, values.reference(index))
		} else {
			signalInvalidType(segment)
		}
	}, value)
}
