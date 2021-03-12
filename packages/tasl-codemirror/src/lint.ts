import { EditorState, Extension } from "@codemirror/next/state"
import { Diagnostic, linter } from "@codemirror/next/lint"
import { EditorView } from "@codemirror/next/view"
import { syntaxTree } from "@codemirror/next/language"
import { SyntaxNode, TreeCursor } from "lezer-tree"

import { Schema } from "@underlay/apg"
import { ul } from "@underlay/namespaces"

import {
	defaultTypes,
	defaultNamespaces,
	LintError,
	namespacePattern,
	ParseState,
	parseURI,
	uriPattern,
} from "@underlay/tasl-lezer"
import { errorUnit } from "./error.js"

export interface UpdateProps {
	errors: number
	state: EditorState
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
}: EditorView): UpdateProps & { diagnostics: Diagnostic[] } {
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
		return { errors: 1, state, schema: {}, namespaces: {}, diagnostics }
	}

	do {
		if (cursor.type.isError) {
		} else if (cursor.type.name === "Namespace") {
			let namespace = ""

			const term = cursor.node.getChild("Term")
			if (term !== null) {
				namespace = parseState.slice(term)
				if (!uriPattern.test(namespace)) {
					const { from, to } = term
					const message = `Invalid URI: URIs must match ${uriPattern.source}`
					diagnostics.push({ from, to, message, severity: "error" })
				} else if (!namespacePattern.test(namespace)) {
					const { from, to } = term
					const message = "Invalid namespace: namespaces must end in / or #"
					diagnostics.push({ from, to, message, severity: "error" })
				}
			}

			const identifier = cursor.node.getChild("Prefix")
			if (identifier !== null) {
				const prefix = parseState.slice(identifier)
				if (prefix in parseState.namespaces) {
					const { from, to } = identifier
					const message = `Duplicate namespace: ${prefix}`
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
					const message = `Invalid type declaration: type ${name} has already been declared`
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
						const message = `Invalid class declaration: class ${uri} has already been declared`
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
			const terms = cursor.node.getChildren("Term")
			const uris = terms.map((uri) => getURI(parseState, diagnostics, uri))
			if (terms.length === 3 && uris.length === 3) {
				const [sourceNode, labelNode, targetNode] = terms
				const [source, label, target] = uris
				if (label in parseState.schema) {
					const { from, to } = labelNode
					const message = `Invalid edge declaration: class ${label} has already been declared`
					diagnostics.push({ from, to, message, severity: "error" })
				}

				if (!(source in parseState.schema)) {
					const { from, to } = sourceNode
					parseState.references.push({ from, to, key: source })
				}

				if (!(target in parseState.schema)) {
					const { from, to } = targetNode
					parseState.references.push({ from, to, key: target })
				}

				const components: Record<string, Schema.Type> = {
					[ul.source]: Schema.reference(source),
					[ul.target]: Schema.reference(target),
				}

				const expression = cursor.node.getChild("Expression")
				if (expression !== null) {
					components[ul.value] = getType(parseState, diagnostics, expression)
				}

				parseState.schema[label] = Schema.product(components)
			}
		} else if (cursor.type.name === "List") {
			const term = cursor.node.getChild("Term")
			const expression = cursor.node.getChild("Expression")
			const head =
				expression === null
					? errorUnit
					: getType(parseState, diagnostics, expression)

			if (term !== null) {
				const uri = getURI(parseState, diagnostics, term)
				if (uri in parseState.schema) {
					const { from, to } = term
					const message = `Invalid list declaration: class ${uri} has already been declared`
					diagnostics.push({ from, to, message, severity: "error" })
				}

				parseState.schema[uri] = Schema.coproduct({
					[ul.none]: Schema.product({}),
					[ul.some]: Schema.coproduct({
						[ul.head]: head,
						[ul.tail]: Schema.reference(uri),
					}),
				})
			}
		}

		reportChildErrors(diagnostics, cursor)
	} while (cursor.nextSibling())

	const namespaces: [string, string][] = Object.entries(
		parseState.namespaces
	).filter(([_, base]) => base !== null) as [string, string][]

	for (const { from, to, key } of parseState.references) {
		if (key in parseState.schema) {
			continue
		} else {
			const message = `Reference error: class ${key} is not defined`
			diagnostics.push({ from, to, message, severity: "error" })
		}
	}

	const sorted = diagnostics.sort(({ from: a, to: c }, { from: b, to: d }) =>
		a < b ? -1 : b < a ? 1 : c < d ? -1 : d < c ? 1 : 0
	)

	return {
		errors: sorted.length,
		state: state,
		schema: parseState.schema,
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
	} else if (node.name === "Uri") {
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
				const message = `Duplicate coproduct option key`
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
