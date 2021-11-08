import * as fs from "node:fs"

import test from "ava"

import * as tasl from "../src/index.js"

const schema = {
	"http://example.com/foo": tasl.Schema.product({
		"http://example.com/foo/1": tasl.Schema.uri(),
	}),
	"http://example.com/bar": tasl.Schema.coproduct({
		"http://example.com/bar/1": tasl.Schema.string,
		"http://example.com/bar/2": tasl.Schema.product({
			"http://example.com/bar/2/1": tasl.Schema.uri(),
			"http://example.com/bar/2/2": tasl.Schema.reference(
				"http://example.com/foo"
			),
		}),
	}),
}

const instance: tasl.Instance.Instance<typeof schema> = {
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
}

test("round-trip to instance to binary and back", (t) => {
	const data = tasl.encode(schema, instance)
	const i = tasl.decode(schema, data)
	for (const [key, type] of tasl.forEntries(schema)) {
		for (const [n, e] of instance[key].entries()) {
			t.true(tasl.Instance.isValueEqualTo(type, e, i[key][n]))
		}
	}
})

test("round-trip schema to binary instance and back", (t) => {
	const data = tasl.encodeSchema(schema)
	const s = tasl.decodeSchema(data)
	for (const key of tasl.forKeys(schema)) {
		if (key in s) {
			t.true(tasl.Schema.isTypeEqualTo(schema[key], s[key]))
		} else {
			t.fail("key missing from result schema")
		}
	}
})

test("round-trip schema schema to binary instance and back", (t) => {
	const input = fs.readFileSync("test/schema-schema.tasl", "utf-8")
	const schemaSchema = tasl.parseSchema(input)
	const data = tasl.encodeSchema(schemaSchema)
	const s = tasl.decodeSchema(data)
	for (const key of tasl.forKeys(schemaSchema)) {
		if (key in s) {
			t.true(tasl.Schema.isTypeEqualTo(schemaSchema[key], s[key]))
		} else {
			t.fail("key missing from result schema schema")
		}
	}
})
