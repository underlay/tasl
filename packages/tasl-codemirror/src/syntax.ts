import {
	continuedIndent,
	indentNodeProp,
	foldNodeProp,
	LezerLanguage,
} from "@codemirror/next/language"

import { styleTags, tags } from "@codemirror/next/highlight"
import { SyntaxNode } from "lezer-tree"

import { parser } from "@underlay/tasl-lezer"

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
			styleTags({
				Comment: tags.comment,
				TypeName: tags.typeName,
				Variable: tags.typeName,
				Term: tags.name,
				"Class/Term Edge/Term": [tags.className, tags.strong],
				"Product/Term Coproduct/Term": tags.propertyName,
				URI: tags.null,
				Literal: tags.string,
				"Literal/Term": tags.string,
				"Reference/Term": [tags.className, tags.strong],
				Pointer: tags.derefOperator,
				"Optional/Nullable": tags.typeOperator,
				Export: tags.definitionOperator,
				"OpenBrace CloseBrace": tags.brace,
				"OpenBracket CloseBracket": tags.bracket,
				"RightArrow LeftArrow": tags.separator,
				NamespaceName: tags.name,
				NamespaceURI: [tags.url, tags.link],
				"namespace type class edge": tags.definitionKeyword,
			}),
		],
	}),
	languageData: {
		closeBrackets: { brackets: ["[", "{"] },
		indentOnInput: /^\s*[\}\]]$/,
		commentTokens: { line: "#" },
	},
})
