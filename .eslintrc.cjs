module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx}', 'tests/**/*.{js,jsx}'],
      env: { jest: true },
    },
  ],
};
