import test from "ava"

import { xsd } from "@underlay/namespaces"

import * as tasl from "../src/index.js"

const schema = tasl.schema({
	"http://example.com/foo": tasl.types.product({
		"http://example.com/foo/1": tasl.types.uri(),
	}),
	"http://example.com/bar": tasl.types.coproduct({
		"http://example.com/bar/1": tasl.types.string,
		"http://example.com/bar/2": tasl.types.product({
			"http://example.com/bar/2/1": tasl.types.uri(),
			"http://example.com/bar/2/2": tasl.types.reference(
				"http://example.com/foo"
			),
		}),
	}),
})

const instance = tasl.Instance.fromJSON(schema, {
	"http://example.com/foo": [
		{
			kind: "product",
			components: {
				"http://example.com/foo/1": {
					kind: "uri",
					value: "http://wow.neat.cool.com",
				},
			},
		},
	],
	"http://example.com/bar": [
		{
			kind: "coproduct",
			key: "http://example.com/bar/1",
			value: { kind: "literal", value: "hello world" },
		},
		{
			kind: "coproduct",
			key: "http://example.com/bar/2",
			value: {
				kind: "product",
				components: {
					"http://example.com/bar/2/1": {
						kind: "uri",
						value: "http://another-uri.net",
					},
					"http://example.com/bar/2/2": { kind: "reference", index: 0 },
				},
			},
		},
	],
})

// test("validate instance", (t) => {
// 	for (const key of tasl.forKeys(schema)) {
// 		for (const [i, element] of instance.elements(key)) {
// 			t.true(tasl.validateValue(schema[key], element))
// 		}
// 	}
// })

test("round-trip to instance to binary and back", (t) => {
	const data = instance.encode()
	const i2 = tasl.Instance.decode(schema, data)
	for (const [key, type] of tasl.forEntries(schema)) {
		for (const [n, e1] of instance.elements(key)) {
			const e2 = i2.get(key, n)
			t.true(tasl.values.isEqualTo(type, e1, e2))
		}
	}
})

test("round-trip schema to in-memory instance and back", (t) => {
	const i = tasl.fromSchema(schema)
	const s = tasl.toSchema(i)
	for (const key of tasl.forKeys(schema)) {
		if (key in s) {
			t.true(tasl.types.isEqualTo(schema[key], s[key]))
		} else {
			t.fail("key missing from result schema")
		}
	}
})

test("round-trip schema to binary instance and back", (t) => {
	const instance = tasl.fromSchema(schema)
	const data = instance.encode()
	const i = tasl.Instance.decode(tasl.schemaSchema, data)
	const s = tasl.toSchema(i)
	for (const key of tasl.forKeys(schema)) {
		if (key in s) {
			t.true(tasl.types.isEqualTo(schema[key], s[key]))
		} else {
			t.fail("key missing from result schema")
		}
	}
})

test("round-trip schema schema to in-memory instance and back", (t) => {
	const i = tasl.fromSchema(tasl.schemaSchema)
	const s = tasl.toSchema(i)
	for (const key of tasl.forKeys(tasl.schemaSchema)) {
		if (key in s) {
			t.true(tasl.types.isEqualTo(tasl.schemaSchema[key], s[key]))
		} else {
			t.fail("key missing from result schema schema")
		}
	}
})

test("round-trip schema schema to binary instance and back", (t) => {
	const instance = tasl.fromSchema(tasl.schemaSchema)
	const data = instance.encode()
	const i = tasl.Instance.decode(tasl.schemaSchema, data)
	const s = tasl.toSchema(i)
	for (const key of tasl.forKeys(tasl.schemaSchema)) {
		if (key in s) {
			t.true(tasl.types.isEqualTo(tasl.schemaSchema[key], s[key]))
		} else {
			t.fail("key missing from result schema schema")
		}
	}
})
