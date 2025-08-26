module.exports = {
	solidity: {
		compilers: [
			{
				version: "0.8.20", // For your current contract
			},
			{
				version: "0.7.3", // Default version Hardhat mentioned
			},
		],
		settings: {
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
