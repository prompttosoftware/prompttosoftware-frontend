import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginPrettier from 'eslint-plugin-prettier';
import js from '@eslint/js';

// Manual imports for plugins, as `compat.extends` might not expose them for direct rule usage
import tseslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.extends(
    // Base recommended configurations
    'plugin:@typescript-eslint/recommended', // Includes eslint-recommended
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    // Next.js specific configurations
    'next',
    'next/core-web-vitals',
    // Prettier should be last to override stylistic rules
    'prettier',
  ),
  {
    // Apply to all JS/TS files that are not specifically overridden
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier: pluginPrettier, // Added explicitly for `prettier/prettier` rule
    },
    rules: {
      // Prettier rule
      'prettier/prettier': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React to be imported
      'react/prop-types': 'off', // Disable prop-types in Next.js/TypeScript projects

      // Next.js specific rule (if not already handled by next/core-web-vitals)
      '@next/next/no-img-element': 'off', // Allow <img> tags

      // General JS/TS rules from old .eslintrc.js
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // Handled by @typescript-eslint
      eqeqeq: ['error', 'always'], // Require === and !==
      'no-unneeded-ternary': 'error', // Disallow unneeded ternary expressions
      'prefer-const': 'error', // Require const for variables that are never reassigned
      'no-use-before-define': 'off', // Handled by @typescript-eslint

      // TypeScript ESLint rules from old .eslintrc.js
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, variables: true },
      ],

      // JSX A11y rules
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
    },
    // Language options for the main config for TypeScript files
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Override for Jest config file
    files: ['jest.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Ensure the Jest setup file is also processed correctly
  {
    files: ['jest.setup.ts'],
    rules: {
      // Add specific overrides if needed for jest.setup.ts
      // For now, let's see if the general config covers the unused vars,
      // otherwise, we might need to be more specific here.
      // Example: '@typescript-eslint/no-unused-vars': 'off',
      // For `any` in jest.setup.ts, it might be acceptable for mocking setup.
      // '@typescript-eslint/no-explicit-any': 'off', // Only if absolutely necessary
    },
  },
  {
    // Override for test files in services (costEstimationService.test.ts)
    files: ['src/services/*.test.ts', '**/*.test.ts'],
    rules: {
      // Often, variables in test files are defined but only used for setup/assertions
      // If the general '@typescript-eslint/no-unused-vars' with `argsIgnorePattern`
      // isn't sufficient, we might need to loosen it here.
      // '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_.+|[iI]gnored' }],
    },
  },
];

export default eslintConfig;
