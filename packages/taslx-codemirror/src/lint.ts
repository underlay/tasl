import { EditorState, Extension } from "@codemirror/next/state"
import { Diagnostic, linter } from "@codemirror/next/lint"
import { EditorView } from "@codemirror/next/view"
import { syntaxTree } from "@codemirror/next/language"
import { SyntaxNode, TreeCursor } from "lezer-tree"

import { Mapping } from "@underlay/apg"

import {
	defaultNamespaces,
	LintError,
	namespacePattern,
	ParseState,
	parseURI,
	uriPattern,
} from "@underlay/taslx-lezer"

export interface UpdateProps {
	errors: number
	state: EditorState
	mapping: Mapping.Mapping
	namespaces: Record<string, string>
}

interface parseState extends ParseState {
	exprs: Record<string, Mapping.Expression[]>
	mapping: Record<string, Mapping.Map>
	diagnostics: Diagnostic[]
}

export function lintView(
	view: EditorView
): UpdateProps & { diagnostics: Diagnostic[] } {
	const cursor = syntaxTree(view.state).cursor()

	const slice = ({ from, to }: SyntaxNode) =>
		view.state.doc.sliceString(from, to)
	const error = (node: SyntaxNode, message: string) =>
		new LintError(node.from, node.to, slice(node), message)

	const state: parseState = {
		slice,
		error,
		namespaces: {},
		exprs: {},
		mapping: {},
		diagnostics: [],
	}

	if (cursor.name === "Mapping") {
		cursor.firstChild()
	} else {
		return {
			errors: 1,
			state: view.state,
			mapping: {},
			namespaces: {},
			diagnostics: [
				{
					from: cursor.from,
					to: cursor.to,
					message: "Syntax error: invalid document",
					severity: "error",
				},
			],
		}
	}

	do {
		if (cursor.type.isError) {
		} else if (cursor.type.name === "Namespace") {
			let namespace = ""

			const term = cursor.node.getChild("Term")
			if (term !== null) {
				namespace = state.slice(term)
				if (!uriPattern.test(namespace)) {
					const { from, to } = term
					const message = `Invalid URI: URIs must match ${uriPattern.source}`
					state.diagnostics.push({ from, to, message, severity: "error" })
				} else if (!namespacePattern.test(namespace)) {
					const { from, to } = term
					const message = "Invalid namespace: namespaces must end in / or #"
					state.diagnostics.push({ from, to, message, severity: "error" })
				}
			}

			const identifier = cursor.node.getChild("Prefix")
			if (identifier !== null) {
				const prefix = state.slice(identifier)
				if (prefix in state.namespaces) {
					const { from, to } = identifier
					const message = `Duplicate namespace: ${prefix}`
					state.diagnostics.push({ from, to, message, severity: "error" })
				} else {
					state.namespaces[prefix] = namespace
				}
			}
		} else if (cursor.type.name === "Expr") {
			const identifier = cursor.node.getChild("ExprName")
			const expressions = cursor.node.getChildren("Expression")
			const exprs = parseExprs(state, expressions)

			if (identifier !== null) {
				const name = state.slice(identifier)
				if (name in state.exprs) {
					const { from, to } = identifier
					const message = `Invalid expression declaration: expression ${name} has already been declared`
					state.diagnostics.push({ from, to, message, severity: "error" })
				} else {
					state.exprs[name] = exprs
				}
			}
		} else if (cursor.type.name === "Map") {
			const terms = cursor.node.getChildren("Term")
			if (terms.length > 0) {
				const key = getURI(state, terms[0])
				if (key !== null) {
					if (key in state.mapping) {
						const { from, to } = terms[0]
						const message = `Invalid map declaration: map ${key} has already been declared`
						state.diagnostics.push({ from, to, message, severity: "error" })
					} else {
						const expressions = cursor.node.getChildren("Expression")
						const source = terms.length > 1 ? getURI(state, terms[1]) : key
						state.mapping[key] = Mapping.map(
							source,
							parseExprs(state, expressions)
						)
					}
				}
			}
		}

		reportChildErrors(state.diagnostics, cursor)
	} while (cursor.nextSibling())

	const namespaces: [string, string][] = Object.entries(
		state.namespaces
	).filter(([_, base]) => base !== null) as [string, string][]

	const sorted = state.diagnostics.sort(
		({ from: a, to: c }, { from: b, to: d }) =>
			a < b ? -1 : b < a ? 1 : c < d ? -1 : d < c ? 1 : 0
	)

	return {
		errors: sorted.length,
		state: view.state,
		mapping: state.mapping,
		namespaces: { ...defaultNamespaces, ...Object.fromEntries(namespaces) },
		diagnostics: sorted,
	}
}

