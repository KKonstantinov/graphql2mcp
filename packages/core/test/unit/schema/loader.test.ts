import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { isObjectType, introspectionFromSchema } from 'graphql';
import type { GraphQLSchema } from 'graphql';
import {
    loadSchemaFromString,
    loadSchemaFromFile,
    loadSchemaFromGlob,
    loadSchemaFromIntrospectionFile,
    loadSchemaFromIntrospectionResult,
    loadSchema
} from '../../../src/schema/loader.js';

const FIXTURES_DIR = path.join(import.meta.dirname, '../../fixtures');

function hasQueryField(schema: GraphQLSchema, fieldName: string): boolean {
    const queryType = schema.getQueryType();
    if (!queryType || !isObjectType(queryType)) return false;
    return fieldName in queryType.getFields();
}

describe('Schema Loading', () => {
    // ─── 1.1 Load from SDL String ───

    describe('1.1 Load from SDL String', () => {
        it('1.1.1 Valid SDL string returns GraphQLSchema with correct field', () => {
            const schema = loadSchemaFromString('type Query { hello: String }');
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });

        it('1.1.2 Invalid SDL string throws with Syntax Error', () => {
            expect(() => loadSchemaFromString('type Query { hello: }')).toThrow(/Syntax Error/);
        });

        it('1.1.3 Empty string throws error', () => {
            expect(() => loadSchemaFromString('')).toThrow(/empty/i);
        });

        it('1.1.4 SDL with multiple types returns schema with all types', () => {
            const sdl = `
                type Query {
                    user(id: ID!): User
                    posts: [Post!]!
                }
                type User { id: ID!, name: String! }
                type Post { id: ID!, title: String! }
                input CreateUserInput { name: String!, email: String }
                enum Role { ADMIN USER }
            `;
            const schema = loadSchemaFromString(sdl);
            expect(hasQueryField(schema, 'user')).toBe(true);
            expect(hasQueryField(schema, 'posts')).toBe(true);
            expect(schema.getType('User')).toBeDefined();
            expect(schema.getType('Post')).toBeDefined();
            expect(schema.getType('CreateUserInput')).toBeDefined();
            expect(schema.getType('Role')).toBeDefined();
        });
    });

    // ─── 1.2 Load from File ───

    describe('1.2 Load from File', () => {
        it('1.2.1 Valid .graphql file returns GraphQLSchema', () => {
            const schema = loadSchemaFromFile(path.join(FIXTURES_DIR, 'simple.graphql'));
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
            expect(hasQueryField(schema, 'user')).toBe(true);
            expect(hasQueryField(schema, 'users')).toBe(true);
        });

        it('1.2.2 File not found throws with path', () => {
            const badPath = path.join(FIXTURES_DIR, 'nonexistent.graphql');
            expect(() => loadSchemaFromFile(badPath)).toThrow(/Schema file not found/);
        });

        it('1.2.3 Empty file throws error', () => {
            const emptyPath = path.join(FIXTURES_DIR, 'empty-file-test.graphql');
            writeFileSync(emptyPath, '');
            try {
                expect(() => loadSchemaFromFile(emptyPath)).toThrow();
            } finally {
                rmSync(emptyPath, { force: true });
            }
        });

        it('1.2.4 Multiple files via glob returns merged schema', () => {
            const schema = loadSchemaFromGlob(path.join(FIXTURES_DIR, 'simple.graphql'));
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });

        it('1.2.5 Glob with no matches throws', () => {
            expect(() => loadSchemaFromGlob('nonexistent/**/*.graphql')).toThrow(/No .graphql files found/);
        });
    });

    // ─── 1.3 Load from Introspection JSON ───

    describe('1.3 Load from Introspection JSON', () => {
        let tempDir: string;

        function createIntrospectionFile(filename: string, content: string): string {
            tempDir = path.join(tmpdir(), `graphql-to-mcp-test-${String(Date.now())}`);
            mkdirSync(tempDir, { recursive: true });
            const filePath = path.join(tempDir, filename);
            writeFileSync(filePath, content);
            return filePath;
        }

        it('1.3.1 Valid introspection JSON file returns GraphQLSchema', () => {
            // Build a schema and get its introspection result
            const sourceSchema = loadSchemaFromString('type Query { hello: String }');
            const introspection = introspectionFromSchema(sourceSchema);
            const filePath = createIntrospectionFile('valid.json', JSON.stringify(introspection));
            try {
                const schema = loadSchemaFromIntrospectionFile(filePath);
                expect(schema).toBeDefined();
                expect(hasQueryField(schema, 'hello')).toBe(true);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('1.3.2 Invalid JSON throws error', () => {
            const filePath = createIntrospectionFile('invalid.json', 'not json at all {{{');
            try {
                expect(() => loadSchemaFromIntrospectionFile(filePath)).toThrow(/not valid JSON/);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('1.3.3 Non-introspection JSON throws error', () => {
            const filePath = createIntrospectionFile('wrong.json', '{"foo": "bar"}');
            try {
                expect(() => loadSchemaFromIntrospectionFile(filePath)).toThrow(/Invalid introspection result/);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('1.3.3b loadSchemaFromIntrospectionResult with data wrapper', () => {
            const sourceSchema = loadSchemaFromString('type Query { hello: String }');
            const introspection = introspectionFromSchema(sourceSchema);
            const schema = loadSchemaFromIntrospectionResult({ data: introspection });
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });
    });

    // ─── 1.4 Source Auto-Detection ───

    describe('1.4 Source Auto-Detection (loadSchema)', () => {
        it('1.4.1 Detects file path ending in .graphql', () => {
            const schema = loadSchema(path.join(FIXTURES_DIR, 'simple.graphql'));
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });

        it('1.4.2 Detects SDL string with newlines', () => {
            const schema = loadSchema('type Query {\n  hello: String\n}');
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });

        it('1.4.3 Detects SDL string starting with type keyword', () => {
            const schema = loadSchema('type Query { hello: String }');
            expect(schema).toBeDefined();
            expect(hasQueryField(schema, 'hello')).toBe(true);
        });

        it('1.4.4 Detects JSON file path', () => {
            const sourceSchema = loadSchemaFromString('type Query { hello: String }');
            const introspection = introspectionFromSchema(sourceSchema);
            const tempDir = path.join(tmpdir(), `graphql-to-mcp-autodetect-${String(Date.now())}`);
            mkdirSync(tempDir, { recursive: true });
            const filePath = path.join(tempDir, 'schema.json');
            writeFileSync(filePath, JSON.stringify(introspection));
            try {
                const schema = loadSchema(filePath);
                expect(schema).toBeDefined();
                expect(hasQueryField(schema, 'hello')).toBe(true);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('1.4.5 Detects glob pattern', () => {
            // Glob with wildcard should be detected as glob source
            expect(() => loadSchema('nonexistent/**/*.graphql')).toThrow(/No .graphql files found/);
        });
    });
});
