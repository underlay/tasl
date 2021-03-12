import { basicSetup } from "@codemirror/next/basic-setup"
import {
	defaultKeymap,
	indentMore,
	indentLess,
} from "@codemirror/next/commands"
import { EditorView, keymap } from "@codemirror/next/view"
import { commentKeymap } from "@codemirror/next/comment"

import { Extension } from "@codemirror/next/state"

import { lineNumbers } from "@codemirror/next/gutter"
import { highlightSelectionMatches } from "@codemirror/next/highlight-selection"
import { defaultHighlightStyle } from "@codemirror/next/highlight"

import { syntax } from "./syntax.js"

export const readOnlyConfig: Extension[] = [
	EditorView.editable.of(false),
	lineNumbers(),
	defaultHighlightStyle,
	highlightSelectionMatches(),
	syntax,
]

export const editableConfig: Extension[] = [
	basicSetup,
	syntax,
	keymap([
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
]
