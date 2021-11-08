import * as Schema from "../schema/index.js"
import * as Instance from "../instance/index.js"
import type { Expression, Value, Mapping } from "./mapping.js"

import { forEntries, forKeys, mapKeys } from "../keys.js"
import { signalInvalidType } from "../utils.js"

/**
 *
 * @param source the source schema
 * @param mapping a mapping from the source schema to the target schema
 * @param target the target schema
 * @throws an error if the mapping does not match the source and target
 */
export function validateMapping(
	source: Schema.Schema,
	mapping: Mapping,
	target: Schema.Schema
) {
	for (const [key, targetType] of forEntries(target)) {
		const map = mapping[key]
		if (map === undefined) {
			throw new Error(`mapping is missing map for target class ${key}`)
		}

		const sourceType = source[map.source]
		if (sourceType === undefined) {
			throw new Error(
				`the source schema does not a class with key ${map.source}`
			)
		}

		validateType(source, mapping, map.expression, targetType, {
			[map.id]: sourceType,
		})
	}
}

/**
 *
 * @param source the source schema
 * @param mapping a mapping from the source schema
 * @param expression an expression within one of the maps of the mapping
 * @param type the target type of the expression
 * @param environment the environment of bound variables
 * @throws an error if the expression does not evaluate to the given type
 */
function validateType(
	source: Schema.Schema,
	mapping: Mapping,
	expression: Expression,
	type: Schema.Type,
	environment: Record<string, Schema.Type>
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
		const value = getValueType(source, expression.value, environment)
		if (value.kind !== "coproduct") {
			throw new Error("the value of a match expression must be a coproduct")
		}

		for (const [key, option] of forEntries(value.options)) {
			const c = expression.cases[key]
			if (c === undefined) {
				throw new Error(`missing case for option ${key}`)
			}

			const e = { ...environment, [c.id]: option }
			validateType(source, mapping, c.expression, type, e)
		}
	} else if (expression.kind === "construction") {
		if (type.kind !== "product") {
			throw new Error("unexpected construction expression")
		}

		for (const [key, component] of forEntries(type.components)) {
			const entry = expression.slots[key]
			if (entry === undefined) {
				throw new Error(`missing slot for component ${key}`)
			}

			validateType(source, mapping, entry, component, environment)
		}
	} else if (expression.kind === "injection") {
		if (type.kind !== "coproduct") {
			throw new Error("unexpected injection expression")
		}

		const option = type.options[expression.key]
		if (option === undefined) {
			throw new Error(`no option for injection key ${expression.key}`)
		}

		validateType(source, mapping, expression.expression, option, environment)
	} else {
		const value = getValueType(source, expression, environment)
		if (type.kind === "reference") {
			const map = mapping[type.key]
			if (value.kind !== "reference" || value.key !== map.source) {
				throw new Error(`expected a reference to class ${map.source}`)
			}
		} else {
			if (!Schema.isTypeSubtypeOf(type, value)) {
				throw new Error("value is not of the expected type")
			}
		}
	}
}

/**
 *
 * @param source the source schema
 * @param value a value expression
 * @param environment the environment of bound variables
 * @returns
 */
function getValueType(
	source: Schema.Schema,
	value: Value,
	environment: Record<string, Schema.Type>
): Schema.Type {
	if (value.kind === "variable") {
		const type = environment[value.id]
		if (type === undefined) {
			throw new Error(`unbound variable ${value.id}`)
		}

		return type
	} else if (value.kind === "projection") {
		const type = getValueType(source, value.value, environment)
		if (type.kind !== "product") {
			throw new Error("invalid projection - value is not a product")
		}

		const component = type.components[value.key]
		if (component === undefined) {
			throw new Error(`invalid projection - no component with key ${value.key}`)
		}

		return component
	} else if (value.kind === "dereference") {
		const reference = getValueType(source, value.value, environment)
		if (reference.kind !== "reference") {
			throw new Error("invalid dereference - value is not a reference")
		}

		if (reference.key !== value.key) {
			throw new Error(
				`invalid dereference - expected key ${reference.key} but found key ${value.key}`
			)
		}

		if (source[value.key] === undefined) {
			console.error(source, value, reference)
			throw new Error("internal error validating dereference")
		}

		return source[value.key]
	} else {
		signalInvalidType(value)
	}
}

export function evaluateMapping<
	S extends Schema.Schema,
	T extends Schema.Schema
>(
	source: S,
	mapping: Mapping,
	target: T
): (instance: Instance.Instance<S>) => Instance.Instance<T> {
	validateMapping(source, mapping, target)
	return function (instance) {
		const result: Instance.Instance<T> = mapKeys(target, (key) => {
			const { source } = mapping[key as string]
			const { length } = instance[source as keyof S]
			return new Array(length)
		})

		for (const key of forKeys(target)) {
			const map = mapping[key as string]
			for (const [i, element] of instance[map.source].entries()) {
				result[key][i] = evaluateExpression(
					source,
					mapping,
					instance,
					target[key],
					map.expression,
					{ [map.id]: [source[map.source], element] }
				) as Instance.Value<T[string]>
			}
		}

		return result
	}
}

