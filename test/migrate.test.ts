import test from "ava"

import { resolve } from "node:path"
import * as fs from "node:fs"

import * as tasl from "../src/index.js"

const source = tasl.parseSchema(
	fs.readFileSync(resolve("test", "source.tasl"), "utf-8")
)

const target = tasl.parseSchema(
	fs.readFileSync(resolve("test", "target.tasl"), "utf-8")
)

const sourceToTarget = tasl.parseMapping(
	fs.readFileSync(resolve("test", "source-to-target.taslx"), "utf-8")
)

const instance = JSON.parse(
	fs.readFileSync(resolve("test", "source.instance.json"), "utf-8")
)

test("test migration", (t) => {
	const result = tasl.Mapping.evaluateMapping(
		source,
		sourceToTarget,
		target
	)(instance)
	console.log(JSON.stringify(result, null, "  "))
	tasl.Instance.validateInstance(target, result)
	t.pass()
})
