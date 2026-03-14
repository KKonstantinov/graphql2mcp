import { describe, it, expect } from 'vitest';
import { buildSchema } from 'graphql';
import { generateTools } from '../../../src/converter/tool-generator.js';
import type { Logger } from '../../../src/converter/tool-generator.js';
import type { ConvertOptions } from '../../../src/types.js';

function makeOptions(sdl: string, overrides?: Partial<ConvertOptions>): ConvertOptions {
    const schema = buildSchema(sdl);
    return { schema, ...overrides };
}

function createLogger(): Logger & { warnings: string[]; infos: string[] } {
    const warnings: string[] = [];
    const infos: string[] = [];
    return {
        warnings,
        infos,
        warn(msg: string) {
            warnings.push(msg);
        },
        info(msg: string) {
            infos.push(msg);
        }
    };
}

describe('Tool Generation', () => {
    // ─── 3.1 Query Tools ───

    describe('3.1 Query Tools', () => {
        it('3.1.1 Single query with no args -> query_hello', () => {
            const result = generateTools(makeOptions('type Query { hello: String }'));
            expect(result.tools).toHaveLength(1);
            expect(result.tools[0].name).toBe('query_hello');
            expect(result.tools[0].operationType).toBe('query');
            expect(Object.keys(result.tools[0].inputSchema)).toHaveLength(0);
        });

        it('3.1.2 Query with scalar args -> params with Zod shape', () => {
            const sdl = `
                type Query { user(id: ID!): User }
                type User { id: ID!, name: String! }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools).toHaveLength(1);
            expect(result.tools[0].name).toBe('query_user');
            expect(result.tools[0].inputSchema).toHaveProperty('id');
            expect(result.tools[0].inputSchema.id.safeParse('123').success).toBe(true);
            expect(result.tools[0].inputSchema.id.safeParse(undefined).success).toBe(false);
        });

        it('3.1.3 Query with input arg -> nested input schema', () => {
            const sdl = `
                type Query { users(filter: UserFilter!): [User] }
                type User { id: ID! }
                input UserFilter { name: String, active: Boolean }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools[0].inputSchema).toHaveProperty('filter');
            expect(result.tools[0].inputSchema.filter.safeParse({ name: 'test' }).success).toBe(true);
        });

        it('3.1.4 Multiple queries -> one tool per field', () => {
            const sdl = `
                type Query {
                    a: String
                    b: String
                    c: String
                    d: String
                    e: String
                }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools).toHaveLength(5);
            const names = result.tools.map(t => t.name);
            expect(names).toContain('query_a');
            expect(names).toContain('query_e');
        });

        it('3.1.5 Query with description uses GraphQL description', () => {
            const sdl = `
                type Query {
                    "Fetch a user by ID"
                    user(id: ID!): String
                }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools[0].description).toBe('Fetch a user by ID');
        });

        it('3.1.6 Query without description gets default description', () => {
            const sdl = `
                type Query { user(id: ID!): String }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools[0].description).toBe('Execute the user GraphQL query');
        });

        it('3.1.7 No Query type -> zero query tools, warning logged', () => {
            const sdl = `
                type Mutation { doSomething: Boolean }
            `;
            const logger = createLogger();
            generateTools(makeOptions(sdl, { mutations: 'all' }), logger);
            expect(logger.warnings.some(w => w.includes('no Query type'))).toBe(true);
        });
    });

    // ─── 3.2 Query Tool Annotations ───

    describe('3.2 Query Tool Annotations', () => {
        it('3.2.1 Query tools have correct annotations', () => {
            const result = generateTools(makeOptions('type Query { hello: String }'));
            expect(result.tools[0].annotations).toEqual({
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true
            });
        });

        it('3.2.2 Query tool has correct title', () => {
            const result = generateTools(makeOptions('type Query { users: String }'));
            expect(result.tools[0].title).toBe('Query: users');
        });
    });

    // ─── 3.3 Mutation Tools ───

    describe('3.3 Mutation Tools', () => {
        const mutationSdl = `
            type Query { hello: String }
            type Mutation {
                createUser(input: CreateUserInput!): User!
                updateUser(id: ID!): User!
                deleteUser(id: ID!): Boolean!
            }
            type User { id: ID!, name: String! }
            input CreateUserInput { name: String!, email: String! }
        `;

        it('3.3.1 Mutations disabled (default) -> zero mutation tools', () => {
            const result = generateTools(makeOptions(mutationSdl));
            const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
            expect(mutationTools).toHaveLength(0);
        });

        it('3.3.2 Mutations "all" -> all mutation fields become tools', () => {
            const result = generateTools(makeOptions(mutationSdl, { mutations: 'all' }));
            const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
            expect(mutationTools).toHaveLength(3);
            expect(mutationTools.map(t => t.name)).toContain('mutation_createUser');
        });

        it('3.3.3 Mutations whitelist -> only whitelisted mutation', () => {
            const result = generateTools(
                makeOptions(mutationSdl, {
                    mutations: { whitelist: ['createUser'] }
                })
            );
            const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
            expect(mutationTools).toHaveLength(1);
            expect(mutationTools[0].name).toBe('mutation_createUser');
        });

        it('3.3.4 Whitelist non-existent -> zero mutation tools', () => {
            const result = generateTools(
                makeOptions(mutationSdl, {
                    mutations: { whitelist: ['nonexistent'] }
                })
            );
            const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
            expect(mutationTools).toHaveLength(0);
        });

        it('3.3.5 Mutation with input arg -> params match input type', () => {
            const result = generateTools(makeOptions(mutationSdl, { mutations: 'all' }));
            const createTool = result.tools.find(t => t.name === 'mutation_createUser')!;
            expect(createTool.inputSchema).toHaveProperty('input');
            expect(
                createTool.inputSchema.input.safeParse({
                    name: 'John',
                    email: 'j@t.com'
                }).success
            ).toBe(true);
        });

        it('3.3.6 Mutation annotations are correct', () => {
            const result = generateTools(makeOptions(mutationSdl, { mutations: 'all' }));
            const mutationTool = result.tools.find(t => t.operationType === 'mutation')!;
            expect(mutationTool.annotations).toEqual({
                readOnlyHint: false,
                destructiveHint: true,
                openWorldHint: true
            });
        });

        it('3.3.7 Mutation tool has correct title', () => {
            const result = generateTools(makeOptions(mutationSdl, { mutations: 'all' }));
            const createTool = result.tools.find(t => t.name === 'mutation_createUser')!;
            expect(createTool.title).toBe('Mutation: createUser');
        });

        it('3.3.8 No Mutation type with mutations enabled -> warning', () => {
            const logger = createLogger();
            generateTools(
                makeOptions('type Query { hello: String }', {
                    mutations: 'all'
                }),
                logger
            );
            expect(logger.warnings.some(w => w.includes('no Mutation type'))).toBe(true);
        });
    });

    // ─── 3.4 Subscriptions ───

    describe('3.4 Subscriptions', () => {
        it('3.4.1 Schema with subscriptions -> zero subscription tools, info logged', () => {
            const sdl = `
                type Query { hello: String }
                type Subscription { onUpdate: String }
            `;
            const logger = createLogger();
            const result = generateTools(makeOptions(sdl), logger);
            // No subscription tools
            expect(result.tools.every(t => t.operationType !== 'subscription')).toBe(true);
            expect(logger.infos.some(i => i.includes('subscriptions'))).toBe(true);
        });
    });

    // ─── 3.5 Filtering ───

    describe('3.5 Filtering', () => {
        const filterSdl = `
            type Query {
                user: String
                users: String
                internal: String
                admin: String
            }
        `;

        it('3.5.1 Include filter -> only matching tools', () => {
            const result = generateTools(makeOptions(filterSdl, { include: ['user'] }));
            expect(result.tools).toHaveLength(1);
            expect(result.tools[0].name).toBe('query_user');
        });

        it('3.5.2 Exclude filter -> all except excluded', () => {
            const result = generateTools(makeOptions(filterSdl, { exclude: ['internal'] }));
            expect(result.tools).toHaveLength(3);
            expect(result.tools.map(t => t.name)).not.toContain('query_internal');
        });

        it('3.5.3 Include + exclude -> exclude takes precedence', () => {
            const result = generateTools(
                makeOptions(filterSdl, {
                    include: ['user', 'admin'],
                    exclude: ['admin']
                })
            );
            expect(result.tools).toHaveLength(1);
            expect(result.tools[0].name).toBe('query_user');
        });

        it('3.5.4 Everything excluded -> throws "No tools were generated"', () => {
            expect(() =>
                generateTools(
                    makeOptions(filterSdl, {
                        exclude: ['user', 'users', 'internal', 'admin']
                    })
                )
            ).toThrow('No tools were generated');
        });
    });

    // ─── 3.5 Edge Cases ───

    describe('3.5 Edge Cases', () => {
        it('3.5.1 No Query type with mutations disabled -> throws', () => {
            const sdl = `type Mutation { create: Boolean }`;
            expect(() => generateTools(makeOptions(sdl))).toThrow();
        });

        it('3.5.2 No Mutation type with mutations enabled -> warning, query tools still work', () => {
            const sdl = `type Query { hello: String }`;
            const logger = createLogger();
            const result = generateTools(makeOptions(sdl, { mutations: 'all' }), logger);
            expect(result.tools).toHaveLength(1);
            expect(logger.warnings.some(w => w.includes('no Mutation type'))).toBe(true);
        });

        it('3.5.3 Subscription only schema -> throws', () => {
            const sdl = `
                type Query
                type Subscription { onUpdate: String }
            `;
            expect(() => generateTools(makeOptions(sdl))).toThrow();
        });
    });

    // ─── Query document generation ───

    describe('Query document generation', () => {
        it('generates query document for simple query', () => {
            const result = generateTools(makeOptions('type Query { hello: String }'));
            expect(result.tools[0].queryDocument).toContain('query');
            expect(result.tools[0].queryDocument).toContain('hello');
        });

        it('generates query document with variables for args', () => {
            const sdl = `
                type Query { user(id: ID!): User }
                type User { id: ID!, name: String! }
            `;
            const result = generateTools(makeOptions(sdl));
            expect(result.tools[0].queryDocument).toContain('$id');
            expect(result.tools[0].queryDocument).toContain('ID!');
        });

        it('generates mutation document', () => {
            const sdl = `
                type Query { hello: String }
                type Mutation { createUser(name: String!): Boolean }
            `;
            const result = generateTools(makeOptions(sdl, { mutations: 'all' }));
            const mutationTool = result.tools.find(t => t.operationType === 'mutation')!;
            expect(mutationTool.queryDocument).toContain('mutation');
            expect(mutationTool.queryDocument).toContain('createUser');
        });
    });

    // ─── Custom prefix ───

    describe('Custom prefix', () => {
        it('uses custom query prefix', () => {
            const result = generateTools(
                makeOptions('type Query { users: String }', {
                    queryPrefix: 'q_'
                })
            );
            expect(result.tools[0].name).toBe('q_users');
        });

        it('uses custom mutation prefix', () => {
            const sdl = `
                type Query { hello: String }
                type Mutation { create: Boolean }
            `;
            const result = generateTools(
                makeOptions(sdl, {
                    mutations: 'all',
                    mutationPrefix: 'm_'
                })
            );
            const mutTool = result.tools.find(t => t.operationType === 'mutation')!;
            expect(mutTool.name).toBe('m_create');
        });
    });
});
