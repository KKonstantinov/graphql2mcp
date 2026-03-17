import { createProxyServerFromUrl } from 'graphql2mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = await createProxyServerFromUrl({
    url: 'https://countries.trevorblades.com/graphql'
});

const transport = new StdioServerTransport();
await server.connect(transport);
