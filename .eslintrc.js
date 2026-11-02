process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
  },
  ignorePatterns: [
    '*.yml',
    '*.js',
  ],
}
