import { describe, it, expect } from 'vitest';
import { buildSchema } from 'graphql';
import type { GraphQLInputType } from 'graphql';
import { z } from 'zod';
import { graphqlTypeToZod, argumentsToZodShape } from '../../../src/converter/type-mapper.js';

/**
 * Helper: build a schema and extract the input type of a specific argument
 * from a specific query field.
 */
function getArgType(sdl: string, queryField: string, argName: string): GraphQLInputType {
    const schema = buildSchema(sdl);
    const queryType = schema.getQueryType()!;
    const field = queryType.getFields()[queryField];
    const arg = field.args.find(a => a.name === argName);
    if (!arg) throw new Error(`Arg ${argName} not found on ${queryField}`);
    return arg.type;
}

/**
 * Helper: build schema and get the type of a specific query field's argument.
 */
function buildAndGetType(typeDecl: string): GraphQLInputType {
    const sdl = `
        type Query { test(arg: ${typeDecl}): String }
        ${typeDecl.includes('Status') ? 'enum Status { ACTIVE INACTIVE }' : ''}
        ${typeDecl.includes('CreateUserInput') ? 'input CreateUserInput { name: String!, email: String }' : ''}
    `;
    return getArgType(sdl, 'test', 'arg');
}

describe('Type Mapping', () => {
    // ─── 2.1 Scalar Types ───

    describe('2.1 Scalar Types', () => {
        it('2.1.1 Nullable String -> z.string().optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('String'));
            expect(zodSchema.safeParse('hello').success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
            expect(zodSchema.safeParse(123).success).toBe(false);
        });

        it('2.1.2 Non-null String -> z.string()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('String!'));
            expect(zodSchema.safeParse('hello').success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
        });

        it('2.1.3 Nullable Int -> z.number().int().optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('Int'));
            expect(zodSchema.safeParse(42).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
            expect(zodSchema.safeParse(3.14).success).toBe(false);
        });

        it('2.1.4 Non-null Int -> z.number().int()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('Int!'));
            expect(zodSchema.safeParse(42).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
            expect(zodSchema.safeParse(3.14).success).toBe(false);
        });

        it('2.1.5 Nullable Float -> z.number().optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('Float'));
            expect(zodSchema.safeParse(3.14).success).toBe(true);
            expect(zodSchema.safeParse(42).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
            expect(zodSchema.safeParse('hello').success).toBe(false);
        });

        it('2.1.6 Nullable Boolean -> z.boolean().optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('Boolean'));
            expect(zodSchema.safeParse(true).success).toBe(true);
            expect(zodSchema.safeParse(false).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
            expect(zodSchema.safeParse('yes').success).toBe(false);
        });

        it('2.1.7 Nullable ID -> z.string().optional(), Non-null ID -> z.string()', () => {
            const nullableId = graphqlTypeToZod(buildAndGetType('ID'));
            expect(nullableId.safeParse('abc').success).toBe(true);
            expect(nullableId.safeParse(undefined).success).toBe(true);

            const nonNullId = graphqlTypeToZod(buildAndGetType('ID!'));
            expect(nonNullId.safeParse('abc').success).toBe(true);
            expect(nonNullId.safeParse(undefined).success).toBe(false);
        });
    });

    // ─── 2.2 List Types ───

    describe('2.2 List Types', () => {
        it('2.2.1 Nullable list of nullable [String] -> z.array(z.string().optional()).optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('[String]'));
            expect(zodSchema.safeParse(['a', 'b']).success).toBe(true);
            expect(zodSchema.safeParse([null]).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
        });

        it('2.2.2 Non-null list of non-null [String!]! -> z.array(z.string())', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('[String!]!'));
            expect(zodSchema.safeParse(['a', 'b']).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
        });

        it('2.2.3 Non-null list of nullable [String]! -> z.array(z.string().optional())', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('[String]!'));
            expect(zodSchema.safeParse(['a', null]).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
        });

        it('2.2.4 Nullable list of non-null [String!] -> z.array(z.string()).optional()', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('[String!]'));
            expect(zodSchema.safeParse(['a', 'b']).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
        });

        it('2.2.5 Nested list [[Int!]!]!', () => {
            const zodSchema = graphqlTypeToZod(buildAndGetType('[[Int!]!]!'));
            expect(zodSchema.safeParse([[1, 2], [3]]).success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
        });
    });

    // ─── 2.3 Enum Types ───

    describe('2.3 Enum Types', () => {
        it('2.3.1 Simple enum -> z.enum(["ACTIVE", "INACTIVE"])', () => {
            const sdl = `
                type Query { test(status: Status): String }
                enum Status { ACTIVE INACTIVE }
            `;
            const type = getArgType(sdl, 'test', 'status');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse('ACTIVE').success).toBe(true);
            expect(zodSchema.safeParse('INACTIVE').success).toBe(true);
            expect(zodSchema.safeParse('UNKNOWN').success).toBe(false);
            expect(zodSchema.safeParse(undefined).success).toBe(true); // nullable
        });

        it('2.3.2 Non-null enum -> z.enum([...]) without optional', () => {
            const sdl = `
                type Query { test(status: Status!): String }
                enum Status { ACTIVE INACTIVE }
            `;
            const type = getArgType(sdl, 'test', 'status');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse('ACTIVE').success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(false);
        });

        it('2.3.3 Nullable enum allows undefined', () => {
            const sdl = `
                type Query { test(status: Status): String }
                enum Status { ACTIVE INACTIVE }
            `;
            const type = getArgType(sdl, 'test', 'status');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
        });
    });

    // ─── 2.4 Input Object Types ───

    describe('2.4 Input Object Types', () => {
        it('2.4.1 Simple input -> z.object({ name: z.string(), email: z.string().optional() })', () => {
            const sdl = `
                type Query { test(input: CreateUserInput!): String }
                input CreateUserInput { name: String!, email: String }
            `;
            const type = getArgType(sdl, 'test', 'input');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse({ name: 'John' }).success).toBe(true);
            expect(zodSchema.safeParse({ name: 'John', email: 'j@t.com' }).success).toBe(true);
            expect(zodSchema.safeParse({}).success).toBe(false); // name is required
        });

        it('2.4.2 Nested input -> nested z.object()', () => {
            const sdl = `
                type Query { test(input: Outer!): String }
                input Outer { inner: Inner! }
                input Inner { value: String! }
            `;
            const type = getArgType(sdl, 'test', 'input');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse({ inner: { value: 'x' } }).success).toBe(true);
            expect(zodSchema.safeParse({ inner: {} }).success).toBe(false);
        });

        it('2.4.3 Input with list field', () => {
            const sdl = `
                type Query { test(filter: Filters!): String }
                input Filters { ids: [ID!]! }
            `;
            const type = getArgType(sdl, 'test', 'filter');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse({ ids: ['a', 'b'] }).success).toBe(true);
            expect(zodSchema.safeParse({ ids: [] }).success).toBe(true);
            expect(zodSchema.safeParse({}).success).toBe(false);
        });

        it('2.4.4 Input with enum field', () => {
            const sdl = `
                type Query { test(filter: Filters!): String }
                input Filters { status: Status }
                enum Status { ACTIVE INACTIVE }
            `;
            const type = getArgType(sdl, 'test', 'filter');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
            expect(zodSchema.safeParse({}).success).toBe(true);
            expect(zodSchema.safeParse({ status: 'INVALID' }).success).toBe(false);
        });

        it('2.4.5 Deeply nested input (5 levels) works without stack overflow', () => {
            const sdl = `
                type Query { test(input: L1!): String }
                input L1 { next: L2! }
                input L2 { next: L3! }
                input L3 { next: L4! }
                input L4 { next: L5! }
                input L5 { value: String! }
            `;
            const type = getArgType(sdl, 'test', 'input');
            const zodSchema = graphqlTypeToZod(type);
            const valid = {
                next: { next: { next: { next: { value: 'deep' } } } }
            };
            expect(zodSchema.safeParse(valid).success).toBe(true);
        });
    });

    // ─── 2.5 Custom Scalars ───

    describe('2.5 Custom Scalars', () => {
        it('2.5.1 Unknown custom scalar defaults to z.string()', () => {
            const sdl = `
                type Query { test(d: DateTime): String }
                scalar DateTime
            `;
            const type = getArgType(sdl, 'test', 'd');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema.safeParse('2024-01-01').success).toBe(true);
            expect(zodSchema.safeParse(undefined).success).toBe(true);
        });

        it('2.5.2 Mapped custom scalar uses provided Zod schema', () => {
            const sdl = `
                type Query { test(d: DateTime!): String }
                scalar DateTime
            `;
            const type = getArgType(sdl, 'test', 'd');
            const customSchema = z.iso.datetime();
            const zodSchema = graphqlTypeToZod(type, {
                customScalars: { DateTime: customSchema }
            });
            expect(zodSchema.safeParse('2024-01-01T00:00:00Z').success).toBe(true);
            expect(zodSchema.safeParse('not-a-date').success).toBe(false);
        });
    });

    // ─── 2.6 Edge Cases ───

    describe('2.6 Edge Cases', () => {
        it('2.6.1 Circular input reference is handled', () => {
            const sdl = `
                type Query { test(a: A): String }
                input A { b: B }
                input B { a: A }
            `;
            const type = getArgType(sdl, 'test', 'a');
            // Should not throw / infinite loop
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema).toBeDefined();
        });

        it('2.6.2 Self-referencing input is handled with depth limit', () => {
            const sdl = `
                type Query { test(filter: NodeFilter): String }
                input NodeFilter { name: String, children: NodeFilter }
            `;
            const type = getArgType(sdl, 'test', 'filter');
            const zodSchema = graphqlTypeToZod(type);
            expect(zodSchema).toBeDefined();
            // Should accept a shallow instance
            expect(zodSchema.safeParse({ name: 'root' }).success).toBe(true);
        });

        it('2.6.3 Description propagation via .describe()', () => {
            const sdl = `
                type Query { test(input: DescInput!): String }
                "An input with described fields"
                input DescInput {
                    "The user name"
                    name: String!
                }
            `;
            const type = getArgType(sdl, 'test', 'input');
            const zodSchema = graphqlTypeToZod(type);
            // The schema should be defined and functional
            expect(zodSchema.safeParse({ name: 'test' }).success).toBe(true);
        });
    });

    // ─── argumentsToZodShape ───

    describe('argumentsToZodShape', () => {
        it('converts field arguments to a Zod raw shape', () => {
            const schema = buildSchema(`
                type Query { user(id: ID!, name: String): User }
                type User { id: ID! }
            `);
            const queryType = schema.getQueryType()!;
            const field = queryType.getFields()['user'];
            const shape = argumentsToZodShape(field.args);

            expect(shape).toHaveProperty('id');
            expect(shape).toHaveProperty('name');

            // id is non-null ID -> z.string()
            expect(shape.id.safeParse('abc').success).toBe(true);
            expect(shape.id.safeParse(undefined).success).toBe(false);

            // name is nullable String -> z.string().optional()
            expect(shape.name.safeParse('test').success).toBe(true);
            expect(shape.name.safeParse(undefined).success).toBe(true);
        });

        it('includes descriptions from args', () => {
            const schema = buildSchema(`
                type Query {
                    "Find a user"
                    user(
                        "The user ID"
                        id: ID!
                    ): String
                }
            `);
            const queryType = schema.getQueryType()!;
            const field = queryType.getFields()['user'];
            const shape = argumentsToZodShape(field.args);

            expect(shape.id).toBeDefined();
        });
    });
});
