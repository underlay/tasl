# tiny algebraic schema language _(tasl)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme) [![license](https://img.shields.io/github/license/underlay/tasl)](https://opensource.org/licenses/MIT) [![NPM version](https://img.shields.io/npm/v/tasl)](https://www.npmjs.com/package/tasl) ![TypeScript types](https://img.shields.io/npm/types/tasl) ![lines of code](https://img.shields.io/tokei/lines/github/underlay/tasl)

A data model for strongly typed semantic data.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm i tasl
```

## Usage

```ts
import * as tasl from "tasl"

const person = tasl.types.product({
	"http://schema.org/name": tasl.types.string,
	"http://schema.org/gender": tasl.types.coproduct({
		"http://schema.org/Male": tasl.types.unit,
		"http://schema.org/Female": tasl.types.unit,
		"http://schema.org/value": tasl.types.string,
	}),
})

const schema = tasl.schema({
	"http://schema.org/Person": person,
})

const instance = tasl.Instance.fromJSON(schema, {
	"http://schema.org/Person": [
		{
			kind: "product",
			components: {
				"http://schema.org/name": {
					kind: "literal",
					value: "Alyssa P. Hacker",
				},
				"http://schema.org/gender": {
					kind: "coproduct",
					key: "http://schema.org/Female",
					value: { kind: "product", components: {} },
				},
			},
		},
		{
			kind: "product",
			components: {
				"http://schema.org/name": { kind: "literal", value: "Ben Bitdiddle" },
				"http://schema.org/gender": {
					kind: "coproduct",
					key: "http://schema.org/Male",
					value: { kind: "product", components: {} },
				},
			},
		},
	],
})

const data = instance.encode()
console.log(data)
// Uint8Array(35) [
//     1,   2,   0,  16,  65, 108, 121, 115, 115,
//    97,  32,  80,  46,  32,  72,  97,  99, 107,
//   101, 114,   1,  13,  66, 101, 110,  32,  66,
//   105, 116, 100, 105, 100, 100, 108, 101
// ]

console.log(tasl.Instance.decode(schema, data).toJSON())
// {
//   "http://schema.org/Person": [
//     {
//       "kind": "product",
//       "components": {
//         "http://schema.org/gender": {
//           "kind": "coproduct",
//           "key": "http://schema.org/Female",
//           "value": {
//             "kind": "product",
//             "components": {}
//           }
//         },
//         "http://schema.org/name": {
//           "kind": "literal",
//           "value": "Alyssa P. Hacker"
//         }
//       }
//     },
//     {
//       "kind": "product",
//       "components": {
//         "http://schema.org/gender": {
//           "kind": "coproduct",
//           "key": "http://schema.org/Male",
//           "value": {
//             "kind": "product",
//             "components": {}
//           }
//         },
//         "http://schema.org/name": {
//           "kind": "literal",
//           "value": "Ben Bitdiddle"
//         }
//       }
//     }
//   ]
// }
```

## API

See [API.md](./API.md).

## Testing

Tests use [AVA 4](https://github.com/avajs/ava) (currently in alpha) and live in the [test](./test/) directory.

```
npm run test
```

## Contributing

PRs accepted!

## License

MIT © 2020 underlay
