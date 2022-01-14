# Documentation

## Table of contents

- [Overview](#overview)
- [JSON instantiation using class constructors](#json-instantiation-using-class-constructors)
- [Binary codecs](#binary-codecs)
- [Schema and mapping DSLs](#schema-and-mapping-dsls)

## Overview

There are three primary data structures in tasl, represented in this JavaScript library as classes exported at the top level.

```ts
import { Schema, Instance, Mapping } from "tasl"
```

- A `Schema` is a runtime representation of a dataset schema.
- An `Instance` is a runtime representation of the contents of a dataset with a particular schema.
- A `Mapping` is a runtime representation of a transformation between two particular schemas.

Each of these can be instantiated directly with a JSON format, encoded to a `Uint8Array`, and decoded from a `Uint8Array`. Additionally, tasl defines two DSLs `.tasl` and `.taslx` for writing schemas and mappings respectively as human-readable UTF-8 source files.

## JSON instantiation using class constructors

### Schemas

The JSON schema format is documented in [./SCHEMAS.md](./SCHEMAS.md).

```ts
const schema = new Schema({
	/* ... see ./schemas.md */
})
```

### Instances

Instances are always instances of a particular schema, so the first argument to the `Instance` constructor is a `readonly schema: Schema`. The JSON instance format is documented in [./INSTANCES.md](./INSTANCES.md).

```ts
const instance = new Instance(schema, {
	/* ... see ./instances.md */
})
```

### Mappings

Similarly, mappings are always mappings from one particular schema to another particular schema, so the first two arguments to the `Mapping` constructor are `readonly source: Schema` and `readonly target: Schema`. The JSON mapping format is documented in [./MAPPINGS.md](./MAPPINGS.md).

```ts
const mapping = new Mapping(sourceSchema, targetSchema, [
	/* ... see ./mappings.md */
])
```

## Binary codecs

All six encoding and decoding methods are also exported at the top level and are **not** methods of their respective classes. This is done to avoid dependency cycles, since internally schemas are encoded as instances of a "schema schema", and mappings as instances of a "mapping schema".

### Schemas

```ts
declare function encodeSchema(schema: Schema): Uint8Array
declare function decodeSchema(data: Uint8Array): Schema
```

Just like the `Instance` constructor, `decodeInstance` takes a concrete schema as its first argument.

```ts
declare function encodeInstance(instance: Instance): Uint8Array
declare function decodeInstance(schema: Schema, data: Uint8Array): Instance
```

Just like the `Mapping` constructor, `decodeMapping` takes two concrete schemas as its first arguments.

```ts
declare function encodeMapping(mapping: Mapping): Uint8Array
declare function decodeMapping(
	source: Schema,
	target: Schema,
	data: Uint8Array
): Mapping
```

## Schema and mapping DSLs

The two DSL parsing methods are also exported at the top level and are not static methods of their respective classes.

### Schemas

```ts
declare function parseSchema(input: string): Schema
```

### Mappings

Just like the `Mapping` constructor, `parseMapping` takes two concrete schemas as its first arguments.

```ts
declare function parseMapping(
	source: Schema,
	target: Schema,
	input: string
): Mapping
```