/**
 *
 * @param schema the source schema
 * @param instance the source instance
 * @param mapping a mapping from the source schema
 * @param type the target type of the expression
 * @param expression an expression evaluating to the target type
 * @param environment the environment of bound variables
 * @returns the evaluated result of the expression
 */
function evaluateExpression(
	schema: Schema.Schema,
	mapping: Mapping,
	instance: Instance.Instance<Schema.Schema>,
	type: Schema.Type,
	expression: Expression,
	environment: Record<string, [Schema.Type, Instance.Value]>
): Instance.Value {
	if (expression.kind === "uri") {
		if (type.kind !== "uri") {
			throw new Error("unexpected URI value")
		}

		return Instance.uri(type, expression.value)
	} else if (expression.kind === "literal") {
		if (type.kind !== "literal") {
			throw new Error("unexpected literal value")
		}

		return Instance.literal(type, expression.value)
	} else if (expression.kind === "construction") {
		if (type.kind !== "product") {
			throw new Error("unexpected construction expression")
		}

		const components = mapKeys(type.components, (key) => {
			const component = type.components[key]
			const entry = expression.slots[key]
			if (entry === undefined) {
				throw new Error(`missing slot for component ${key}`)
			}

			return evaluateExpression(
				schema,
				mapping,
				instance,
				component,
				entry,
				environment
			)
		})

		return Instance.product(type, components)
	} else if (expression.kind === "match") {
		const [t, v] = evaluateValue(
			schema,
			instance,
			expression.value,
			environment
		)

		if (t.kind !== "coproduct" || v.kind !== "coproduct") {
			throw new Error("the value of a match expression must be a coproduct")
		}

		const entry = expression.cases[v.key]
		return evaluateExpression(
			schema,
			mapping,
			instance,
			type,
			entry.expression,
			{
				...environment,
				[entry.id]: [t.options[v.key], v.value],
			}
		)
	} else if (expression.kind === "injection") {
		if (type.kind !== "coproduct") {
			throw new Error("unexpected injection expression")
		}

		const option = type.options[expression.key]
		if (option === undefined) {
			throw new Error(`no option for injection key ${expression.key}`)
		}

		return Instance.coproduct(
			type,
			expression.key,
			evaluateExpression(
				schema,
				mapping,
				instance,
				option,
				expression.expression,
				environment
			)
		)
	} else {
		const [t, v] = evaluateValue(schema, instance, expression, environment)
		if (type.kind === "reference") {
			const map = mapping[type.key]
			if (t.kind !== "reference" || t.key !== map.source) {
				throw new Error(`expected a reference to class ${map.source}`)
			}

			return v
		} else {
			if (!Schema.isTypeSubtypeOf(type, t)) {
				throw new Error("value is not of the expected type")
			}

			return Schema.isTypeSubtypeOf(t, type) ? v : Instance.cast(t, v, type)
		}
	}
}

/**
 *
 * @param schema the source schema
 * @param instance the source instance
 * @param value the value expression to evaluate
 * @param environment the evaluated result of the value expression
 * @returns the type and value of the evaluated value expression
 */
function evaluateValue(
	schema: Schema.Schema,
	instance: Instance.Instance<Schema.Schema>,
	value: Value,
	environment: Record<string, [Schema.Type, Instance.Value]>
): [Schema.Type, Instance.Value] {
	if (value.kind === "projection") {
		const [t, v] = evaluateValue(schema, instance, value.value, environment)

		if (t.kind !== "product" || v.kind !== "product") {
			throw new Error("invalid projection - value is not a product")
		}

		if (t.components[value.key] === undefined) {
			throw new Error(`invalid projection - no component with key ${value.key}`)
		}

		return [t.components[value.key], v.components[value.key]]
	} else if (value.kind === "dereference") {
		const [t, v] = evaluateValue(schema, instance, value.value, environment)

		if (t.kind !== "reference" || v.kind !== "reference") {
			throw new Error("invalid dereference - value is not a reference")
		}

		if (t.key !== value.key) {
			throw new Error(
				`invalid dereference - expected key ${t.key} but found key ${value.key}`
			)
		}

		if (schema[value.key] === undefined) {
			console.error(schema, value, t)
			throw new Error("internal error evaluating dereference")
		}

		return [schema[value.key], instance[value.key][v.index]]
	} else if (value.kind === "variable") {
		if (value.id in environment) {
			return environment[value.id]
		} else {
			throw new Error(`unbound variable ${value.id}`)
		}
	} else {
		signalInvalidType(value)
	}
}
