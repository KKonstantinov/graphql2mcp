import { generateTools, loadSchema } from '@graphql-to-mcp/core';
import type { ConvertOptions, MutationMode, ToolDefinition } from '@graphql-to-mcp/core';
import type { GraphQLSchema } from 'graphql';
import type { z } from 'zod';

/** Options for registerGraphQLTools */
export interface RegisterGraphQLToolsOptions {
    /** SDL string, file path, glob, or introspection JSON path */
    source?: string;
    /** Pre-built GraphQLSchema object */
    schema?: GraphQLSchema;
    /** GraphQL execution endpoint URL (required for runtime execution) */
    endpoint: string;
    /** HTTP headers for runtime execution */
    headers?: Record<string, string>;
    /** Mutation exposure mode. Default: "none" */
    mutations?: MutationMode;
    /** Field selection depth. Default: 3 */
    depth?: number;
    /** Only include these operations */
    include?: string[];
    /** Exclude these operations */
    exclude?: string[];
    /** Custom prefix for query tools */
    queryPrefix?: string;
    /** Custom prefix for mutation tools */
    mutationPrefix?: string;
    /** Custom scalar mappings */
    customScalars?: Record<string, z.ZodType>;
    /** Request timeout in ms. Default: 30000 */
    timeout?: number;
}

/** Metadata about a registered tool */
export interface RegisteredToolInfo {
    name: string;
    title: string;
    operationType: 'query' | 'mutation';
    fieldName: string;
}

/** Result of registering GraphQL tools */
export interface RegisterGraphQLToolsResult {
    tools: RegisteredToolInfo[];
    count: number;
}

interface McpServerLike {
    registerTool(
        name: string,
        config: {
            title?: string;
            description?: string;
            inputSchema?: Record<string, z.ZodType>;
            annotations?: {
                readOnlyHint?: boolean;
                destructiveHint?: boolean;
                openWorldHint?: boolean;
            };
        },
        handler: (args: Record<string, unknown>) => Promise<{
            isError?: boolean;
            content: Array<{ type: 'text'; text: string }>;
        }>
    ): unknown;
}

const DEFAULT_TIMEOUT = 30_000;

/**
 * Execute a GraphQL operation against an endpoint.
 */
async function executeGraphQL(
    endpoint: string,
    query: string,
    variables: Record<string, unknown>,
    headers: Record<string, string>,
    timeout: number
): Promise<{ data?: unknown; errors?: Array<{ message: string }> }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...headers
            },
            body: JSON.stringify({ query, variables }),
            signal: controller.signal
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error(`HTTP ${String(response.status)}: Authentication/authorization failed`);
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('json')) {
            const text = await response.text();
            throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}: ${text.slice(0, 200)}`);
        }

        return (await response.json()) as { data?: unknown; errors?: Array<{ message: string }> };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Request timed out after ${String(timeout)}ms`, { cause: error });
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/** Registers a single MCP tool that proxies a GraphQL operation. */
function registerSingleTool(
    server: McpServerLike,
    tool: ToolDefinition,
    endpoint: string,
    headers: Record<string, string>,
    timeout: number
): void {
    const config: {
        title: string;
        description: string;
        inputSchema?: Record<string, z.ZodType>;
        annotations: {
            readOnlyHint?: boolean;
            destructiveHint?: boolean;
            openWorldHint?: boolean;
        };
    } = {
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations
    };

    if (Object.keys(tool.inputSchema).length > 0) {
        config.inputSchema = tool.inputSchema;
    }

    server.registerTool(tool.name, config, async (args: Record<string, unknown>) => {
        try {
            const result = await executeGraphQL(endpoint, tool.queryDocument, args, headers, timeout);

            if (result.errors && result.errors.length > 0) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({ data: result.data, errors: result.errors }, null, 2)
                        }
                    ]
                };
            }

            return {
                content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }]
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                isError: true,
                content: [{ type: 'text' as const, text: message }]
            };
        }
    });
}

/**
 * Register GraphQL tools on an existing McpServer instance.
 * Does not create or manage transports — the user controls their own server lifecycle.
 */
export function registerGraphQLTools(server: McpServerLike, options: RegisterGraphQLToolsOptions): RegisterGraphQLToolsResult {
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

    const { tools } = generateTools(convertOptions);
    const headers = options.headers ?? {};
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    for (const tool of tools) {
        registerSingleTool(server, tool, options.endpoint, headers, timeout);
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
