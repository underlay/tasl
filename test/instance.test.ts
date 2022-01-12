import test from "ava"

import {
	Schema,
	types,
	Instance,
	values,
	encodeInstance,
} from "../src/index.js"

test("encode nano instance", (t) => {
	const schema = new Schema({
		"http://example.com/foo": types.boolean,
	})

	const instance = new Instance(schema, {
		"http://example.com/foo": [
			values.boolean(true),
			values.boolean(false),
			values.boolean(true),
		],
	})

	t.deepEqual(
		encodeInstance(instance),

		new Uint8Array([
			0x01, // version number
			0x03, // number of elements in the class
			0x01, // the value of the first element ("true")
			0x00, // the value of the second element ("false")
			0x01, // the value of the third element ("true")
		])
	)
})

test("encode micro instance", (t) => {
	const schema = new Schema({
		"http://example.com/a": types.product({
			"http://example.com/a/a": types.u8,
			"http://example.com/a/b": types.boolean,
		}),
		"http://example.com/b": types.coproduct({
			"http://example.com/b/a": types.bytes,
			"http://example.com/b/b": types.unit,
			"http://example.com/b/c": types.uri(),
		}),
	})

	const instance = new Instance(schema, {
		"http://example.com/a": [
			values.product({
				"http://example.com/a/a": values.u8(0xff),
				"http://example.com/a/b": values.boolean(false),
			}),
		],
		"http://example.com/b": [
			values.coproduct(
				"http://example.com/b/a",
				values.bytes(new Uint8Array([0x0f, 0xee, 0x12, 0x00]))
			),
			values.coproduct("http://example.com/b/b", values.unit()),
			values.coproduct("http://example.com/b/b", values.unit()),
			values.coproduct(
				"http://example.com/b/c",
				values.uri(
					"dweb:/ipfs/bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354"
				)
			),
		],
	})

	t.deepEqual(
		encodeInstance(instance),
		new Uint8Array([
			0x01, // version number
			0x01, // number of elements in the first class
			0xff, // the value of the first component (u8)
			0x00, // the value of the second component (boolean)
			0x04, // the number of elements in the second class
			0x00, // the index of option for the first element's value
			0x04, // the number of bytes in the binary literal
			...[0x0f, 0xee, 0x12, 0x00], // the raw bytes of the binary literal
			0x01, // the index of the option for the second element's value
			0x01, // the index of the option for the third element's value
			0x02, // the index of the option for the fourth element's value
			0x46, // the length of the URI in bytes (70)s
			...new TextEncoder().encode(
				"dweb:/ipfs/bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354"
			),
		])
	)
})
