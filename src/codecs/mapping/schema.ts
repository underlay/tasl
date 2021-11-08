import { ul } from "@underlay/namespaces"

import * as Schema from "../../schema/index.js"

export const valueType = Schema.coproduct({
	[ul.map]: Schema.reference(ul.map),
	[ul.case]: Schema.reference(ul.case),
	[ul.projection]: Schema.reference(ul.projection),
	[ul.dereference]: Schema.reference(ul.dereference),
})

export type ValueType = typeof valueType

export const expressionType = Schema.coproduct({
	...valueType.options,
	[ul.uri]: Schema.uri(),
	[ul.literal]: Schema.string,
	[ul.match]: Schema.reference(ul.match),
	[ul.construction]: Schema.reference(ul.construction),
	[ul.injection]: Schema.reference(ul.injection),
})

export type ExpressionType = typeof expressionType

export const mappingSchema = {
	[ul.map]: Schema.product({
		[ul.source]: Schema.uri(),
		[ul.target]: Schema.uri(),
		[ul.value]: expressionType,
	}),
	[ul.projection]: Schema.product({
		[ul.key]: Schema.uri(),
		[ul.value]: valueType,
	}),
	[ul.dereference]: Schema.product({
		[ul.key]: Schema.uri(),
		[ul.value]: valueType,
	}),
	[ul.match]: Schema.product({
		[ul.value]: valueType,
	}),
	[ul.case]: Schema.product({
		[ul.source]: Schema.reference(ul.match),
		[ul.key]: Schema.uri(),
		[ul.value]: expressionType,
	}),
	[ul.construction]: Schema.product({}),
	[ul.slot]: Schema.product({
		[ul.source]: Schema.reference(ul.construction),
		[ul.key]: Schema.uri(),
		[ul.value]: expressionType,
	}),
	[ul.injection]: Schema.product({
		[ul.key]: Schema.uri(),
		[ul.value]: expressionType,
	}),
}

export type MappingSchema = typeof mappingSchema
