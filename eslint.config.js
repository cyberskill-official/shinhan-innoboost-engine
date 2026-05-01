// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';
import securityPlugin from 'eslint-plugin-security';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  importPlugin.flatConfigs.recommended,
  unicornPlugin.configs['flat/recommended'],
  securityPlugin.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Strict TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Hygiene
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'prefer-const': 'warn',

      // Workspace boundaries (engine cannot import from ui, etc.)
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './engine', from: './ui', message: 'engine cannot import from ui' },
            { target: './engine', from: './hitl', message: 'engine cannot import from hitl' },
            { target: './hitl', from: './ui', message: 'hitl cannot import from ui' },
          ],
        },
      ],

      // Project-specific: every API endpoint must call assertCan (P01-T07)
      // Custom rule loaded from .github/eslint-rules/assert-can.js (TODO)
    },
  },
  {
    ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**'],
  },
);
