import { readFileSync, globSync } from 'node:fs';
import path from 'node:path';
import { buildSchema, buildClientSchema, getIntrospectionQuery } from 'graphql';
import type { GraphQLSchema, IntrospectionQuery } from 'graphql';
import { executeGraphQL, DEFAULT_TIMEOUT } from '../execution.js';

/**
 * Load a GraphQL schema from an SDL string.
 *
 * @param sdl - A GraphQL Schema Definition Language string
 * @returns The parsed GraphQL schema
 * @throws If the SDL is empty or contains syntax errors
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
 * Load a GraphQL schema from a `.graphql` or `.gql` file.
 *
 * @param filePath - Absolute or relative path to the schema file
 * @returns The parsed GraphQL schema
 * @throws If the file does not exist or contains invalid SDL
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
 *
 * All matching files are concatenated and parsed as a single SDL document.
 *
 * @param pattern - A glob pattern (e.g. `"schemas/*.graphql"`)
 * @returns The merged GraphQL schema
 * @throws If no files match the pattern
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
 *
 * Supports both raw `IntrospectionQuery` and wrapped `{ data: IntrospectionQuery }` formats.
 *
 * @param filePath - Path to the JSON file containing the introspection result
 * @returns The built GraphQL schema
 * @throws If the file does not exist, is not valid JSON, or is not a valid introspection result
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
 *
 * Accepts both raw `IntrospectionQuery` and wrapped `{ data: IntrospectionQuery }` formats.
 *
 * @param json - The parsed introspection result
 * @returns The built GraphQL schema
 * @throws If the input is not a valid introspection result
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

/** Options for {@link loadSchemaFromUrl}. */
export interface LoadSchemaFromUrlOptions {
    /** The GraphQL endpoint URL to introspect */
    url: string;
    /** HTTP headers (e.g. `Authorization`) */
    headers?: Record<string, string>;
    /** Request timeout in milliseconds. Default: `30000` */
    timeout?: number;
}

/**
 * Load a GraphQL schema by sending an introspection query to a live endpoint.
 *
 * @param options - URL, headers, and timeout configuration
 * @returns The introspected GraphQL schema
 * @throws If introspection is disabled, returns errors, or the request fails
 */
export async function loadSchemaFromUrl(options: LoadSchemaFromUrlOptions): Promise<GraphQLSchema> {
    const headers = options.headers ?? {};
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    const result = await executeGraphQL(options.url, getIntrospectionQuery(), {}, headers, timeout);

    if (result.errors && result.errors.length > 0) {
        const messages = result.errors.map(e => e.message).join(', ');
        if (messages.toLowerCase().includes('introspection')) {
            throw new Error(`Introspection is disabled on ${options.url}`);
        }
        throw new Error(`Failed to introspect ${options.url}: ${messages}`);
    }

    if (!result.data) {
        throw new Error(`Failed to introspect ${options.url}: no data returned`);
    }

    return buildClientSchema(result.data as IntrospectionQuery);
}

/**
 * Auto-detect the source type and load a GraphQL schema.
 *
 * Detection order:
 * 1. Contains newlines or type keywords → SDL string
 * 2. Ends with `.json` → introspection JSON file
 * 3. Contains `*` or `?` → glob pattern
 * 4. Ends with `.graphql` or `.gql` → SDL file
 * 5. Fallback → SDL string
 *
 * @param source - SDL string, file path, glob pattern, or introspection JSON path
 * @returns The loaded GraphQL schema
 * @throws If the source cannot be parsed or the file does not exist
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
