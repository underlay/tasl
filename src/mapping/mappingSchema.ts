import { ul } from "@underlay/namespaces"

import { Schema, types } from "../schema/index.js"

export const termType = types.coproduct({
	[ul.map]: types.reference(ul.map),
	[ul.case]: types.reference(ul.case),
	[ul.projection]: types.reference(ul.projection),
	[ul.dereference]: types.reference(ul.dereference),
})

export type TermType = typeof termType

export const expressionType = types.coproduct({
	...termType.options,
	[ul.uri]: types.uri(),
	[ul.literal]: types.string,
	[ul.match]: types.reference(ul.match),
	[ul.product]: types.reference(ul.product),
	[ul.coproduct]: types.reference(ul.coproduct),
})

export type ExpressionType = typeof expressionType

export const mappingSchema = new Schema({
	[ul.map]: types.product({
		[ul.source]: types.uri(),
		[ul.target]: types.uri(),
		[ul.value]: expressionType,
	}),
	[ul.projection]: types.product({
		[ul.key]: types.uri(),
		[ul.value]: termType,
	}),
	[ul.dereference]: types.product({
		[ul.key]: types.uri(),
		[ul.value]: termType,
	}),
	[ul.match]: types.product({
		[ul.value]: termType,
	}),
	[ul.case]: types.product({
		[ul.source]: types.reference(ul.match),
		[ul.key]: types.uri(),
		[ul.value]: expressionType,
	}),
	[ul.product]: types.product({}),
	[ul.component]: types.product({
		[ul.source]: types.reference(ul.product),
		[ul.key]: types.uri(),
		[ul.value]: expressionType,
	}),
	[ul.coproduct]: types.product({
		[ul.key]: types.uri(),
		[ul.value]: expressionType,
	}),
})

export type MappingSchema = typeof mappingSchema extends Schema<infer S>
	? S
	: never
