import { floatToString, signalInvalidType } from "../utils.js"
import { types } from "../schema/types.js"

const { stringify } = JSON

export namespace values {
	export type Value = URI | Literal | Product | Coproduct | Reference

	export type URI = { kind: "uri"; value: string }
	export type Literal = { kind: "literal"; value: string }
	export type Product = { kind: "product"; components: Record<string, Value> }
	export type Coproduct = { kind: "coproduct"; key: string; value: Value }
	export type Reference = { kind: "reference"; index: number }

	/**
	 * Make a new URI value.
	 * @param {string} value
	 * @returns {values.URI}
	 */
	export function uri(value: string): URI {
		return { kind: "uri", value }
	}

	/**
	 * Check if a value is a URI.
	 * @param {values.Value} value
	 * @returns {boolean}
	 */
	export const isURI = (value: Value): value is URI => value.kind === "uri"

	/**
	 * Make a new literal value.
	 * @param {string} value
	 * @returns {values.Literal}
	 */
	export function literal(value: string): Literal {
		return { kind: "literal", value }
	}

	/**
	 * Check if a value is a literal.
	 * @param {values.Value} value
	 * @returns {boolean}
	 */
	export const isLiteral = (value: Value): value is Literal =>
		value.kind === "literal"

	/**
	 * Make a new product value.
	 * @param components
	 * @returns {Product}
	 */
	export function product(components: Record<string, Value>): Product {
		return { kind: "product", components }
	}

	/**
	 * Check if a value is a product.
	 * @param {Value} value
	 * @returns {boolean}
	 */
	export const isProduct = (value: Value): value is Product =>
		value.kind === "product"

	/**
	 * Make a new coproduct value.
	 * @param {string} key
	 * @param value
	 * @returns {Coproduct}
	 */
	export function coproduct(key: string, value: Value): Coproduct {
		return { kind: "coproduct", key, value }
	}

	/**
	 * Check if a value is a coproduct.
	 * @param {Value} value
	 * @returns {boolean}
	 */
	export const isCoproduct = (value: Value): value is Coproduct =>
		value.kind === "coproduct"

	/**
	 * Make a new reference value.
	 * @param {number} index
	 * @returns {Reference}
	 */
	export function reference(index: number): Reference {
		return { kind: "reference", index }
	}

	/**
	 * Check if a value is a reference.
	 * @param {Value} value
	 * @returns {boolean}
	 */
	export const isReference = (value: Value): value is Reference =>
		value.kind === "reference"

	/**
	 * make a new unit value
	 * @returns {Value}
	 */
	export function unit(): Product {
		return { kind: "product", components: {} }
	}

	/**
	 * make a new literal value with datatype xsd:string
	 * @param {string} value
	 * @returns {Value}
	 */
	export function string(value: string): Literal {
		return { kind: "literal", value }
	}

	/**
	 * make a new literal value with datatype xsd:boolean
	 * @param {boolean} value
	 * @returns {Value}
	 */
	export function boolean(value: boolean): Literal {
		return { kind: "literal", value: value ? "true" : "false" }
	}

	/**
	 * make a new literal value with datatype xsd:float
	 * @param {number} value
	 * @returns {Value}
	 */
	export function float32(value: number): Literal {
		return { kind: "literal", value: floatToString(value) }
	}

	/**
	 * make a new literal value with datatype xsd:double
	 * @param {number} value
	 * @returns {Value}
	 */
	export function float64(value: number): Literal {
		return { kind: "literal", value: floatToString(value) }
	}

