import { Extension, StateEffect, StateField } from "@codemirror/next/state"
import { Diagnostic, setDiagnostics } from "@codemirror/next/lint"
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/next/view"
import { syntaxTree } from "@codemirror/next/language"
import { SyntaxNode, TreeCursor } from "lezer-tree"

import { Mapping } from "@underlay/apg"

import {
	defaultNamespaces,
	LintError,
	ParseState,
	parseURI,
} from "@underlay/taslx-lezer"

export interface MappingProps {
	errorCount: number
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
): MappingProps & { diagnostics: Diagnostic[] } {
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
			errorCount: 1,
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
			}

			const identifier = cursor.node.getChild("Prefix")
			if (identifier !== null) {
				const prefix = state.slice(identifier)
				if (prefix in state.namespaces) {
					const { from, to } = identifier
					const message = `namespace ${prefix} has already been declared`
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
					const message = `expression ${name} has already been declared`
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
						const message = `map ${key} has already been declared`
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
		errorCount: sorted.length,
		mapping: state.mapping,
		namespaces: { ...defaultNamespaces, ...Object.fromEntries(namespaces) },
		diagnostics: sorted,
	}
}

// export const makeLinter = (
// 	onChange?: (props: UpdateProps) => void
// ): Extension =>
// 	linter((view: EditorView) => {
// 		const { diagnostics, ...props } = lintView(view)
// 		if (onChange !== undefined) {
// 			onChange(props)
// 		}
// 		return diagnostics
// 	})

// export const linterExtension = makeLinter((view: EditorView) => {
// 	const { diagnostics, ...props } = lintView(view)
// 	return diagnostics
// })

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

const LintDelay = 500

const setMappingEffect = StateEffect.define<Readonly<MappingProps>>()

export const MappingState = StateField.define<Readonly<MappingProps>>({
	create() {
		return { errorCount: 0, mapping: {}, namespaces: defaultNamespaces }
	},
	update(value, tr) {
		return tr.effects.reduce<MappingProps>(
			(value, effect) => (effect.is(setMappingEffect) ? effect.value : value),
			value
		)
	},
})

export const linter: Extension = [
	MappingState,
	ViewPlugin.fromClass(
		class {
			public lintTime = Date.now() + LintDelay
			public set = true

			constructor(readonly view: EditorView) {
				this.run = this.run.bind(this)
				setTimeout(this.run, LintDelay)
			}

			run() {
				const now = Date.now()
				if (now < this.lintTime - 10) {
					setTimeout(this.run, this.lintTime - now)
				} else {
					this.set = false
					const { diagnostics, ...props } = lintView(this.view)
					// const { errorCount } = this.view.state.field(mappingState)
					this.view.dispatch(
						{ effects: [setMappingEffect.of(props)] },
						setDiagnostics(this.view.state, diagnostics)
					)
				}
			}

			update(update: ViewUpdate) {
				if (update.docChanged) {
					this.lintTime = Date.now() + LintDelay
					if (!this.set) {
						this.set = true
						setTimeout(this.run, LintDelay)
					}
				}
			}
		}
	),
]
