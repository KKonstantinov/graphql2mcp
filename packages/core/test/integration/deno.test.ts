// deno-lint-ignore-file
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { assert } from 'https://deno.land/std@0.224.0/assert/assert.ts';

// Import from built dist — run `pnpm build` first
import { loadSchemaFromString, generateTools } from '../../dist/index.mjs';

const SIMPLE_SDL = 'type Query { hello: String, user(id: ID!): User }\ntype User { id: ID!, name: String!, email: String }';

Deno.test('loads schema from SDL string', () => {
    const schema = loadSchemaFromString(SIMPLE_SDL);
    assert(schema);
});

Deno.test('generates query tools from schema', () => {
    const schema = loadSchemaFromString(SIMPLE_SDL);
    const result = generateTools({ schema });
    assertEquals(result.tools.length, 2);
    assert(result.tools.some((t: any) => t.name === 'query_hello'));
    assert(result.tools.some((t: any) => t.name === 'query_user'));
});

Deno.test('tools have correct annotations', () => {
    const schema = loadSchemaFromString(SIMPLE_SDL);
    const result = generateTools({ schema });
    for (const tool of result.tools) {
        assertEquals((tool as any).annotations.readOnlyHint, true);
        assertEquals((tool as any).annotations.destructiveHint, false);
        assertEquals((tool as any).annotations.openWorldHint, true);
    }
});

Deno.test('generates mutation tools when enabled', () => {
    const sdl = `
        type Query { hello: String }
        type Mutation { createUser(name: String!): User! }
        type User { id: ID!, name: String! }
    `;
    const schema = loadSchemaFromString(sdl);
    const result = generateTools({ schema, mutations: 'all' });
    const mutations = result.tools.filter((t: any) => t.operationType === 'mutation');
    assertEquals(mutations.length, 1);
    assertEquals((mutations[0] as any).name, 'mutation_createUser');
    assertEquals((mutations[0] as any).annotations.readOnlyHint, false);
    assertEquals((mutations[0] as any).annotations.destructiveHint, true);
});

Deno.test('generates correct query documents', () => {
    const schema = loadSchemaFromString(SIMPLE_SDL);
    const result = generateTools({ schema });
    const userTool = result.tools.find((t: any) => t.name === 'query_user');
    assert(userTool);
    assert((userTool as any).queryDocument.includes('query'));
    assert((userTool as any).queryDocument.includes('user'));
    assert((userTool as any).queryDocument.includes('$id'));
});
