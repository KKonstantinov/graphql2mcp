import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createProxyServer, createProxyServerFromUrl } from '../../src/server.js';
import { createMockGraphQLServer, createHeaderCapturingServer, createErrorServer, createNonGraphQLServer } from './helpers/mock-server.js';
import type { MockGraphQLServer } from './helpers/mock-server.js';

const SIMPLE_SDL = `
type Query {
    hello: String
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
}
type User {
    id: ID!
    name: String!
    email: String
}
`;

const MUTATION_SDL = `
type Query {
    hello: String
    user(id: ID!): User
}
type Mutation {
    createUser(name: String!, email: String!): User!
    deleteUser(id: ID!): Boolean!
}
type User {
    id: ID!
    name: String!
    email: String
}
`;

const SIMPLE_RESOLVERS = {
    hello: () => 'world',
    user: ({ id }: { id: string }) => ({ id, name: 'John', email: 'john@test.com' }),
    users: ({ limit }: { limit?: number }) => {
        const all = [
            { id: '1', name: 'Alice', email: 'alice@test.com' },
            { id: '2', name: 'Bob', email: 'bob@test.com' }
        ];
        return limit ? all.slice(0, limit) : all;
    }
};

const MUTATION_RESOLVERS = {
    ...SIMPLE_RESOLVERS,
    createUser: ({ name, email }: { name: string; email: string }) => ({
        id: '99',
        name,
        email
    }),
    deleteUser: () => true
};

async function connectClient(server: ReturnType<typeof createProxyServer>) {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    return client;
}

