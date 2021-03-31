export function matchTree(tree, names) {
	const cursor = tree.cursor()
	const iter = names[Symbol.iterator]()
	do {
		const { value } = iter.next()
		expect(cursor.name).toBe(value)
	} while (cursor.next())
}
