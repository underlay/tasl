import { parse } from ".."

// // (these aren't real lint tests; I need to write more)

test("Comment only", () => {
	const result = parse(`# This is a comment`)
})

test("Prefix only", () => {
	const result = parse(`namespace s http://schema.org/`)
})

test("Comment and namespace", () => {
	const result = parse(`
# neat
namespace s http://schema.org/
# wow
`)
})

test("Several comments and namespaces", () => {
	const result = parse(`
# neat
namespace s http://schema.org/
# let's do it again
namespace b http://schema.borg/
# HMMMM
#HMM
namespace c http://schema.corg/`)
})

test("Namespace and variable", () => {
	const result = parse(`# fdjsklf
namespace foo http://ffjkdls.fdsj/
expr wow {}
`)
})

test("Does it work?", () => {
	const source = `
namespace ex http://example.com/
# COOL!

`
})
