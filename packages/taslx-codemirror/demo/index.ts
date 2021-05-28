import { openLintPanel } from "@codemirror/next/lint"
import { EditorState } from "@codemirror/next/state"
import { EditorView } from "@codemirror/next/view"
import { editableConfig } from "../lib/index.js"

const initialValue = `# hello world

namespace ex http://example.com#
namespace ul http://underlay.org/ns/

map ex:jksl











`

const state = EditorState.create({
	doc: initialValue,
	extensions: editableConfig,
})

const view = new EditorView({
	state,
	parent: document.getElementById("editor"),
	dispatch(tr) {
		view.update([tr])
		// const { mapping } = view.state.field(MappingState)
	},
})

openLintPanel(view)
view.focus()
