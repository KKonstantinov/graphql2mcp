import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { buildSchema, graphql } from 'graphql';
import { registerGraphQLTools } from '../../src/registration.js';

const SIMPLE_SDL = `
type Query {
    hello: String
    user(id: ID!): User
}
type User {
    id: ID!
    name: String!
    email: String
}
`;

const RESOLVERS = {
    hello: () => 'world',
    user: ({ id }: { id: string }) => ({ id, name: 'TestUser', email: 'test@example.com' })
};

interface MockServer {
    server: Server;
    url: string;
    close: () => Promise<void>;
}

function createMockGraphQLServer(sdl: string, rootValue: Record<string, unknown>): Promise<MockServer> {
    const gqlSchema = buildSchema(sdl);
    const server = createServer((req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        req.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            const parsed = JSON.parse(body) as { query: string; variables?: Record<string, unknown> };

            void graphql({
                schema: gqlSchema,
                source: parsed.query,
                rootValue,
                variableValues: parsed.variables
            }).then(result => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        });
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') throw new Error('Failed to get server address');
            const url = `http://127.0.0.1:${String(address.port)}/graphql`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((r, j) => {
                        server.close(e => {
                            e ? j(e) : r();
                        });
                    })
            });
        });
    });
}

async function connectClient(server: McpServer) {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    return client;
}

describe('Library E2E: registerGraphQLTools on McpServer', () => {
    let mockServer: MockServer;

    beforeAll(async () => {
        mockServer = await createMockGraphQLServer(SIMPLE_SDL, RESOLVERS);
    });

    afterAll(async () => {
        await mockServer.close();
    });

    // ─── 10.1.3 SDL -> lib -> tool invocation ───

    it('10.1.3 registers tools and invokes them successfully', async () => {
        const server = new McpServer({ name: 'test-lib-server', version: '1.0.0' });

        const result = registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: mockServer.url
        });

        expect(result.count).toBe(2);
        expect(result.tools.map(t => t.name)).toContain('query_hello');
        expect(result.tools.map(t => t.name)).toContain('query_user');

        const client = await connectClient(server);

        // Test query_hello
        const helloResult = await client.callTool({ name: 'query_hello', arguments: {} });
        expect(helloResult.content).toHaveLength(1);
        const helloText = (helloResult.content as Array<{ type: string; text: string }>)[0].text;
        expect(helloText).toContain('world');

        // Test query_user with args
        const userResult = await client.callTool({ name: 'query_user', arguments: { id: '42' } });
        const userText = (userResult.content as Array<{ type: string; text: string }>)[0].text;
        const parsed = JSON.parse(userText) as { user: { id: string; name: string } };
        expect(parsed.user.id).toBe('42');
        expect(parsed.user.name).toBe('TestUser');
    });

    it('tools listed via client have correct annotations', async () => {
        const server = new McpServer({ name: 'test-lib-server', version: '1.0.0' });

        registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: mockServer.url
        });

        const client = await connectClient(server);
        const { tools } = await client.listTools();

        for (const tool of tools) {
            expect(tool.annotations?.readOnlyHint).toBe(true);
            expect(tool.annotations?.destructiveHint).toBe(false);
            expect(tool.annotations?.openWorldHint).toBe(true);
        }
    });

    it('GraphQL errors are returned with isError true', async () => {
        const errorSdl = `type Query { fail: String }`;
        const errorServer = await createMockGraphQLServer(errorSdl, {
            fail: () => {
                throw new Error('Test error');
            }
        });

        try {
            const server = new McpServer({ name: 'test-error', version: '1.0.0' });
            registerGraphQLTools(server, {
                source: errorSdl,
                endpoint: errorServer.url
            });

            const client = await connectClient(server);
            const result = await client.callTool({ name: 'query_fail', arguments: {} });
            expect(result.isError).toBe(true);
            const text = (result.content as Array<{ type: string; text: string }>)[0].text;
            expect(text).toContain('Test error');
        } finally {
            await errorServer.close();
        }
    });

    it('network errors are returned with isError true', async () => {
        const server = new McpServer({ name: 'test-network-error', version: '1.0.0' });
        registerGraphQLTools(server, {
            source: `type Query { hello: String }`,
            endpoint: 'http://127.0.0.1:1/graphql', // unreachable
            timeout: 2000
        });

        const client = await connectClient(server);
        const result = await client.callTool({ name: 'query_hello', arguments: {} });
        expect(result.isError).toBe(true);
    });
});
