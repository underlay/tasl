import { parser } from "lezer-taslx"
import type { SyntaxNode } from "@lezer/common"

import * as Mapping from "../../mapping/index.js"

const p = parser.configure({ strict: true })

/**
 * Parse a mapping from a .taslx file
 * @param {string} input the taslx source string
 * @returns {Mapping.Mapping}
 */
export function parseMapping(input: string): Mapping.Mapping {
	const tree = p.parse(input)
	if (tree.topNode.name !== "Mapping") {
		throw new Error()
	}

	const namespaces: Record<string, string> = {}

	const slice = ({ from, to }: SyntaxNode) => input.slice(from, to)

	function getTerm(node: SyntaxNode): string {
		const value = slice(node)
		const index = value.indexOf(":")
		const prefix = value.slice(0, index)
		if (prefix in namespaces) {
			return namespaces[prefix] + value.slice(index + 1)
		} else {
			throw new Error(
				`invalid term "${value}" - no namespace with prefix ${prefix} has been declared`
			)
		}
	}

	function parseValue(node: SyntaxNode): Mapping.Value {
		const identifier = node.getChild("Identifier")
		if (identifier === null) {
			throw new Error("internal parse error - missing Value/Identifier node")
		}

		const id = slice(identifier)
		const path = node.getChildren("Path")
		return path.reduce<Mapping.Value>(
			(value, node) => {
				if (node.name === "Projection") {
					const key = node.getChild("Key")
					if (key === null) {
						throw new Error(
							"internal parse error - missing Projection/Key node"
						)
					}

					return { kind: "projection", key: getTerm(key), value }
				} else if (node.name === "Dereference") {
					const key = node.getChild("Key")
					if (key === null) {
						throw new Error(
							"internal parse error - missing Dereference/Key node"
						)
					}

					return { kind: "dereference", key: getTerm(key), value }
				} else {
					throw new Error(
						`internal parse error - invalid path node name "${node.name}""`
					)
				}
			},
			{ kind: "variable", id }
		)
	}

	function parseExpression(node: SyntaxNode): Mapping.Expression {
		if (node.name === "URI") {
			const value = slice(node)
			return { kind: "uri", value: value.slice(1, -1) }
		} else if (node.name === "Literal") {
			const value = slice(node)
			return { kind: "literal", value: JSON.parse(value) }
		} else if (node.name === "Value") {
			return parseValue(node)
		} else if (node.name === "Construction") {
			const slots: Mapping.Slots = {}
			const entries = node.getChildren("Slot")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error - missing Slot/Key node")
				}

				const key = getTerm(term)
				if (key in slots) {
					throw new Error(`duplicate slot key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					throw new Error("internal parse error - missing Slot/Expression node")
				}

				const injections = entry.getChildren("Injection")
				slots[key] = parseInjections(parseExpression(expression), injections)
			}

			return { kind: "construction", slots }
		} else if (node.name === "Match") {
			const value = node.getChild("Value")
			if (value === null) {
				throw new Error("internal parse error - missing Match/Value node")
			}

			const cases: Mapping.Cases = {}
			const entries = node.getChildren("Case")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error - missing Case/Key node")
				}

				const key = getTerm(term)
				if (key in cases) {
					throw new Error(`duplicate case key ${key}`)
				}

				const identifier = entry.getChild("Identifier")
				if (identifier === null) {
					throw new Error("internal parse error - missing Case/Identifier node")
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					throw new Error("internal parse error - missing Case/Expression node")
				}

				const injections = entry.getChildren("Injection")
				cases[key] = {
					id: slice(identifier),
					expression: parseInjections(parseExpression(expression), injections),
				}
			}

			return { kind: "match", value: parseValue(value), cases }
		} else {
			throw new Error(
				`internal parse error - invalid value node name "${node.name}"`
			)
		}
	}

	function parseInjections(
		expression: Mapping.Expression,
		injections: SyntaxNode[]
	): Mapping.Expression {
		return injections.reduce<Mapping.Expression>((e, injection) => {
			const key = injection.getChild("Key")
			if (key === null) {
				throw new Error("internal parse error - missing Injection/Key node")
			}

			return { kind: "injection", key: getTerm(key), expression: e }
		}, expression)
	}

	const mapping: Mapping.Mapping = {}

	for (
		let node = tree.topNode.firstChild;
		node !== null;
		node = node.nextSibling
	) {
		if (node.name === "Comment") {
			continue
		} else if (node.name === "NamespaceDefinition") {
			const identifier = node.getChild("Identifier")
			if (identifier === null) {
				throw new Error(
					"internal parse error - missing NamespaceDefinition/Identifier node"
				)
			}

			const namespaceURI = node.getChild("NamespaceURI")
			if (namespaceURI === null) {
				throw new Error(
					"internal parse error - missing NamespaceDefinition/NamespaceURI node"
				)
			}

			const id = slice(identifier)
			namespaces[id] = slice(namespaceURI)
		} else if (node.name === "MapDeclaration") {
			const target = node.getChild("Target")
			if (target === null) {
				throw new Error(
					"internal parse error - missing MapDeclaration/Target node"
				)
			}

			const key = getTerm(target)
			if (key in mapping) {
				throw new Error(`duplicate map key ${key}`)
			}

			const source = node.getChild("Source")
			if (source === null) {
				throw new Error(
					"internal parse error - missing MapDeclaration/Source node"
				)
			}

			const identifier = node.getChild("Identifier")
			if (identifier === null) {
				throw new Error(
					"internal parse error - missing MapDeclaration/Identifier node"
				)
			}

			const expression = node.getChild("Expression")
			if (expression === null) {
				throw new Error(
					"internal parse error - missing MapDeclaration/Expression node"
				)
			}

			const injections = node.getChildren("Injection")
			mapping[key] = {
				source: getTerm(source),
				id: slice(identifier),
				expression: parseInjections(parseExpression(expression), injections),
			}
		} else {
			throw new Error(
				`internal parser error - invalid statement node name "${node.name}""`
			)
		}
	}

	return mapping
}
