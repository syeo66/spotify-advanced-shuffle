module.exports = {
  extends: ['react-app', 'eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaFeatures: { modules: true },
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['prettier', 'simple-import-sort'],
  root: true,
  rules: {
    complexity: ['warn', 15],
    eqeqeq: 'error',
    'linebreak-style': ['error', 'unix'],
    'no-console': 'warn',
    'no-else-return': 'error',
    'no-empty': 'error',
    'no-shadow': 'warn',
    'prefer-destructuring': 'error',
    'prefer-template': 'error',
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
  },
};
