import type { Mapping } from "../mapping.js"

export function variable(id: string): Mapping.Variable {
	return { kind: "variable", id }
}

export const isVariable = (
	expression: Mapping.Expression
): expression is Mapping.Variable => expression.kind === "variable"

export function projection(
	key: string,
	value: Mapping.Term
): Mapping.Projection {
	return { kind: "projection", key, value }
}

export const isProjection = (
	expression: Mapping.Expression
): expression is Mapping.Projection => expression.kind === "projection"

export function dereference(
	key: string,
	value: Mapping.Term
): Mapping.Dereference {
	return { kind: "dereference", key, value }
}

export const isDereference = (
	expression: Mapping.Expression
): expression is Mapping.Dereference => expression.kind === "dereference"

export function uri(value: string): Mapping.URI {
	return { kind: "uri", value }
}

export const isURI = (
	expression: Mapping.Expression
): expression is Mapping.URI => expression.kind === "uri"

export function literal(value: string): Mapping.Literal {
	return { kind: "literal", value }
}

export const isLiteral = (
	expression: Mapping.Expression
): expression is Mapping.Literal => expression.kind === "literal"

export function coproduct(
	key: string,
	value: Mapping.Expression
): Mapping.Coproduct {
	return { kind: "coproduct", key, value }
}

export const isCoproduct = (
	expression: Mapping.Expression
): expression is Mapping.Coproduct => expression.kind === "coproduct"

export function product(components: {
	[K in string]: Mapping.Expression
}): Mapping.Product {
	return { kind: "product", components }
}

export const isProduct = (
	expression: Mapping.Expression
): expression is Mapping.Product => expression.kind === "product"

export function match(
	value: Mapping.Term,
	cases: { [K in string]: { id: string; value: Mapping.Expression } }
): Mapping.Match {
	return { kind: "match", value, cases }
}

export const isMatch = (
	expression: Mapping.Expression
): expression is Mapping.Match => expression.kind === "match"
