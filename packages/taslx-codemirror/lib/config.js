import { basicSetup } from "@codemirror/next/basic-setup";
import { defaultKeymap, indentMore, indentLess, } from "@codemirror/next/commands";
import { EditorView, keymap } from "@codemirror/next/view";
import { commentKeymap } from "@codemirror/next/comment";
import { lineNumbers } from "@codemirror/next/gutter";
import { highlightSelectionMatches } from "@codemirror/next/search";
import { defaultHighlightStyle } from "@codemirror/next/highlight";
import { syntax } from "./syntax.js";
export * from "@codemirror/next/state";
export { EditorView } from "@codemirror/next/view";
export { EditorState } from "@codemirror/next/state";
export const readOnlyConfig = [
    EditorView.editable.of(false),
    lineNumbers(),
    defaultHighlightStyle,
    highlightSelectionMatches(),
    syntax,
];
export const editableConfig = [
    basicSetup,
    syntax,
    keymap.of([
        ...defaultKeymap,
        ...commentKeymap,
        {
            key: "Tab",
            preventDefault: true,
            run: indentMore,
        },
        {
            key: "Shift-Tab",
            preventDefault: true,
            run: indentLess,
        },
    ]),
];
