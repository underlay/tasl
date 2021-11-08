# Docs

## Table of contents

- [Overview](#overview)
- [Types](#types)
  - [The URI type](#the-uri-type)
  - [Literal types](#literal-types)
  - [Product types](#product-types)
  - [Coproduct types](#coproduct-types)
  - [Reference types](#reference-types)
- [Values](#values)
- [Schemas](#schemas)
- [Schema schema](#schema-schema)
- [Instances](#instances)

## Types

The most important objects in tasl are _types_. The tasl data model has five kinds of types.

```typescript
type Type = URI | Literal | Product | Coproduct | Reference
```

All tasl types are represented as regular JSON-serializable JavaScript objects and can be discriminated with a `.kind` property - for example, URI types have a `.kind: "uri"` property, literal types have a `.kind: "literal"` property, and so on. For each of the five kinds of types, tasl exports its TypeScript type, a constructor method, and a type guard method.

### The URI type

The URI type is a built-in primitive type in tasl used to model URI values. The URI type is analogous to RDF Named Nodes.

```typescript
type URI = Readonly<{ kind: "uri" }>

declare function uri(): URI

declare function isURI(type: Type): type is URI
```

The URI type is a single type - it's not parametrized by anything - so we refer to it as "_the_ URI type" instead of talking about plural "URI types".

### Literal types

Literal types are also primitive types, but unlike the URI type they are parametrized by a _datatype_. Literal types are analogous to RDF Literals.

```typescript
type Literal<Datatype extends string = string> = Readonly<{
	kind: "literal"
	datatype: Datatype
}>

declare function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype>

declare function isLiteral(type: Type): type is Literal

declare function isLiteralDatatype<Datatype extends string>(
	type: Type,
	datatype: Datatype
): type is Literal<Datatype>
```

The datatype of a literal must be a URI, and is typically a term from an existing vocabularly of datatype terms, like `http://www.w3.org/2001/XMLSchema#string` (from the [XSD vocabulary](https://www.w3.org/TR/xmlschema11-2/)) or `http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON` (from an upcoming version [RDF Schema vocabulary](https://www.w3.org/TR/2014/REC-rdf-schema-20140225/), introduced in the [JSON-LD spec](https://www.w3.org/TR/json-ld11/#the-rdf-json-datatype)).

```typescript
const dateTime = tasl.literal("http://www.w3.org/2001/XMLSchema#dateTime")
// dateTime: tasl.Literal<"http://www.w3.org/2001/XMLSchema#dateTime">
```

### Product types

Product types are a composite type made up of entries called _components_. Each component maps a URI key to another type. Intuitively, product types are like structs, objects, or records.

```typescript
type Product<
	Components extends { [key in string]: Type } = { [key in string]: Type }
> = Readonly<{
	kind: "product"
	components: Readonly<Components>
}>

declare function product<Components extends { [key in string]: Type }>(
	components: Components
): Product<Components>

declare function isProduct(type: Type): type is Product
```

You can make product types by passing an object of components into the `product` constructor method:

```typescript
const string = tasl.literal("http://www.w3.org/2001/XMLSchema#string")
// string: tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">

const dateTime = tasl.literal("http://www.w3.org/2001/XMLSchema#dateTime")
// dateTime: tasl.Literal<"http://www.w3.org/2001/XMLSchema#dateTime">

const person = tasl.product({
	"http://schema.org/name": string,
	"http://schema.org/birthDate": dateTime,
})
// person: tasl.Product<{
//   "http://schema.org/name": tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">
//   "http://schema.org/birthDate": tasl.Literal<"http://www.w3.org/2001/XMLSchema#dateTime">
// }>
```

### Coproduct types

Coproduct types are another kind of composite type. They're made up of entries called _options_. Each option maps a URI key to another type. Intuitively, coproduct types are like sum types or variants.

Coproducts are different in tasl than in other languages since each option of a coproduct has an explicit key, just like a product type. In tasl, you have to name each of your variant alternatives the same way you have to name each of your struct properties.

```typescript
type Coproduct<
	Options extends { [key in string]: Type } = { [key in string]: Type }
> = Readonly<{
	kind: "coproduct"
	options: Readonly<Options>
}>

declare function coproduct<Options extends { [key in string]: Type }>(
	options: Options
): Coproduct<Options>

declare function isCoproduct(type: Type): type is Coproduct
```

You can make coproduct types by passing an object of options into the `coproduct` constructor method:

```typescript
const string = tasl.literal("http://www.w3.org/2001/XMLSchema#string")
// string: tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">

const dateTime = tasl.literal("http://www.w3.org/2001/XMLSchema#dateTime")
// dateTime: tasl.Literal<"http://www.w3.org/2001/XMLSchema#dateTime">

const gender = tasl.coproduct({
	"http://schema.org/Male": tasl.product({}),
	"http://schema.org/Female": tasl.product({}),
	"http://schema.org/value": string,
})
// gender: tasl.Coproduct<{
//   "http://schema.org/Male": tasl.Product<{}>
//   "http://schema.org/Female": tasl.Product<{}>
//   "http://schema.org/value": tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">
// }>

const person = tasl.product({
	"http://schema.org/name": string,
	"http://schema.org/birthDate": dateTime,
	"http://schema.org/gender": gender,
})
// person: tasl.Product<{
//   "http://schema.org/name": tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">
//   "http://schema.org/birthDate": tasl.Literal<"http://www.w3.org/2001/XMLSchema#dateTime">
//   "http://schema.org/gender": tasl.Coproduct<{
//     "http://schema.org/Male": tasl.Product<{}>
//     "http://schema.org/Female": tasl.Product<{}>
//     "http://schema.org/value": tasl.Literal<"http://www.w3.org/2001/XMLSchema#string">
//   }>
// }>
```

### Reference types

```typescript
type Reference<Key extends string = string> = Readonly<{
	kind: "reference"
	key: Key
}>

declare function reference<Key extends string>(key: Key): Reference<Key>

declare function isReference(type: Type): type is Reference

declare function isReferenceKey<Key extends string>(
	type: Type,
	key: Key
): type is Reference<Key>
```

## Values

```typescript
namespace Values {
	type URI = Readonly<{ kind: "uri"; value: string }>

	type Literal<Datatype extends string> = Readonly<{
		kind: "literal"
		value: string
	}>

	type Product<Components extends { [key in string]: Type }> = Readonly<{
		kind: "product"
		components: { readonly [K in keyof Components]: Value<Components[K]> }
	}>

	type Coproduct<
		Options extends { [key in string]: Type },
		Key extends keyof Options = keyof Options
	> = {
		[k in keyof Options]: Readonly<{
			kind: "coproduct"
			key: k
			value: Value<Options[k]>
		}>
	}[Key]

	type Reference<Key extends string> = Readonly<{
		kind: "reference"
		index: number
	}>
}

type Value<T extends Type = Type> = T extends URI
	? Values.URI
	: T extends Literal<infer Datatype>
	? Values.Literal<Datatype>
	: T extends Product<infer Components>
	? Values.Product<Components>
	: T extends Coproduct<infer Options>
	? Values.Coproduct<Options>
	: T extends Reference<infer Key>
	? Values.Reference<Key>
	: never

/**
 * Check whether two values X and Y of the same type are equal.
 * @param type a type T
 * @param x a value X of type T
 * @param y a value Y of type T
 * @returns {boolean} true if X is equal to Y, false otherwise
 */
declare function isValueEqual<T extends Type>(
	type: T,
	x: Value<T>,
	y: Value<T>
): boolean
```

## Schemas

```typescript
type Schema<S extends { [key in string]: Type } = { [key in string]: Type }> =
	Readonly<S>

declare function schema<S extends Types>(classes: S): Schema<S>
```

## Schema schema

```typescript
declare const typeType: Readonly<{
	kind: "coproduct"
	options: {
		/* ... */
	}
}>

type TypeType = typeof TypeType

declare const schemaSchema: Readonly<{
	/* ... */
}>

type SchemaSchema = typeof schemaSchema
```
