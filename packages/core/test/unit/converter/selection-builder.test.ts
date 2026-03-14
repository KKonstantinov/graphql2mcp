import { describe, it, expect } from 'vitest';
import { buildSchema } from 'graphql';
import { buildSelectionSet } from '../../../src/converter/selection-builder.js';

function getReturnType(sdl: string, queryField: string) {
    const schema = buildSchema(sdl);
    const queryType = schema.getQueryType()!;
    const field = queryType.getFields()[queryField];
    return { type: field.type, schema };
}

describe('Field Selection (Selection Builder)', () => {
    // ─── 4.1 Scalar return ───

    it('4.1 Scalar return -> empty string (no selection set)', () => {
        const { type, schema } = getReturnType('type Query { hello: String }', 'hello');
        const selection = buildSelectionSet(type, schema, 3);
        expect(selection).toBe('');
    });

    // ─── 4.2 Object with scalar fields ───

    it('4.2 Object with scalar fields at depth 1', () => {
        const sdl = `
            type Query { user: User }
            type User { id: ID!, name: String!, email: String }
        `;
        const { type, schema } = getReturnType(sdl, 'user');
        const selection = buildSelectionSet(type, schema, 1);
        expect(selection).toContain('id');
        expect(selection).toContain('name');
        expect(selection).toContain('email');
    });

    // ─── 4.3 Nested object ───

    it('4.3 Nested object at depth 2', () => {
        const sdl = `
            type Query { user: User }
            type User { id: ID!, posts: [Post!]! }
            type Post { id: ID!, title: String! }
        `;
        const { type, schema } = getReturnType(sdl, 'user');
        const selection = buildSelectionSet(type, schema, 2);
        expect(selection).toContain('id');
        expect(selection).toContain('posts');
        expect(selection).toContain('title');
    });

    // ─── 4.4 Depth limit hit ───

    it('4.4 Depth limit stops nested objects', () => {
        const sdl = `
            type Query { user: User }
            type User { id: ID!, posts: [Post!]! }
            type Post { id: ID!, title: String!, author: User! }
        `;
        const { type, schema } = getReturnType(sdl, 'user');
        const selection = buildSelectionSet(type, schema, 1);
        expect(selection).toContain('id');
        // At depth 1, posts is an object type that should be excluded
        expect(selection).not.toContain('posts');
    });

    // ─── 4.5 Default depth 3 ───

    it('4.5 Default depth 3 selects up to 3 levels', () => {
        const sdl = `
            type Query { user: User }
            type User { id: ID!, profile: Profile! }
            type Profile { bio: String!, address: Address! }
            type Address { city: String!, country: String! }
        `;
        const { type, schema } = getReturnType(sdl, 'user');
        const selection = buildSelectionSet(type, schema, 3);
        expect(selection).toContain('id');
        expect(selection).toContain('profile');
        expect(selection).toContain('bio');
        expect(selection).toContain('address');
        expect(selection).toContain('city');
        expect(selection).toContain('country');
    });

    // ─── 4.6 Interface return type ───

    it('4.6 Interface return uses __typename and inline fragments', () => {
        const sdl = `
            type Query { node(id: ID!): Node }
            interface Node { id: ID! }
            type User implements Node { id: ID!, name: String! }
            type Post implements Node { id: ID!, title: String! }
        `;
        const { type, schema } = getReturnType(sdl, 'node');
        const selection = buildSelectionSet(type, schema, 2);
        expect(selection).toContain('__typename');
        expect(selection).toContain('... on User');
        expect(selection).toContain('... on Post');
        expect(selection).toContain('name');
        expect(selection).toContain('title');
    });

    // ─── 4.7 Union return type ───

    it('4.7 Union return uses __typename and inline fragments', () => {
        const sdl = `
            type Query { search(q: String!): [SearchResult!]! }
            union SearchResult = User | Post
            type User { id: ID!, name: String! }
            type Post { id: ID!, title: String! }
        `;
        const { type, schema } = getReturnType(sdl, 'search');
        const selection = buildSelectionSet(type, schema, 2);
        expect(selection).toContain('__typename');
        expect(selection).toContain('... on User');
        expect(selection).toContain('... on Post');
    });

    // ─── 4.8 List return type ───

    it('4.8 List return uses same selection as element type', () => {
        const sdl = `
            type Query { users: [User!]! }
            type User { id: ID!, name: String!, email: String }
        `;
        const { type, schema } = getReturnType(sdl, 'users');
        const selection = buildSelectionSet(type, schema, 2);
        expect(selection).toContain('id');
        expect(selection).toContain('name');
        expect(selection).toContain('email');
    });

    // ─── Edge cases ───

    it('Enum return type -> no selection set', () => {
        const sdl = `
            type Query { status: Status }
            enum Status { ACTIVE INACTIVE }
        `;
        const { type, schema } = getReturnType(sdl, 'status');
        const selection = buildSelectionSet(type, schema, 3);
        expect(selection).toBe('');
    });
});
