const esModules = ["@underlay/apg", "@underlay/namespaces"].join("|")

export default {
	testEnvironment: "node",
	transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
	transform: {
		"\\.(j|t)s$": [
			"babel-jest",
			{
				plugins: [
					"@babel/plugin-proposal-export-namespace-from",
					"@babel/plugin-transform-typescript",
					"@babel/plugin-transform-modules-commonjs",
				],
			},
		],
	},
}
