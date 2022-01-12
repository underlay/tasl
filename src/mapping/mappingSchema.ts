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
	[ul.construction]: types.reference(ul.construction),
	[ul.injection]: types.reference(ul.injection),
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
	[ul.construction]: types.product({}),
	[ul.slot]: types.product({
		[ul.source]: types.reference(ul.construction),
		[ul.key]: types.uri(),
		[ul.value]: expressionType,
	}),
	[ul.injection]: types.product({
		[ul.key]: types.uri(),
		[ul.value]: expressionType,
	}),
})

export type MappingSchema = typeof mappingSchema extends Schema<infer S>
	? S
	: never
