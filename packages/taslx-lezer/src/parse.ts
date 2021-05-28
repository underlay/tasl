import { Mapping } from "@underlay/apg"
import { SyntaxNode } from "lezer"

import { parser } from "../grammar/taslx.js"

import { LintError, parseURI, ParseState } from "./utils.js"

interface parseState extends ParseState {
	mapping: Record<string, Mapping.Map>
	exprs: Record<string, Mapping.Expression[]>
}

export interface ParseResult {
	mapping: Mapping.Mapping
	namespaces: Record<string, string>
}

export function parse(input: string): ParseResult {
	const slice = (node: SyntaxNode) => input.slice(node.from, node.to)
	const error = (node: SyntaxNode, message: string) =>
		new LintError(node.from, node.to, slice(node), message)

	const state: parseState = {
		slice,
		error,
		namespaces: {},
		exprs: {},
		mapping: {},
	}

	const tree = parser.configure({ strict: true }).parse(input)
	const cursor = tree.cursor()

	if (cursor.name === "Mapping") {
		cursor.firstChild()
	} else {
		throw state.error(cursor.node, "Invalid top-level node")
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
		} else if (cursor.type.name === "Map") {
			const target = cursor.node.getChild("Target")!
			const targetURI = target && parseURI(state, target)

			if (targetURI in state.mapping) {
				throw state.error(target, `map ${targetURI} has already been declared`)
			}

			const source = cursor.node.getChild("Source")
			const sourceURI = source === null ? targetURI : parseURI(state, source)
			const expression = cursor.node.getChild("Expression")!
			state.mapping[targetURI] = Mapping.map(
				sourceURI,
				parseExpression(state, expression)
			)
		}
	} while (cursor.nextSibling())

	return {
		mapping: Mapping.mapping(state.mapping),
		namespaces: state.namespaces,
	}
}

// export const parseExpression = (state: parseState, nodes: SyntaxNode[]) =>
// 	nodes.reduce<Mapping.Expression[]>(
// 		(exprs, node) => exprs.concat(parseExpr(state, node)),
// 		[]
// 	)

export function parseExpression(
	state: parseState,
	node: SyntaxNode
): Mapping.Expression[] {
	if (node.name === "Variable") {
		const value = state.slice(node)
		if (value in state.exprs) {
			return state.exprs[value]
		} else {
			throw state.error(node, `Expression ${value} is not defined`)
		}
	} else if (node.name === "Dereference") {
		const term = node.getChild("Term")!
		const key = parseURI(state, term)
		return [Mapping.dereference(key)]
	} else if (node.name === "Projection") {
		const term = node.getChild("Term")!
		const key = parseURI(state, term)
		return [Mapping.projection(key)]
	} else if (node.name === "Injection") {
		const term = node.getChild("Term")!
		const key = parseURI(state, term)
		return [Mapping.injection(key)]
	} else if (node.name === "Identifier") {
		const term = node.getChild("Term")!
		const key = parseURI(state, term)
		return [Mapping.identifier(key)]
	} else if (node.name === "Constant") {
		const string = node.getChild("String")!
		const text = state.slice(string)
		const value = JSON.parse(text)
		if (typeof value !== "string") {
			throw state.error(string, `Invalid constant: ${text}`)
		}
		const term = node.getChild("Term")!
		const datatype = parseURI(state, term)
		return [Mapping.constant(value, datatype)]
	} else if (node.name === "Tuple") {
		const slots: Record<string, Mapping.Expression[]> = {}
		for (const slot of node.getChildren("Slot")) {
			const term = slot.getChild("Term")!
			const key = parseURI(state, term)
			if (key in slots) {
				throw state.error(term, `Duplicate tuple slot key: ${key}`)
			} else {
				const expression = slot.getChild("Expression")!
				slots[key] = parseExpression(state, expression)
			}
		}

		return [Mapping.tuple(slots)]
	} else if (node.name === "Match") {
		const cases: Record<string, Mapping.Expression[]> = {}
		for (const CASE of node.getChildren("Case")) {
			const term = CASE.getChild("Term")!
			const key = parseURI(state, term)
			if (key in cases) {
				throw state.error(term, `Duplicate match case key: ${key}`)
			} else {
				const expression = CASE.getChild("Expression")!
				cases[key] = parseExpression(state, expression)
			}
		}

		return [Mapping.match(cases)]
	} else {
		throw new Error("Unexpected Expression node")
	}
}
