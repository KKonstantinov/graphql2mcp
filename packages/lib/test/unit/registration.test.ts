import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import { buildSchema } from 'graphql';
import { registerGraphQLTools } from '../../src/registration.js';
import type { z } from 'zod';

// Create a mock McpServer-like object
function createMockServer() {
    const registeredTools: Array<{
        name: string;
        config: {
            title?: string;
            description?: string;
            inputSchema?: Record<string, z.ZodType>;
            annotations?: {
                readOnlyHint?: boolean;
                destructiveHint?: boolean;
                openWorldHint?: boolean;
            };
        };
        handler: (args: Record<string, unknown>) => Promise<{
            isError?: boolean;
            content: Array<{ type: 'text'; text: string }>;
        }>;
    }> = [];

    return {
        registeredTools,
        registerTool: vi.fn(
            (
                name: string,
                config: {
                    title?: string;
                    description?: string;
                    inputSchema?: Record<string, z.ZodType>;
                    annotations?: {
                        readOnlyHint?: boolean;
                        destructiveHint?: boolean;
                        openWorldHint?: boolean;
                    };
                },
                handler: (args: Record<string, unknown>) => Promise<{
                    isError?: boolean;
                    content: Array<{ type: 'text'; text: string }>;
                }>
            ) => {
                registeredTools.push({ name, config, handler });
            }
        )
    };
}

const SIMPLE_SDL = `
type Query {
    hello: String
    user(id: ID!): User
}
type User { id: ID!, name: String! }
`;

const MUTATION_SDL = `
type Query { hello: String }
type Mutation {
    createUser(name: String!): User!
    deleteUser(id: ID!): Boolean!
}
type User { id: ID!, name: String! }
`;

const FIXTURES_DIR = path.join(import.meta.dirname, '../../../core/test/fixtures');

describe('Library: registerGraphQLTools', () => {
    // ─── 9.1 Register from SDL ───

    it('9.1 Register from SDL string', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql'
        });

        expect(result.count).toBe(2);
        expect(result.tools).toHaveLength(2);
        expect(result.tools.map(t => t.name)).toContain('query_hello');
        expect(result.tools.map(t => t.name)).toContain('query_user');

        // Verify tools were registered on the server
        expect(server.registerTool).toHaveBeenCalledTimes(2);
    });

    // ─── 9.2 Register from file ───

    it('9.2 Register from file', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: path.join(FIXTURES_DIR, 'simple.graphql'),
            endpoint: 'http://localhost:4000/graphql'
        });

        expect(result.count).toBe(3); // hello, user, users
        expect(result.tools.map(t => t.name)).toContain('query_hello');
    });

    // ─── 9.4 Register from schema object ───

    it('9.4 Register from schema object', () => {
        const schema = buildSchema(SIMPLE_SDL);
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            schema,
            endpoint: 'http://localhost:4000/graphql'
        });

        expect(result.count).toBe(2);
    });

    // ─── 9.5 Returns metadata ───

    it('9.5 Returns metadata with tools and count', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql'
        });

        expect(result).toHaveProperty('tools');
        expect(result).toHaveProperty('count');
        expect(result.count).toBe(result.tools.length);

        for (const tool of result.tools) {
            expect(tool).toHaveProperty('name');
            expect(tool).toHaveProperty('title');
            expect(tool).toHaveProperty('operationType');
            expect(tool).toHaveProperty('fieldName');
        }
    });

    // ─── 9.6 No transport management ───

    it('9.6 Does not create or manage transports', () => {
        const server = createMockServer();
        registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql'
        });

        // The server should only have registerTool called, nothing else
        expect(server.registerTool).toHaveBeenCalled();
        // No connect/close/transport methods should be called
    });

    // ─── 9.7 Mutations whitelist ───

    it('9.7 Mutations whitelist registers only whitelisted', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: MUTATION_SDL,
            endpoint: 'http://localhost:4000/graphql',
            mutations: { whitelist: ['createUser'] }
        });

        const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
        expect(mutationTools).toHaveLength(1);
        expect(mutationTools[0].name).toBe('mutation_createUser');
    });

    // ─── Error: missing source and schema ───

    it('throws when neither source nor schema is provided', () => {
        const server = createMockServer();
        expect(() =>
            registerGraphQLTools(server, {
                endpoint: 'http://localhost:4000/graphql'
            } as any)
        ).toThrow(/source.*schema/i);
    });

    // ─── Annotations on registered tools ───

    it('registered query tools have readOnlyHint annotation', () => {
        const server = createMockServer();
        registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql'
        });

        for (const tool of server.registeredTools) {
            expect(tool.config.annotations?.readOnlyHint).toBe(true);
            expect(tool.config.annotations?.destructiveHint).toBe(false);
        }
    });

    it('registered mutation tools have destructiveHint annotation', () => {
        const server = createMockServer();
        registerGraphQLTools(server, {
            source: MUTATION_SDL,
            endpoint: 'http://localhost:4000/graphql',
            mutations: 'all'
        });

        const mutationTools = server.registeredTools.filter(t => t.name.startsWith('mutation_'));
        for (const tool of mutationTools) {
            expect(tool.config.annotations?.readOnlyHint).toBe(false);
            expect(tool.config.annotations?.destructiveHint).toBe(true);
        }
    });

    // ─── Include/exclude ───

    it('respects include filter', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql',
            include: ['hello']
        });

        expect(result.count).toBe(1);
        expect(result.tools[0].name).toBe('query_hello');
    });

    it('respects exclude filter', () => {
        const server = createMockServer();
        const result = registerGraphQLTools(server, {
            source: SIMPLE_SDL,
            endpoint: 'http://localhost:4000/graphql',
            exclude: ['hello']
        });

        expect(result.count).toBe(1);
        expect(result.tools[0].name).toBe('query_user');
    });
});
