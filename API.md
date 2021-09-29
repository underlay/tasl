# API

## Table of contents

- [Types](#types)
  - [The URI type](#the-uri-type)
  - [Literal types](#literal-types)
  - [Product types](#product-types)
  - [Coproduct types](#coproduct-types)
  - [Reference types](#reference-types)
- [Type utilities](#type-utilities)
  - [Type equality](#type-equality)
  - [Subtypes](#subtypes)
  - [Type comparability](#type-comparability)
  - [Greatest common subtype](#greatest-common-subtype)
  - [Least common supertype](#least-common-supertype)
- [Schemas](#schemas)
  - [Schema schema](#schema-schema)
  - [Encoding schemas](#encoding-schemas)
  - [Decoding schemas](#decoding-schemas)
- [Values](#values)
- [Value utilities](#value-utilities)
- [Instances](#instances)

## Types

```typescript
export type Type = URI | Literal | Product | Coproduct | Reference
```

### The URI type

```typescript
export type URI = Readonly<{ kind: "uri" }>

export declare function uri(): URI

export declare function isURI(type: Type): type is URI
```

### Literal types

```typescript
export type Literal<Datatype extends string = string> = Readonly<{
	kind: "literal"
	datatype: Datatype
}>

export declare function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype>

export declare function isLiteral(type: Type): type is Literal

export declare function isLiteralDatatype<Datatype extends string>(
	type: Type,
	datatype: Datatype
): type is Literal<Datatype>
```

### Product types

```typescript
export type Product<
	Components extends { [key in string]: Type } = { [key in string]: Type }
> = Readonly<{
	kind: "product"
	components: Readonly<Components>
}>

export declare function product<Components extends { [key in string]: Type }>(
	components: Components
): Product<Components>

export declare function isProduct(type: Type): type is Product
```

### Coproduct types

```typescript
export type Coproduct<
	Options extends { [key in string]: Type } = { [key in string]: Type }
> = Readonly<{
	kind: "coproduct"
	options: Readonly<Options>
}>

export declare function coproduct<Options extends { [key in string]: Type }>(
	options: Options
): Coproduct<Options>

export declare function isCoproduct(type: Type): type is Coproduct
```

### Reference types

```typescript
export type Reference<Key extends string = string> = Readonly<{
	kind: "reference"
	key: Key
}>

export declare function reference<Key extends string>(key: Key): Reference<Key>

export declare function isReference(type: Type): type is Reference

export declare function isReferenceKey<Key extends string>(
	type: Type,
	key: Key
): type is Reference<Key>
```

## Type utilities

### Type equality

```typescript
/**
 * Check whether the type X is equal to the type Y.
 * Equality is reflexive, transitive, and symmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X = Y, false otherwise
 */
export declare function isTypeEqualTo<T extends Type>(x: T, y: Type): y is T
```

### Subtypes

```typescript
/**
 * Check whether the type X is a subtype of the type Y.
 * The subtype relation is reflexive, transitive, and antisymmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X ≤ Y, false otherwise
 */
export declare function isTypeSubtypeOf(x: Type, y: Type): boolean
```

### Type comparablility

```typescript
/**
 * Check whether the type X is comparable with the type Y.
 * The comparability relation is reflexive and symmetric, but not necessarily transitive.
 * @param x a type
 * @param y a type
 * @returns {boolean} true if X and Y are comparable, false otherwise
 */
export declare function isTypeComparableWith(x: Type, y: Type): boolean
```

### Greatest common subtype

```typescript
/**
 * Get the infimum of types X and Y.
 * The infimum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that both X and Y are assignable to Z
 */
export declare function greatestCommonSubtype(x: Type, y: Type): Type
```

### Least common supertype

```typescript
/**
 * Get the supremum of types X and Y.
 * The supremum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that both X and Y are subtypes of Z
 */
export declare function leastCommonSupertype(x: Type, y: Type): Type
```

## Schemas

```typescript
type Schema<S extends { [key in string]: Type } = { [key in string]: Type }> =
	Readonly<S>

declare function schema<S extends Types>(classes: S): Schema<S>
```

### Schema schema

```typescript
export declare const typeType: Coproduct<{
	"http://underlay.org/ns/uri": Product<{}>
	"http://underlay.org/ns/literal": URI
	"http://underlay.org/ns/product": Reference<"http://underlay.org/ns/product">
	"http://underlay.org/ns/coproduct": Reference<"http://underlay.org/ns/coproduct">
	"http://underlay.org/ns/reference": Reference<"http://underlay.org/ns/class">
}>

export type TypeType = typeof typeType

export declare const schemaSchema: Readonly<{
	"http://underlay.org/ns/class": Produce<{
		"http://underlay.org/ns/key": URI
		"http://underlay.org/ns/value": TypeType
	}>
	"http://underlay.org/ns/product": Produce<{}>
	"http://underlay.org/ns/component": Product<{
		"http://underlay.org/ns/source": Reference<"http://underlay.org/ns/product">
		"http://underlay.org/ns/key": URI
		"http://underlay.org/ns/value": TypeType
	}>
	"http://underlay.org/ns/coproduct": Product<{}>
	"http://underlay.org/ns/option": Product<{
		"http://underlay.org/ns/source": Reference<"http://underlay.org/ns/coproduct">
		"http://underlay.org/ns/key": URI
		"http://underlay.org/ns/value": TypeType
	}>
}>

export type SchemaSchema = typeof schemaSchema
```

### Encoding schemas

```typescript
/**
 * Convert a schema to an instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Instance} an instance of the schema schema
 */
export declare function fromSchema(schema: Schema): Instance<SchemaSchema>

/**
 * Convert a schema to an encoded instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Uint8Array} an encoded instance of the schema schema
 */
export declare function encodeSchema(schema: Schema): Uint8Array
```

### Decoding schemas

```typescript
/**
 * Convert an instance of the schema schema to a schema
 * @param {Instance} instance an instance of the schema schema
 * @returns {Schema} a schema
 */
export declare function toSchema(instance: Instance<SchemaSchema>): Schema

/**
 * Convert an encoded instance of the schema schema to a schema
 * @param {Uint8Array} data
 * @returns {Schema} a schema
 */
export declare function decodeSchema(data: Uint8Array): Schema
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

export type Value<T extends Type = Type> = T extends URI
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
```

## Value utilities

```typescript
/**
 * Check whether two values X and Y of the same type are equal.
 * @param type a type T
 * @param x a value X of type T
 * @param y a value Y of type T
 * @throws an error if either of X or Y are not of type T
 * @returns {boolean} true if X is equal to Y, false otherwise
 */
declare function isValueEqualTo<T extends Type>(
	type: T,
	x: Value<T>,
	y: Value<T>
): boolean
```

## Instances

```typescript
export declare class Instance<S extends Types> {
	readonly schema: Schema<S>

	static decode<S extends Types>(
		schema: Schema<S>,
		data: Uint8Array
	): Instance<S>

	static fromJSON<S extends Types>(
		schema: Schema<S>,
		classes: { [K in keyof S]: Value<S[K]>[] }
	): Instance<S>

	encode(): Uint8Array

	toJSON(): { [K in keyof S]: Value<S[K]>[] }

	count<K extends keyof S>(key: K): number

	get<K extends keyof S>(key: K, index: number): Value<S[K]>

	keys(): Iterable<string>

	elements<K extends keyof S>(key: K): Iterable<[number, Value<S[K]>]>
}
```