describe('Proxy E2E Integration', () => {
    // ─── 10.1.1 SDL file to proxy to tool invocation ───

    describe('10.1.1 SDL file -> proxy -> tool invocation', () => {
        let mockServer: MockGraphQLServer;
        let tempDir: string;
        let schemaFile: string;

        beforeAll(async () => {
            mockServer = await createMockGraphQLServer(SIMPLE_SDL, SIMPLE_RESOLVERS);
            tempDir = path.join(tmpdir(), `graphql2mcp-e2e-${Date.now()}`);
            mkdirSync(tempDir, { recursive: true });
            schemaFile = path.join(tempDir, 'schema.graphql');
            writeFileSync(schemaFile, SIMPLE_SDL);
        });

        afterAll(async () => {
            await mockServer.close();
            rmSync(tempDir, { recursive: true, force: true });
        });

        it('query_hello returns data from mock server', async () => {
            const server = createProxyServer({
                endpoints: [{ source: schemaFile, endpoint: mockServer.url }]
            });
            const client = await connectClient(server);

            const result = await client.callTool({ name: 'query_hello', arguments: {} });
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(1);
            const text = (result.content as Array<{ type: string; text: string }>)[0].text;
            expect(text).toContain('world');
        });

        it('query_user with args returns user data', async () => {
            const server = createProxyServer({
                endpoints: [{ source: schemaFile, endpoint: mockServer.url }]
            });
            const client = await connectClient(server);

            const result = await client.callTool({
                name: 'query_user',
                arguments: { id: '123' }
            });
            const text = (result.content as Array<{ type: string; text: string }>)[0].text;
            const parsed = JSON.parse(text);
            expect(parsed.user.id).toBe('123');
            expect(parsed.user.name).toBe('John');
        });

        it('lists all tools via tools/list', async () => {
            const server = createProxyServer({
                endpoints: [{ source: schemaFile, endpoint: mockServer.url }]
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            const names = tools.map(t => t.name);
            expect(names).toContain('query_hello');
            expect(names).toContain('query_user');
            expect(names).toContain('query_users');
            expect(tools).toHaveLength(3);
        });

        it('tools have correct annotations', async () => {
            const server = createProxyServer({
                endpoints: [{ source: schemaFile, endpoint: mockServer.url }]
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            for (const tool of tools) {
                expect(tool.annotations?.readOnlyHint).toBe(true);
                expect(tool.annotations?.destructiveHint).toBe(false);
                expect(tool.annotations?.openWorldHint).toBe(true);
            }
        });
    });

    // ─── 10.1.2 URL -> proxy -> tool invocation ───

    describe('10.1.2 URL -> proxy -> tool invocation', () => {
        let mockServer: MockGraphQLServer;

        beforeAll(async () => {
            mockServer = await createMockGraphQLServer(SIMPLE_SDL, SIMPLE_RESOLVERS);
        });

        afterAll(async () => {
            await mockServer.close();
        });

        it('introspects URL and creates working tools', async () => {
            const server = await createProxyServerFromUrl({
                url: mockServer.url
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            expect(tools.length).toBeGreaterThan(0);

            const result = await client.callTool({ name: 'query_hello', arguments: {} });
            const text = (result.content as Array<{ type: string; text: string }>)[0].text;
            expect(text).toContain('world');
        });
    });

    // ─── 10.1.3 Mutations E2E ───

    describe('10.1.4 Mutations whitelist E2E', () => {
        let mockServer: MockGraphQLServer;

        beforeAll(async () => {
            mockServer = await createMockGraphQLServer(MUTATION_SDL, MUTATION_RESOLVERS);
        });

        afterAll(async () => {
            await mockServer.close();
        });

        it('only whitelisted mutations are available', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: MUTATION_SDL,
                        endpoint: mockServer.url,
                        mutations: { whitelist: ['createUser'] }
                    }
                ]
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            const mutationTools = tools.filter(t => t.name.startsWith('mutation_'));
            expect(mutationTools).toHaveLength(1);
            expect(mutationTools[0].name).toBe('mutation_createUser');
        });

        it('whitelisted mutation executes correctly', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: MUTATION_SDL,
                        endpoint: mockServer.url,
                        mutations: { whitelist: ['createUser'] }
                    }
                ]
            });
            const client = await connectClient(server);

            const result = await client.callTool({
                name: 'mutation_createUser',
                arguments: { name: 'Jane', email: 'jane@test.com' }
            });
            const text = (result.content as Array<{ type: string; text: string }>)[0].text;
            const parsed = JSON.parse(text);
            expect(parsed.createUser.name).toBe('Jane');
            expect(parsed.createUser.email).toBe('jane@test.com');
        });

        it('all mutations mode works', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: MUTATION_SDL,
                        endpoint: mockServer.url,
                        mutations: 'all'
                    }
                ]
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            const mutationTools = tools.filter(t => t.name.startsWith('mutation_'));
            expect(mutationTools).toHaveLength(2);

            // Mutation tools should have correct annotations
            for (const tool of mutationTools) {
                expect(tool.annotations?.readOnlyHint).toBe(false);
                expect(tool.annotations?.destructiveHint).toBe(true);
            }
        });
    });

    // ─── 10.1.5 Multi-endpoint E2E ───

    describe('10.1.5 Multi-endpoint E2E', () => {
        let server1: MockGraphQLServer;
        let server2: MockGraphQLServer;

        const SDL2 = `
            type Query { ping: String }
        `;

        beforeAll(async () => {
            server1 = await createMockGraphQLServer(SIMPLE_SDL, SIMPLE_RESOLVERS);
            server2 = await createMockGraphQLServer(SDL2, {
                ping: () => 'pong'
            });
        });

        afterAll(async () => {
            await server1.close();
            await server2.close();
        });

        it('two endpoints with prefixed tools', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: SIMPLE_SDL,
                        endpoint: server1.url,
                        prefix: 'api1'
                    },
                    {
                        source: SDL2,
                        endpoint: server2.url,
                        prefix: 'api2'
                    }
                ]
            });
            const client = await connectClient(server);

            const { tools } = await client.listTools();
            const names = tools.map(t => t.name);

            // api1 tools
            expect(names).toContain('api1_query_hello');
            expect(names).toContain('api1_query_user');

            // api2 tools
            expect(names).toContain('api2_query_ping');
        });

        it('tools from different endpoints execute against correct servers', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: SIMPLE_SDL,
                        endpoint: server1.url,
                        prefix: 'api1'
                    },
                    {
                        source: SDL2,
                        endpoint: server2.url,
                        prefix: 'api2'
                    }
                ]
            });
            const client = await connectClient(server);

            const result1 = await client.callTool({
                name: 'api1_query_hello',
                arguments: {}
            });
            const text1 = (result1.content as Array<{ type: string; text: string }>)[0].text;
            expect(text1).toContain('world');

            const result2 = await client.callTool({
                name: 'api2_query_ping',
                arguments: {}
            });
            const text2 = (result2.content as Array<{ type: string; text: string }>)[0].text;
            expect(text2).toContain('pong');
        });
    });

    // ─── Error scenarios ───

    describe('Error handling E2E', () => {
        it('6.2.1 GraphQL errors returned with isError', async () => {
            const errorSdl = `type Query { failQuery: String }`;
            const mockServer = await createMockGraphQLServer(errorSdl, {
                failQuery: () => {
                    throw new Error('Something went wrong');
                }
            });

            try {
                const server = createProxyServer({
                    endpoints: [{ source: errorSdl, endpoint: mockServer.url }]
                });
                const client = await connectClient(server);

                const result = await client.callTool({
                    name: 'query_failQuery',
                    arguments: {}
                });
                expect(result.isError).toBe(true);
                const text = (result.content as Array<{ type: string; text: string }>)[0].text;
                expect(text).toContain('Something went wrong');
            } finally {
                await mockServer.close();
            }
        });

        it('6.2.2 Network error returned with isError', async () => {
            const server = createProxyServer({
                endpoints: [
                    {
                        source: `type Query { hello: String }`,
                        endpoint: 'http://127.0.0.1:1/graphql' // unreachable
                    }
                ],
                timeout: 2000
            });
            const client = await connectClient(server);

            const result = await client.callTool({
                name: 'query_hello',
                arguments: {}
            });
            expect(result.isError).toBe(true);
        });

        it('6.2.4 Non-JSON response returns error', async () => {
            const htmlServer = await createNonGraphQLServer();

            try {
                const server = createProxyServer({
                    endpoints: [
                        {
                            source: `type Query { hello: String }`,
                            endpoint: htmlServer.url
                        }
                    ]
                });
                const client = await connectClient(server);

                const result = await client.callTool({
                    name: 'query_hello',
                    arguments: {}
                });
                expect(result.isError).toBe(true);
                const text = (result.content as Array<{ type: string; text: string }>)[0].text;
                expect(text).toContain('JSON');
            } finally {
                await htmlServer.close();
            }
        });

        it('6.2.5 Auth failure returns error with HTTP status', async () => {
            const authServer = await createErrorServer(401);

            try {
                const server = createProxyServer({
                    endpoints: [
                        {
                            source: `type Query { hello: String }`,
                            endpoint: authServer.url
                        }
                    ]
                });
                const client = await connectClient(server);

                const result = await client.callTool({
                    name: 'query_hello',
                    arguments: {}
                });
                expect(result.isError).toBe(true);
                const text = (result.content as Array<{ type: string; text: string }>)[0].text;
                expect(text).toContain('401');
            } finally {
                await authServer.close();
            }
        });
    });

    // ─── Header passing ───

    describe('Headers', () => {
        it('6.1.4 Auth headers are sent in requests', async () => {
            const headerServer = await createHeaderCapturingServer(SIMPLE_SDL, SIMPLE_RESOLVERS);

            try {
                const server = createProxyServer({
                    endpoints: [
                        {
                            source: SIMPLE_SDL,
                            endpoint: headerServer.url,
                            headers: {
                                Authorization: 'Bearer test-token',
                                'X-Custom-Header': 'custom-value'
                            }
                        }
                    ]
                });
                const client = await connectClient(server);

                await client.callTool({ name: 'query_hello', arguments: {} });

                const lastHeaders = headerServer.getLastHeaders();
                expect(lastHeaders['authorization']).toBe('Bearer test-token');
                expect(lastHeaders['x-custom-header']).toBe('custom-value');
            } finally {
                await headerServer.close();
            }
        });
    });
});
