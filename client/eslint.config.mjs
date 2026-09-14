import parser from '@typescript-eslint/parser'
import ts from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import importHelpers from 'eslint-plugin-import-helpers'
import globals from 'globals'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['node_modules/**', 'build/**', 'dist/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier,
      'import-helpers': importHelpers,
      react,
      'react-hooks': hooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-redeclare': 'error',
      'no-console': 'error',
      'no-shadow': 'off',
      'prefer-template': 'error',
      'no-empty': 'error',
      'no-debugger': 'warn',
      'no-unused-vars': 'off',
      'prettier/prettier': [
        'warn',
        {
          trailingComma: 'es5',
          tabWidth: 2,
          semi: false,
          singleQuote: true,
        },
      ],
      'react/jsx-key': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
]
