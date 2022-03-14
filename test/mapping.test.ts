import test from "ava"

import * as fs from "node:fs"
import { resolve } from "node:path"

import {
	Schema,
	types,
	Instance,
	values,
	Mapping,
	expressions,
	parseSchema,
	parseMapping,
	encodeMapping,
	decodeMapping,
} from "../src/index.js"

const dataset = parseSchema(
	fs.readFileSync(resolve("test", "rdf-dataset.tasl"), "utf-8")
)

const graph = parseSchema(
	fs.readFileSync(resolve("test", "rdf-graph.tasl"), "utf-8")
)

const graphToDataset = parseMapping(
	graph,
	dataset,
	fs.readFileSync(resolve("test", "graph-to-dataset.taslx"), "utf-8")
)

const datasetToGraph = parseMapping(
	dataset,
	graph,
	fs.readFileSync(resolve("test", "dataset-to-graph.taslx"), "utf-8")
)

test("round-trip dataset-to-graph.taslx to binary blob and back", (t) => {
	decodeMapping(dataset, graph, encodeMapping(datasetToGraph))
	t.pass()
})

test("round-trip graph-to-dataset.taslx to binary blob and back", (t) => {
	decodeMapping(graph, dataset, encodeMapping(graphToDataset))
	t.pass()
})

const source = parseSchema(
	fs.readFileSync(resolve("test", "source.tasl"), "utf-8")
)

const target = parseSchema(
	fs.readFileSync(resolve("test", "target.tasl"), "utf-8")
)

const sourceToTarget = parseMapping(
	source,
	target,
	fs.readFileSync(resolve("test", "source-to-target.taslx"), "utf-8")
)

test("round-trip source-to-target.taslx to binary blob and back", (t) => {
	decodeMapping(source, target, encodeMapping(sourceToTarget))
	t.pass()
})

test("apply source-to-target.taslx to source.instance.json", (t) => {
	const sourceInstance = new Instance(
		source,
		JSON.parse(
			fs.readFileSync(resolve("test", "source.instance.json"), "utf-8")
		)
	)

	sourceToTarget.apply(sourceInstance)
	t.pass()
})

test("apply instantiated mapping", (t) => {
	const sourceSchema = new Schema({
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
	const sourceInstance = new Instance(sourceSchema, {
		"http://schema.org/Person": [
			{
				id: 0,
				value: values.product({
					"http://schema.org/name": values.string("John Doe"),
					"http://schema.org/gender": values.coproduct(
						"http://schema.org/Male",
						values.unit()
					),
				}),
			},
			{
				id: 1,
				value: values.product({
					"http://schema.org/name": values.string("Jane Doe"),
					"http://schema.org/gender": values.coproduct(
						"http://schema.org/Female",
						values.unit()
					),
				}),
			},
		],
	})

	const targetSchema = new Schema({
		"http://example.com/person": types.product({
			"http://example.com/name": types.string,
			"http://example.com/gender": types.string,
		}),
	})

	const mapping = new Mapping(sourceSchema, targetSchema, [
		{
			target: "http://example.com/person",
			source: "http://schema.org/Person",
			id: "person",
			value: expressions.product({
				"http://example.com/name": expressions.term("person", [
					expressions.projection("http://schema.org/name"),
				]),
				"http://example.com/gender": expressions.match(
					"person",
					[expressions.projection("http://schema.org/gender")],
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
							value: expressions.term("gender", []),
						},
					}
				),
			}),
		},
	])

	const targetInstance = mapping.apply(sourceInstance)

	t.deepEqual(targetInstance.toJSON(), {
		"http://example.com/person": [
			{
				id: 0,
				value: values.product({
					"http://example.com/name": values.string("John Doe"),
					"http://example.com/gender": values.string("Male"),
				}),
			},
			{
				id: 1,
				value: values.product({
					"http://example.com/name": values.string("Jane Doe"),
					"http://example.com/gender": values.string("Female"),
				}),
			},
		],
	})
})
