import test from "ava"
import varint from "varint"
import { xsd } from "@underlay/namespaces"

import { types } from "../src/schema/index.js"
import { encodeLiteral, decodeLiteral } from "../src/instance/literals/index.js"
import { DecodeState, makeEncodeState } from "../src/utils.js"

// dd if=/dev/urandom bs=1 count=1020 | xxd -p
const randomHexBinary = [
	"364e4ec6eda0c52fdbb6d48ab8ef500932eb6bcedc5fd753ae28098c49a2",
	"bf286cc389dabee1ec873746ec229bed9097fc64381168ec446b087cbcde",
	"b59f519e8a4ea80042e7d4c3e5763c97f22d42785924632887169877b89d",
	"995232e630939e2c1f2052aa4d477ea55807555f04c37f2d76c6fa429b57",
	"14f67ff34e32831cd0c7c127bb27604db479e60451c959598df5720a6b00",
	"dfab8e6e8293c5e35008feeb4441a6237b5adc8cb1564b3ab8815a77fd49",
	"9cb129001cea76c4cefc69301d61eefa16ed07d17b87d7a16e7e29ebf41d",
	"5cf99466b3ad291c569a77e8c4fddbc1d2a9b82dccb7f4bad4be65dcca2f",
	"b32f5ca530179da21b4c534c65cdcb1585f99609af23de1c863710ead2b8",
	"50637651e9c94677eab15f5e11d8b7aaf2282c2599211dec049b77e18115",
	"6b952b0c4b493696b16083e61204c68a7b66c411f906070c44bb0da50c50",
	"b2e4125689d4db3488aff3dfe35efc4cbd51494efa42f7e4b0829472302a",
	"ebad64fd3a775119dd9927033a5a152115f3210fb01de423ad43aaeb653e",
	"6dc8a5f2e2549195f31656f56992a49becaa7ae47b972bf05777667cea59",
	"5795f9eea87f5b8031402b578ee60981c6af1af3b01cc0d91cef7dbba688",
	"74e2c5077c77b7e624a6bb602548eae87430bab0b1a02ec771c37859234d",
	"4c719365fd2af162be77d398c8143fdeebe062ade4f005cdb49fb631194d",
	"bb459673cd0642f4c7b7a12f31e51ed647025c64deb5178be6aaeefa6ff2",
	"2aff8bade1321255b80eee5fc6ab31302b0cf61c6ed4521349bf1fbea02f",
	"d94fc505d3574c8f4e16446b5d40cf2ec92f7c9a2bf2721be23b9184a188",
	"38a8cb885c90df019f19adb00e237a8ff1bc453096cc7d316329ceeda891",
	"2fe78c35290165d0d574a9038be0d0803e01ef87bfce5a2f3fa7be902712",
	"e551cac7f9871b19c47b89ed10f0fde8b5b48ea85ab264728bcaa2be36c9",
	"5df8318bf7b2d1624de769a899ebc95a7bd2fc5a85150ac2812df5e54b47",
	"0866c752f53d0ce452779c112c722edd0abe39a5fbd8433d652977e50df1",
	"f3a031c780aca60e31c0d2671b26d17034aed4f28a5f6632540388ff9ec5",
	"be0fd5b76f6d58a41f6980f099fa33153d13ff20e0ab0f06f2bc891b61e9",
	"4b3a6a4e2f42546cbb3479caab4b7c99b3e6ee5a6624c084e594c0930343",
	"08d46b1619306b08ae4e68687dbf7598c61df644df83c919b812624bfcb3",
	"3ab40fbaef6afb88caee832944d8ba7f229cb5956766af68216d33b1f160",
	"a14be42cba4061ab76233c3ab803a624c8c325f94076a33ab2aacf8b4882",
	"c117b2e1c581810908cb68e57d160cf04a71fdd1f38cfcbede50c076c6dc",
	"f5899393f0fcb3b0dd0ddadc72360486af72df5d93319853d513f36bdc12",
	"b831e6408c7b488bb176221d664330904faa3b3dd18afc879bf724592532",
].join("")

const randomHexBinaryLength = Buffer.from(
	varint.encode(randomHexBinary.length / 2)
).toString("hex")

