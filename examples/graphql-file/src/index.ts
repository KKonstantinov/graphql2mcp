import path from 'node:path';
import { createProxyServer } from 'graphql-to-mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const schemaPath = path.join(import.meta.dirname, '../schema.graphql');

const server = createProxyServer({
    endpoints: [
        {
            source: schemaPath,
            endpoint: 'http://localhost:4000/graphql'
        }
    ],
    name: 'sdl-file-example'
});

const transport = new StdioServerTransport();
await server.connect(transport);
