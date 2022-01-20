# Instances

## Table of Contents

- [Overview](#overview)
- [JSON format](#json-format)
- [Value factory methods](#value-factory-methods)
- [Standard value constructors](#standard-value-constructors)
- [Value predicate methods](#value-predicate-methods)
- [Type casting](#type-casting)

## Overview

An `Instance` is a runtime representation of the contents of a dataset. Every instance is an instance of a particular `Schema`, and it has, for each class in its schema, an array of _values_ of the class type. The values at the top-level of each array are called _elements_.

The tasl JavaScript library exports a regular ES6 class `Instance` at the top level. Instances can be instantiated in two ways:

- Passing a JSON representation of the instance into the class constructor `new Instance(schema, ...)`
- Decoding an instance from the binary format using `decodeInstance(schema: Schema, data: Uint8Array): Instance`

## JSON format

An instance can be instantiated by passing the class constructor a schema `schema: Schema` and an object `elements: Record<string, Value[]>`. The entries of `elements` object must correspond to the classes in the schema.

Each kind of tasl type corresponds to a kind of value, which are represented as JavaScript objects discriminated by a `.kind` property

```ts
type Value = URI | Literal | Product | Coproduct | Reference

type URI = { kind: "uri"; value: string }
type Literal = { kind: "literal"; value: string }
type Product = { kind: "product"; components: Record<string, Value> }
type Coproduct = { kind: "coproduct"; key: string; value: Value }
type Reference = { kind: "reference"; index: number }
```

Note that product and coproduct _types_ have the same structure, product and coproduct _values_ are structurally different. A product value has values for each of its type's components, while a coproduct value only has a value for one of its type's options.

Here's an example instance of the example schema given in [SCHEMAS.md](./SCHEMAS.md)

```ts
import { Schema, types, Instance } from "tasl"

const schema = new Schema({
	"http://schema.org/Person": types.product({
		"http://schema.org/name": types.product({
			"http://schema.org/givenName": types.string,
			"http://schema.org/familyName": types.string,
		}),
		"http://schema.org/email": types.uri(),
	}),
	"http://schema.org/Book": types.product({
		"http://schema.org/name": types.string,
		"http://schema.org/identifier": types.uri(),
		"http://schema.org/author": types.reference("http://schema.org/Person"),
	}),
})

// an empty instance of the schema
const emptyInstance = new Instance(schema, {
	"http://schema.org/Person": [],
	"http://schema.org/Book": [],
})

const instance = new Instance(schema, {
	"http://schema.org/Person": [
		{
			kind: "product",
			components: {
				"http://schema.org/name": {
					kind: "product",
					components: {
						"http://schema.org/givenName": { kind: "literal", value: "John" },
						"http://schema.org/familyName": { kind: "literal", value: "Doe" },
					},
				},
				"http://schema.org/email": {
					kind: "uri",
					value: "mailto:johndoe@example.com",
				},
			},
		},
		{
			kind: "product",
			components: {
				"http://schema.org/name": {
					kind: "product",
					components: {
						"http://schema.org/givenName": { kind: "literal", value: "Jane" },
						"http://schema.org/familyName": { kind: "literal", value: "Doe" },
					},
				},
				"http://schema.org/email": {
					kind: "uri",
					value: "mailto:janedoe@example.com",
				},
			},
		},
	],
	"http://schema.org/Book": [
		{
			kind: "product",
			components: {
				"http://schema.org/name": {
					kind: "literal",
					value: "My Life As Jane Doe: A Memoir",
				},
				"http://schema.org/author": {
					kind: "reference",
					index: 1,
				},
			},
		},
	],
})
```

Note that the order of the elements in each array is important since reference values use integer indices.

## Value factory methods

Similar to the `types` namespace that has utility methods for constructing types, we have a `values` namespace with analogous utility methods for constructing values.

```ts
declare namespace values {
	function uri(value: string): URI
	function literal(value: string): Literal
	function product(components: Record<string, Value>): Product
	function coproduct(key: string, value: Value): Coproduct
	function reference(index: number): Reference
}
```

## Standard value constructors

Analogous to the standard library of constants for common types in the `types` namespace, the `values` namespace has a standard library of methods for creating values of each of those common types.

```ts
declare namespace values {
	function unit(): Product
	function string(value: string): Literal
	function boolean(value: boolean): Literal
	function f32(value: number): Literal
	function f64(value: number): Literal
	function i64(value: bigint): Literal
	function i32(value: number): Literal
	function i16(value: number): Literal
	function i8(value: number): Literal
	function u64(value: bigint): Literal
	function u32(value: number): Literal
	function u16(value: number): Literal
	function u8(value: number): Literal
	function bytes(value: Uint8Array): Literal
	function JSON(value: any): Literal
}
```

These effectively handle serializing JavaScript types to Unicode as required by the corresponding type's datatype definition (e.g. in the [XSD spec](https://www.w3.org/TR/xmlschema11-2/)). These, especially the two floating-point types `f32` and `f64`, are **not** obvious and are **not** the same as calling `Number.toString()` or relying on JavaScript's implicit type coercion. **Values of the standard library types should always be created using these built-in value constructors and never manually converted to string values.**

Here's the example instance from above rewritten to use the value constructors

```ts
import { Instance, values } from "tasl"

const instance = new Instance(schema, {
	"http://schema.org/Person": [
		values.product({
			"http://schema.org/name": values.product({
				"http://schema.org/givenName": values.string("John"),
				"http://schema.org/familyName": values.string("Doe"),
			}),
			"http://schema.org/email": values.uri("mailto:johndoe@example.com"),
		}),
		values.product({
			"http://schema.org/name": values.product({
				"http://schema.org/givenName": values.string("Jane"),
				"http://schema.org/familyName": values.string("Doe"),
			}),
			"http://schema.org/email": values.uri("mailto:janedoe@example.com"),
		}),
	],
	"http://schema.org/Book": [
		values.product({
			"http://schema.org/name": values.string("My Life As Jane Doe: A Memoir"),
			"http://schema.org/author": values.reference(1),
		}),
	],
})
```

## Value predicate methods

The `values` namespace has five predicate methods for discriminating between the kinds of values. These are equivalent to `(value) => value.kind === "uri"`, `(value) => value.kind === "literal"`, etc.

```ts
declare namespace values {
	function isURI(value: Value): value is URI
	function isLiteral(value: Value): value is Literal
	function isProduct(value: Value): value is Product
	function isCoproduct(value: Value): value is Coproduct
	function isReference(value: Value): value is Reference
}
```

## Value comparison methods

Two values of the same type can be tested for value equality.

```ts
declare namespace values {
	function isEqualTo(type: Type, x: Value, y: Value): boolean
}
```

`values.isEqualTo` must only be called with two values of the same type; if either `x` or `y` does not match the type `type` then the function will throw an error.

## Type casting

A value of type Y can be cast into a value of type X if and only if X ≤ Y.

```ts
declare namespace values {
	function cast(type: Type, value: Value, target: Type): Value
}
```

If `value` does match the type `type`, or the type `target` is not a subtype of `type`, then `values.cast` will throw an error.

Intuitively, we can use `values.cast` to strip extraneous product components from values. It has no other effect on any other kinds of types.

```ts
import { types, values } from "tasl"

values.cast(types.uri(), values.uri("http://example.com"), types.uri()) // { kind: 'uri', value: 'http://example.com' }

values.cast(types.boolean, values.boolean(false), types.string)
// Uncaught Error: a literal value cannot be cast to a different literal datatype

values.cast(
	types.product({
		"http://schema.org/name": types.string,
		"http://schema.org/email": types.uri(),
	}),
	values.product({
		"http://schema.org/name": values.string("John Doe"),
		"http://schema.org/email": values.uri("mailto:johndoe@example.com"),
	}),
	types.product({
		"http://schema.org/name": types.string,
	})
)
// {
//   kind: 'product',
//   components: { 'http://schema.org/name': { kind: 'literal', value: 'John Doe' } }
// }

values.cast(
	types.product({
		"http://schema.org/name": types.string,
	}),
	values.product({
		"http://schema.org/name": values.string("John Doe"),
	}),
	types.product({
		"http://schema.org/name": types.string,
		"http://schema.org/email": types.uri(),
	})
)
// Uncaught Error: the product value has no component key http://schema.org/email

values.cast(
	types.coproduct({
		"http://schema.org/Male": types.unit,
		"http://schema.org/Female": types.unit,
		"http://schema.org/value": types.string,
	}),
	values.coproduct("http://schema.org/Male", values.unit()),
	types.coproduct({
		"http://schema.org/Male": types.unit,
		"http://schema.org/Female": types.unit,
	})
)
// Uncaught Error: the target type is not a subtype of the source type
```

Note the behavior of the last example - even if the given value of a coproduct type is "compatible" with a target coproduct type, `values.cast` will still throw an error if the target type is not a subtype of the source type.
