module.exports = {
	compilers: {
		solc: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			metadata: {
				bytecodeHash: "none",
			},
		},
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
	mocha: {
		timeout: 40000,
	},
};
