import { xsd, rdf } from "@underlay/namespaces"

import { product, literal } from "./types.js"

export const unit = product({})

export const string = literal(xsd.string)
export const boolean = literal(xsd.boolean)
export const f32 = literal(xsd.float)
export const f64 = literal(xsd.double)
export const i64 = literal(xsd.long)
export const i32 = literal(xsd.int)
export const i16 = literal(xsd.short)
export const i8 = literal(xsd.byte)
export const u64 = literal(xsd.unsignedLong)
export const u32 = literal(xsd.unsignedInt)
export const u16 = literal(xsd.unsignedShort)
export const u8 = literal(xsd.unsignedByte)
export const bytes = literal(xsd.hexBinary)
export const JSON = literal(rdf.JSON)
