import { styleTags, tags } from "@codemirror/next/highlight"

export const styleNodeProp = styleTags({
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
})
