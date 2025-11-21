/**
 * Jest Configuration
 *
 * Author: Vladimir K.S.
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test match patterns
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],

  // Ignore non-Jest test files (custom test runners)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/', // Custom console-based tests
    '/tests/unit/', // Custom console-based tests
    '/tests/test-inquirer', // Interactive test files
    '/tests/run-all.js' // Custom test runner
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    'bin/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true
};
