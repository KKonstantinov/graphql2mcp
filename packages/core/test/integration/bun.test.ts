import { describe, it, expect } from 'bun:test';
import { loadSchemaFromString, generateTools } from '../../dist/index.mjs';

const SIMPLE_SDL = 'type Query { hello: String, user(id: ID!): User }\ntype User { id: ID!, name: String!, email: String }';

describe('@graphql-to-mcp/core (Bun)', () => {
    it('loads schema from SDL string', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        expect(schema).toBeDefined();
    });

    it('generates query tools from schema', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        expect(result.tools).toHaveLength(2);
        expect(result.tools.map(t => t.name)).toContain('query_hello');
        expect(result.tools.map(t => t.name)).toContain('query_user');
    });

    it('tools have correct annotations', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        for (const tool of result.tools) {
            expect(tool.annotations.readOnlyHint).toBe(true);
            expect(tool.annotations.destructiveHint).toBe(false);
            expect(tool.annotations.openWorldHint).toBe(true);
        }
    });

    it('generates mutation tools when enabled', () => {
        const sdl = `
            type Query { hello: String }
            type Mutation { createUser(name: String!): User! }
            type User { id: ID!, name: String! }
        `;
        const schema = loadSchemaFromString(sdl);
        const result = generateTools({ schema, mutations: 'all' });
        const mutations = result.tools.filter(t => t.operationType === 'mutation');
        expect(mutations).toHaveLength(1);
        expect(mutations[0].name).toBe('mutation_createUser');
        expect(mutations[0].annotations.readOnlyHint).toBe(false);
        expect(mutations[0].annotations.destructiveHint).toBe(true);
    });

    it('generates correct query documents', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        const userTool = result.tools.find(t => t.name === 'query_user');
        expect(userTool).toBeDefined();
        expect(userTool!.queryDocument).toContain('query');
        expect(userTool!.queryDocument).toContain('user');
        expect(userTool!.queryDocument).toContain('$id');
    });
});
