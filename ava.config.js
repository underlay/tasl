export default {
	files: ["./test/*.test.ts"],
	extensions: {
		ts: "module",
	},
	nodeArguments: ["--loader=ts-node/esm"],
}
