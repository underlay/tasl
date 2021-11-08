import { forKeys } from "../keys.js"
import { validateURI } from "../utils.js"

export type Mapping = Record<string, Map>

export type Map = {
	source: string
	id: string
	expression: Expression
}

export type Expression =
	| Value
	| URI
	| Literal
	| Match
	| Construction
	| Injection

export type Value = Variable | Projection | Dereference

export type Variable = { kind: "variable"; id: string }

export function variable(id: string): Variable {
	return { kind: "variable", id }
}

export type Projection = { kind: "projection"; key: string; value: Value }

export function projection(key: string, value: Value): Projection {
	validateURI(key)
	return { kind: "projection", key, value }
}

export type Dereference = { kind: "dereference"; key: string; value: Value }

export function dereference(key: string, value: Value): Dereference {
	validateURI(key)
	return { kind: "dereference", key, value }
}

export type URI = { kind: "uri"; value: string }

export function uri(value: string): URI {
	validateURI(value)
	return { kind: "uri", value }
}

export type Literal = { kind: "literal"; value: string }

export function literal(value: string): Literal {
	return { kind: "literal", value }
}

export type Injection = {
	kind: "injection"
	key: string
	expression: Expression
}

export function injection(key: string, expression: Expression): Injection {
	validateURI(key)
	return { kind: "injection", key, expression }
}

export type Construction = {
	kind: "construction"
	slots: Slots
}

export type Slots = Record<string, Expression>

export function construction(slots: Slots): Construction {
	for (const key of forKeys(slots)) {
		validateURI(key)
	}

	return { kind: "construction", slots }
}

export type Match = {
	kind: "match"
	value: Value
	cases: Cases
}

export type Cases = Record<string, Case>

export type Case = { id: string; expression: Expression }

export function match(value: Value, cases: Cases): Match {
	for (const key of forKeys(cases)) {
		validateURI(key)
	}

	return { kind: "match", value, cases }
}