	/**
	 * make a new literal value with datatype xsd:long
	 * @param {bigint} value
	 * @returns {Value}
	 */
	export function i64(value: bigint): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:int
	 * @param {number} value
	 * @returns {Value}
	 */
	export function i32(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:short
	 * @param {number} value
	 * @returns {Value}
	 */
	export function i16(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:byte
	 * @param {number} value
	 * @returns {Value}
	 */
	export function i8(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:unsignedLong
	 * @param {number} value
	 * @returns {Value}
	 */
	export function u64(value: bigint): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:unsignedInt
	 * @param {number} value
	 * @returns {Value}
	 */
	export function u32(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:unsignedShort
	 * @param {number} value
	 * @returns {Value}
	 */
	export function u16(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:unsignedByte
	 * @param {number} value
	 * @returns {Value}
	 */
	export function u8(value: number): Literal {
		return { kind: "literal", value: value.toString() }
	}

	/**
	 * make a new literal value with datatype xsd:hexBinary
	 * @param {Uint8Array} value
	 * @returns {Value}
	 */
	export function bytes(value: Uint8Array): Literal {
		return { kind: "literal", value: Buffer.from(value).toString("hex") }
	}

	/**
	 * make a new literal value with datatype rdf:JSON
	 * @param value
	 * @returns {Value}
	 */
	export function JSON(value: any): Literal {
		return { kind: "literal", value: stringify(value) }
	}

	/**
	 * Check whether two values X and Y of the same type are equal.
	 * @param type a type T
	 * @param x a value X of type T
	 * @param y a value Y of type T
	 * @throws an error if either of X or Y are not of type T
	 * @returns {boolean} true if X is equal to Y, false otherwise
	 */
	export function isEqualTo(type: types.Type, x: Value, y: Value): boolean {
		if (type.kind === "uri" && x.kind === "uri" && y.kind === "uri") {
			return x.value === y.value
		} else if (
			type.kind === "literal" &&
			x.kind === "literal" &&
			y.kind === "literal"
		) {
			return x.value === y.value
		} else if (
			type.kind === "product" &&
			x.kind === "product" &&
			y.kind === "product"
		) {
			for (const [key, component] of Object.entries(type.components)) {
				if (key in x.components && key in y.components) {
					if (isEqualTo(component, x.components[key], y.components[key])) {
						continue
					} else {
						return false
					}
				} else {
					throw new Error("one of the values is not of the provided type")
				}
			}
			return true
		} else if (
			type.kind === "coproduct" &&
			x.kind === "coproduct" &&
			y.kind === "coproduct"
		) {
			if (x.key in type.options && y.key in type.options) {
				return (
					x.key === y.key && isEqualTo(type.options[x.key], x.value, y.value)
				)
			} else {
				throw new Error("one of the values is not of the provided type")
			}
		} else if (
			type.kind === "reference" &&
			x.kind === "reference" &&
			y.kind === "reference"
		) {
			return x.index === y.index
		} else {
			throw new Error("one of the values is not of the provided type")
		}
	}

	/**
	 * Cast a value of one type to another type.
	 * The target type must be a subtype of the source type.
	 * A subtype of a type can only differ by (recursively)
	 * adding coproduct options and removing product components.
	 * This means the only way that casting actually changes the input
	 * value is by (again recursively) stripping extraneous product
	 * components that are present in the source type but not in the
	 * target type.
	 * @param type the source type
	 * @param value a value of the source type
	 * @param target the target type
	 * @throws an error if the target type is not a subtype of the source type
	 * @returns {Value} a value of the target type
	 */
	export function cast(
		type: types.Type,
		value: Value,
		target: types.Type
	): Value {
		if (type.kind === "uri") {
			if (value.kind !== "uri" || target.kind !== "uri") {
				throw new Error("values cannot be cast to different kinds of types")
			}

			return value
		} else if (type.kind === "literal") {
			if (value.kind !== "literal" || target.kind !== "literal") {
				throw new Error("values cannot be cast to different kinds of types")
			} else if (type.datatype !== target.datatype) {
				throw new Error(
					"a literal value cannot be cast to a different literal datatype"
				)
			}

			return value
		} else if (type.kind === "product") {
			if (value.kind !== "product" || target.kind !== "product") {
				throw new Error("values cannot be cast to different kinds of types")
			}

			const components: Record<string, values.Value> = {}
			for (const [key, component] of Object.entries(target.components)) {
				if (type.components[key] === undefined) {
					throw new Error(`the product value has no component key ${key}`)
				} else if (value.components[key] === undefined) {
					throw new Error("the product value is not of the provided type")
				}

				components[key] = cast(
					type.components[key],
					value.components[key],
					component
				)
			}

			return values.product(components)
		} else if (type.kind === "coproduct") {
			if (value.kind !== "coproduct" || target.kind !== "coproduct") {
				throw new Error("values cannot be cast to different kinds of types")
			}

			const { [value.key]: source, ...rest } = type.options
			if (source === undefined) {
				throw new Error(
					"the coproduct value is not of the provided source type"
				)
			}

			for (const [key, option] of Object.entries(rest)) {
				if (
					key in target.options &&
					types.isSubtypeOf(target.options[key], option)
				) {
					continue
				} else {
					throw new Error("the target type is not a subtype of the source type")
				}
			}

			const option = target.options[value.key]
			if (option === undefined) {
				throw new Error(
					`the target coproduct type has no option with key ${value.key}`
				)
			}

			return values.coproduct(value.key, cast(source, value.value, option))
		} else if (type.kind === "reference") {
			if (value.kind !== "reference" || target.kind !== "reference") {
				throw new Error("values cannot be cast to different kinds of types")
			} else if (type.key !== target.key) {
				throw new Error(
					"a reference value cannot be cast to a different reference key"
				)
			}

			return value
		} else {
			signalInvalidType(type)
		}
	}
}
