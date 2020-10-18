module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'emotion'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'react/prop-types': ['off'],

    '@typescript-eslint/explicit-function-return-type': ['warn', { 'allowExpressions': true }],

    'emotion/no-vanilla': 'error',
    'emotion/import-from-emotion': 'error',
    'emotion/styled-import': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { 'vars': 'all', 'args': 'all', 'varsIgnorePattern': '^jsx$|^_', 'argsIgnorePattern': '^_' }
    ],

    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2, { 'SwitchCase': 1, 'ignoredNodes': ['TemplateLiteral > *'] }],
    'eol-last': ['error', 'always'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};