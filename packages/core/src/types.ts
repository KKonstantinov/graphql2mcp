import type { GraphQLSchema } from 'graphql';
import type { z } from 'zod';

/** Mutation exposure mode */
export type MutationMode = 'none' | 'all' | { whitelist: string[] };

/** Configuration for the core conversion engine */
export interface ConvertOptions {
    /** The GraphQL schema to convert */
    schema: GraphQLSchema;
    /** Mutation exposure mode. Default: "none" */
    mutations?: MutationMode;
    /** Maximum depth for return type field selection. Default: 3 */
    depth?: number;
    /** Only include operations whose field names are in this list */
    include?: string[];
    /** Exclude operations whose field names are in this list */
    exclude?: string[];
    /** Custom prefix for query tools. Default: "query_" */
    queryPrefix?: string;
    /** Custom prefix for mutation tools. Default: "mutation_" */
    mutationPrefix?: string;
    /** Custom scalar mappings: scalar name -> Zod schema */
    customScalars?: Record<string, z.ZodType>;
}

/** Annotations for an MCP tool */
export interface ToolAnnotations {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
}

/** A generated MCP tool definition */
export interface ToolDefinition {
    /** Tool name (e.g. "query_users") */
    name: string;
    /** Human-readable title (e.g. "Query: users") */
    title: string;
    /** Tool description */
    description: string;
    /** Zod raw shape for input parameters */
    inputSchema: Record<string, z.ZodType>;
    /** MCP tool annotations */
    annotations: ToolAnnotations;
    /** The GraphQL query/mutation document string for runtime execution */
    queryDocument: string;
    /** The operation type: "query" or "mutation" */
    operationType: 'query' | 'mutation';
    /** The original GraphQL field name */
    fieldName: string;
}

/** Result of converting a schema to tool definitions */
export interface ConvertResult {
    /** All generated tool definitions */
    tools: ToolDefinition[];
}

/** Options for loading a schema from a source */
export interface LoadSchemaOptions {
    /** HTTP headers for introspection (e.g. Authorization) */
    headers?: Record<string, string>;
}