const literals: Record<string, [string, string][]> = {
	[xsd.boolean]: [
		["true", "01"],
		["false", "00"],
	],
	[xsd.float]: [
		["NaN", "7fc00000"],
		["INF", "7f800000"],
		["-INF", "ff800000"],
		["0", "00000000"],
		["-0", "80000000"],
		["3.1415927410125732", "40490fdb"], // Math.PI rounded to float32
		["2.7182817459106445", "402df854"], // Math.E rounded to float32
		["9007199254740992", "5a000000"], // Math.MAX_SAFE_INTEGER rounded to float32
		["-9007199254740992", "da000000"], // Math.MIN_SAFE_INTEGER rounded to float32
	],
	[xsd.double]: [
		["NaN", "7ff8000000000000"],
		["INF", "7ff0000000000000"],
		["-INF", "fff0000000000000"],
		["0", "0000000000000000"],
		["-0", "8000000000000000"],
		["3.141592653589793", "400921fb54442d18"], // Math.PI
		["2.718281828459045", "4005bf0a8b145769"], // Math.E
		["9007199254740991", "433fffffffffffff"], // Math.MAX_SAFE_INTEGER
		["-9007199254740992", "c340000000000000"], // Math.MIN_SAFE_INTEGER
		["1.7976931348623157e+308", "7fefffffffffffff"], // Math.MAX_VALUE
		["5e-324", "0000000000000001"], // Math.MIN_VALUE
		["-1.7976931348623157e+308", "ffefffffffffffff"], // -Math.MAX_VALUE
		["-5e-324", "8000000000000001"], // -Math.MIN_VALUE
	],
	[xsd.long]: [
		["0", "0000000000000000"],
		["1", "0000000000000001"],
		["-1", "ffffffffffffffff"],
		["9223372036854775807", "7fffffffffffffff"],
		["-9223372036854775808", "8000000000000000"],
	],
	[xsd.int]: [
		["0", "00000000"],
		["1", "00000001"],
		["-1", "ffffffff"],
		["2147483647", "7fffffff"],
		["-2147483648", "80000000"],
	],
	[xsd.short]: [
		["0", "0000"],
		["1", "0001"],
		["-1", "ffff"],
		["32767", "7fff"],
		["-32768", "8000"],
	],
	[xsd.byte]: [
		["0", "00"],
		["1", "01"],
		["-1", "ff"],
		["127", "7f"],
		["-128", "80"],
	],
	[xsd.unsignedLong]: [
		["0", "0000000000000000"],
		["1", "0000000000000001"],
		["18446744073709551615", "ffffffffffffffff"],
	],
	[xsd.unsignedInt]: [
		["0", "00000000"],
		["1", "00000001"],
		["4294967295", "ffffffff"],
	],
	[xsd.unsignedShort]: [
		["0", "0000"],
		["1", "0001"],
		["65535", "ffff"],
	],
	[xsd.unsignedByte]: [
		["0", "00"],
		["1", "01"],
		["255", "ff"],
	],
	[xsd.hexBinary]: [
		["", "00"],
		["00", "01" + "00"],
		["0f", "01" + "0f"],
		["8f1d88cc1103a8", "07" + "8f1d88cc1103a8"],
		[
			"a14be42cba4061ab76233c3ab803a624c8c325f94076a33ab2aacf8b4882",
			"1e" + "a14be42cba4061ab76233c3ab803a624c8c325f94076a33ab2aacf8b4882",
		],
		[randomHexBinary, randomHexBinaryLength + randomHexBinary],
	],
}

const datatypes = Object.keys(literals)

test("encode/decode literals", (t) => {
	let byteLength = 0
	const chunks: Uint8Array[] = []
	function process(iter: Iterable<Uint8Array>) {
		for (const chunk of iter) {
			chunks.push(chunk)
			byteLength += chunk.byteLength
		}
	}

	const encodeState = makeEncodeState()
	for (const datatype of datatypes) {
		const type = types.literal(datatype)
		for (const [i, _] of literals[datatype]) {
			process(encodeLiteral(encodeState, type, { kind: "literal", value: i }))
		}
	}

	if (encodeState.offset > 0) {
		process([new Uint8Array(encodeState.buffer, 0, encodeState.offset)])
	}

	const buffer = new ArrayBuffer(byteLength)
	let byteOffset = 0
	for (const chunk of chunks) {
		const target = new Uint8Array(buffer, byteOffset, chunk.byteLength)
		target.set(chunk)
		byteOffset += chunk.byteLength
	}

	const data = new Uint8Array(buffer)
	const view = new DataView(buffer)
	const decodeState: DecodeState = { data, view, offset: 0 }
	for (const datatype of datatypes) {
		const type = types.literal(datatype)
		for (const [i, o] of literals[datatype]) {
			const offset = decodeState.offset

			// test encode
			const output = Buffer.from(o, "hex")
			const source = new Uint8Array(buffer, offset, output.length)
			t.deepEqual(Buffer.from(source), output, `encode ${datatype} ${i}`)

			// test decode
			const value = decodeLiteral(decodeState, type)
			t.is(
				o.length / 2,
				decodeState.offset - offset,
				`bad decode length: ${datatype} ${i}`
			)
			t.is(value, i, `decode ${datatype} ${i}`)
		}
	}
})
