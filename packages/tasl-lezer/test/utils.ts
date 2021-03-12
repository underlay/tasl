import { Tree } from "lezer"

export function matchTree(tree: Tree, names: string[]) {
	const cursor = tree.cursor()
	const iter = names[Symbol.iterator]()
	do {
		const { value } = iter.next()
		expect(cursor.name).toBe(value)
	} while (cursor.next())
}
