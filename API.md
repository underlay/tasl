# API

## Table of contents

- [Types](#types)
  - [`types.Type`](#typestype)
  - [The URI type](#the-uri-type)
    - [`types.URI`](#typesuri)
    - [`types.uri`](#typesuri)
    - [`types.isURI`](#typesisuri)
  - [Literal types](#literal-types)
    - [`types.Literal`](#typesliteral)
    - [`types.literal`](#typesliteral)
    - [`types.isLiteral`](#typesisliteral)
    - [`types.isLiteralDatatype`](#typesisliteraldatatype)
  - [Product types](#product-types)
    - [`types.Product`](#typesproduct)
    - [`types.product`](#typesproduct)
    - [`types.isProduct`](#typesisproduct)
  - [Coproduct types](#coproduct-types)
    - [`types.Coproduct`](#typescoproduct)
    - [`types.coproduct`](#typescoproduct)
    - [`types.isCoproduct`](#typesiscoproduct)
  - [Reference types](#reference-types)
    - [`types.Reference`](#typesreference)
    - [`types.reference`](#typesreference)
    - [`types.isReference`](#typesisreference)
    - [`types.isReferenceKey`](#typesisreferencekey)
  - [Standard library type constants](#standard-library-type-constants)
    - [`types.unit`](#typesunit)
    - [`types.string`](#typesstring)
    - [`types.boolean`](#typesboolean)
    - [`types.float32`](#typesfloat32)
    - [`types.float64`](#typesfloat64)
    - [`types.int`](#typesint)
    - [`types.uint`](#typesuint)
    - [`types.int64`](#typesint64)
    - [`types.int32`](#typesint32)
    - [`types.int16`](#typesint16)
    - [`types.int8`](#typesint8)
    - [`types.uint64`](#typesuint64)
    - [`types.uint32`](#typesuint32)
    - [`types.uint16`](#typesuint16)
    - [`types.uint8`](#typesuint8)
    - [`types.bytes`](#typesbytes)
    - [`types.JSON`](#typesjson)
  - [Type utilities](#type-utilities)
    - [`types.isEqualTo`](#typesisequalto)
    - [`types.isSubtypeOf`](#typesissubtypeof)
    - [`types.isComparableWith](#typesiscomparablewith)
    - [`types.greatestCommonSubtype`](#typesgreatestcommonsubtype)
    - [`types.leastCommonSupertype`](#typesleastcommonsupertype)
- [Schemas](#schemas)
  - [Schema schema](#schema-schema)
    - [`typeType`](#typetype)
    - [`TypeType`](#typetype)
    - [`schemaSchema`](#schemaschema)
    - [`SchemaSchema`](#schemaschema)
  - [Encoding schemas](#encoding-schemas)
    - [`fromSchema`](#fromschema)
    - [`encodeSchema`](#encodeschema)
  - [Decoding schemas](#decoding-schemas)
    - [`toSchema`](#toschema)
    - [`decodeSchema`](#decodeschema)
- [Values](#values)
  - [`values.Value`](#valuesvalue)
  - [URI values](#uri-values)
    - [`values.URI`](#valuesuri)
    - [`values.uri`](#valuesuri)
  - [Literal values](#literal-values)
    - [`values.Literal`](#valuesliteral)
    - [`values.literal`](#valuesliteral)
  - [Product values](#product-values)
    - [`values.Product`](#valuesproduct)
    - [`values.product`](#valuesproduct)
  - [Coproduct values](#coproduct-values)
    - [`values.Coproduct`](#valuescoproduct)
    - [`values.coproduct`](#valuescoproduct)
  - [Reference values](#reference-values)
    - [`values.Reference`](#valuesreference)
    - [`values.reference`](#valuesreference)
  - [Standard library value constructors](#standard-library-value-constructors)
    - [`values.unit`](#valuesunit)
    - [`values.uri`](#valuesuri)
    - [`values.string`](#valuesstring)
    - [`values.boolean`](#valuesboolean)
    - [`values.float32`](#valuesfloat32)
    - [`values.float64`](#valuesfloat64)
    - [`values.int`](#valuesint)
    - [`values.uint`](#valuesuint)
    - [`values.int64`](#valuesint64)
    - [`values.int32`](#valuesint32)
    - [`values.int16`](#valuesint16)
    - [`values.int8`](#valuesint8)
    - [`values.uint64`](#valuesuint64)
    - [`values.uint32`](#valuesuint32)
    - [`values.uint16`](#valuesuint16)
    - [`values.uint8`](#valuesuint8)
    - [`values.bytes`](#valuesbytes)
    - [`values.JSON`](#valuesjson)
  - [Value utilities](#value-utilities)
    - [`values.isEqualTo`](#valuesisequalto)
- [Instances](#instances)
  - [`Instance`](#instance)

## Types

All type-level types, methods, and constants are exported under the `types.` namespace. You can import this directly:

```ts
import { types } from "tasl"

function foo(type: types.Type) {
	if (types.isURI(type)) {
		// ...
	} else {
		// ...
	}
}
```

... or access it as a submodule of a global import:

```ts
import * as tasl from "tasl"

function foo(type: tasl.types.Type) {
	if (tasl.types.isURI(type)) {
		// ...
	} else {
		// ...
	}
}
```

### `types.Type`

```ts
export type Type = URI | Literal | Product | Coproduct | Reference
```

### The URI type

#### `types.URI`

```ts
export type URI = Readonly<{ kind: "uri" }>
```

#### `types.uri`

```ts
export declare function uri(): URI
```

#### `types.isURI`

```ts
export declare function isURI(type: Type): type is URI
```

### Literal types

#### `types.Literal`

```ts
export type Literal<Datatype extends string = string> = Readonly<{
	kind: "literal"
	datatype: Datatype
}>
```

#### `types.literal`

```ts
export declare function literal<Datatype extends string>(
	datatype: Datatype
): Literal<Datatype>
```

#### `types.isLiteral`

```ts
export declare function isLiteral(type: Type): type is Literal
```

#### `types.isLiteralDatatype`

```ts
export declare function isLiteralDatatype<Datatype extends string>(
	type: Type,
	datatype: Datatype
): type is Literal<Datatype>
```

### Product types

#### `types.Product`

```ts
export type Product<
	Components extends Record<string, types.Type> = Record<string, types.Type>
> = Readonly<{
	kind: "product"
	components: Readonly<Components>
}>
```

#### `types.product`

```ts
export declare function product<Components extends Record<string, types.Type>>(
	components: Components
): Product<Components>
```

#### `types.isProduct`

```ts
export declare function isProduct(type: Type): type is Product
```

### Coproduct types

#### `types.Coproduct`

```ts
export type Coproduct<
	Options extends Record<string, types.Type> = Record<string, types.Type>
> = Readonly<{
	kind: "coproduct"
	options: Readonly<Options>
}>
```

#### `types.coproduct`

```ts
export declare function coproduct<Options extends Record<string, types.Type>>(
	options: Options
): Coproduct<Options>
```

#### `types.isCoproduct`

```ts
export declare function isCoproduct(type: Type): type is Coproduct
```

### Reference types

### `types.Reference`

```ts
export type Reference<Key extends string = string> = Readonly<{
	kind: "reference"
	key: Key
}>
```

#### `types.reference`

```ts
export declare function reference<Key extends string>(key: Key): Reference<Key>
```

#### `types.isReference`

```ts
export declare function isReference(type: Type): type is Reference
```

#### `types.isReferenceKey`

```ts
export declare function isReferenceKey<Key extends string>(
	type: Type,
	key: Key
): type is Reference<Key>
```

### Standard library type constants

#### `types.unit`

```ts
export declare const unit: Product<{}>
```

#### `types.uri`

```ts
export declare const uri: URI
```

#### `types.string`

```ts
export declare const string: Literal<"http://www.w3.org/2001/XMLSchema#string">
```

#### `types.boolean`

```ts
export declare const boolean: Literal<"http://www.w3.org/2001/XMLSchema#boolean">
```

#### `types.float32`

```ts
export declare const float32: Literal<"http://www.w3.org/2001/XMLSchema#float">
```

#### `types.float64`

```ts
export declare const float64: Literal<"http://www.w3.org/2001/XMLSchema#double">
```

#### `types.int`

```ts
export declare const int: Literal<"http://www.w3.org/2001/XMLSchema#integer">
```

#### `types.uint`

```ts
export declare const uint: Literal<"http://www.w3.org/2001/XMLSchema#nonNegativeInteger">
```

#### `types.int64`

```ts
export declare const int64: Literal<"http://www.w3.org/2001/XMLSchema#long">
```

#### `types.int32`

```ts
export declare const int32: Literal<"http://www.w3.org/2001/XMLSchema#int">
```

#### `types.int16`

```ts
export declare const int16: Literal<"http://www.w3.org/2001/XMLSchema#short">
```

#### `types.int8`

```ts
export declare const int8: Literal<"http://www.w3.org/2001/XMLSchema#byte">
```

#### `types.uint64`

```ts
export declare const uint64: Literal<"http://www.w3.org/2001/XMLSchema#unsignedLong">
```

#### `types.uint32`

```ts
export declare const uint32: Literal<"http://www.w3.org/2001/XMLSchema#unsignedInt">
```

#### `types.uint16`

```ts
export declare const uint16: Literal<"http://www.w3.org/2001/XMLSchema#unsignedShort">
```

#### `types.uint8`

```ts
export declare const uint8: Literal<"http://www.w3.org/2001/XMLSchema#unsignedByte">
```

#### `types.bytes`

```ts
export declare const bytes: Literal<"http://www.w3.org/2001/XMLSchema#hexBinary">
```

#### `types.JSON`

```ts
export declare const JSON: Literal<"http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON">
```

### Type utilities

#### `types.isEqualTo`

```ts
/**
 * Check whether the type X is equal to the type Y.
 * Equality is reflexive, transitive, and symmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X = Y, false otherwise
 */
export declare function isEqualTo<T extends Type>(x: T, y: Type): y is T
```

#### `types.isSubtypeOf`

```ts
/**
 * Check whether the type X is a subtype of the type Y.
 * The subtype relation is reflexive, transitive, and antisymmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X ≤ Y, false otherwise
 */
export declare function isSubtypeOf(x: Type, y: Type): boolean
```

#### Type comparablility

```ts
/**
 * Check whether the type X is comparable with the type Y.
 * The comparability relation is reflexive and symmetric, but not necessarily transitive.
 * @param x a type
 * @param y a type
 * @returns {boolean} true if X and Y are comparable, false otherwise
 */
export declare function isTypeComparableWith(x: Type, y: Type): boolean
```

#### `types.greatestCommonSubtype`

```ts
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

#### `types.leastCommonSupertype`

```ts
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

```ts
type Schema<S extends { [key in string]: Type } = { [key in string]: Type }> =
	Readonly<S>

export declare function schema<S extends Types>(classes: S): Schema<S>
```

### Schema schema

#### `typeType`

```ts
export declare const typeType: Coproduct<{
	"http://underlay.org/ns/uri": Product<{}>
	"http://underlay.org/ns/literal": URI
	"http://underlay.org/ns/product": Reference<"http://underlay.org/ns/product">
	"http://underlay.org/ns/coproduct": Reference<"http://underlay.org/ns/coproduct">
	"http://underlay.org/ns/reference": Reference<"http://underlay.org/ns/class">
}>
```

#### `TypeType`

```ts
export type TypeType = typeof typeType
```

#### `schemaSchema`

```ts
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
```

#### `SchemaSchema`

```ts
export type SchemaSchema = typeof schemaSchema
```

### Encoding schemas

#### `fromSchema`

```ts
/**
 * Convert a schema to an instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Instance} an instance of the schema schema
 */
export declare function fromSchema(schema: Schema): Instance<SchemaSchema>
```

#### `encodeSchema`

```ts
/**
 * Convert a schema to an encoded instance of the schema schema
 * @param {Schema} schema a schema
 * @returns {Uint8Array} an encoded instance of the schema schema
 */
export declare function encodeSchema(schema: Schema): Uint8Array
```

### Decoding schemas

#### `toSchema`

```ts
/**
 * Convert an instance of the schema schema to a schema
 * @param {Instance} instance an instance of the schema schema
 * @returns {Schema} a schema
 */
export declare function toSchema(instance: Instance<SchemaSchema>): Schema
```

#### `decodeSchema`

```ts
/**
 * Convert an encoded instance of the schema schema to a schema
 * @param {Uint8Array} data
 * @returns {Schema} a schema
 */
export declare function decodeSchema(data: Uint8Array): Schema
```

## Values

### `values.Value`

```ts
export type Value<T extends types.Type = types.Type> = T extends types.URI
	? values.URI
	: T extends types.Literal<infer Datatype>
	? values.Literal<Datatype>
	: T extends types.Product<infer Components>
	? values.Product<Components>
	: T extends types.Coproduct<infer Options>
	? values.Coproduct<Options>
	: T extends types.Reference<infer Key>
	? values.Reference<Key>
	: never
```

### URI values

#### `values.URI`

```ts
export type URI = Readonly<{ kind: "uri"; value: string }>
```

#### `values.uri`

```ts
export declare function uri(type: types.URI, value: string): values.URI
```

### Literal values

#### `values.Literal`

```ts
export declare type Literal<Datatype extends string> = Readonly<{
	kind: "literal"
	value: string
}>
```

#### `values.literal`

```ts
declare function literal<Datatype extends string>(
	type: types.Literal<Datatype>,
	value: string
): values.Literal<Datatype>
```

### Product values

#### `values.Product`

```ts
export type Product<Components extends Record<string, types.Type>> = Readonly<{
	kind: "product"
	components: { readonly [K in keyof Components]: values.Value<Components[K]> }
}>
```

#### `values.product`

```ts
export declare function product<Components extends Record<string, types.Type>>(
	type: types.Product<Components>,
	components: { [K in keyof Components]: values.Value<Components[K]> }
): values.Product<Components>
```

### Coproduct values

#### `values.Coproduct`

```ts
type Coproduct<
	Options extends Record<string, types.Type>,
	Key extends keyof Options = keyof Options
> = {
	[k in keyof Options]: Readonly<{
		kind: "coproduct"
		key: k
		value: values.Value<Options[k]>
	}>
}[Key]
```

#### `values.coproduct`

```ts
export declare function coproduct<
	Options extends Record<string, types.Type>,
	Key extends keyof Options
>(
	type: types.Coproduct<Options>,
	key: Key,
	value: values.Value<Options[Key]>
): values.Coproduct<Options, Key>
```

### Reference values

#### `values.Reference`

```ts
export type Reference<Key extends string> = Readonly<{
	kind: "reference"
	index: number
}>
```

#### `values.reference`

```ts
export declare function reference<Key extends string>(
	type: types.Reference<Key>,
	index: number
): values.Reference<key>
```

```ts
namespace Values {
	type Literal<Datatype extends string> = Readonly<{
		kind: "literal"
		value: string
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
}
```

### Standard library value constructors

#### `values.unit`

```ts
export declare function unit(): values.Product<{}>
```

#### `values.uri`

```ts
export declare function uri(value: string): values.URI
```

#### `values.string`

```ts
export declare function string(
	value: string
): values.Literal<"http://www.w3.org/2001/XMLSchema#string">
```

#### `values.boolean`

```ts
export declare function boolean(
	value: boolean
): values.Literal<"http://www.w3.org/2001/XMLSchema#boolean">
```

#### `values.float32`

```ts
export declare function float32(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#float">
```

#### `values.float64`

```ts
export declare function float64(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#double">
```

#### `values.int`

```ts
export declare function int(
	value: bigint
): values.Literal<"http://www.w3.org/2001/XMLSchema#integer">
```

#### `values.uint`

```ts
export declare function uint(
	value: bigint
): values.Literal<"http://www.w3.org/2001/XMLSchema#nonNegativeInteger">
```

#### `values.int64`

```ts
export declare function int64(
	value: bigint
): values.Literal<"http://www.w3.org/2001/XMLSchema#long">
```

#### `values.int32`

```ts
export declare function int32(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#int">
```

#### `values.int16`

```ts
export declare function int16(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#short">
```

#### `values.int8`

```ts
export declare function int8(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#byte">
```

#### `values.uint64`

```ts
export declare function uint64(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#unsignedLong">
```

#### `values.uint32`

```ts
export declare function uint32(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#unsignedInt">
```

#### `values.uint16`

```ts
export declare function uint16(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#unsignedShort">
```

#### `values.uint8`

```ts
export declare function uint8(
	value: number
): values.Literal<"http://www.w3.org/2001/XMLSchema#unsignedByte">
```

#### `values.bytes`

```ts
export declare function bytes(
	value: Uint8Array
): values.Literal<"http://www.w3.org/2001/XMLSchema#hexBinary">
```

#### `values.JSON`

```ts
export declare function JSON(
	value: any
): values.Literal<"http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON">
```

### Value utilities

#### `values.isEqualTo`

```ts
/**
 * Check whether two values X and Y of the same type are equal.
 * @param type a type T
 * @param x a value X of type T
 * @param y a value Y of type T
 * @throws an error if either of X or Y are not of type T
 * @returns {boolean} true if X is equal to Y, false otherwise
 */
export declare function isEqualTo<T extends types.Type>(
	type: T,
	x: values.Value<T>,
	y: values.Value<T>
): boolean
```

## Instances

### `Instance`

```ts
export declare class Instance<S extends Record<string, types.Type>> {
	readonly schema: Schema<S>

	static decode<S extends Record<string, types.Type>>(
		schema: Schema<S>,
		data: Uint8Array
	): Instance<S>

	static fromJSON<S extends Record<string, types.Type>>(
		schema: Schema<S>,
		classes: { [K in keyof S]: values.Value<S[K]>[] }
	): Instance<S>

	encode(): Uint8Array

	toJSON(): { [K in keyof S]: values.Value<S[K]>[] }

	count<K extends keyof S>(key: K): number

	get<K extends keyof S>(key: K, index: number): values.Value<S[K]>

	keys(): Iterable<string>

	elements<K extends keyof S>(key: K): Iterable<[number, values.Value<S[K]>]>
}
```
