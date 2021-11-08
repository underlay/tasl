import test from "ava"

import * as fs from "node:fs"
import { resolve } from "node:path"

import * as tasl from "../src/index.js"

const dataset = tasl.parseSchema(
	fs.readFileSync(resolve("test", "rdf-dataset.tasl"), "utf-8")
)

const graph = tasl.parseSchema(
	fs.readFileSync(resolve("test", "rdf-graph.tasl"), "utf-8")
)

const graphToDataset = tasl.parseMapping(
	fs.readFileSync(resolve("test", "graph-to-dataset.taslx"), "utf-8")
)

const datasetToGraph = tasl.parseMapping(
	fs.readFileSync(resolve("test", "dataset-to-graph.taslx"), "utf-8")
)

const source = tasl.parseSchema(
	fs.readFileSync(resolve("test", "source.tasl"), "utf-8")
)

const target = tasl.parseSchema(
	fs.readFileSync(resolve("test", "target.tasl"), "utf-8")
)

const sourceToTarget = tasl.parseMapping(
	fs.readFileSync(resolve("test", "source-to-target.taslx"), "utf-8")
)

test("datasetToGraph is a valid mapping", (t) => {
	tasl.Mapping.validateMapping(dataset, datasetToGraph, graph)
	t.pass()
})

test("round-trip datasetToGraph to binary blob and back", (t) => {
	const data = tasl.encodeMapping(datasetToGraph)
	const mapping = tasl.decodeMapping(data)
	tasl.Mapping.validateMapping(dataset, mapping, graph)
	t.pass()
})

test("graphToDataset is a valid mapping", (t) => {
	tasl.Mapping.validateMapping(graph, graphToDataset, dataset)
	t.pass()
})

test("round-trip graphToDataset to binary blob and back", (t) => {
	const data = tasl.encodeMapping(graphToDataset)
	const mapping = tasl.decodeMapping(data)
	tasl.Mapping.validateMapping(graph, mapping, dataset)
	t.pass()
})

test("sourceToTarget is a valid mapping", (t) => {
	tasl.Mapping.validateMapping(source, sourceToTarget, target)
	t.pass()
})

test("round-trip sourceToTarget to binary blob and back", (t) => {
	const data = tasl.encodeMapping(sourceToTarget)
	const mapping = tasl.decodeMapping(data)
	tasl.Mapping.validateMapping(source, mapping, target)
	t.pass()
})
