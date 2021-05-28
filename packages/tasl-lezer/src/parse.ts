import { SyntaxNode } from "lezer"
import { Schema } from "@underlay/apg"
import { ul } from "@underlay/namespaces"

import { parser } from "../grammar/tasl.js"

import { LintError, ParseState, parseURI, printSyntax } from "./utils.js"
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

	if (cursor.name === "Schema") {
		cursor.firstChild()
	} else {
		throw error(cursor.node, "Invalid top-level node")
	}

	do {
		if (cursor.type.name === "Namespace") {
			const identifier = cursor.node.getChild("NamespaceName")!
			const prefix = state.slice(identifier)

			const uri = cursor.node.getChild("NamespaceURI")!
			const namespace = state.slice(uri)

			if (prefix in state.namespaces) {
				throw state.error(
					identifier,
					`namespace ${prefix} has already been delared`
				)
			} else {
				state.namespaces[prefix] = namespace
			}
		} else if (cursor.type.name === "Type") {
			const identifier = cursor.node.getChild("TypeName")!
			const expression = cursor.node.getChild("Expression")!
			const type = parseType(state, expression)

			const name = state.slice(identifier)
			if (name in state.types) {
				throw state.error(identifier, `type ${name} has already been declared`)
			} else {
				state.types[name] = type
			}
		} else if (cursor.type.name === "Class") {
			const node = cursor.node.getChild("Term")!
			const term = parseURI(state, node)!
			if (term in state.schema) {
				throw state.error(node, `class ${term} has already been declared`)
			} else {
				const expression = cursor.node.getChild("Expression")!
				state.schema[term] = parseType(state, expression)
			}
		} else if (cursor.type.name === "Edge") {
			const [term, source, target] = cursor.node.getChildren("Term")!
			const key = parseURI(state, term)
			const sourceURI = parseURI(state, source)
			const targetURI = parseURI(state, target)

			const expression = cursor.node.getChild("Expression")
			const value = expression && parseType(state, expression)

			if (key in state.schema) {
				throw state.error(term, `class ${key} has already been declared`)
			}

			if (!(sourceURI in state.schema)) {
				const { from, to } = source
				state.references.push({ from, to, key: sourceURI })
			}

			if (!(targetURI in state.schema)) {
				const { from, to } = target
				state.references.push({ from, to, key: targetURI })
			}

			const components: Record<string, Schema.Type> = {
				[ul.source]: Schema.reference(sourceURI),
				[ul.target]: Schema.reference(targetURI),
			}

			if (value !== null) {
				components[ul.value] = value
			}

			state.schema[key] = Schema.product(components)
		}
	} while (cursor.nextSibling())

	for (const { from, to, key } of state.references) {
		if (key in state.schema) {
			continue
		} else {
			const message = `class ${key} is not defined`
			throw new LintError(from, to, key, message)
		}
	}

	return { schema: Schema.schema(state.schema), namespaces: state.namespaces }
}

// Variable | Optional | Reference | URI | Literal | Product | Coproduct
export function parseType(state: parseState, node: SyntaxNode): Schema.Type {
	if (node.name === "Variable") {
		const value = state.slice(node)
		if (value in state.types) {
			return state.types[value]
		} else {
			throw state.error(node, `type ${value} is not defined`)
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
	} else if (node.name === "URI") {
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
				throw state.error(term, `duplicate product component key: ${key}`)
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
				throw state.error(term, `duplicate coproduct option key: ${key}`)
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
		throw state.error(node, "unexpected expression node")
	}
}
