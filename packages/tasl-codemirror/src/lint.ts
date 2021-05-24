import { Extension, StateEffect, StateField } from "@codemirror/next/state"
import { Diagnostic, setDiagnostics } from "@codemirror/next/lint"
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/next/view"
import { syntaxTree } from "@codemirror/next/language"
import { SyntaxNode, TreeCursor } from "lezer-tree"

import { ul } from "@underlay/namespaces"
import { Schema } from "@underlay/apg"

import {
	defaultTypes,
	defaultNamespaces,
	LintError,
	ParseState,
	parseURI,
} from "@underlay/tasl-lezer"
import { errorUnit } from "./error.js"

export interface SchemaProps {
	errorCount: number
	schema: Schema.Schema
	namespaces: Record<string, string>
}

interface parseState extends ParseState {
	references: { from: number; to: number; key: string }[]
	types: Record<string, Schema.Type>
	schema: Record<string, Schema.Type>
}

export function lintView({
	state,
}: EditorView): SchemaProps & { diagnostics: Diagnostic[] } {
	const cursor = syntaxTree(state).cursor()

	const slice = ({ from, to }: SyntaxNode) => state.doc.sliceString(from, to)
	const error = (node: SyntaxNode, message: string) =>
		new LintError(node.from, node.to, slice(node), message)

	const parseState: parseState = {
		slice,
		error,
		namespaces: {},
		references: [],
		types: { ...defaultTypes },
		schema: {},
	}

	const diagnostics: Diagnostic[] = []

	if (cursor.name === "Schema") {
		cursor.firstChild()
	} else {
		diagnostics.push({
			from: cursor.from,
			to: cursor.to,
			message: "Syntax error: invalid document",
			severity: "error",
		})
		return { errorCount: 1, schema: {}, namespaces: {}, diagnostics }
	}

	do {
		if (cursor.type.isError) {
		} else if (cursor.type.name === "Namespace") {
			let namespace = ""

			const term = cursor.node.getChild("NamespaceURI")
			if (term !== null) {
				namespace = parseState.slice(term)
			}

			const identifier = cursor.node.getChild("NamespaceName")
			if (identifier !== null) {
				const prefix = parseState.slice(identifier)
				if (prefix in parseState.namespaces) {
					const { from, to } = identifier
					const message = `duplicate namespace: ${prefix}`
					diagnostics.push({ from, to, message, severity: "error" })
				} else {
					parseState.namespaces[prefix] = namespace
				}
			}
		} else if (cursor.type.name === "Type") {
			const identifier = cursor.node.getChild("TypeName")
			const expression = cursor.node.getChild("Expression")
			const type =
				expression === null
					? errorUnit
					: getType(parseState, diagnostics, expression)
			if (identifier !== null) {
				const name = parseState.slice(identifier)
				if (name in parseState.types) {
					const { from, to } = identifier
					const message = `type ${name} has already been declared`
					diagnostics.push({ from, to, message, severity: "error" })
				} else {
					parseState.types[name] = type
				}
			}
		} else if (cursor.type.name === "Class") {
			const term = cursor.node.getChild("Term")
			if (term !== null) {
				const uri = getURI(parseState, diagnostics, term)
				if (uri !== null) {
					if (uri in parseState.schema) {
						const { from, to } = term
						const message = `class ${uri} has already been declared`
						diagnostics.push({ from, to, message, severity: "error" })
					} else {
						const expression = cursor.node.getChild("Expression")
						parseState.schema[uri] =
							expression === null
								? errorUnit
								: getType(parseState, diagnostics, expression)
					}
				}
			}
		} else if (cursor.type.name === "Edge") {
			const [term, source, target] = cursor.node.getChildren("Term")!
			if (term !== undefined) {
				const key = getURI(parseState, diagnostics, term)
				if (key in parseState.schema) {
					const { from, to } = term
					const message = `class ${key} has already been declared`
					diagnostics.push({ from, to, message, severity: "error" })
				}

				if (source !== undefined) {
					const sourceURI = getURI(parseState, diagnostics, source)

					if (!(sourceURI in parseState.schema)) {
						const { from, to } = source
						parseState.references.push({ from, to, key: sourceURI })
					}

					if (target !== undefined) {
						const targetURI = getURI(parseState, diagnostics, target)

						if (!(targetURI in parseState.schema)) {
							const { from, to } = target
							parseState.references.push({ from, to, key: targetURI })
						}

						const components: Record<string, Schema.Type> = {
							[ul.source]: Schema.reference(sourceURI),
							[ul.target]: Schema.reference(targetURI),
						}

						const expression = cursor.node.getChild("Expression")
						if (expression !== null) {
							const type = getType(parseState, diagnostics, expression)
							components[ul.value] = type
						}

						parseState.schema[key] = Schema.product(components)
					}
				}
			}
		}

		reportChildErrors(diagnostics, cursor)
	} while (cursor.nextSibling())

	for (const { from, to, key } of parseState.references) {
		if (key in parseState.schema) {
			continue
		} else {
			const message = `class ${key} is not defined`
			diagnostics.push({ from, to, message, severity: "error" })
		}
	}

	const sorted = diagnostics.sort(({ from: a, to: c }, { from: b, to: d }) =>
		a < b ? -1 : b < a ? 1 : c < d ? -1 : d < c ? 1 : 0
	)

	return {
		errorCount: sorted.length,
		schema: parseState.schema,
		namespaces: { ...defaultNamespaces, ...parseState.namespaces },
		diagnostics: sorted,
	}
}

