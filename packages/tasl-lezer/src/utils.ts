import { SyntaxNode } from "lezer"

export interface ParseState {
	slice: (node: SyntaxNode) => string
	error: (node: SyntaxNode, message: string) => LintError
	namespaces: Record<string, string>
}

export class LintError extends Error {
	constructor(
		readonly from: number,
		readonly to: number,
		readonly value: string,
		message: string
	) {
		super(message)
	}
}

export function parseURI(state: ParseState, node: SyntaxNode): string {
	const value = state.slice(node)
	if (node.type.name === "AbsoluteTerm") {
		return value.slice(1, -1)
	} else if (node.type.name === "NamespaceTerm") {
		const index = value.indexOf(":")
		const prefix = value.slice(0, index)
		if (prefix in state.namespaces) {
			return state.namespaces[prefix] + value.slice(index + 1)
		} else {
			throw state.error(node, `namespace ${prefix} is not defined`)
		}
	} else {
		throw state.error(node, "unexpected syntax")
	}
}

export function printSyntax(node: SyntaxNode, prefix: string = "") {
	console.log(`${prefix}- ${node.type.name} ${node.from} ${node.to}`)
	for (let child = node.firstChild; child !== null; child = child.nextSibling) {
		printSyntax(child, prefix + "  ")
	}
}
