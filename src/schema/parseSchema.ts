import { parser } from "lezer-tasl"
import type { SyntaxNode } from "@lezer/common"

import { Schema } from "./schema.js"
import { types } from "./types.js"

const p = parser.configure({ strict: true })

export function parseSchema(input: string): Schema {
	const tree = p.parse(input)
	if (tree.topNode.name !== "Schema") {
		throw new Error()
	}

	const namespaces: Record<string, string> = {}
	const environment: Record<string, types.Type> = {
		uri: types.uri(),
		unit: types.unit,
		string: types.string,
		boolean: types.boolean,
		f32: types.f32,
		f64: types.f64,
		i8: types.i8,
		i16: types.i16,
		i32: types.i32,
		i64: types.i64,
		u8: types.u8,
		u16: types.u16,
		u32: types.u32,
		u64: types.u64,
		bytes: types.bytes,
		JSON: types.JSON,
	}

	const slice = ({ from, to }: SyntaxNode) => input.slice(from, to)

	function getTerm(node: SyntaxNode): string {
		const value = slice(node)
		const index = value.indexOf(":")
		const prefix = value.slice(0, index)
		if (prefix in namespaces) {
			return namespaces[prefix] + value.slice(index + 1)
		} else {
			throw new Error(
				`invalid term "${value}"" - no namespace with prefix ${prefix} has been declared`
			)
		}
	}

	function parseType(node: SyntaxNode): types.Type {
		if (node.name === "Type") {
			const id = slice(node)
			const type = environment[id]
			if (type === undefined) {
				throw new Error(
					`invalid type variable - no type with name "${id}"" has been declared`
				)
			}

			return type
		} else if (node.name === "URI") {
			return types.uri()
		} else if (node.name === "Literal") {
			const key = node.getChild("Key")
			if (key === null) {
				throw new Error("internal parse error: missing Literal/Key node")
			}

			return types.literal(getTerm(key))
		} else if (node.name === "Product") {
			const components: Record<string, types.Type> = {}
			const entries = node.getChildren("Component")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error: missing Component/Key node")
				}

				const key = getTerm(term)
				if (key in components) {
					throw new Error(`duplicate component key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					throw new Error(
						"internal parse error: missing Component/Expression node"
					)
				}

				components[key] = parseType(expression)
			}

			return types.product(components)
		} else if (node.name === "Coproduct") {
			const options: Record<string, types.Type> = {}
			const entries = node.getChildren("Option")
			for (const entry of entries) {
				const term = entry.getChild("Key")
				if (term === null) {
					throw new Error("internal parse error: missing Option/Key node")
				}

				const key = getTerm(term)
				if (key in options) {
					throw new Error(`duplicate option key ${key}`)
				}

				const expression = entry.getChild("Expression")
				if (expression === null) {
					options[key] = types.unit
				} else {
					options[key] = parseType(expression)
				}
			}

			return types.coproduct(options)
		} else if (node.name === "Reference") {
			const term = node.getChild("Key")
			if (term === null) {
				throw new Error("internal parse error: missing Reference/Key node")
			}

			return types.reference(getTerm(term))
		} else {
			throw new Error(
				`internal parse error: invalid expression node name "${node.name}""`
			)
		}
	}

	const classes: Record<string, types.Type> = {}
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
					"internal parse error: missing NamespaceDefinition/Prefix node"
				)
			}

			const namespace = node.getChild("Namespace")
			if (namespace === null) {
				throw new Error(
					"internal parse error: missing NamespaceDefinition/Namespace node"
				)
			}

			namespaces[slice(identifier)] = slice(namespace)
		} else if (node.name === "TypeDefinition") {
			const name = node.getChild("Name")
			if (name === null) {
				throw new Error(
					"internal parse error: missing TypeDefinition/Name node"
				)
			}

			const expression = node.getChild("Expression")
			if (expression === null) {
				throw new Error(
					"internal parse error: missing TypeDefinition/Expression node"
				)
			}

			environment[slice(name)] = parseType(expression)
		} else if (node.name === "ClassDeclaration") {
			const term = node.getChild("Key")
			if (term === null) {
				throw new Error(
					"internal parse error: missing ClassDeclaration/Key node"
				)
			}

			const key = getTerm(term)

			if (key in classes) {
				throw new Error(`duplicate class key ${key}`)
			}

			const expression = node.getChild("Expression")
			if (expression === null) {
				throw new Error(
					"internal parse error: missing ClassDeclaration/Expression node"
				)
			}

			classes[key] = parseType(expression)
		} else {
			throw new Error(
				`internal parse error: invalid statement node name "${node.name}""`
			)
		}
	}

	return new Schema(classes)
}
