import { forEntries } from "./keys.js"
import { signalInvalidType } from "./utils.js"

import * as types from "./schema/types/index.js"
import { Schema } from "./schema/schema.js"

import type { Mapping } from "./mapping/mapping.js"
import type { Type } from "./types.js"

/**
 *
 * @param source the source schema
 * @param mapping a mapping from the source schema to the target schema
 * @param target the target schema
 * @throws an error if the mapping does not match the source and target
 */
export function validateMapping(
	source: Schema,
	target: Schema,
	maps: Mapping.Map[]
) {
	for (const [key, targetType] of target.entries()) {
		const map = maps.find((map) => map.target === key)
		if (map === undefined) {
			throw new Error(`missing target ${key} from mapping`)
		}
		const sourceType = source.get(map.source)
		const environment = { [map.id]: sourceType }
		validateExpression(source, maps, map.value, targetType, environment)
	}
}

/**
 *
 * @param source the source schema
 * @param maps a mapping from the source schema
 * @param expression an expression within one of the maps of the mapping
 * @param type the target type of the expression
 * @param environment the environment of bound variables
 * @throws an error if the expression does not evaluate to the given type
 */
function validateExpression(
	source: Schema,
	maps: Mapping.Map[],
	expression: Mapping.Expression,
	type: Type,
	environment: Record<string, Type>
) {
	if (expression.kind === "uri") {
		if (type.kind !== "uri") {
			throw new Error("unexpected URI value")
		}
	} else if (expression.kind === "literal") {
		if (type.kind !== "literal") {
			throw new Error("unexpected literal value")
		}
	} else if (expression.kind === "match") {
		const value = getTermType(source, expression.value, environment)
		if (value.kind !== "coproduct") {
			throw new Error("the value of a match expression must be a coproduct")
		}

		for (const [key, option] of forEntries(value.options)) {
			const c = expression.cases[key]
			if (c === undefined) {
				throw new Error(`missing case for option ${key}`)
			}

			const e = { ...environment, [c.id]: option }
			validateExpression(source, maps, c.value, type, e)
		}
	} else if (expression.kind === "product") {
		if (type.kind !== "product") {
			throw new Error("unexpected product expression")
		}

		for (const [key, component] of forEntries(type.components)) {
			const entry = expression.components[key]
			if (entry === undefined) {
				throw new Error(`missing slot for component ${key}`)
			}

			validateExpression(source, maps, entry, component, environment)
		}
	} else if (expression.kind === "coproduct") {
		if (type.kind !== "coproduct") {
			throw new Error("unexpected coproduct expression")
		}

		const option = type.options[expression.key]
		if (option === undefined) {
			throw new Error(`no option for injection key ${expression.key}`)
		}

		validateExpression(source, maps, expression.value, option, environment)
	} else {
		const value = getTermType(source, expression, environment)
		if (type.kind === "reference") {
			const map = maps.find((map) => map.target === type.key)
			if (map === undefined) {
				throw new Error(`missing target ${type.key} from mapping`)
			} else if (value.kind !== "reference" || value.key !== map.source) {
				throw new Error(`expected a reference to class ${map.source}`)
			}
		} else {
			if (!types.isSubtypeOf(type, value)) {
				throw new Error("value is not of the expected type")
			}
		}
	}
}

function getTermType(
	source: Schema,
	value: Mapping.Term,
	environment: Record<string, Type>
): Type {
	if (value.kind === "variable") {
		const type = environment[value.id]
		if (type === undefined) {
			throw new Error(`unbound variable ${value.id}`)
		}

		return type
	} else if (value.kind === "projection") {
		const type = getTermType(source, value.value, environment)
		if (type.kind !== "product") {
			throw new Error("invalid projection - value is not a product")
		}

		const component = type.components[value.key]
		if (component === undefined) {
			throw new Error(`invalid projection - no component with key ${value.key}`)
		}

		return component
	} else if (value.kind === "dereference") {
		const reference = getTermType(source, value.value, environment)
		if (reference.kind !== "reference") {
			throw new Error("invalid dereference - value is not a reference")
		}

		if (reference.key !== value.key) {
			throw new Error(
				`invalid dereference - expected key ${reference.key} but found key ${value.key}`
			)
		}

		return source.get(value.key)
	} else {
		signalInvalidType(value)
	}
}
