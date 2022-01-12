import * as fs from "node:fs"

import test from "ava"

import {
	Schema,
	types,
	Instance,
	values,
	parseSchema,
	encodeSchema,
	decodeSchema,
	decodeInstance,
	encodeInstance,
} from "../src/index.js"

const schema = new Schema({
	"http://example.com/foo": types.product({
		"http://example.com/foo/1": types.uri(),
	}),
	"http://example.com/bar": types.coproduct({
		"http://example.com/bar/1": types.string,
		"http://example.com/bar/2": types.product({
			"http://example.com/bar/2/1": types.uri(),
			"http://example.com/bar/2/2": types.reference("http://example.com/foo"),
		}),
	}),
})

const instance = new Instance(schema, {
	"http://example.com/foo": [
		values.product({
			"http://example.com/foo/1": values.uri("http://wow.neat.cool.com"),
		}),
	],
	"http://example.com/bar": [
		values.coproduct("http://example.com/bar/1", values.literal("hello world")),
		values.coproduct(
			"http://example.com/bar/2",
			values.product({
				"http://example.com/bar/2/1": values.uri("http://another-uri.net"),
				"http://example.com/bar/2/2": values.reference(0),
			})
		),
	],
})

test("round-trip instance to binary and back", (t) => {
	const data = encodeInstance(instance)
	const i = decodeInstance(schema, data)
	t.true(i.isEqualTo(instance))
	t.true(instance.isEqualTo(i))
})

test("round-trip schema to binary and back", (t) => {
	const data = encodeSchema(schema)
	const s = decodeSchema(data)
	t.true(s.isEqualTo(schema))
	t.true(schema.isEqualTo(s))
})

test("round-trip schema schema to binary and back", (t) => {
	const input = fs.readFileSync("test/schema-schema.tasl", "utf-8")
	const schemaSchema = parseSchema(input)
	const data = encodeSchema(schemaSchema)
	const s = decodeSchema(data)
	t.true(s.isEqualTo(schemaSchema))
	t.true(schemaSchema.isEqualTo(s))
})
