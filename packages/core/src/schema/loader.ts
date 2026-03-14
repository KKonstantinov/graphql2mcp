import { readFileSync, globSync } from 'node:fs';
import path from 'node:path';
import { buildSchema, buildClientSchema } from 'graphql';
import type { GraphQLSchema, IntrospectionQuery } from 'graphql';

/**
 * Load a GraphQL schema from an SDL string.
 */
export function loadSchemaFromString(sdl: string): GraphQLSchema {
    const trimmed = sdl.trim();
    if (trimmed.length === 0) {
        throw new Error('Invalid GraphQL SDL: empty string');
    }
    try {
        return buildSchema(trimmed);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid GraphQL SDL: ${message}`, { cause: error });
    }
}

/**
 * Load a GraphQL schema from a .graphql/.gql file path.
 */
export function loadSchemaFromFile(filePath: string): GraphQLSchema {
    const resolved = path.resolve(filePath);
    let content: string;
    try {
        content = readFileSync(resolved, 'utf8');
    } catch {
        throw new Error(`Schema file not found: ${resolved}`);
    }
    return loadSchemaFromString(content);
}

/**
 * Load and merge GraphQL schemas from a glob pattern.
 */
export function loadSchemaFromGlob(pattern: string): GraphQLSchema {
    const files = globSync(pattern);
    if (files.length === 0) {
        throw new Error(`No .graphql files found matching pattern: ${pattern}`);
    }
    const sdlParts: string[] = [];
    for (const file of files) {
        sdlParts.push(readFileSync(path.resolve(file), 'utf8'));
    }
    return loadSchemaFromString(sdlParts.join('\n'));
}

/**
 * Load a GraphQL schema from an introspection result JSON file.
 */
export function loadSchemaFromIntrospectionFile(filePath: string): GraphQLSchema {
    const resolved = path.resolve(filePath);
    let content: string;
    try {
        content = readFileSync(resolved, 'utf8');
    } catch {
        throw new Error(`Schema file not found: ${resolved}`);
    }
    let json: unknown;
    try {
        json = JSON.parse(content) as unknown;
    } catch (error) {
        throw new Error(`Invalid introspection result: file is not valid JSON`, { cause: error });
    }
    return loadSchemaFromIntrospectionResult(json);
}

/**
 * Load a GraphQL schema from an introspection result object.
 */
export function loadSchemaFromIntrospectionResult(json: unknown): GraphQLSchema {
    try {
        const introspection =
            typeof json === 'object' && json !== null && 'data' in json
                ? (json as { data: IntrospectionQuery }).data
                : (json as IntrospectionQuery);
        return buildClientSchema(introspection);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid introspection result: ${message}`, { cause: error });
    }
}

/**
 * Detect the type of a schema source string and load accordingly.
 * - If it contains newlines or type definitions, treat as SDL string
 * - If it ends in .json, treat as introspection JSON file
 * - If it ends in .graphql or .gql, treat as SDL file
 * - If it contains glob characters (* or ?), treat as glob pattern
 */
export function loadSchema(source: string): GraphQLSchema {
    const trimmed = source.trim();

    // SDL string detection: contains newlines or starts with schema/type definitions
    if (trimmed.includes('\n') || /^(type |schema |input |enum |interface |union |scalar |extend |directive )/.test(trimmed)) {
        return loadSchemaFromString(trimmed);
    }

    // File path detection
    if (trimmed.endsWith('.json')) {
        return loadSchemaFromIntrospectionFile(trimmed);
    }

    if (trimmed.includes('*') || trimmed.includes('?')) {
        return loadSchemaFromGlob(trimmed);
    }

    if (trimmed.endsWith('.graphql') || trimmed.endsWith('.gql')) {
        return loadSchemaFromFile(trimmed);
    }

    // Fallback: try as SDL string
    return loadSchemaFromString(trimmed);
}
