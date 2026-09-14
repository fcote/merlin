import parser from '@typescript-eslint/parser'
import ts from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import importHelpers from 'eslint-plugin-import-helpers'
import globals from 'globals'

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
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            'module',
            [
              '/^@config/',
              '/^@logger/',
              '/^@pubSub/',
              '/^@knex/',
              '/^@links/',
              '/^@drivers/',
              '/^@typings/',
              '/^@helpers/',
              '/^@middlewares/',
              '/^@jobs/',
              '/^@resolvers/',
              '/^@services/',
              '/^@models/',
            ],
            'parent',
            ['sibling', 'index'],
          ],
          alphabetize: {
            order: 'asc',
            ignoreCase: true,
          },
        },
      ],
      'prettier/prettier': [
        'warn',
        {
          trailingComma: 'es5',
          tabWidth: 2,
          semi: false,
          singleQuote: true,
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
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
