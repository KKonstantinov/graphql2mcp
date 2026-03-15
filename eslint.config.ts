import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';

// eslint-disable-next-line @typescript-eslint/no-deprecated -- defineConfig not yet available in this version
export default tseslint.config(
    {
        ignores: [
            '**/dist/',
            '**/node_modules/',
            '**/bin/',
            '**/coverage/',
            'docs/.vitepress/cache/',
            'docs/.vitepress/dist/',
            'scripts/',
            '**/test/integration/bun.test.ts',
            '**/test/integration/deno.test.ts',
            '**/test/integration/node.test.mts'
        ]
    },
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    unicorn.configs['recommended'],
    {
        plugins: {
            'import-x': importX
        }
    },
    {
        rules: {
            // Short variable names are fine in this codebase
            'unicorn/prevent-abbreviations': 'off',
            // We use null returns
            'unicorn/no-null': 'off',
            // We use process.exit
            'unicorn/no-process-exit': 'off',
            // Our files use camelCase
            'unicorn/filename-case': 'off',
            // Enforce `import type` for type-only imports
            '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
            // Prefer `import type` over `import { type ... }`
            'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level']
        }
    },
    // Relaxed rules for test files
    {
        files: ['packages/*/test/**/*.ts', 'packages/*/test/**/*.mts'],
        rules: {
            // Tests use `any` casts for mock objects
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            // Tests use non-null assertions on known-good values
            '@typescript-eslint/no-non-null-assertion': 'off',
            // Test describe/it return promises that don't need handling
            '@typescript-eslint/no-floating-promises': 'off',
            // Test helpers defined inside describe blocks for locality
            'unicorn/consistent-function-scoping': 'off',
            // Async handlers without await are valid in tests
            '@typescript-eslint/require-await': 'off',
            // mockResolvedValue(undefined) is idiomatic in vitest
            'unicorn/no-useless-undefined': 'off'
        }
    },
    // Prettier must be last to override all formatting rules
    prettier
);
