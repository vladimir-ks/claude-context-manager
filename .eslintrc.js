/**
 * ESLint Configuration
 *
 * Author: Vladimir K.S.
 */

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Enforce async/await over callbacks
    'prefer-promise-reject-errors': 'error',
    'no-async-promise-executor': 'error',

    // Error handling
    'no-throw-literal': 'error',
    'handle-callback-err': 'error',

    // Code quality
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off', // We use console for CLI output
    'no-empty': ['error', { allowEmptyCatch: true }],

    // Best practices
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // Style (handled by Prettier, but keep a few critical ones)
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'never']
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '.husky/',
    'archive-packages/',
    '00_DOCS/',
    '.claude/'
  ]
};
