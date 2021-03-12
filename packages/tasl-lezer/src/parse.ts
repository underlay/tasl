import { SyntaxNode } from "lezer"
import { Schema } from "@underlay/apg"
import { ul } from "@underlay/namespaces"

import { parser } from "../grammar/tasl.js"
import {
	LintError,
	namespacePattern,
	ParseState,
	parseURI,
	uriPattern,
} from "./utils.js"
import { defaultTypes } from "./stdlib.js"

interface parseState extends ParseState {
	schema: Record<string, Schema.Type>
	types: Record<string, Schema.Type>
	references: { from: number; to: number; key: string }[]
}

export interface ParseResult {
	schema: Schema.Schema
	namespaces: Record<string, string>
}

export function parse(input: string): ParseResult {
	const tree = parser.configure({ strict: true }).parse(input)
	const cursor = tree.cursor()

	if (cursor.name === "Schema") {
		cursor.firstChild()
	} else {
		throw new LintError(cursor.from, cursor.to, "", "Invalid top-level node")
	}

	const slice = ({ from, to }: SyntaxNode) => input.slice(from, to)
	const error = (node: SyntaxNode, message: string) =>
		new LintError(node.from, node.to, slice(node), message)
	const state: parseState = {
		slice,
		error,
		namespaces: {},
		types: { ...defaultTypes },
		schema: {},
		references: [],
	}

	do {
		if (cursor.type.name === "Namespace") {
			const term = cursor.node.getChild("Term")!
			const namespace = state.slice(term)
			if (!uriPattern.test(namespace)) {
				throw state.error(
					term,
					`Invalid URI: URIs must match ${uriPattern.source}`
				)
			} else if (!namespacePattern.test(namespace)) {
				throw state.error(
					term,
					"Invalid namespace: namespaces must end in / or #"
				)
			}

			const identifier = cursor.node.getChild("Prefix")!
			const prefix = state.slice(identifier)
			if (prefix in state.namespaces) {
				throw state.error(identifier, `Duplicate namespace: ${prefix}`)
			} else {
				state.namespaces[prefix] = namespace
			}
		} else if (cursor.type.name === "Type") {
			const identifier = cursor.node.getChild("TypeName")!
			const expression = cursor.node.getChild("Expression")!
			const type = parseType(state, expression)

			const name = state.slice(identifier)
			if (name in state.types) {
				throw state.error(
					identifier,
					`Invalid type declaration: type ${name} has already been declared`
				)
			} else {
				state.types[name] = type
			}
		} else if (cursor.type.name === "Class") {
			const node = cursor.node.getChild("Term")!
			const term = parseURI(state, node)!
			if (term in state.schema) {
				throw state.error(
					node,
					`Invalid class declaration: class ${term} has already been declared`
				)
			} else {
				const expression = cursor.node.getChild("Expression")!
				state.schema[term] = parseType(state, expression)
			}
		} else if (cursor.type.name === "Edge") {
			const terms = cursor.node.getChildren("Term")
			const names = terms.map((uri) => parseURI(state, uri))

			const expression = cursor.node.getChild("Expression")
			const value = expression && parseType(state, expression)

			const [sourceNode, labelNode, targetNode] = terms
			const [source, label, target] = names
			if (label in state.schema) {
				throw state.error(
					labelNode,
					`Invalid edge declaration: class ${label} has already been declared`
				)
			} else {
				if (!(source in state.schema)) {
					const { from, to } = sourceNode
					state.references.push({ from, to, key: source })
				}

				if (!(target in state.schema)) {
					const { from, to } = targetNode
					state.references.push({ from, to, key: target })
				}

				const components: Record<string, Schema.Type> = {
					[ul.source]: Schema.reference(source),
					[ul.target]: Schema.reference(target),
				}

				if (value !== null) {
					components[ul.value] = value
				}

				state.schema[label] = Schema.product(components)
			}
		} else if (cursor.type.name === "List") {
			const node = cursor.node.getChild("Term")!
			const term = parseURI(state, node)!
			if (term in state.schema) {
				throw state.error(
					node,
					`Invalid list declaration: class ${term} has already been declared`
				)
			} else {
				const expression = cursor.node.getChild("Expression")!
				state.schema[term] = Schema.coproduct({
					[ul.none]: Schema.product({}),
					[ul.some]: Schema.product({
						[ul.head]: parseType(state, expression),
						[ul.tail]: Schema.reference(term),
					}),
				})
			}
		}
	} while (cursor.nextSibling())

	for (const { from, to, key } of state.references) {
		if (key in state.schema) {
			continue
		} else {
			const message = `Invalid reference: class ${key} is not defined`
			throw new LintError(from, to, key, message)
		}
	}

	return { schema: Schema.schema(state.schema), namespaces: state.namespaces }
}

// Variable | Optional | Reference  | Uri | Literal | Product | Coproduct
export function parseType(state: parseState, node: SyntaxNode): Schema.Type {
	if (node.name === "Variable") {
		const value = state.slice(node)
		if (value in state.types) {
			return state.types[value]
		} else {
			throw state.error(node, `Type ${value} is not defined`)
		}
	} else if (node.name === "Optional") {
		const expression = node.getChild("Expression")!
		const type = parseType(state, expression)
		return Schema.coproduct({ [ul.none]: Schema.product({}), [ul.some]: type })
	} else if (node.name === "Reference") {
		const term = node.getChild("Term")!
		const key = parseURI(state, term)
		if (!(key in state.schema)) {
			const { from, to } = term
			state.references.push({ from, to, key })
		}

		return Schema.reference(key)
	} else if (node.name === "Uri") {
		return Schema.uri()
	} else if (node.name === "Literal") {
		const term = node.getChild("Term")!
		const datatype = parseURI(state, term)
		return Schema.literal(datatype)
	} else if (node.name === "Product") {
		const components: Record<string, Schema.Type> = {}
		for (const component of node.getChildren("Component")) {
			const term = component.getChild("Term")!

			const key = parseURI(state, term)
			if (key in components) {
				throw state.error(term, `Duplicate product component key: ${key}`)
			} else {
				const expression = component.getChild("Expression")!
				components[key] = parseType(state, expression)
			}
		}

		return Schema.product(components)
	} else if (node.name === "Coproduct") {
		const options: Record<string, Schema.Type> = {}
		for (const option of node.getChildren("Option")) {
			const term = option.getChild("Term")!
			const key = parseURI(state, term)
			if (key in options) {
				throw state.error(term, `Duplicate coproduct option key: ${key}`)
			} else {
				const expression = option.getChild("Expression")
				if (expression === null) {
					options[key] = Schema.product({})
				} else {
					options[key] = parseType(state, expression)
				}
			}
		}
		return Schema.coproduct(options)
	} else {
		throw new Error("Unexpected Expression node")
	}
}
