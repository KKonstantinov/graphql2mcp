import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadSchemaFromFile, generateTools } from '../../src/index.js';

const FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures');

describe('Core Integration: Schema to Tools E2E', () => {
    // ─── 10.2.1 Complex schema ───

    it('10.2.1 Complex schema generates all query tools with correct schemas', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'complex.graphql'));
        const result = generateTools({ schema });

        // 3 query fields: searchUsers, user, roles
        expect(result.tools).toHaveLength(3);

        const names = result.tools.map(t => t.name);
        expect(names).toContain('query_searchUsers');
        expect(names).toContain('query_user');
        expect(names).toContain('query_roles');

        // searchUsers has filter and pagination args
        const searchTool = result.tools.find(t => t.name === 'query_searchUsers')!;
        expect(searchTool.inputSchema).toHaveProperty('filter');
        expect(searchTool.inputSchema).toHaveProperty('pagination');
        expect(searchTool.description).toBe('Search for users by filter');

        // user has id arg
        const userTool = result.tools.find(t => t.name === 'query_user')!;
        expect(userTool.inputSchema).toHaveProperty('id');
        expect(userTool.inputSchema.id.safeParse('abc').success).toBe(true);

        // roles has no args
        const rolesTool = result.tools.find(t => t.name === 'query_roles')!;
        expect(Object.keys(rolesTool.inputSchema)).toHaveLength(0);
    });

    // ─── Complex schema with mutations ───

    it('Complex schema with mutations enabled generates mutation tools', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'complex.graphql'));
        const result = generateTools({ schema, mutations: 'all' });

        // 3 queries + 3 mutations
        expect(result.tools).toHaveLength(6);

        const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
        expect(mutationTools).toHaveLength(3);
        expect(mutationTools.map(t => t.name)).toContain('mutation_createUser');
        expect(mutationTools.map(t => t.name)).toContain('mutation_updateUser');
        expect(mutationTools.map(t => t.name)).toContain('mutation_deleteUser');

        // createUser mutation has input arg with CreateUserInput shape
        const createTool = mutationTools.find(t => t.name === 'mutation_createUser')!;
        expect(createTool.inputSchema).toHaveProperty('input');
        expect(
            createTool.inputSchema.input.safeParse({
                name: 'John',
                email: 'john@test.com',
                role: 'ADMIN'
            }).success
        ).toBe(true);
    });

    // ─── 10.2.2 Minimal schema ───

    it('10.2.2 Minimal schema -> single query_hello tool', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'simple.graphql'));
        const result = generateTools({ schema, include: ['hello'] });
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].name).toBe('query_hello');
        expect(Object.keys(result.tools[0].inputSchema)).toHaveLength(0);
    });

    // ─── Interfaces schema ───

    it('Interfaces schema generates tools with correct selection sets', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'interfaces.graphql'));
        const result = generateTools({ schema });

        expect(result.tools).toHaveLength(2);
        const nodeTool = result.tools.find(t => t.name === 'query_node')!;
        expect(nodeTool.queryDocument).toContain('__typename');
        expect(nodeTool.queryDocument).toContain('... on User');
        expect(nodeTool.queryDocument).toContain('... on Post');
    });

    // ─── No-query schema ───

    it('No-query schema with mutations enabled generates mutation tools', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'no-query.graphql'));
        const result = generateTools({ schema, mutations: 'all' });
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].name).toBe('mutation_doSomething');
        expect(result.tools[0].operationType).toBe('mutation');
    });

    // ─── Circular input schema ───

    it('Circular input schema handles self-referencing input types', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'circular-input.graphql'));
        const result = generateTools({ schema });
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].name).toBe('query_findNodes');
        // Should not stack overflow
        expect(result.tools[0].inputSchema).toHaveProperty('filter');
    });

    // ─── Mutation whitelist ───

    it('Mutation whitelist only generates whitelisted mutations', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'complex.graphql'));
        const result = generateTools({
            schema,
            mutations: { whitelist: ['createUser'] }
        });

        const mutationTools = result.tools.filter(t => t.operationType === 'mutation');
        expect(mutationTools).toHaveLength(1);
        expect(mutationTools[0].name).toBe('mutation_createUser');
    });

    // ─── All annotations correct ───

    it('All query tools have readOnlyHint true, all mutations destructiveHint true', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'complex.graphql'));
        const result = generateTools({ schema, mutations: 'all' });

        for (const tool of result.tools) {
            if (tool.operationType === 'query') {
                expect(tool.annotations.readOnlyHint).toBe(true);
                expect(tool.annotations.destructiveHint).toBe(false);
            } else {
                expect(tool.annotations.readOnlyHint).toBe(false);
                expect(tool.annotations.destructiveHint).toBe(true);
            }
            expect(tool.annotations.openWorldHint).toBe(true);
        }
    });

    // ─── Query documents ───

    it('generates correct query documents', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'simple.graphql'));
        const result = generateTools({ schema });
        const userTool = result.tools.find(t => t.name === 'query_user')!;
        expect(userTool).toBeDefined();
        expect(userTool.queryDocument).toContain('query');
        expect(userTool.queryDocument).toContain('user');
        expect(userTool.queryDocument).toContain('$id');
    });

    // ─── Titles are correct ───

    it('All tools have correct title format', () => {
        const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'complex.graphql'));
        const result = generateTools({ schema, mutations: 'all' });

        for (const tool of result.tools) {
            if (tool.operationType === 'query') {
                expect(tool.title).toBe(`Query: ${tool.fieldName}`);
            } else {
                expect(tool.title).toBe(`Mutation: ${tool.fieldName}`);
            }
        }
    });
});
