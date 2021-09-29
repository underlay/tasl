import { xsd, rdf } from "@underlay/namespaces"

import { product, literal } from "./types.js"

export default {
	unit: product({}),
	string: literal(xsd.string),
	boolean: literal(xsd.boolean),
	float32: literal(xsd.float),
	float64: literal(xsd.double),
	int: literal(xsd.integer),
	uint: literal(xsd.nonNegativeInteger),
	int64: literal(xsd.long),
	int32: literal(xsd.int),
	int16: literal(xsd.short),
	int8: literal(xsd.byte),
	uint64: literal(xsd.unsignedLong),
	uint32: literal(xsd.unsignedInt),
	uint16: literal(xsd.unsignedShort),
	uint8: literal(xsd.unsignedByte),
	bytes: literal(xsd.hexBinary),
	JSON: literal(rdf.JSON),
}
