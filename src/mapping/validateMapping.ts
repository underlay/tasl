import { signalInvalidType } from "../utils.js"

import { Schema, types } from "../schema/index.js"

import type { expressions } from "./expressions.js"
import { forComponents, forOptions } from "../keys.js"

export function validateMapping(
	source: Schema,
	target: Schema,
	maps: expressions.Map[]
) {
	const targets = new Map<string, expressions.Map>()
	for (const map of maps) {
		if (targets.has(map.target)) {
			throw new Error("duplicate target in mapping")
		} else {
			targets.set(map.target, map)
		}
	}

	for (const [key, targetType] of target.entries()) {
		const map = targets.get(key)
		if (map === undefined) {
			throw new Error(`missing target ${key} from mapping`)
		}

		const sourceType = source.get(map.source)
		const environment = { [map.id]: sourceType }
		validateExpression(source, targets, map.value, targetType, environment)
	}
}

function validateExpression(
	source: Schema,
	targets: Map<string, expressions.Map>,
	expression: expressions.Expression,
	type: types.Type,
	environment: Record<string, types.Type>
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
		const termType = getTermType(source, expression.value, environment)
		if (termType.kind !== "coproduct") {
			throw new Error("the value of a match expression must be a coproduct")
		}

		for (const [key, option] of forOptions(termType)) {
			const c = expression.cases[key]
			if (c === undefined) {
				throw new Error(`missing case for option ${key}`)
			}

			const e = { ...environment, [c.id]: option }
			validateExpression(source, targets, c.value, type, e)
		}
	} else if (expression.kind === "product") {
		if (type.kind !== "product") {
			throw new Error("unexpected product expression")
		}

		for (const [key, component] of forComponents(type)) {
			const entry = expression.components[key]
			if (entry === undefined) {
				throw new Error(`missing slot for component ${key}`)
			}

			validateExpression(source, targets, entry, component, environment)
		}
	} else if (expression.kind === "coproduct") {
		if (type.kind !== "coproduct") {
			throw new Error("unexpected coproduct expression")
		}

		const option = type.options[expression.key]
		if (option === undefined) {
			throw new Error(`no option for injection key ${expression.key}`)
		}

		validateExpression(source, targets, expression.value, option, environment)
	} else {
		const value = getTermType(source, expression, environment)
		if (type.kind === "reference") {
			const map = targets.get(type.key)
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
	value: expressions.Term,
	environment: Record<string, types.Type>
): types.Type {
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
