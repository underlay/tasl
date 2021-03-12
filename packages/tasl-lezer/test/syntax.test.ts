import { parser } from "../grammar/tasl.js"
import { matchTree } from "./utils"

test("Single comment", () => {
	const tree = parser.parse(`# this is a comment`)
	expect(tree.type.name).toBe("Schema")
	expect(tree.children.length).toBe(1)
	expect(tree.children[0].type.name).toBe("Comment")
})

test("Several comments", () => {
	const tree = parser.parse(`# this is a comment
# and another comment

#a last comment
`)

	matchTree(tree, ["Schema", "Comment", "Comment", "Comment"])
})

test("Single namespace", () => {
	const tree = parser.parse(`namespace schema http://schema.org/`)
	matchTree(tree, ["Schema", "Namespace", "namespace", "Prefix", "Term"])
})

test("Single variable", () => {
	const tree = parser.parse(`type foo {}`)
	matchTree(tree, ["Schema", "Type", "type", "TypeName", "Product"])
})

test("Simple class", () => {
	const tree = parser.parse(`class foo:bar {}`)
	matchTree(tree, ["Schema", "Class", "class", "Term", "Product"])
})

test("Medium class", () => {
	const tree = parser.parse(`class ex:foo { ex:bar -> <>; ex:baz -> ? <> }`)
	matchTree(tree, [
		"Schema",
		"Class",
		"class",
		"Term",
		"Product",
		"Component",
		"Term",
		"Uri",
		"Component",
		"Term",
		"Optional",
		"Uri",
	])
})

test("Complex class", () => {
	const tree = parser.parse(
		`class foo:bar ? [ex:foo >- <>; ex:bar >- {ex:baz -> fjdkals}]`
	)

	matchTree(tree, [
		"Schema",
		"Class",
		"class",
		"Term",
		"Optional",
		"Coproduct",
		"Option",
		"Term",
		"Uri",
		"Option",
		"Term",
		"Product",
		"Component",
		"Term",
		"Variable",
	])
})

test("Edges", () => {
	const tree = parser.parse(`edge ex:foo ==/ ex:bar /=> ex:baz`)
	matchTree(tree, ["Schema", "Edge", "edge", "Term", "Term", "Term"])
})

test("List", () => {
	const tree = parser.parse(`list ex:foo :: <>`)
	matchTree(tree, ["Schema", "List", "list", "Term", "Uri"])
})

test("Enum", () => {
	const tree = parser.parse(`type eeee [ ex:foo; ex:bar; ex:baz ]`)
	matchTree(tree, [
		"Schema",
		"Type",
		"type",
		"TypeName",
		"Coproduct",
		"Option",
		"Term",
		"Option",
		"Term",
		"Option",
		"Term",
	])
})
