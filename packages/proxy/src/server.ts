import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateTools, loadSchema } from '@graphql-to-mcp/core';
import type { ConvertOptions, MutationMode, ToolDefinition } from '@graphql-to-mcp/core';
import type { GraphQLSchema } from 'graphql';

const DEFAULT_TIMEOUT = 30_000;

export interface EndpointConfig {
    /** SDL file path, glob, SDL string, or introspection JSON path */
    source: string;
    /** GraphQL execution endpoint URL. Required for file/SDL sources, optional for URL sources. */
    endpoint?: string;
    /** HTTP headers for both introspection and runtime execution */
    headers?: Record<string, string>;
    /** Mutation exposure mode. Default: "none" */
    mutations?: MutationMode;
    /** Only include these operations */
    include?: string[];
    /** Exclude these operations */
    exclude?: string[];
    /** Prefix for this endpoint's tools (for multi-endpoint collision avoidance) */
    prefix?: string;
}

export interface ProxyServerOptions {
    /** Endpoint configurations (at least one required) */
    endpoints: EndpointConfig[];
    /** MCP server name. Default: "graphql-mcp-server" */
    name?: string;
    /** MCP server version. Default: "1.0.0" */
    version?: string;
    /** Field selection depth. Default: 3 */
    depth?: number;
    /** Request timeout in ms. Default: 30000 */
    timeout?: number;
    /** Custom prefix for query tools. Default: "query_" */
    queryPrefix?: string;
    /** Custom prefix for mutation tools. Default: "mutation_" */
    mutationPrefix?: string;
}

/**
 * Execute a GraphQL operation against an endpoint.
 */
async function executeGraphQL(
    endpoint: string,
    query: string,
    variables: Record<string, unknown>,
    headers: Record<string, string>,
    timeout: number
): Promise<{ data?: unknown; errors?: Array<{ message: string; locations?: unknown; path?: unknown }> }> {
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

        return (await response.json()) as {
            data?: unknown;
            errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Request timed out after ${String(timeout)}ms`, { cause: error });
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Register a single tool on the MCP server.
 */
function registerTool(server: McpServer, tool: ToolDefinition, endpoint: string, headers: Record<string, string>, timeout: number): void {
    const config: {
        title: string;
        description: string;
        inputSchema?: Record<string, import('zod').ZodType>;
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
 * Load schema from a source string. Supports SDL strings, file paths, and globs.
 * For URL introspection, use introspectSchemaFromUrl separately.
 */
function loadSchemaFromSource(source: string): GraphQLSchema {
    return loadSchema(source);
}

/**
 * Create and configure a proxy MCP server.
 */
export function createProxyServer(options: ProxyServerOptions): McpServer {
    const serverName = options.name ?? 'graphql-mcp-server';
    const serverVersion = options.version ?? '1.0.0';
    const depth = options.depth ?? 3;
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    const server = new McpServer({ name: serverName, version: serverVersion });

    for (const epConfig of options.endpoints) {
        const schema = loadSchemaFromSource(epConfig.source);
        const endpoint = epConfig.endpoint ?? epConfig.source;
        const headers = epConfig.headers ?? {};

        const convertOptions: ConvertOptions = {
            schema,
            mutations: epConfig.mutations ?? 'none',
            depth,
            include: epConfig.include,
            exclude: epConfig.exclude,
            queryPrefix: epConfig.prefix ? `${epConfig.prefix}_query_` : (options.queryPrefix ?? 'query_'),
            mutationPrefix: epConfig.prefix ? `${epConfig.prefix}_mutation_` : (options.mutationPrefix ?? 'mutation_')
        };

        const { tools } = generateTools(convertOptions);

        for (const tool of tools) {
            registerTool(server, tool, endpoint, headers, timeout);
        }
    }

    return server;
}

/**
 * Create a simple proxy server from a single source.
 */
export function createSimpleProxyServer(options: {
    source: string;
    endpoint?: string;
    headers?: Record<string, string>;
    mutations?: MutationMode;
    name?: string;
    version?: string;
    depth?: number;
    timeout?: number;
    include?: string[];
    exclude?: string[];
    queryPrefix?: string;
    mutationPrefix?: string;
}): McpServer {
    return createProxyServer({
        endpoints: [
            {
                source: options.source,
                endpoint: options.endpoint,
                headers: options.headers,
                mutations: options.mutations,
                include: options.include,
                exclude: options.exclude
            }
        ],
        name: options.name,
        version: options.version,
        depth: options.depth,
        timeout: options.timeout,
        queryPrefix: options.queryPrefix,
        mutationPrefix: options.mutationPrefix
    });
}

/**
 * Introspect a schema from a URL and create a proxy server.
 * This fetches the schema via an introspection query.
 */
export async function createProxyServerFromUrl(options: {
    url: string;
    endpoint?: string;
    headers?: Record<string, string>;
    mutations?: MutationMode;
    name?: string;
    version?: string;
    depth?: number;
    timeout?: number;
    include?: string[];
    exclude?: string[];
}): Promise<McpServer> {
    const headers = options.headers ?? {};
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    // Fetch introspection result
    const { getIntrospectionQuery } = await import('graphql');
    const introspectionQuery = getIntrospectionQuery();

    const result = await executeGraphQL(options.url, introspectionQuery, {}, headers, timeout);

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

    const { buildClientSchema, printSchema } = await import('graphql');
    const schema = buildClientSchema(result.data as import('graphql').IntrospectionQuery);
    const sdl = printSchema(schema);

    return createProxyServer({
        endpoints: [
            {
                source: sdl,
                endpoint: options.endpoint ?? options.url,
                headers: options.headers,
                mutations: options.mutations,
                include: options.include,
                exclude: options.exclude
            }
        ],
        name: options.name,
        version: options.version,
        depth: options.depth,
        timeout: options.timeout
    });
}
