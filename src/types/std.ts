import { xsd, rdf } from "@underlay/namespaces"

import { product, literal } from "./types.js"

export const unit = product({})
export const string = literal(xsd.string)
export const boolean = literal(xsd.boolean)
export const float32 = literal(xsd.float)
export const float64 = literal(xsd.double)
export const int = literal(xsd.integer)
export const uint = literal(xsd.nonNegativeInteger)
export const int64 = literal(xsd.long)
export const int32 = literal(xsd.int)
export const int16 = literal(xsd.short)
export const int8 = literal(xsd.byte)
export const uint64 = literal(xsd.unsignedLong)
export const uin32 = literal(xsd.unsignedInt)
export const uint16 = literal(xsd.unsignedShort)
export const uint8 = literal(xsd.unsignedByte)
export const bytes = literal(xsd.hexBinary)
export const JSON = literal(rdf.JSON)
