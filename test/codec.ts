import test from "ava"

import { xsd } from "@underlay/namespaces"

import * as tasl from "../src/index.js"

const s1 = tasl.schema({
	"http://example.com/foo": tasl.product({
		"http://example.com/foo/1": tasl.uri(),
	}),
	"http://example.com/bar": tasl.coproduct({
		"http://example.com/bar/1": tasl.literal(xsd.string),
		"http://example.com/bar/2": tasl.product({
			"http://example.com/bar/2/1": tasl.uri(),
			"http://example.com/bar/2/2": tasl.reference("http://example.com/foo"),
		}),
	}),
})

const i1 = tasl.Instance.fromJSON(s1, {
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

test("round-trip to instance to binary and back", (t) => {
	const data = i1.encode()
	const i2 = tasl.Instance.decode(s1, data)
	for (const [key, type] of tasl.forEntries(s1)) {
		for (const [n, e1] of i1.elements(key)) {
			const e2 = i2.get(key, n)
			t.true(tasl.isValueEqual(type, e1, e2))
		}
	}
})

test("round-trip schema to in-memory instance and back", (t) => {
	const s2 = tasl.toSchema(tasl.fromSchema(s1))
	for (const key of tasl.forKeys(s1)) {
		if (key in s2) {
			t.true(tasl.isTypeEqual(s1[key], s2[key]))
		} else {
			t.fail("key missing from result schema")
		}
	}
})

test("round-trip schema to binary instance and back", (t) => {
	const i1 = tasl.fromSchema(s1)
	const data = i1.encode()
	const i2 = tasl.Instance.decode(tasl.schemaSchema, data)
	const s2 = tasl.toSchema(i2)
	for (const key of tasl.forKeys(s1)) {
		if (key in s2) {
			t.true(tasl.isTypeEqual(s1[key], s2[key]))
		} else {
			t.fail("key missing from result schema")
		}
	}
})
