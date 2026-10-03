module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { sourceType: 'module', ecmaVersion: 2020 },
  env: { browser: true, es2017: true, node: true },
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
};
