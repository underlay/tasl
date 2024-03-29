# Instances

## Table of Contents

- [Overview](#overview)
- [Value factory methods](#value-factory-methods)
- [Standard value constructors](#standard-value-constructors)
- [Binary codec](#binary-codec)
- [Advanced value utilities](#advanced-value-utilities)
  - [Value comparison](#value-comparison)
  - [Type casting](#type-casting)

## Overview

An `Instance` is a runtime representation of the contents of a dataset. Every instance is an instance of a particular `Schema`, and it has, for each class in its schema, a set of _values_ of the class type, each with a unique unsigned integer id. The values at the top-level of each array are called _elements_.

The tasl JavaScript library exports a regular ES6 class `Instance` at the top level. Just like `Schema` classes are built out of objects from the `types` namespace, `Instance` classes are built out of objects from the `values` namespace. Each kind of type in `types.` corresponds to a kind of value in `values.`, also represented as regular JavaScript objects discriminated by a `.kind` property.

```ts
declare class Instance {
  constructor(
    readonly schema: Schema,
    readonly elements: Record<string, values.Element[]>
  )
  count(key: string): number
  get(key: string, id: number): values.Value
  keys(key: string): Iterable<number>
  values(key: string): Iterable<values.Value>
  entries(key: string): Iterable<[number, values.Value]>
  isEqualTo(instance: Instance): boolean
}

type Element = { id: number; value: Value }

type Value = URI | Literal | Product | Coproduct | Reference

type URI = { kind: "uri"; value: string }
type Literal = { kind: "literal"; value: string }
type Product = { kind: "product"; components: Record<string, Value> }
type Coproduct = { kind: "coproduct"; key: string; value: Value }
type Reference = { kind: "reference"; id: number }
```

Instances are always instances of a particular schema, so the first argument to the `Instance` constructor is a `readonly schema: Schema`.

Here's an example instance of our example schema.

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
      id: 0,
      value: {
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
    },
    {
      id: 1,
      value: {
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
    },
  ],
  "http://schema.org/Book": [
    {
      id: 0,
      value: {
        kind: "product",
        components: {
          "http://schema.org/name": {
            kind: "literal",
            value: "My Life As Jane Doe: A Memoir",
          },
          "http://schema.org/identifier": {
            kind: "uri",
            value: "urn:isbn:000-0-0000-01",
          },
          "http://schema.org/author": {
            kind: "reference",
            id: 1,
          },
        },
      },
    },
  ],
})
```

## Value factory methods

Just like how the `types` namespace has factory methods for constructing types, the `values` namespace has factory methods for constructing values.

```ts
declare namespace values {
  function uri(value: string): URI
  function literal(value: string): Literal
  function product(components: Record<string, Value>): Product
  function coproduct(key: string, value: Value): Coproduct
  function reference(id: number): Reference
}
```

## Standard value constructors

Again, analogous to the standard library of constants for common types in the `types` namespace, the `values` namespace has a standard library of methods for creating values of each of those common types.

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

Here's the example instance from above rewritten to use the value factory methods and standard literal constructors.

```ts
import { Schema, types, Instance, values } from "tasl"

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

const instance = new Instance(schema, {
  "http://schema.org/Person": [
    {
      id: 0,
      value: values.product({
        "http://schema.org/name": values.product({
          "http://schema.org/givenName": values.string("John"),
          "http://schema.org/familyName": values.string("Doe"),
        }),
        "http://schema.org/email": values.uri("mailto:johndoe@example.com"),
      }),
    },
    {
      id: 0,
      value: values.product({
        "http://schema.org/name": values.product({
          "http://schema.org/givenName": values.string("Jane"),
          "http://schema.org/familyName": values.string("Doe"),
        }),
        "http://schema.org/email": values.uri("mailto:janedoe@example.com"),
      }),
    },
  ],
  "http://schema.org/Book": [
    {
      id: 0,
      value: values.product({
        "http://schema.org/name": values.string(
          "My Life As Jane Doe: A Memoir"
        ),
        "http://schema.org/author": values.reference(1),
      }),
    },
  ],
})
```

## Binary codec

Instances can be encoded and decoded from `Uint8Arrays` with the top-level `encodeInstance` and `decodeInstance` methods. Just like the `Instance` constructor, `decodeInstance` takes a concrete schema as its first argument.

```ts
declare function encodeInstance(instance: Instance): Uint8Array
declare function decodeInstance(schema: Schema, data: Uint8Array): Instance
```

## Advanced value utilities

The `values` namespace also has a few additional methods for comparing and manipulating values.

### Value comparison

Two values of the same type can be tested for value equality.

```ts
declare namespace values {
  function isEqualTo(type: Type, x: Value, y: Value): boolean
}
```

`values.isEqualTo` must only be called with two values of the same type; if either `x` or `y` does not match the type `type` then the function will throw an error.

### Type casting

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
