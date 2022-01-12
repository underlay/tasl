import type { Mapping } from "../mapping.js"

export function variable(id: string): Mapping.Variable {
	return { kind: "variable", id }
}

export function projection(
	key: string,
	value: Mapping.Term
): Mapping.Projection {
	return { kind: "projection", key, value }
}

export function dereference(
	key: string,
	value: Mapping.Term
): Mapping.Dereference {
	return { kind: "dereference", key, value }
}

export function uri(value: string): Mapping.URI {
	return { kind: "uri", value }
}

export function literal(value: string): Mapping.Literal {
	return { kind: "literal", value }
}

export function injection(
	key: string,
	expression: Mapping.Expression
): Mapping.Injection {
	return { kind: "injection", key, value: expression }
}

export function construction(slots: {
	[K in string]: Mapping.Expression
}): Mapping.Construction {
	return { kind: "construction", slots }
}

export function match(
	value: Mapping.Term,
	cases: { [K in string]: { id: string; value: Mapping.Expression } }
): Mapping.Match {
	return { kind: "match", value, cases }
}
