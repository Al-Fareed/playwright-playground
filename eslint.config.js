import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import i from 'eslint-plugin-import';
import reactRefresh from 'eslint-plugin-react-refresh';
import parser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['dist', 'test-results'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintPluginPrettierRecommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: i,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-empty-pattern': 2,
      'import/no-useless-path-segments': 2,
      'import/export': 2,
      'import/no-extraneous-dependencies': 2,
      'import/no-unused-modules': 2,
      'import/no-amd': 2,
      'import/no-commonjs': 2,
      'import/first': 2,
      'import/exports-last': 0,
      'import/no-duplicates': 2,
      'import/no-namespace': 0,
      'import/order': 2,
      'import/newline-after-import': 2,
      'import/prefer-default-export': 0,
    },
  },
);
