import { continuedIndent, indentNodeProp, foldNodeProp, LezerLanguage, } from "@codemirror/next/language";
import { styleTags, tags } from "@codemirror/next/highlight";
import { parser } from "@underlay/taslx-lezer/grammar/taslx.js";
export const syntax = LezerLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Tuple: continuedIndent({ except: /^\s*\}/ }),
                Match: continuedIndent({ except: /^\s*\]/ }),
            }),
            foldNodeProp.add({
                Tuple(subtree) {
                    return { from: subtree.from + 1, to: subtree.to - 1 };
                },
                Match(subtree) {
                    return { from: subtree.from + 1, to: subtree.to - 1 };
                },
            }),
            styleTags({
                Comment: tags.comment,
                Prefix: tags.namespace,
                ExprName: tags.typeName,
                Variable: tags.typeName,
                Term: tags.name,
                "Map/Term": tags.className,
                "Dereference/Term": tags.className,
                "Tuple/Term": tags.propertyName,
                "Match/Term": tags.propertyName,
                "Projection/Term": tags.propertyName,
                "Injection/Term": tags.propertyName,
                Identifier: tags.string,
                "Identifier/Term": tags.string,
                Constant: tags.string,
                String: tags.string,
                "Constant/Term": tags.string,
                Projector: tags.operator,
                Injector: tags.operator,
                Pointer: tags.operator,
                "{ }": tags.bracket,
                "[ ]": tags.bracket,
                "->": tags.separator,
                ">-": tags.separator,
                ";": tags.separator,
                "Namespace/Term": tags.namespace,
                namespace: tags.keyword,
                expr: tags.keyword,
                map: tags.keyword,
            }),
        ],
    }),
    languageData: {
        closeBrackets: { brackets: ["[", "{", "<"] },
        indentOnInput: /^\s*[\}\]]$/,
        commentTokens: { line: "#" },
    },
});
