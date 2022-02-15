export namespace expressions {
	export type Map = {
		source: string
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

	export type Coproduct = { kind: "coproduct"; key: string; value: Expression }

	export type Term = { kind: "term"; id: string; path: Path }

	export type Path = Segment[]
	export type Segment = Projection | Dereference
	export type Projection = { kind: "projection"; key: string }
	export type Dereference = { kind: "dereference"; key: string }

	export type Match = {
		kind: "match"
		id: string
		path: Path
		cases: Record<string, Case>
	}

	export type Case = { id: string; value: Expression }

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

	export function term(id: string, path: Path): Term {
		return { kind: "term", id, path }
	}

	export const isTerm = (expression: Expression): expression is Term =>
		expression.kind === "term"

	export function projection(key: string): Projection {
		return { kind: "projection", key }
	}

	export const isProjection = (segment: Segment): segment is Projection =>
		segment.kind === "projection"

	export function dereference(key: string): Dereference {
		return { kind: "dereference", key }
	}

	export const isDereference = (segment: Segment): segment is Dereference =>
		segment.kind === "dereference"

	export function match(
		id: string,
		path: Path,
		cases: Record<string, Case>
	): Match {
		return { kind: "match", id, path, cases }
	}

	export const isMatch = (expression: Expression): expression is Match =>
		expression.kind === "match"
}
