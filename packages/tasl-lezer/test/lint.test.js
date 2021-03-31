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
type wow <>
class foo:ok [
  foo:damn >- { foo:wow -> wow };
  foo:shit >- <>;
]
`)
})

test("Does it work?", () => {
	const source = `
namespace ex http://example.com/
# COOL!
class ex:Recipe {
  ex:name -> string ;
  ex:wasDerivedFromURL -> string ;
  ex:hasAuthor -> * ex:Author ;
  ex:hasSource -> * ex:Webpage ;
  ex:hasIngredient -> * ex:Ingredient ;
  ex:hasAssociatedTags -> * ex:Tag ;
}
class ex:Ingredient {
  ex:name -> string ;
  ex:url -> string ;
}
class ex:Webpage { ex:url -> string }
class ex:Tag { ex:name -> string }
class ex:Author { ex:name -> string }
edge ex:Recipe ==/ ex:hasIngredient /=> ex:Ingredient
`
})
