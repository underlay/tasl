import {
	continuedIndent,
	indentNodeProp,
	foldNodeProp,
	LezerLanguage,
} from "@codemirror/next/language"

import { SyntaxNode } from "lezer-tree"

import { parser } from "@underlay/tasl-lezer"

import { styleNodeProp } from "./style.js"

export const syntax = LezerLanguage.define({
	parser: parser.configure({
		props: [
			indentNodeProp.add({
				Product: continuedIndent({ except: /^\s*\}/ }),
				Coproduct: continuedIndent({ except: /^\s*\]/ }),
			}),
			foldNodeProp.add({
				Product(subtree: SyntaxNode) {
					return { from: subtree.from + 1, to: subtree.to - 1 }
				},
				Coproduct(subtree: SyntaxNode) {
					return { from: subtree.from + 1, to: subtree.to - 1 }
				},
			}),
			styleNodeProp,
		],
	}),
	languageData: {
		closeBrackets: { brackets: ["[", "{"] },
		indentOnInput: /^\s*[\}\]]$/,
		commentTokens: { line: "#" },
	},
})
