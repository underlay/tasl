import { openLintPanel } from "@codemirror/next/lint"
import { EditorState } from "@codemirror/next/state"
import { EditorView } from "@codemirror/next/view"
import { editableConfig, makeLinter } from "../lib/index.js"

const initialValue = `# Welcome to the schema editor!
# If you're new, you probably want to read
# the schema language documentation here:
# http://r1.underlay.org/docs/schemas

namespace ex http://example.com#
namespace ul http://underlay.org/ns/

expr foo / ex:jskl | / ex:jklfs

map ex:jksl :: ex:jsl
  | foo
  | "jkfls" <ex:fjsl>
  | \\ ex:99
  | * ex:si99
  | { ex:sjlk }







`

const linter = makeLinter()
const extensions = [...editableConfig, linter]

const state = EditorState.create({
	doc: initialValue,
	extensions,
})

const view = new EditorView({
	state,
	parent: document.getElementById("editor"),
})

openLintPanel(view)
view.focus()
