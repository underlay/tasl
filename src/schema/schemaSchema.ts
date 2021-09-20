import { ul } from "@underlay/namespaces"

import { coproduct, product, reference, uri } from "../types/index.js"
import { schema } from "./schema.js"

export const typeType = coproduct({
	[ul.uri]: product({}),
	[ul.literal]: uri(),
	[ul.product]: reference(ul.product),
	[ul.coproduct]: reference(ul.coproduct),
	[ul.reference]: reference(ul.class),
})

export type TypeType = typeof typeType

export const schemaSchema = schema({
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

export type SchemaSchema = typeof schemaSchema
