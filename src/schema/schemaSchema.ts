import { ul } from "@underlay/namespaces"

import { Schema } from "./schema.js"
import { uri, product, coproduct, reference } from "./types/index.js"

/**
 * typeType is a type that models tasl types.
 * There are five kinds of tasl types, so typeType is a coproduct with an option for each kind.
 * - URI types are not parametrized by any data and thus can be modeled with the unit type.
 * - Literal types are parametrized by a URI datatype and thus can be modeled with the URI type.
 * - Product and coproduct types are both parametrized by a map of URI keys to types.
 *   This is harder to model in tasl itself because there may be an aribtrary number of components or options,
 * - Reference types are parametrized by a URI key and can be modeled with the URI type.
 */
export const typeType = coproduct({
	[ul.uri]: product({}),
	[ul.literal]: uri(),
	[ul.product]: reference(ul.product),
	[ul.coproduct]: reference(ul.coproduct),
	[ul.reference]: reference(ul.class),
})

export type TypeType = typeof typeType

/**
 * schemaSchema is a schema that models tasl schemas.
 * At the end of the day, a schema is just a map; each class is an entry mapping
 * a URI key to a type. Here, we represent
 */
export const schemaSchema = new Schema({
	[ul.class]: product({
		[ul.key]: uri(),
		[ul.value]: typeType,
	}),
	[ul.product]: product({}),
	[ul.component]: product({
		[ul.source]: reference(ul.product),
		[ul.key]: uri(),
		[ul.value]: typeType,
	}),
	[ul.coproduct]: product({}),
	[ul.option]: product({
		[ul.source]: reference(ul.coproduct),
		[ul.key]: uri(),
		[ul.value]: typeType,
	}),
})

export type SchemaSchema = typeof schemaSchema extends Schema<infer S>
	? S
	: never
