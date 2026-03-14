import { isNonNullType, isListType, isEnumType, isInputObjectType, isScalarType } from 'graphql';
import type { GraphQLInputType, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
import { z } from 'zod';

const MAX_INPUT_DEPTH = 10;

/** Built-in GraphQL scalar name to Zod schema mapping (non-null versions) */
function builtinScalarToZod(scalarName: string): z.ZodType {
    switch (scalarName) {
        case 'String': {
            return z.string();
        }
        case 'Int': {
            return z.number().int();
        }
        case 'Float': {
            return z.number();
        }
        case 'Boolean': {
            return z.boolean();
        }
        case 'ID': {
            return z.string();
        }
        default: {
            // Unknown scalar: default to string
            return z.string();
        }
    }
}

export interface TypeMapperOptions {
    /** Custom scalar name -> Zod schema mapping */
    customScalars?: Record<string, z.ZodType>;
}

/**
 * Convert a GraphQL input type to a Zod schema.
 * Handles non-null wrappers, lists, scalars, enums, and input objects recursively.
 */
export function graphqlTypeToZod(type: GraphQLInputType, options?: TypeMapperOptions, visited?: Set<string>, depth = 0): z.ZodType {
    const visitedSet = visited ?? new Set<string>();

    // Non-null wrapper: unwrap and return without .optional()
    if (isNonNullType(type)) {
        return graphqlTypeToZodInner(type.ofType, options, visitedSet, depth);
    }

    // Everything else is nullable (optional + nullable) at this level
    const innerSchema = graphqlTypeToZodInner(type, options, visitedSet, depth);
    return innerSchema.nullish();
}

/**
 * Convert the inner (non-null-unwrapped) type. Returns a non-optional schema.
 */
function graphqlTypeToZodInner(
    type: GraphQLInputType,
    options: TypeMapperOptions | undefined,
    visited: Set<string>,
    depth: number
): z.ZodType {
    if (isListType(type)) {
        const elementSchema = graphqlTypeToZod(type.ofType, options, visited, depth);
        return z.array(elementSchema);
    }

    if (isEnumType(type)) {
        return enumToZod(type);
    }

    if (isInputObjectType(type)) {
        return inputObjectToZod(type, options, visited, depth);
    }

    if (isScalarType(type)) {
        // Check custom scalar mapping first
        if (options?.customScalars && type.name in options.customScalars) {
            return options.customScalars[type.name];
        }
        return builtinScalarToZod(type.name);
    }

    // Fallback for any unknown type
    return z.string();
}

function enumToZod(type: GraphQLEnumType): z.ZodType {
    const values = type.getValues().map(v => v.name) as [string, ...string[]];
    const schema = z.enum(values);
    return type.description ? schema.describe(type.description) : schema;
}

function inputObjectToZod(
    type: GraphQLInputObjectType,
    options: TypeMapperOptions | undefined,
    visited: Set<string>,
    depth: number
): z.ZodType {
    // Circular reference detection
    if (visited.has(type.name) && depth >= MAX_INPUT_DEPTH) {
        // At depth limit with circular ref, return a permissive schema
        return z.record(z.string(), z.unknown());
    }

    if (depth >= MAX_INPUT_DEPTH) {
        return z.record(z.string(), z.unknown());
    }

    const newVisited = new Set(visited);
    newVisited.add(type.name);

    const fields = type.getFields();
    const shape: Record<string, z.ZodType> = {};

    for (const [fieldName, field] of Object.entries(fields)) {
        let fieldSchema = graphqlTypeToZod(field.type, options, newVisited, depth + 1);
        if (field.description) {
            fieldSchema = fieldSchema.describe(field.description);
        }
        shape[fieldName] = fieldSchema;
    }

    const schema = z.object(shape);
    return type.description ? schema.describe(type.description) : schema;
}

/**
 * Convert GraphQL arguments to a Zod raw shape (Record<string, ZodType>).
 * This is the format expected by MCP SDK's registerTool inputSchema.
 */
export function argumentsToZodShape(
    args: readonly { name: string; type: GraphQLInputType; description?: string | null; defaultValue?: unknown }[],
    options?: TypeMapperOptions
): Record<string, z.ZodType> {
    const shape: Record<string, z.ZodType> = {};

    for (const arg of args) {
        let schema = graphqlTypeToZod(arg.type, options);

        // Add description
        const parts: string[] = [];
        if (arg.description) {
            parts.push(arg.description);
        }
        if (arg.defaultValue !== undefined) {
            parts.push(`Default: ${JSON.stringify(arg.defaultValue)}`);
        }
        if (parts.length > 0) {
            schema = schema.describe(parts.join('. '));
        }

        shape[arg.name] = schema;
    }

    return shape;
}
