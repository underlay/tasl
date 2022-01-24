import { parser } from "lezer-taslx"
import type { SyntaxNode } from "@lezer/common"

import { Schema } from "../schema/index.js"

import { Mapping } from "./mapping.js"
import * as expressions from "./expressions/index.js"

const strictParser = parser.configure({ strict: true })

export function parseMapping(
	source: Schema,
	target: Schema,
	input: string
): Mapping {
	const tree = strictParser.parse(input)
	if (tree.topNode.name !== "Mapping") {
		throw new Error()
	}

	const namespaces: Record<string, string> = {}

	const slice = ({ from, to }: SyntaxNode) => input.slice(from, to)

	function getURI(node: SyntaxNode): string {
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

	function parsePath(node: SyntaxNode): Mapping.Term {
		const identifier = node.getChild("Identifier")
		if (identifier === null) {
			throw new Error("internal parse error - missing Value/Identifier node")
		}

		const id = slice(identifier)
		const segments = node.getChildren("Segment")
		return segments.reduce<Mapping.Term>((term, segment) => {
			if (segment.name === "Projection") {
				const key = segment.getChild("Key")
				if (key === null) {
					throw new Error("internal parse error - missing Projection/Key node")
				}

				return expressions.projection(getURI(key), term)
			} else if (segment.name === "Dereference") {
				const key = segment.getChild("Key")
				if (key === null) {
					throw new Error("internal parse error - missing Dereference/Key node")
				}

				return expressions.dereference(getURI(key), term)
			} else {
				throw new Error(
					`internal parse error - invalid path node name "${segment.name}""`
				)
			}
		}, expressions.variable(id))
	}

	function parseExpression(node: SyntaxNode): Mapping.Expression {
		if (node.name === "URI") {
			const value = slice(node).slice(1, -1)
			return expressions.uri(value)
		} else if (node.name === "Literal") {
			const string = node.getChild("String")
			if (string === null) {
				throw new Error("internal parse error - missing Literal/String node")
			}

			const value = JSON.parse(slice(string))
			return expressions.literal(value)
		} else if (node.name === "Path") {
			return parsePath(node)
		} else if (node.name === "Construction") {
			const components: { [K in string]: Mapping.Expression } = {}
			const entries = node.getChildren("Slot")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error - missing Slot/Key node")
				}

				const key = getURI(term)
				if (key in components) {
					throw new Error(`duplicate slot key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					throw new Error("internal parse error - missing Slot/Expression node")
				}

				const injections = entry.getChildren("Injection")
				components[key] = parseInjections(
					parseExpression(expression),
					injections
				)
			}

			return expressions.product(components)
		} else if (node.name === "Match") {
			const path = node.getChild("Path")
			if (path === null) {
				throw new Error("internal parse error - missing Match/Value node")
			}

			const cases: {
				[K in string]: { id: string; value: Mapping.Expression }
			} = {}

			const entries = node.getChildren("Case")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error - missing Case/Key node")
				}

				const key = getURI(term)
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
					value: parseInjections(parseExpression(expression), injections),
				}
			}

			return expressions.match(parsePath(path), cases)
		} else {
			throw new Error(
				`internal parse error - invalid value node name "${node.name}"`
			)
		}
	}

	const parseInjections = (
		expression: Mapping.Expression,
		injections: SyntaxNode[]
	) =>
		injections.reduce<Mapping.Expression>((expression, injection) => {
			const key = injection.getChild("Key")
			if (key === null) {
				throw new Error("internal parse error - missing Injection/Key node")
			}

			return expressions.coproduct(getURI(key), expression)
		}, expression)

	const mapping: {
		[K in string]: { id: string; source: string; value: Mapping.Expression }
	} = {}

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

			const namespace = node.getChild("Namespace")
			if (namespace === null) {
				throw new Error(
					"internal parse error - missing NamespaceDefinition/Namespace node"
				)
			}

			const id = slice(identifier)
			namespaces[id] = slice(namespace)
		} else if (node.name === "MapDeclaration") {
			const target = node.getChild("Target")
			if (target === null) {
				throw new Error(
					"internal parse error - missing MapDeclaration/Target node"
				)
			}

			const key = getURI(target)
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
				source: getURI(source),
				id: slice(identifier),
				value: parseInjections(parseExpression(expression), injections),
			}
		} else {
			throw new Error(
				`internal parser error - invalid statement node name "${node.name}""`
			)
		}
	}

	return new Mapping(
		source,
		target,
		Object.entries(mapping).map(([target, map]) => ({ target, ...map }))
	)
}