function getURI(
	state: parseState,
	diagnostics: Diagnostic[],
	node: SyntaxNode
): string {
	try {
		return parseURI(state, node)
	} catch (e) {
		if (e instanceof LintError) {
			const { from, to, message, value } = e
			diagnostics.push({ from, to, message, severity: "error" })
			return value
		} else {
			throw e
		}
	}
}

// Variable | Optional | Reference | Unit | Iri | Literal | Product | Coproduct
function getType(
	state: parseState,
	diagnostics: Diagnostic[],
	node: SyntaxNode
): Schema.Type {
	if (node.name === "Variable") {
		const value = state.slice(node)
		if (value in state.types) {
			return state.types[value]
		} else {
			const { from, to } = node
			const message = `Type ${value} is not defined`
			diagnostics.push({ from, to, message, severity: "error" })
			return errorUnit
		}
	} else if (node.name === "Optional") {
		const expression = node.getChild("Expression")
		const type =
			expression === null ? errorUnit : getType(state, diagnostics, expression)
		return Schema.coproduct({ [ul.none]: Schema.product({}), [ul.some]: type })
	} else if (node.name === "Reference") {
		const term = node.getChild("Term")
		if (term === null) {
			return errorUnit
		}

		const key = getURI(state, diagnostics, term)
		if (!(key in state.schema)) {
			const { from, to } = term
			state.references.push({ from, to, key })
		}

		return Schema.reference(key)
	} else if (node.name === "URI") {
		return Schema.uri()
	} else if (node.name === "Literal") {
		const term = node.getChild("Term")
		if (term === null) {
			return errorUnit
		}
		const datatype = getURI(state, diagnostics, term)
		return Schema.literal(datatype)
	} else if (node.name === "Product") {
		const components: Record<string, Schema.Type> = {}
		for (const component of node.getChildren("Component")) {
			const term = component.getChild("Term")
			if (term === null) {
				continue
			}

			const key = getURI(state, diagnostics, term)
			if (key in components) {
				const { from, to } = term
				const message = `Duplicate product component key`
				diagnostics.push({ from, to, message, severity: "error" })
			}

			const expression = component.getChild("Expression")
			components[key] =
				expression === null
					? errorUnit
					: getType(state, diagnostics, expression)
		}

		return Schema.product(components)
	} else if (node.name === "Coproduct") {
		const options: Record<string, Schema.Type> = {}
		for (const option of node.getChildren("Option")) {
			const term = option.getChild("Term")
			if (term === null) {
				continue
			}

			const key = getURI(state, diagnostics, term)
			if (key in options) {
				const { from, to } = term
				const message = `duplicate coproduct option key`
				diagnostics.push({ from, to, message, severity: "error" })
			}

			const expression = option.getChild("Expression")
			options[key] =
				expression === null
					? Schema.product({})
					: getType(state, diagnostics, expression)
		}

		return Schema.coproduct(options)
	} else {
		throw new Error("unexpected expression node")
	}
}

function reportChildErrors(diagnostics: Diagnostic[], cursor: TreeCursor) {
	if (cursor.type.isError) {
		const { from, to } = cursor
		const message = `unexpected or missing token (that's all we know)`
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

const setSchemaEffect = StateEffect.define<Readonly<SchemaProps>>()

export const SchemaState = StateField.define<Readonly<SchemaProps>>({
	create() {
		return { errorCount: 0, schema: {}, namespaces: defaultNamespaces }
	},
	update(value, tr) {
		return tr.effects.reduce<SchemaProps>(
			(value, effect) => (effect.is(setSchemaEffect) ? effect.value : value),
			value
		)
	},
})

export const linter: Extension = [
	SchemaState,
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
					this.view.dispatch(
						{ effects: [setSchemaEffect.of(props)] },
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
