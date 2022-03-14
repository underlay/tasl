# Mappings

## Table of contents

- [Overview](#overview)
- [`.taslx` DSL](#taslx-dsl)
- [Binary codec](#binary-codec)

## Overview

A `Mapping` is a runtime representation of a structural transformation between two schemas. Every mapping is a mapping from a particular source schema to a particular target schema, and it has, for each class in the target schema, a source class in the source schema, and an lambda expression that describes how to rewrite elements from the source class into elements of the target class. Just like `Schema` classes are built out of objects from the `types` namespace, `Mapping` classes are built out of objects from the `expressions` namespace.

```ts
declare class Mapping {
  constructor(
    readonly source: Schema,
    readonly target: Schema,
    maps: expressions.Map[]
  )
  get(key: string): expressions.Map
  has(key: string): boolean
  keys(): Iterable<string>
  values(): Iterable<expressions.Map>
  entries(): Iterable<[string, expressions.Map]>
  apply(instance: Instance): Instance
}

declare namespace expressions {
  type Map = { source: string; target: string; id: string; value: Expression }

  type Expression = URI | Literal | Product | Coproduct | Term | Match

  type URI = { kind: "uri"; value: string }
  type Literal = { kind: "literal"; value: string }
  type Product = { kind: "product"; components: Record<string, Expression> }
  type Coproduct = { kind: "coproduct"; key: string; value: Expression }

  type Term = { kind: "term"; id: string; path: Path }

  type Path = Segment[]
  type Segment = Projection | Dereference
  type Projection = { kind: "projection"; key: string }
  type Dereference = { kind: "dereference"; key: string }

  type Match = {
    kind: "match"
    id: string
    path: Path
    cases: Record<string, Case>
  }

  type Case = { id: string; value: Expression }
}
```

> ⚠️ Mappings and expressions are complex, so don't be discouraged if you don't understand them on the first pass!

The best way to think of expressions is as a slightly more powerful way to write values. The `URI`, `Literal`, `Product`, and `Coproduct` expressions are exactly like `values.URI`, `values.Literal`, `values.Product`, and `values.Coproduct`; you can think of them as expressions that "evaluate" to those respective values.

Let's pause here and look at a tiny example mapping.

```ts
import { Schema, types, Instance, values, Mapping, expressions } from "tasl"

const sourceSchema = new Schema({
  "http://schema.org/Person": types.product({
    "http://schema.org/name": types.string,
    "http://schema.org/email": types.uri(),
  }),
})

const targetSchema = new Schema({
  "http://example.com/widget": types.string,
})

const mapping = new Mapping(sourceSchema, targetSchema, {
  "http://example.com/widget": {
    source: "http://schema.org/Person",
    id: "person",
    value: expressions.literal("foo"),
  },
})
```

Here we have a source schema with a single class `http://schema.org/Person` and a target schema, also with a single class `http://example.com/widget`. To write a mapping from the source to the target schema, we call the `Mapping` class constructor with the source and target schemas and an object `maps: Record<string, expressions.Map>`. `maps` has an entry for every class in the target schema, and each `expression.Map` is an object with three properties:

| property | type                     | description                                                 |
| -------- | ------------------------ | ----------------------------------------------------------- |
| `source` | `string`                 | the key of a class in the source schema                     |
| `id`     | `string`                 | a term to bind element values to                            |
| `value`  | `expressions.Expression` | an expression evaluating to a term of the target class type |

Our example map is essentially saying that it's going to populate elements of the `http://example.com/widget` class in the target instance using elements from the `http://schema.org/Person` class in the source instance - each individual person element is going to be rewritten into a widget element. Widget elements are just string literals, and our example map must be a lambda expression that takes a single variable of the person type and returns a value of the widget type.

The expression in our example is equivalent to this JavaScript function:

```ts
const f = (person: {
  kind: "product"
  components: {
    "http://schema.org/name": { kind: "literal"; value: string }
    "http://schema.org/email": { kind: "uri"; value: string }
  }
}): { kind: "literal"; value: string } => ({ kind: "literal", value: "foo" })
```

It takes a single variable bound to the name `id: "person"`, and must return a widget value. This expression just returns a constant value every time - mapping every person value to the same default widget value `{ kind: "literal", value: "foo" }`.

We can see this by applying the mapping to an instance of the source schema.

```ts
const instance = new Instance(sourceSchema, {
  "http://schema.org/Person": [
    values.product({
      "http://schema.org/name": values.string("John Doe"),
      "http://schema.org/email": values.uri("mailto:johndoe@example.com"),
    }),
    values.product({
      "http://schema.org/name": values.string("Jane Doe"),
      "http://schema.org/email": values.uri("mailto:janedoe@example.com"),
    }),
  ],
})

const targetInstance = mapping.apply(instance)
console.log(targetInstance)
// Instance {
//   schema: Schema { classes: { 'http://example.com/widget': [Object] } },
//   elements: { 'http://example.com/widget': [ [Object], [Object] ] }
// }

for (const element of targetInstance.values("http://example.com/widget")) {
  console.log(element)
}
// { kind: 'literal', value: 'foo' }
// { kind: 'literal', value: 'foo' }
```

There are a few things to highlight here. The first is just the type signature of the `.apply` method. A `Mapping` already has specific source and target schemas, so all we pass to `Mapping.apply` is an instance of its source schema, and it returns us an instance of its target schema.

Second, target classes always have a single source class - there's no way to merge multiple classes in the source into a single class in the target, although we are allowed to use the same class in the source schema to populate multiple classes in the target schema. So when we apply mappings, each class in the resulting target instance has exactly the same number of elements as its source class in the source instance.

Third, it's best to **think of expressions as templates, not transformations**. We tend to see schema migrations in terms of deltas: "rename this property from A to B", "move this value from this table to that one". But when we're making mappings, we have to translate this into something more declarative. An expression is like a template for the target value with holes filled in by parts of the source value.

To see this, let's look at a more complex example. Here we're mapping a source schema with separate `http://schema.org/Person` and `http://schema.org/Book` classes to a target schema with a just single `http://example.com/book` class.

```ts
import { Schema, types, Instance, values, Mapping, expressions } from "tasl"

const sourceSchema = new Schema({
  "http://schema.org/Person": types.product({
    "http://schema.org/name": types.string,
    "http://schema.org/email": types.uri(),
  }),
  "http://schema.org/Book": types.product({
    "http://schema.org/name": types.string,
    "http://schema.org/author": types.reference("http://schema.org/Person"),
  }),
})

const targetSchema = new Schema({
  "http://example.com/book": types.product({
    "http://example.com/name": types.string,
    "http://example.com/author": types.string,
  }),
})
```

We want to populate `http://example.com/book` in the target using elements from `http://schema.org/Book` in the source. The target class is a product type with `http://example.com/name` and `http://example.com/author` strings. One trivial way to write a mapping would just be to write a constant default value for both of these, but here we probably want to copy each book's name and "lift" the author's name from the referenced person.

The way we do this is with `expressions.Term` expressions. Mappings use string `id` properties as lexically scoped variable names - we give each `expressions.Map` a string `id` to bind element values to, so that later we can reference them with terms. Terms also have a `path` array of projections and dereferences that let us access components of products and "follow" indices of references to their element values.

```ts
const mapping = new Mapping(sourceSchema, targetSchema, [
  {
    source: "http://schema.org/Book",
    target: "http://example.com/book",
    id: "book",
    value: expressions.product({
      "http://example.com/name": expressions.term("book", [
        expressions.projection("http://schema.org/name"),
      ]),
      "http://example.com/author": expressions.term("book", [
        expressions.projection("http://schema.org/author"),
        expressions.dereference("http://schema.org/Person"),
        expressions.projection("http://schema.org/name"),
      ]),
    }),
  },
])
```

Here, we've bound each element of the source class to the identifier `book`, and when we write the template of our target value (the `expressions.product` with `http://example.com/name` and `http://example.com/author` components) we use term expressions of identifer to populate the components. The two term expressions in this mapping reference the same identifier but with different paths:

- `[expression.projection("http://schema.org/name")]` means "take the `http://schema.org/name` component of the product value". Typechecking happens inside the `Mapping` constructor, which will throw an error if value bound to the identifier isn't a product, or if it didn't have a `http://schema.org/name` component, or if the `http://schema.org/name` component wasn't of the expected type (string literal in this case).
- `[expressions.projection("http://schema.org/author"), expressions.dereference("http://schema.org/Person"), expressions.projection("http://schema.org/name")]` means "take the `http://schema.org/author` component of the product value, and follow the id of the resulting reference value into the `http://schema.org/Person` class, and then take the `http://schema.org/name` component of the resulting person element". The `Mapping` constructor would throw an error if the value bound to the identifier wasn't a product, if the `http://schema.org/author` component wasn't a reference to the `http://schema.org/Person` class, or if the person class wasn't a product type, or if the `http://schema.org/name` component of the person type wasn't a string literal.

This covers terms, paths, projections, and deferences. The last kind of expression that we haven't seen yet is `expressions.Match`. Match expressions are dual to component projections. A product value has values for all of its component types, so the only way to "operate" on it is to access one of its components by name. But a coproduct value has a value for just one of its option types, so the only way to "operate" on it is to do case anaylsis on all of the options at once.

Here's a example illustrating case analysis.

```ts
const sourceSchema = new Schema({
  "http://schema.org/Person": types.product({
    "http://schema.org/name": types.string,
    "http://schema.org/gender": types.coproduct({
      "http://schema.org/Male": types.unit,
      "http://schema.org/Female": types.unit,
      "http://schema.org/value": types.string,
    }),
  }),
})

const targetSchema = new Schema({
  "http://example.com/person": types.product({
    "http://example.com/name": types.string,
    "http://example.com/gender": types.string,
  }),
})
```

In the source schema, a person's gender is either one of two distinguished enums (`http://schema.org/Male`, `http://schema.org/Female`) or a string value (`http://schema.org/value`). In the target schema, a person's gender is always just a string.

To write a mapping between these schemas, we must handle each case of the source person's gender coproduct and map them **all** to the target person's gender (ie a string).

```ts
const mapping = new Mapping(sourceSchema, targetSchema, [
  {
    source: "http://schema.org/Person",
    target: "http://example.com/person",
    id: "person",
    value: expressions.product({
      "http://example.com/name": expressions.term("person", [
        expressions.projection("http://schema.org/name"),
      ]),
      "http://example.com/gender": expressions.match(
        "person",
        [expressions.projection("http://schema.org/gender")],
        {
          "http://schema.org/Male": {
            id: "gender",
            value: expressions.literal("Male"),
          },
          "http://schema.org/Female": {
            id: "gender",
            value: expressions.literal("Female"),
          },
          "http://schema.org/value": {
            id: "gender",
            value: expressions.term("gender", []),
          },
        }
      ),
    }),
  },
])
```

Match expressions always match "on" a specific term; they have `id` and `path` properties just like `expressions.Term`. This term (`person / http://schema.org/gender` in this case) must evalute to a coproduct, or the Mapping constructor will throw an error. A match expression then has an object of cases; each case has its own `id: string` property that the value of the corresponding option will be bound to, and a `value: expressions.Expression` property. Match expressions must have a case for every option in the matched term's type, and each case of a match expression must evaluate to a term of the target type (a string literal in this case).

In the first two cases, we ignore the newly bound variable `gender` and just return string constants for the two options. This is the only thing we really can do, as the variable will be bound to a unit value that we couldn't do anything with if we tried. In the third case, the variable `gender` will be bound to a string literal value, which is exactly what we want, so our expression value for that case is an identity term expression.

Written JavaScript, the entire match expression would look like this:

```ts
const f = (
  x:
    | {
        kind: "coproduct"
        key: "http://schema.org/Male"
        value: { kind: "product"; components: {} }
      }
    | {
        kind: "coproduct"
        key: "http://schema.org/Female"
        value: { kind: "product"; components: {} }
      }
    | {
        kind: "coproduct"
        key: "http://schema.org/value"
        value: { kind: "literal"; value: string }
      }
): { kind: "literal"; value: string } => {
  switch (x.key) {
    case "http://schema.org/Male":
      return { kind: "literal", value: "Male" }
    case "http://schema.org/Female":
      return { kind: "literal", value: "Female" }
    case "http://schema.org/value":
      return { kind: "literal", value: x.value }
  }
}
```

## `.taslx` DSL

An even more concise way to instantiate mappings is to use the `.taslx` DSL with the `parseMapping` method. The DSL supports comments and URI namespaces, which dramatically improve readability. Just like the `Mapping` constructor, `parseMapping` takes concrete source and target schemas as its first arguments.

```ts
declare function parseMapping(
  source: Schema,
  target: Schema,
  input: string
): Mapping
```

Here are the three examples from the overview written using the DSL.

```
namespace s http://schema.org/
namespace ex http://example.com/

map ex:widget <= s:Person (person) => "foo"
```

```
namespace s http://schema.org/
namespace ex http://example.com/

map ex:book <= s:Book (book) => {
  ex:name <= book / s:name
  ex:author <= book / s:author * s:Person / s:name
}
```

```
namespace s http://schema.org/
namespace ex http://example.com/

map ex:person <= s:Person (person) => {
  ex:name <= person / s:name
  ex:gender <= person / s:gender [
    s:Male (gender) => "Male"
    s:Female (gender) => "Female"
    s:value (gender) => value
  ]
}
```

## Binary codec

Mappings can be encoded and decoded from `Uint8Arrays` with the top-level `encodeMapping` and `decodeMapping` methods. Just like the `Mapping` constructor, `decodeMapping` takes concrete source and target schemas as its first arguments.

```ts
declare function encodeMapping(mapping: Mapping): Uint8Array
declare function decodeMapping(
  source: Schema,
  target: Schema,
  data: Uint8Array
): Mapping
```
