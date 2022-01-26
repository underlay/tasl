import { ul } from "@underlay/namespaces"

import { Schema } from "./schema.js"
import { types } from "./types.js"

/**
 * typeType is a type that models tasl types.
 * There are five kinds of tasl types, so typeType is a coproduct with an option for each kind.
 * - URI types are not parametrized by any data and thus can be modeled with the unit type.
 * - Literal types are parametrized by a URI datatype and thus can be modeled with the URI type.
 * - Product and coproduct types are both parametrized by a map of URI keys to types.
 *   This is harder to model in tasl itself because there may be an aribtrary number of components or options,
 * - Reference types are parametrized by a URI key and can be modeled with the URI type.
 */
export const typeType = types.coproduct({
	[ul.uri]: types.product({}),
	[ul.literal]: types.uri(),
	[ul.product]: types.reference(ul.product),
	[ul.coproduct]: types.reference(ul.coproduct),
	[ul.reference]: types.reference(ul.class),
})

/**
 * schemaSchema is a schema that models tasl schemas.
 * At the end of the day, a schema is just a map; each class is an entry mapping
 * a URI key to a type. Here, we represent
 */
export const schemaSchema = new Schema({
	[ul.class]: types.product({
		[ul.key]: types.uri(),
		[ul.value]: typeType,
	}),
	[ul.product]: types.product({}),
	[ul.component]: types.product({
		[ul.source]: types.reference(ul.product),
		[ul.key]: types.uri(),
		[ul.value]: typeType,
	}),
	[ul.coproduct]: types.product({}),
	[ul.option]: types.product({
		[ul.source]: types.reference(ul.coproduct),
		[ul.key]: types.uri(),
		[ul.value]: typeType,
	}),
})
