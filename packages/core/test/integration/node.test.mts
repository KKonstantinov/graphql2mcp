import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadSchemaFromString, generateTools } from '../../dist/index.mjs';

const SIMPLE_SDL = 'type Query { hello: String, user(id: ID!): User }\ntype User { id: ID!, name: String!, email: String }';

describe('@graphql-to-mcp/core (Node.js)', () => {
    it('loads schema from SDL string', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        assert.ok(schema);
    });

    it('generates query tools from schema', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        assert.equal(result.tools.length, 2);
        assert.ok(result.tools.some(t => t.name === 'query_hello'));
        assert.ok(result.tools.some(t => t.name === 'query_user'));
    });

    it('tools have correct annotations', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        for (const tool of result.tools) {
            assert.equal(tool.annotations.readOnlyHint, true);
            assert.equal(tool.annotations.destructiveHint, false);
            assert.equal(tool.annotations.openWorldHint, true);
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
        assert.equal(mutations.length, 1);
        assert.equal(mutations[0].name, 'mutation_createUser');
        assert.equal(mutations[0].annotations.readOnlyHint, false);
        assert.equal(mutations[0].annotations.destructiveHint, true);
    });

    it('generates correct query documents', () => {
        const schema = loadSchemaFromString(SIMPLE_SDL);
        const result = generateTools({ schema });
        const userTool = result.tools.find(t => t.name === 'query_user');
        assert.ok(userTool);
        assert.ok(userTool.queryDocument.includes('query'));
        assert.ok(userTool.queryDocument.includes('user'));
        assert.ok(userTool.queryDocument.includes('$id'));
    });
});
