import { signalInvalidType } from "../utils.js"

import { Schema, types } from "../schema/index.js"

import type { expressions } from "./expressions.js"
import { forComponents, forOptions } from "../keys.js"

export function validateMapping(
	source: Schema,
	target: Schema,
	maps: expressions.Map[]
): Map<string, expressions.Map> {
	const mapping = new Map()
	maps.sort(({ target: a }, { target: b }) => (a < b ? -1 : a > b ? 1 : 0))
	for (const map of maps) {
		Object.freeze(map)
		if (mapping.has(map.target)) {
			throw new Error("duplicate map target")
		} else {
			mapping.set(map.target, map)
		}
	}

	for (const key of target.keys()) {
		if (mapping.has(key)) {
			continue
		} else {
			throw new Error(`missing target ${key} from mapping`)
		}
	}

	for (const map of mapping.values()) {
		const sourceType = source.get(map.source)
		const targetType = target.get(map.target)
		const environment = { [map.id]: sourceType }
		validateExpression(source, mapping, map.value, targetType, environment)
	}

	return mapping
}

function validateExpression(
	source: Schema,
	maps: Map<string, expressions.Map>,
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
	} else if (expression.kind === "product") {
		if (type.kind !== "product") {
			throw new Error("unexpected product expression")
		}

		for (const [key, component] of forComponents(type)) {
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
	} else if (expression.kind === "term") {
		const { id, path } = expression
		const termType = getTermType(source, id, path, environment)
		if (type.kind === "reference") {
			const map = maps.get(type.key)
			if (map === undefined) {
				throw new Error(`missing target ${type.key} from mapping`)
			} else if (termType.kind !== "reference" || termType.key !== map.source) {
				throw new Error(`expected a reference to class ${map.source}`)
			}
		} else {
			if (!types.isSubtypeOf(type, termType)) {
				throw new Error("value is not of the expected type")
			}
		}
	} else if (expression.kind === "match") {
		const { id, path } = expression
		const termType = getTermType(source, id, path, environment)
		if (termType.kind !== "coproduct") {
			throw new Error("the value of a match expression must be a coproduct")
		}

		for (const [key, option] of forOptions(termType)) {
			const c = expression.cases[key]
			if (c === undefined) {
				throw new Error(`missing case for option ${key}`)
			}

			const e = { ...environment, [c.id]: option }
			validateExpression(source, maps, c.value, type, e)
		}
	} else {
	}
}

function getTermType(
	source: Schema,
	id: string,
	path: expressions.Path,
	environment: Record<string, types.Type>
): types.Type {
	const type = environment[id]
	if (type === undefined) {
		throw new Error(`unbound variable: ${id}`)
	}

	return path.reduce((type, segment) => {
		if (segment.kind === "projection") {
			if (type.kind !== "product") {
				throw new Error("invalid projection: not a product")
			}
			const component = type.components[segment.key]
			if (component === undefined) {
				throw new Error(
					`invalid projection: no component with key ${segment.key}`
				)
			}
			return component
		} else if (segment.kind === "dereference") {
			if (type.kind !== "reference") {
				throw new Error("invalid dereference: not a reference")
			}
			if (type.key !== segment.key) {
				throw new Error(
					`invalid dereference: expected key ${type.key} but got key ${segment.key}`
				)
			}
			return source.get(type.key)
		} else {
			signalInvalidType(segment)
		}
	}, environment[id])
}
