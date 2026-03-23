import type { CallToolResult, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { GraphQLSchema } from 'graphql';
import type { z } from 'zod';
import { generateTools } from './converter/tool-generator.js';
import { createToolHandler, DEFAULT_TIMEOUT } from './execution.js';
import { loadSchema } from './schema/loader.js';
import type { ConvertOptions, MutationMode, ToolDefinition } from './types.js';

/**
 * Options for {@link getGraphQLTools} and {@link registerGraphQLTools}.
 *
 * Provide either `source` (SDL string, file path, glob, or introspection JSON)
 * or a pre-built `schema`. The `endpoint` is always required for runtime execution.
 */
export interface GraphQLToolsOptions {
    /** SDL string, file path, glob, or introspection JSON path */
    source?: string;
    /** Pre-built GraphQLSchema object (alternative to `source`) */
    schema?: GraphQLSchema;
    /** GraphQL execution endpoint URL */
    endpoint: string;
    /** HTTP headers sent with every GraphQL request */
    headers?: Record<string, string>;
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
    /** Request timeout in milliseconds. Default: `30000` */
    timeout?: number;
}

/**
 * A GraphQL tool with its configuration and handler, ready for manual registration.
 *
 * Returned by {@link getGraphQLTools}. Contains everything needed to register
 * the tool on an MCP server or to invoke it directly.
 */
export interface GraphQLToolEntry {
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
    /** Async handler that executes the GraphQL operation and returns an MCP result */
    handler: (args: Record<string, unknown>) => Promise<CallToolResult>;
    /** Whether this tool wraps a `"query"` or `"mutation"` */
    operationType: 'query' | 'mutation';
    /** The original GraphQL field name */
    fieldName: string;
    /** The GraphQL query/mutation document string sent at runtime */
    queryDocument: string;
}

/**
 * Result of {@link getGraphQLTools}.
 */
export interface GetGraphQLToolsResult {
    /** The generated tool entries with handlers */
    tools: GraphQLToolEntry[];
    /** Number of tools generated */
    count: number;
}

/**
 * Metadata about a tool registered by {@link registerGraphQLTools}.
 */
export interface RegisteredToolInfo {
    /** Tool name */
    name: string;
    /** Human-readable title */
    title: string;
    /** Whether this tool wraps a `"query"` or `"mutation"` */
    operationType: 'query' | 'mutation';
    /** The original GraphQL field name */
    fieldName: string;
}

/**
 * Result of {@link registerGraphQLTools}.
 */
export interface RegisterGraphQLToolsResult {
    /** Metadata for each registered tool */
    tools: RegisteredToolInfo[];
    /** Number of tools registered */
    count: number;
}

/**
 * Structural interface for any object that supports MCP tool registration.
 *
 * Both the official `McpServer` from `@modelcontextprotocol/sdk` and custom
 * implementations satisfy this interface.
 */
export interface McpServerLike {
    /** Register a named tool with a configuration object and an async handler. */
    registerTool(
        name: string,
        config: {
            title?: string;
            description?: string;
            inputSchema?: Record<string, z.ZodType>;
            annotations?: ToolAnnotations;
        },
        handler: (args: Record<string, unknown>) => Promise<CallToolResult>
    ): unknown;
}

/** Resolve schema from options and generate raw tool definitions. */
function resolveTools(options: GraphQLToolsOptions): ToolDefinition[] {
    let schema: GraphQLSchema;

    if (options.schema) {
        schema = options.schema;
    } else if (options.source) {
        schema = loadSchema(options.source);
    } else {
        throw new Error('Either "source" or "schema" must be provided');
    }

    const convertOptions: ConvertOptions = {
        schema,
        mutations: options.mutations ?? 'none',
        depth: options.depth ?? 3,
        include: options.include,
        exclude: options.exclude,
        queryPrefix: options.queryPrefix,
        mutationPrefix: options.mutationPrefix,
        customScalars: options.customScalars
    };

    return generateTools(convertOptions).tools;
}

/** Convert tool definitions into GraphQLToolEntry objects with bound handlers. */
function buildToolEntries(tools: ToolDefinition[], endpoint: string, headers: Record<string, string>, timeout: number): GraphQLToolEntry[] {
    return tools.map(tool => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        handler: createToolHandler(tool, endpoint, headers, timeout),
        operationType: tool.operationType,
        fieldName: tool.fieldName,
        queryDocument: tool.queryDocument
    }));
}

/**
 * Generate GraphQL tools with bound handlers, without registering them on a server.
 *
 * Use this when you need full control over how tools are registered, or when
 * integrating with a non-standard MCP server implementation.
 *
 * @param options - Schema source, endpoint, and conversion options
 * @returns The generated tool entries and their count
 *
 * @example
 * ```ts
 * const { tools } = getGraphQLTools({
 *     source: './schema.graphql',
 *     endpoint: 'http://localhost:4000/graphql',
 *     mutations: 'all'
 * });
 *
 * for (const tool of tools) {
 *     server.registerTool(tool.name, { ... }, tool.handler);
 * }
 * ```
 */
export function getGraphQLTools(options: GraphQLToolsOptions): GetGraphQLToolsResult {
    const tools = resolveTools(options);
    const headers = options.headers ?? {};
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;
    const entries = buildToolEntries(tools, options.endpoint, headers, timeout);

    return { tools: entries, count: entries.length };
}

/**
 * Register GraphQL tools on an MCP server.
 *
 * Resolves the schema, generates tool definitions, and registers each tool
 * with a handler that proxies requests to the GraphQL endpoint.
 *
 * @param server - Any object satisfying {@link McpServerLike}
 * @param options - Schema source, endpoint, and conversion options
 * @returns Metadata about the registered tools
 *
 * @example
 * ```ts
 * const server = new McpServer({ name: 'my-server', version: '1.0.0' });
 * const result = registerGraphQLTools(server, {
 *     source: './schema.graphql',
 *     endpoint: 'http://localhost:4000/graphql'
 * });
 * console.log(`Registered ${result.count} tools`);
 * ```
 */
export function registerGraphQLTools(server: McpServerLike, options: GraphQLToolsOptions): RegisterGraphQLToolsResult {
    const { tools } = getGraphQLTools(options);

    for (const tool of tools) {
        const config: {
            title: string;
            description: string;
            inputSchema?: Record<string, z.ZodType>;
            annotations: ToolAnnotations;
        } = {
            title: tool.title,
            description: tool.description,
            annotations: tool.annotations
        };

        if (Object.keys(tool.inputSchema).length > 0) {
            config.inputSchema = tool.inputSchema;
        }

        server.registerTool(tool.name, config, tool.handler);
    }

    return {
        tools: tools.map(t => ({
            name: t.name,
            title: t.title,
            operationType: t.operationType,
            fieldName: t.fieldName
        })),
        count: tools.length
    };
}
