export namespace expressions {
	export type Map = {
		source: string
		target: string
		id: string
		value: Expression
	}

	export type Expression = URI | Literal | Product | Coproduct | Term | Match

	export type URI = { kind: "uri"; value: string }
	export type Literal = { kind: "literal"; value: string }
	export type Product = {
		kind: "product"
		components: Record<string, Expression>
	}

	export type Coproduct = {
		kind: "coproduct"
		key: string
		value: Expression
	}

	export type Term = Variable | Projection | Dereference
	export type Variable = { kind: "variable"; id: string }
	export type Projection = { kind: "projection"; key: string; value: Term }
	export type Dereference = { kind: "dereference"; key: string; value: Term }

	export type Match = {
		kind: "match"
		value: Term
		cases: Record<string, Case>
	}

	export type Case = { id: string; value: Expression }

	export function variable(id: string): Variable {
		return { kind: "variable", id }
	}

	export const isVariable = (expression: Expression): expression is Variable =>
		expression.kind === "variable"

	export function projection(key: string, value: Term): Projection {
		return { kind: "projection", key, value }
	}

	export const isProjection = (
		expression: Expression
	): expression is Projection => expression.kind === "projection"

	export function dereference(key: string, value: Term): Dereference {
		return { kind: "dereference", key, value }
	}

	export const isDereference = (
		expression: Expression
	): expression is Dereference => expression.kind === "dereference"

	export function uri(value: string): URI {
		return { kind: "uri", value }
	}

	export const isURI = (expression: Expression): expression is URI =>
		expression.kind === "uri"

	export function literal(value: string): Literal {
		return { kind: "literal", value }
	}

	export const isLiteral = (expression: Expression): expression is Literal =>
		expression.kind === "literal"

	export function coproduct(key: string, value: Expression): Coproduct {
		return { kind: "coproduct", key, value }
	}

	export const isCoproduct = (
		expression: Expression
	): expression is Coproduct => expression.kind === "coproduct"

	export function product(components: Record<string, Expression>): Product {
		return { kind: "product", components }
	}

	export const isProduct = (expression: Expression): expression is Product =>
		expression.kind === "product"

	export function match(value: Term, cases: Record<string, Case>): Match {
		return { kind: "match", value, cases }
	}

	export const isMatch = (expression: Expression): expression is Match =>
		expression.kind === "match"
}
