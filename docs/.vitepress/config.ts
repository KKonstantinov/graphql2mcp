import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'graphql-to-mcp',
    description: 'Convert GraphQL schemas and endpoints into MCP servers',
    base: '/graphql-to-mcp/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/getting-started' },
            { text: 'API', link: '/api' },
            { text: 'npm', link: 'https://www.npmjs.com/package/graphql-to-mcp' },
            { text: 'GitHub', link: 'https://github.com/KKonstantinov/graphql-to-mcp' }
        ],
        sidebar: [
            {
                text: 'Introduction',
                items: [{ text: 'Getting Started', link: '/getting-started' }]
            },
            {
                text: 'Packages',
                items: [
                    { text: 'Core', link: '/packages/core' },
                    { text: 'Proxy', link: '/packages/proxy' },
                    { text: 'Library', link: '/packages/lib' }
                ]
            },
            {
                text: 'Reference',
                items: [
                    { text: 'API', link: '/api' },
                    { text: 'Architecture', link: '/architecture' }
                ]
            }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/KKonstantinov/graphql-to-mcp' }],
        search: {
            provider: 'local'
        }
    }
});
