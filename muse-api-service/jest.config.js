export default {
	testEnvironment: "node",
	transform: {},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	testMatch: ["**/tests/**/*.test.js"],
	// Allow mocking non-existent modules
	setupFiles: ["<rootDir>/jest.setup.cjs"],
};
