export default {
	files: ["./test/**/*"],
	extensions: {
		ts: "module",
	},
	nodeArguments: ["--loader=ts-node/esm"],
}
