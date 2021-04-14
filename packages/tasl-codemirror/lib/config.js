import { basicSetup } from "@codemirror/next/basic-setup";
import { defaultKeymap } from "@codemirror/next/commands";
import { EditorView, keymap } from "@codemirror/next/view";
import { commentKeymap } from "@codemirror/next/comment";
import { lineNumbers } from "@codemirror/next/gutter";
import { highlightSelectionMatches } from "@codemirror/next/search";
import { defaultHighlightStyle } from "@codemirror/next/highlight";
import { syntax } from "./syntax.js";
import { linter } from "./lint.js";
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
    linter,
    keymap.of([...defaultKeymap, ...commentKeymap]),
];
