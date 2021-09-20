# tiny algebraic schema language _(tasl)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme) [![license](https://img.shields.io/github/license/underlay/tasl)](https://opensource.org/licenses/MIT) [![NPM version](https://img.shields.io/npm/v/tasl)](https://www.npmjs.com/package/tasl) ![TypeScript types](https://img.shields.io/npm/types/tasl) ![lines of code](https://img.shields.io/tokei/lines/github/underlay/tasl)

An algebraic data model designed for datasets.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [Types](#types)
    - [URI types](#uri-types)
    - [Literal types](#literal-types)
    - [Product types](#product-types)
    - [Coproduct types](#coproduct-types)
    - [Reference types](#reference-types)
    - [Type utilities](#type-utilities)
  - [Values](#values)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm i tasl
```

## Usage

```typescript
import * as tasl from "tasl"
```

## API

### Types

```typescript
type Type = URI | Literal | Product | Coproduct | Reference
```

#### URI types

```typescript
type URI = Readonly<{ kind: "uri" }>

declare function uri(): URI

declare function isURI(type: Type): type is URI
```

#### Literal types

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

#### Product types

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

#### Coproduct types

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

#### Reference types

```typescript
type Reference<Key extends string = string> = Readonly<{
	kind: "reference"
	key: Key
}>

declare function reference<Key extends string>(key: Key): Reference<Key>

declare function isReference(type: Type): type is Reference

declare function isReferenceKey<Key extends string>(type: Type, key: Key): type
```

#### Type utilities

```typescript
/**
 * Check whether the type X is equal to the type Y.
 * Equality is associative, commutative, and symmetric.
 * @param x
 * @param y
 * @returns true if X and Y are equal to each other, false otherwise
 */
declare function isTypeEqual<T extends Type>(x: T, y: Type): y is T

/**
 * Check whether the type X is assignable to the type Y.
 * Intuitively, assignability means that X is a "superset" of Y,
 * or that you can freely use values of type X as if they were values of type Y.
 * URIs, literals, and references are assignable if they are strictly equal.
 * A product type X is assignable to the product type Y if for every key K in Y,
 * X has a component with key K and the type X(K) is assignable to the type Y(K).
 * A coproduct type X is assignable to the coproduct type Y if for every key K in X,
 * Y has a component with key K and the type X(K) is assignable to the type Y(K).
 * Types of different kinds are never assignable to each other.
 * Assignability is associative and commutative, but not symmetric.
 * @param x
 * @param y
 * @returns true if X is assignable to Y, false otherwise
 */
declare function isTypeAssignable(x: Type, y: Type): boolean

declare function unifyTypes(x: Type, y: Type): Type
```

### Values

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

declare function validateValue<T extends Type>(
	type: T,
	value: Value
): value is Value<T>
```

## Testing

Tests use [AVA 4](https://github.com/avajs/ava) (currently in alpha) and live in the [test](./test/) directory.

```
npm run test
```

## Contributing

PRs accepted!

## License

MIT © 2020 underlay
