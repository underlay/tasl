# tiny algebraic schema language _(tasl)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme) [![license](https://img.shields.io/github/license/underlay/tasl)](https://opensource.org/licenses/MIT) [![NPM version](https://img.shields.io/npm/v/tasl)](https://www.npmjs.com/package/tasl) ![TypeScript types](https://img.shields.io/npm/types/tasl) ![lines of code](https://img.shields.io/tokei/lines/github/underlay/tasl)

An algebraic data model for strongly typed semantic data.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm i tasl
```

## Usage

```ts
import { Schema, types, Instance, values, Mapping, expressions } from "tasl"

// directly instantiate a schema
const schema = new Schema({
	"http://schema.org/Person": types.product({
		"http://schema.org/name": types.string,
		"http://schema.org/gender": types.coproduct({
			"http://schema.org/Male": types.unit,
			"http://schema.org/Female": types.unit,
			"http://schema.org/value": types.string,
		}),
	}),
})

// directly instantiate an instance
const instance = new Instance(schema, {
	"http://schema.org/Person": [
		values.product({
			"http://schema.org/name": values.string("John Doe"),
			"http://schema.org/gender": values.coproduct(
				"http://schema.org/Male",
				values.unit()
			),
		}),
		values.product({
			"http://schema.org/name": values.string("Jane Doe"),
			"http://schema.org/gender": values.coproduct(
				"http://schema.org/Female",
				values.unit()
			),
		}),
	],
})

const targetSchema = new Schema({
	"http://example.com/person": types.product({
		"http://example.com/name": types.string,
		"http://example.com/gender": types.string,
	}),
})

const mapping = new Mapping(schema, targetSchema, [
	{
		source: "http://schema.org/Person",
		target: "http://example.com/person",
		id: "person",
		value: expressions.construction({
			"http://example.com/name": expressions.projection(
				"http://schema.org/name",
				expressions.variable("person")
			),
			"http://example.com/gender": expressions.match(
				expressions.projection(
					"http://schema.org/gender",
					expressions.variable("person")
				),
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
						value: expressions.variable("gender"),
					},
				}
			),
		}),
	},
])

// apply a mapping
const targetInstance = mapping.apply(instance)
console.log(targetInstance.elements)
// {
//   "http://example.com/person": [
//     {
//       "kind": "product",
//       "components": {
//         "http://example.com/gender": {
//           "kind": "literal",
//           "value": "Male"
//         },
//         "http://example.com/name": {
//           "kind": "literal",
//           "value": "John Doe"
//         }
//       }
//     },
//     {
//       "kind": "product",
//       "components": {
//         "http://example.com/gender": {
//           "kind": "literal",
//           "value": "Female"
//         },
//         "http://example.com/name": {
//           "kind": "literal",
//           "value": "Jane Doe"
//         }
//       }
//     }
//   ]
// }
```

## Testing

Tests use [AVA](https://github.com/avajs/ava) and live in the [test](./test/) directory.

```
npm run test
```

## Contributing

PRs accepted!

## License

MIT © 2020 underlay
