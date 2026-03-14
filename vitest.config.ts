import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: ['packages/core', 'packages/proxy', 'packages/lib']
    }
});
