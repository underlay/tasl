import { continuedIndent, indentNodeProp, foldNodeProp, LezerLanguage, } from "@codemirror/next/language";
import { styleTags, tags } from "@codemirror/next/highlight";
import { parser } from "@underlay/tasl-lezer/grammar/tasl.js";
export const syntax = LezerLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Product: continuedIndent({ except: /^\s*\}/ }),
                Coproduct: continuedIndent({ except: /^\s*\]/ }),
            }),
            foldNodeProp.add({
                Product(subtree) {
                    return { from: subtree.from + 1, to: subtree.to - 1 };
                },
                Coproduct(subtree) {
                    return { from: subtree.from + 1, to: subtree.to - 1 };
                },
            }),
            styleTags({
                Comment: tags.comment,
                Prefix: tags.namespace,
                TypeName: tags.typeName,
                Variable: tags.typeName,
                Term: tags.name,
                "Class/Term": tags.className,
                "Edge/Term": tags.className,
                "Product/Term": tags.propertyName,
                "Coproduct/Term": tags.propertyName,
                Uri: tags.string,
                Literal: tags.string,
                "Literal/Term": tags.string,
                "Reference/Term": tags.className,
                Pointer: tags.operator,
                Optional: tags.operator,
                "{ }": tags.bracket,
                "[ ]": tags.bracket,
                "->": tags.separator,
                "<-": tags.separator,
                ";": tags.separator,
                "Namespace/Uri": tags.namespace,
                namespace: tags.keyword,
                type: tags.keyword,
                class: tags.keyword,
                edge: tags.keyword,
                list: tags.keyword,
            }),
        ],
    }),
    languageData: {
        closeBrackets: { brackets: ["[", "{", "<"] },
        indentOnInput: /^\s*[\}\]]$/,
        commentTokens: { line: "#" },
    },
});
