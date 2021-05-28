import { openLintPanel } from "@codemirror/next/lint"
import { EditorState } from "@codemirror/next/state"
import { EditorView } from "@codemirror/next/view"
import { editableConfig } from "../lib/index.js"

// import { parse } from "@underlay/tasl-lezer"

const initialValue = `namespace ex http://example.com/

type location [
  ex:coordinates <- {
    ex:lat -> double
    ex:long -> double
  }
  ex:address <- {
    ex:street -> string
    ex:city -> string
    ex:state -> string
    ex:zipCode -> string
  }
]

class ex:BookStore :: {
  ex:name -> string
  ex:location -> ? location
}

class ex:Book :: {
  ex:name -> string
  ex:isbn -> <>
  ex:store -> * ex:BookStore
  ex:category -> [
    ex:fiction
    ex:nonFiction
    ex:other <- string
  ]
}

edge ex:Citation :: ex:Book => ex:Book
edge ex:Citation2 :: ex:Book =/ {
  ex:value -> string
} /=> ex:Book



`

// const a = parse(initialValue)

const state = EditorState.create({
	doc: initialValue,
	extensions: [editableConfig],
})

const view = new EditorView({
	state,
	parent: document.getElementById("editor"),
})

openLintPanel(view)
view.focus()
