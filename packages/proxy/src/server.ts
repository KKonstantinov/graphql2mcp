import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DEFAULT_TIMEOUT, loadSchemaFromUrl, registerGraphQLTools } from '@graphql2mcp/core';
import type { MutationMode } from '@graphql2mcp/core';

/**
 * Configuration for a single GraphQL endpoint in a multi-endpoint proxy.
 */
export interface EndpointConfig {
    /** SDL file path, glob, SDL string, or introspection JSON path */
    source: string;
    /** GraphQL execution endpoint URL. Required for file/SDL sources, optional for URL sources. */
    endpoint?: string;
    /** HTTP headers for both introspection and runtime execution */
    headers?: Record<string, string>;
    /** Mutation exposure mode. Default: `"none"` */
    mutations?: MutationMode;
    /** Only include these operations */
    include?: string[];
    /** Exclude these operations */
    exclude?: string[];
    /** Prefix for this endpoint's tools (for multi-endpoint collision avoidance) */
    prefix?: string;
}

/**
 * Options for creating a proxy MCP server via {@link createProxyServer}.
 */
export interface ProxyServerOptions {
    /** Endpoint configurations (at least one required) */
    endpoints: EndpointConfig[];
    /** MCP server name. Default: `"graphql-mcp-server"` */
    name?: string;
    /** MCP server version. Default: `"1.0.0"` */
    version?: string;
    /** Maximum depth for return-type field selection. Default: `3` */
    depth?: number;
    /** Request timeout in milliseconds. Default: `30000` */
    timeout?: number;
    /** Custom prefix for query tool names. Default: `"query_"` */
    queryPrefix?: string;
    /** Custom prefix for mutation tool names. Default: `"mutation_"` */
    mutationPrefix?: string;
}

/**
 * Create and configure a proxy MCP server from one or more GraphQL endpoints.
 *
 * Loads each endpoint's schema, generates MCP tools, and registers them
 * on a new {@link McpServer} instance.
 *
 * @param options - Server name/version, endpoint configs, and shared defaults
 * @returns A configured McpServer ready to be connected to a transport
 */
export function createProxyServer(options: ProxyServerOptions): McpServer {
    const serverName = options.name ?? 'graphql-mcp-server';
    const serverVersion = options.version ?? '1.0.0';
    const depth = options.depth ?? 3;
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    const server = new McpServer({ name: serverName, version: serverVersion });

    for (const epConfig of options.endpoints) {
        registerGraphQLTools(server, {
            source: epConfig.source,
            endpoint: epConfig.endpoint ?? epConfig.source,
            headers: epConfig.headers,
            mutations: epConfig.mutations ?? 'none',
            depth,
            include: epConfig.include,
            exclude: epConfig.exclude,
            queryPrefix: epConfig.prefix ? `${epConfig.prefix}_query_` : (options.queryPrefix ?? 'query_'),
            mutationPrefix: epConfig.prefix ? `${epConfig.prefix}_mutation_` : (options.mutationPrefix ?? 'mutation_'),
            timeout
        });
    }

    return server;
}

/**
 * Create a proxy MCP server from a single GraphQL source.
 *
 * Convenience wrapper around {@link createProxyServer} for the common
 * single-endpoint case.
 *
 * @param options - Schema source, endpoint, and server configuration
 * @returns A configured McpServer ready to be connected to a transport
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
 * Introspect a live GraphQL endpoint and create a proxy MCP server.
 *
 * Fetches the schema via an introspection query, then delegates to
 * {@link createProxyServer}.
 *
 * @param options - URL to introspect, plus server configuration
 * @returns A configured McpServer ready to be connected to a transport
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
    const { printSchema } = await import('graphql');
    const schema = await loadSchemaFromUrl({
        url: options.url,
        headers: options.headers,
        timeout: options.timeout
    });

    return createProxyServer({
        endpoints: [
            {
                source: printSchema(schema),
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
