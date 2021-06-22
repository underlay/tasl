import varint from "varint"

import * as Schema from "../schema/index.js"
import { forEntries, getKeys, signalInvalidType } from "../utils.js"

import type { Value } from "./instance.js"

import { decodeLiteral } from "./decodeLiteral.js"
import { version } from "./version.js"

export function getVarint(state: { data: Uint8Array; offset: number }) {
	const length = varint.decode(state.data, state.offset)
	state.offset += varint.encodingLength(length)
	return length
}

export function log<S extends { [key in string]: Schema.Type }>(
	schema: Schema.Schema<S>,
	data: Buffer
) {
	let offset = 0

	const v = varint.decode(data, offset)
	if (v !== version) {
		throw new Error(`Unsupported version: ${v}`)
	}

	offset += varint.encodingLength(v)

	const uriCount = varint.decode(data, offset)
	offset += varint.encodingLength(uriCount)

	process.stdout.write(`URI count: ${uriCount}\n`)

	const decoder = new TextDecoder()

	for (let i = 0; i < uriCount; i++) {
		const length = varint.decode(data, offset)
		offset += varint.encodingLength(length)
		const value = decoder.decode(data.slice(offset, offset + length))
		offset += length
		process.stdout.write(`${i.toString().padStart(3)}: ${value}\n`)
	}

	process.stdout.write(`Header offset: ${offset}\n`)

	process.stdout.write(`Labels ----------------------\n`)
	const state: { data: Buffer; offset: number } = { data, offset }
	for (const [key, type, i] of forEntries(schema)) {
		const valuesLength = varint.decode(data, state.offset)
		state.offset += varint.encodingLength(valuesLength)

		process.stdout.write(
			`${i.toString().padStart(3)}: ${key}, ${valuesLength} elements --------\n`
		)
		for (let i = 0; i < valuesLength; i++) {
			process.stdout.write(
				`   ${i.toString().padStart(3)} ----------------------\n`
			)
			logValue("        ", state, type)
		}
	}
}

export function logValue(
	prefix: string,
	state: { data: Buffer; offset: number },
	type: Schema.Type
) {
	if (type.kind === "uri") {
		const index = getVarint(state)
		process.stdout.write(`${prefix} uri index: ${index}\n`)
	} else if (type.kind === "literal") {
		const value = decodeLiteral(state, type.datatype)
		process.stdout.write(`${prefix} literal value: ${JSON.stringify(value)}\n`)
	} else if (type.kind === "product") {
		const { length } = getKeys(type.components)
		process.stdout.write(`${prefix} record with ${length} components\n`)
		const values: Schema.Type[] = Object.values(type.components)
		for (const component of values) {
			logValue(`${prefix} | `, state, component)
		}
	} else if (type.kind === "coproduct") {
		const keys = getKeys(type.options)
		const index = getVarint(state)
		if (index in keys && keys[index] in type.options) {
			process.stdout.write(`${prefix} variant with key ${keys[index]}\n`)
			const option = type.options[keys[index]]
			logValue(`${prefix} > `, state, option)
		} else {
			throw new Error("Invalid option index")
		}
	} else if (type.kind === "reference") {
		const index = getVarint(state)
		process.stdout.write(`${prefix} reference to element ${index}\n`)
	} else {
		signalInvalidType(type)
	}
}

export function* resolveValue<T extends Schema.Type = Schema.Type>(
	type: Schema.Type,
	value: Value,
	path: string[]
): Generator<Value<T>, void, undefined> {
	if (path.length === 0) {
		yield value as Value<T>
	} else {
		const [key, ...rest] = path
		if (type.kind === "product" && value.kind === "product") {
			if (key in type.components) {
				yield* resolveValue(type.components[key], value.components[key], rest)
			} else {
				throw new Error(`invalid product component ${key}`)
			}
		} else if (type.kind === "coproduct" && value.kind === "coproduct") {
			if (key in type.options) {
				if (value.key === key) {
					yield* resolveValue(type.options[key], value.value, rest)
				} else {
					return
				}
			} else {
				throw new Error(`invalid coproduct option ${key}`)
			}
		} else {
			throw new Error(`path too long`)
		}
	}
}
