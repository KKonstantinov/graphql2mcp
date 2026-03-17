import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { registerGraphQLTools } from '@graphql2mcp/lib';

// Create your own MCP server with custom tools
const server = new McpServer({
    name: 'my-hybrid-server',
    version: '1.0.0'
});

// Register your own custom tools
server.registerTool(
    'ping',
    {
        title: 'Ping',
        description: 'Simple health check tool',
        inputSchema: {
            message: z.string().optional().describe('Optional message to echo back')
        }
    },
    ({ message }) => ({
        content: [{ type: 'text', text: `pong: ${message ?? 'no message'}` }]
    })
);

// Add GraphQL tools from a schema alongside your custom tools
const result = registerGraphQLTools(server, {
    source: `
        type Query {
            "Get a list of countries"
            countries(filter: CountryFilter): [Country!]!
            "Get a specific country by code"
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
    endpoint: 'https://countries.trevorblades.com/graphql'
});

console.error(`Registered ${String(result.count)} GraphQL tools: ${result.tools.map(t => t.name).join(', ')}`);
console.error('Plus custom tool: ping');

const transport = new StdioServerTransport();
await server.connect(transport);
