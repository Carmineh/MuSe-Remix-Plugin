export default {
  // Enable ES module support
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {},
  testEnvironment: 'node',
  testTimeout: 60000,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/temp/**',
    '!jest.config.js',
    '!server.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};