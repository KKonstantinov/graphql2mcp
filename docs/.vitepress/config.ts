import { defineConfig } from 'vitepress';

const title = 'graphql-to-mcp';
const description = 'Convert GraphQL schemas and endpoints into MCP servers';
const siteUrl = 'https://kkonstantinov.github.io/graphql-to-mcp/';

export default defineConfig({
    title,
    description,

    base: '/graphql-to-mcp/',
    cleanUrls: true,
    lastUpdated: true,

    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/graphql-to-mcp/favicon.svg' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: siteUrl }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }]
    ],

    themeConfig: {
        logo: '/favicon.svg',

        nav: [
            { text: 'Guide', link: '/getting-started' },
            { text: 'API', link: '/core' },
            {
                text: 'Packages',
                items: [
                    { text: 'CLI Proxy (graphql-to-mcp)', link: '/cli' },
                    { text: 'Library (@graphql-to-mcp/lib)', link: '/library' },
                    { text: 'Core (@graphql-to-mcp/core)', link: '/core' }
                ]
            },
            {
                text: 'GitHub',
                link: 'https://github.com/KKonstantinov/graphql-to-mcp'
            }
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Getting Started', link: '/getting-started' },
                    { text: 'CLI Reference', link: '/cli' },
                    { text: 'Library Mode', link: '/library' },
                    { text: 'Mutations', link: '/mutations' }
                ]
            },
            {
                text: 'Packages',
                items: [
                    { text: 'CLI Proxy', link: '/packages/proxy' },
                    { text: 'Library', link: '/packages/lib' },
                    { text: 'Core', link: '/packages/core' }
                ]
            },
            {
                text: 'Reference',
                items: [
                    { text: 'Core API', link: '/core' },
                    { text: 'Architecture', link: '/architecture' }
                ]
            }
        ],

        outline: [2, 3],

        editLink: {
            pattern: 'https://github.com/KKonstantinov/graphql-to-mcp/edit/main/docs/:path'
        },

        footer: {
            message: 'Released under the <a href="https://github.com/KKonstantinov/graphql-to-mcp/blob/main/LICENSE">MIT License</a>.',
            copyright: 'Copyright &copy; 2025-present'
        },

        search: {
            provider: 'local'
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/KKonstantinov/graphql-to-mcp' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/graphql-to-mcp' }
        ]
    }
});
