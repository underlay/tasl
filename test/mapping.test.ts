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
} from "../src/index.js"

const dataset = parseSchema(
	fs.readFileSync(resolve("test", "rdf-dataset.tasl"), "utf-8")
)

const graph = parseSchema(
	fs.readFileSync(resolve("test", "rdf-graph.tasl"), "utf-8")
)

const graphToDataset = Mapping.parse(
	graph,
	dataset,
	fs.readFileSync(resolve("test", "graph-to-dataset.taslx"), "utf-8")
)

const datasetToGraph = Mapping.parse(
	dataset,
	graph,
	fs.readFileSync(resolve("test", "dataset-to-graph.taslx"), "utf-8")
)

test("round-trip dataset-to-graph.taslx to binary blob and back", (t) => {
	Mapping.decode(dataset, graph, datasetToGraph.encode())
	t.pass()
})

test("round-trip graph-to-dataset.taslx to binary blob and back", (t) => {
	Mapping.decode(graph, dataset, graphToDataset.encode())
	t.pass()
})

const source = parseSchema(
	fs.readFileSync(resolve("test", "source.tasl"), "utf-8")
)

const target = parseSchema(
	fs.readFileSync(resolve("test", "target.tasl"), "utf-8")
)

const sourceToTarget = Mapping.parse(
	source,
	target,
	fs.readFileSync(resolve("test", "source-to-target.taslx"), "utf-8")
)

test("round-trip source-to-target.taslx to binary blob and back", (t) => {
	Mapping.decode(source, target, sourceToTarget.encode())
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

	const mapping = new Mapping(sourceSchema, targetSchema, [
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

	const targetInstance = mapping.apply(sourceInstance)

	t.deepEqual(targetInstance.elements, {
		"http://example.com/person": [
			values.product({
				"http://example.com/name": values.string("John Doe"),
				"http://example.com/gender": values.string("Male"),
			}),
			values.product({
				"http://example.com/name": values.string("Jane Doe"),
				"http://example.com/gender": values.string("Female"),
			}),
		],
	})
	console.log(JSON.stringify(targetInstance.elements, null, "  "))
})
