import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { GraphQLSchema } from 'graphql';
import type { z } from 'zod';

export type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

/**
 * Controls which GraphQL mutations are exposed as MCP tools.
 *
 * - `"none"` — no mutations (default)
 * - `"all"` — all mutations
 * - `{ whitelist: string[] }` — only the named mutations
 */
export type MutationMode = 'none' | 'all' | { whitelist: string[] };

/**
 * Low-level configuration for the core conversion engine ({@link generateTools}).
 *
 * For most use cases, prefer {@link GraphQLToolsOptions} with
 * {@link getGraphQLTools} or {@link registerGraphQLTools} instead.
 */
export interface ConvertOptions {
    /** The GraphQL schema to convert */
    schema: GraphQLSchema;
    /** Mutation exposure mode. Default: `"none"` */
    mutations?: MutationMode;
    /** Maximum depth for return-type field selection. Default: `3` */
    depth?: number;
    /** Only include operations whose field names are in this list */
    include?: string[];
    /** Exclude operations whose field names are in this list */
    exclude?: string[];
    /** Custom prefix for query tool names. Default: `"query_"` */
    queryPrefix?: string;
    /** Custom prefix for mutation tool names. Default: `"mutation_"` */
    mutationPrefix?: string;
    /** Custom scalar mappings: GraphQL scalar name → Zod schema */
    customScalars?: Record<string, z.ZodType>;
}

/**
 * A generated MCP tool definition (without a bound handler).
 *
 * Produced by {@link generateTools}. For a version that includes a
 * ready-to-use handler, see {@link GraphQLToolEntry}.
 */
export interface ToolDefinition {
    /** Tool name (e.g. `"query_users"`) */
    name: string;
    /** Human-readable title (e.g. `"Query: users"`) */
    title: string;
    /** Tool description derived from the GraphQL field */
    description: string;
    /** Zod raw shape for input parameters */
    inputSchema: Record<string, z.ZodType>;
    /** MCP tool annotations (readOnlyHint, destructiveHint, etc.) */
    annotations: ToolAnnotations;
    /** The GraphQL query/mutation document string sent at runtime */
    queryDocument: string;
    /** Whether this tool wraps a `"query"` or `"mutation"` */
    operationType: 'query' | 'mutation';
    /** The original GraphQL field name */
    fieldName: string;
}

/** Result of {@link generateTools}. */
export interface ConvertResult {
    /** All generated tool definitions */
    tools: ToolDefinition[];
}

/** Options for loading a schema from a source. */
export interface LoadSchemaOptions {
    /** HTTP headers for introspection (e.g. `Authorization`) */
    headers?: Record<string, string>;
}
