import { Schema } from "@underlay/apg"
import { rdf, xsd } from "@underlay/namespaces"

export const defaultTypes: Record<string, Schema.Type> = {
	unit: Schema.product({}),
	uri: Schema.uri(),
	string: Schema.literal(xsd.string),
	boolean: Schema.literal(xsd.boolean),
	integer: Schema.literal(xsd.integer),
	double: Schema.literal(xsd.double),
	date: Schema.literal(xsd.date),
	dateTime: Schema.literal(xsd.dateTime),
	base64Binary: Schema.literal(xsd.base64Binary),
	JSON: Schema.literal(rdf.JSON),
}

export const defaultNamespaces: Record<string, string> = {
	ul: "http://underlay.org/ns/",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
}
