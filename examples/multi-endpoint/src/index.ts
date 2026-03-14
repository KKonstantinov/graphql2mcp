import { createProxyServer } from 'graphql-to-mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Combine two GraphQL APIs into a single MCP server.
// Each endpoint gets a prefix to avoid tool name collisions.
const server = createProxyServer({
    endpoints: [
        {
            source: `
                type Query {
                    "Get countries, optionally filtered"
                    countries(filter: CountryFilter): [Country!]!
                    "Get a country by its ISO code"
                    country(code: ID!): Country
                }

                type Country {
                    code: ID!
                    name: String!
                    capital: String
                    currency: String
                }

                input CountryFilter {
                    code: String
                    continent: String
                }
            `,
            endpoint: 'https://countries.trevorblades.com/graphql',
            prefix: 'geo'
        },
        {
            source: `
                type Query {
                    "List all available languages"
                    languages(filter: LanguageFilter): [Language!]!
                    "Get a specific language by code"
                    language(code: ID!): Language
                }

                type Language {
                    code: ID!
                    name: String!
                    native: String
                    rtl: Boolean!
                }

                input LanguageFilter {
                    code: String
                }
            `,
            endpoint: 'https://countries.trevorblades.com/graphql',
            prefix: 'lang'
        }
    ],
    name: 'multi-endpoint-example'
});

const transport = new StdioServerTransport();
await server.connect(transport);
