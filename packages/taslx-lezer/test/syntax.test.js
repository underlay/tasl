import { parser } from "../grammar/taslx.js"

import { matchTree } from "./utils.js"

test("Single comment", () => {
	const tree = parser.parse(`# this is a comment`)
	expect(tree.type.name).toBe("Mapping")
	expect(tree.children.length).toBe(1)
	expect(tree.children[0].type.name).toBe("Comment")
})

test("Several comments", () => {
	const tree = parser.parse(`# this is a comment
# and another comment

#a last comment
`)

	matchTree(tree, ["Mapping", "Comment", "Comment", "Comment"])
})

test("Single namespace", () => {
	const tree = parser.parse(`namespace schema http://schema.org/`)
	matchTree(tree, ["Mapping", "Namespace", "namespace", "Prefix", "Term"])
})

test("Single variable", () => {
	const tree = parser.parse(`expr foo {}`)
	matchTree(tree, ["Mapping", "Expr", "expr", "ExprName", "Tuple"])
})

test("Simple map", () => {
	const tree = parser.parse(`map ex:foo :: ex:bar / ex:baz`)
	matchTree(tree, [
		"Mapping",
		"Map",
		"map",
		"Term",
		"Term",
		"Projection",
		"Projector",
		"Term",
	])
})

test("Medium map", () => {
	const tree = parser.parse(
		`map ex:foo :: ex:bar [ ex:hello; ex:world >- * ex:a | / ex:b | \\ ex:cool ]`
	)

	matchTree(tree, [
		"Mapping",
		"Map",
		"map",
		"Term",
		"Term",
		"Match",
		"Case",
		"Term",
		"Case",
		"Term",
		"Dereference",
		"Pointer",
		"Term",
		"Projection",
		"Projector",
		"Term",
		"Injection",
		"Injector",
		"Term",
	])
})
