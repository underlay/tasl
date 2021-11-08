import { parser } from "lezer-tasl"
import type { SyntaxNode } from "@lezer/common"

import * as Schema from "../../schema/index.js"
import * as std from "../../schema/std.js"

const p = parser.configure({ strict: true })

/**
 * Parse a schema from a .tasl file.
 * @param {string} input the tasl source string
 * @returns {Schema.Schema}
 */
export function parseSchema(input: string): Schema.Schema {
	const tree = p.parse(input)
	if (tree.topNode.name !== "Schema") {
		throw new Error()
	}

	const namespaces: Record<string, string> = {}
	const environment: Record<string, Schema.Type> = { uri: Schema.uri(), ...std }

	const slice = ({ from, to }: SyntaxNode) => input.slice(from, to)

	function getTerm(node: SyntaxNode): string {
		const value = slice(node)
		const index = value.indexOf(":")
		const prefix = value.slice(0, index)
		if (prefix in namespaces) {
			return namespaces[prefix] + value.slice(index + 1)
		} else {
			throw new Error(
				`invalid term "${value}"" - no namespace with prefix ${prefix} has been declared`
			)
		}
	}

	function parseType(node: SyntaxNode): Schema.Type {
		if (node.name === "Type") {
			const id = slice(node)
			const type = environment[id]
			if (type === undefined) {
				console.error(id, environment)
				throw new Error(
					`invalid type variable - no type with name "${id}"" has been declared`
				)
			}

			return type
		} else if (node.name === "URI") {
			return Schema.uri()
		} else if (node.name === "Literal") {
			const term = node.getChild("Term")
			if (term === null) {
				throw new Error("internal parse error - missing Literal/Term node")
			}

			const datatype = getTerm(term)
			return Schema.literal(datatype)
		} else if (node.name === "Product") {
			const components: Schema.Components = {}
			const entries = node.getChildren("Component")
			for (const entry of entries) {
				const term = entry.getChild("Term")
				if (term === null) {
					throw new Error("internal parse error - missing Component/Term node")
				}

				const key = getTerm(term)
				if (key in components) {
					throw new Error(`duplicate component key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					throw new Error(
						"internal parse error - missing Component/Expression node"
					)
				}

				components[key] = parseType(expression)
			}

			return Schema.product(components)
		} else if (node.name === "Coproduct") {
			const options: Schema.Options = {}
			const entries = node.getChildren("Option")
			for (const entry of entries) {
				const term = entry.getChild("Term")
				if (term === null) {
					throw new Error("internal parse error - missing Option/Term node")
				}

				const key = getTerm(term)
				if (key in options) {
					throw new Error(`duplicate option key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					options[key] = Schema.unit
				} else {
					options[key] = parseType(expression)
				}
			}

			return Schema.coproduct(options)
		} else if (node.name === "Reference") {
			const term = node.getChild("Term")
			if (term === null) {
				throw new Error("internal parse error - missing Reference/Term node")
			}

			const key = getTerm(term)
			return Schema.reference(key)
		} else {
			throw new Error(
				`internal parser error - invalid expression node name "${node.name}""`
			)
		}
	}

	const schema: Schema.Schema = {}
	for (
		let node = tree.topNode.firstChild;
		node !== null;
		node = node.nextSibling
	) {
		if (node.name === "Comment") {
			continue
		} else if (node.name === "NamespaceDefinition") {
			const identifier = node.getChild("Prefix")
			if (identifier === null) {
				throw new Error(
					"internal parse error - missing NamespaceDefinition/Prefix node"
				)
			}

			const namespaceURI = node.getChild("NamespaceURI")
			if (namespaceURI === null) {
				throw new Error(
					"internal parse error - missing NamespaceDefinition/NamespaceURI node"
				)
			}

			namespaces[slice(identifier)] = slice(namespaceURI)
		} else if (node.name === "TypeDefinition") {
			const name = node.getChild("Name")
			if (name === null) {
				throw new Error(
					"internal parse error - missing TypeDefinition/Name node"
				)
			}

			const expression = node.getChild("Expression")
			if (expression === null) {
				throw new Error(
					"internal parse error - missing TypeDefinition/Expression node"
				)
			}

			environment[slice(name)] = parseType(expression)
		} else if (node.name === "ClassDeclaration") {
			const term = node.getChild("Term")
			if (term === null) {
				throw new Error(
					"internal parse error - missing ClassDeclaration/Term node"
				)
			}

			const key = getTerm(term)

			if (key in schema) {
				throw new Error(`duplicate class key ${key}`)
			}

			const expression = node.getChild("Expression")
			if (expression === null) {
				throw new Error(
					"internal parse error - missing ClassDeclaration/Expression node"
				)
			}

			schema[key] = parseType(expression)
		} else {
			throw new Error(
				`internal parser error - invalid statement node name "${node.name}""`
			)
		}
	}

	return schema
}
