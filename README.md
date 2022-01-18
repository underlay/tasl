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

## API

See the [docs/](./docs) folder.

## Usage

```ts
import {
	Schema,
	types,
	Instance,
	values,
	encodeInstance,
	decodeInstance,
} from "tasl"

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
// Schema {
//   classes: {
//     'http://schema.org/Person': { kind: 'product', components: [Object] }
//   },
// }

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
// Instance {
//   schema: Schema {
//     classes: { 'http://schema.org/Person': [Object] }
//   },
//   elements: { 'http://schema.org/Person': [ [Object], [Object] ] }
// }

const data = encodeInstance(instance)
// Uint8Array(22) [
//     1,  2,   1,   8,  74, 111, 104,
//   110, 32,  68, 111, 101,   0,   8,
//    74, 97, 110, 101,  32,  68, 111,
//   101
// ]

decodeInstance(schema, data)
// Instance {
//   schema: Schema {
//     classes: { 'http://schema.org/Person': [Object] }
//   },
//   elements: { 'http://schema.org/Person': [ [Object], [Object] ] }
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