export const makeLinter = (
	onChange?: (props: UpdateProps) => void
): Extension =>
	linter((view: EditorView) => {
		const { diagnostics, ...props } = lintView(view)
		if (onChange !== undefined) {
			onChange(props)
		}
		return diagnostics
	})

function getURI(state: parseState, node: SyntaxNode): string {
	try {
		return parseURI(state, node)
	} catch (e) {
		if (e instanceof LintError) {
			const { from, to, message, value } = e
			state.diagnostics.push({ from, to, message, severity: "error" })
			return value
		} else {
			throw e
		}
	}
}

const parseExprs = (state: parseState, nodes: SyntaxNode[]) =>
	nodes.reduce<Mapping.Expression[]>(
		(prev, node) => prev.concat(parseExpr(state, node)),
		[]
	)

// Variable | Optional | Reference | Unit | Iri | Literal | Product | Coproduct
function parseExpr(state: parseState, node: SyntaxNode): Mapping.Expression[] {
	if (node.name === "Variable") {
		const value = state.slice(node)
		if (value in state.exprs) {
			return state.exprs[value]
		} else {
			const { from, to } = node
			const message = `Expression ${value} is not defined`
			state.diagnostics.push({ from, to, message, severity: "error" })
			return []
		}
	} else if (node.name === "Dereference") {
		const term = node.getChild("Term")
		if (term === null) {
			return []
		}

		const key = getURI(state, term)
		return [Mapping.dereference(key)]
	} else if (node.name === "Projection") {
		const term = node.getChild("Term")
		if (term === null) {
			return []
		}

		const key = getURI(state, term)
		return [Mapping.projection(key)]
	} else if (node.name === "Injection") {
		const term = node.getChild("Term")
		if (term === null) {
			return []
		}

		const key = getURI(state, term)
		return [Mapping.injection(key)]
	} else if (node.name === "Identifier") {
		const term = node.getChild("Term")
		if (term === null) {
			return []
		}

		const key = getURI(state, term)
		return [Mapping.identifier(key)]
	} else if (node.name === "Constant") {
		const string = node.getChild("String")
		const value =
			string === null ? '""' : (JSON.parse(state.slice(string)) as string)

		const term = node.getChild("Term")
		if (term === null) {
			return []
		}

		const key = getURI(state, term)
		return [Mapping.constant(value, key)]
	} else if (node.name === "Tuple") {
		const slots: Record<string, Mapping.Expression[]> = {}
		for (const slot of node.getChildren("Slot")) {
			const term = slot.getChild("Term")
			if (term === null) {
				continue
			}

			const key = getURI(state, term)
			if (key in slots) {
				const { from, to } = term
				const message = `Duplicate tuple slot key`
				state.diagnostics.push({ from, to, message, severity: "error" })
			}

			const expressions = slot.getChildren("Expression")
			slots[key] = parseExprs(state, expressions)
		}

		return [Mapping.tuple(slots)]
	} else if (node.name === "Match") {
		const cases: Record<string, Mapping.Expression[]> = {}
		for (const CASE of node.getChildren("Case")) {
			const term = CASE.getChild("Term")
			if (term === null) {
				continue
			}

			const key = getURI(state, term)
			if (key in cases) {
				const { from, to } = term
				const message = `Duplicate match case key`
				state.diagnostics.push({ from, to, message, severity: "error" })
			}

			const expressions = CASE.getChildren("Expression")
			cases[key] = parseExprs(state, expressions)
		}

		return [Mapping.match(cases)]
	} else {
		throw new Error("Unexpected Expression node")
	}
}

function reportChildErrors(diagnostics: Diagnostic[], cursor: TreeCursor) {
	if (cursor.type.isError) {
		const { from, to } = cursor
		const message = `Syntax error: unexpected or missing token (that's all we know)`
		diagnostics.push({ from, to, message, severity: "error" })
	}
	if (cursor.firstChild()) {
		do {
			reportChildErrors(diagnostics, cursor)
		} while (cursor.nextSibling())
		cursor.parent()
	}
}
