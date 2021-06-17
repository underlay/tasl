import type { URI } from "./uri.js"
import type { Literal } from "./literal.js"
import type { Product } from "./product.js"
import type { Coproduct } from "./coproduct.js"
import type { Reference } from "./reference.js"

export type Type = URI | Literal | Product | Coproduct | Reference
