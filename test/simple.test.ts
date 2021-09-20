import test from "ava"

import { xsd } from "@underlay/namespaces"

import * as tasl from "../src/index.js"

test("encode nano instance", (t) => {
	const schema = tasl.schema({
		"http://example.com/foo": tasl.literal(xsd.boolean),
	})

	const instance = tasl.Instance.fromJSON(schema, {
		"http://example.com/foo": [
			{ kind: "literal", value: "true" },
			{ kind: "literal", value: "false" },
		],
	})

	t.deepEqual(
		instance.encode(),
		new Uint8Array([
			0x01, // version number
			0x02, // number of elements in the class
			0x01, // the value of the first element ("true")
			0x00, // the value of the second element ("false")
		])
	)
})

test("encode micro instance", (t) => {
	const schema = tasl.schema({
		"http://example.com/a": tasl.product({
			"http://example.com/a/a": tasl.literal(xsd.unsignedByte),
			"http://example.com/a/b": tasl.literal(xsd.integer),
		}),
		"http://example.com/b": tasl.coproduct({
			"http://example.com/b/a": tasl.literal(xsd.hexBinary),
			"http://example.com/b/b": tasl.product({}),
		}),
	})

	const instance = tasl.Instance.fromJSON(schema, {
		"http://example.com/a": [
			{
				kind: "product",
				components: {
					"http://example.com/a/a": { kind: "literal", value: "244" },
					"http://example.com/a/b": { kind: "literal", value: "-100000" },
				},
			},
		],
		"http://example.com/b": [
			{
				kind: "coproduct",
				key: "http://example.com/b/a",
				value: { kind: "literal", value: "0FEE1200" },
			},
			{
				kind: "coproduct",
				key: "http://example.com/b/b",
				value: { kind: "product", components: {} },
			},
			{
				kind: "coproduct",
				key: "http://example.com/b/b",
				value: { kind: "product", components: {} },
			},
		],
	})

	t.deepEqual(
		instance.encode(),
		new Uint8Array([
			0x01, // version number
			0x01, // number of elements in the first class
			244, // the value of the first component (uint8)
			...[191, 154, 12], // the value of the second component (signed varint)
			0x03, // the number of elements in the second class
			0x00, // the index of option for the first element's value
			0x04, // the number of bytes in the binary literal
			...[0x0f, 0xee, 0x12, 0x00], // the raw bytes of the binary literal
			0x01, // the index of the option for the second element's value
			0x01, // the index of the option for the third element's value
		])
	)
})
