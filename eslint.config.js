import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

const sharedGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  Audio: 'readonly',
  Image: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  Date: 'readonly',
  Math: 'readonly',
  Object: 'readonly',
  Proxy: 'readonly',
  Set: 'readonly',
  Promise: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  performance: 'readonly',
  Event: 'readonly',
  confirm: 'readonly',
  localStorage: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  HTMLElement: 'readonly',
  HTMLCanvasElement: 'readonly',
  HTMLInputElement: 'readonly',
  Node: 'readonly',
};

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: sharedGlobals,
    },
    rules: {
      'no-console': 'off', // Allow console for game debugging
      'no-constant-condition': 'warn',
      'no-case-declarations': 'off', // Allow lexical declarations in case blocks
      // Delegate formatting to Prettier
      semi: 'off',
      quotes: 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test mocks
    },
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'styles/**',
      '*.config.js',
      'docs/scripts/**',
      'docs/**',
      '.claude/**',
      '.github/**',
      '.kilocode/**',
      '.serena/**',
    ],
  },
  // Run Prettier last so it can report formatting issues
  prettierPlugin,
];
