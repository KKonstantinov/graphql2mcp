import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        exclude: ['test/integration/bun.test.ts', 'test/integration/deno.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/index.ts'],
            reporter: ['text', 'lcov']
        }
    }
});
