import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolDefinition } from './types.js';

/** Default request timeout in milliseconds (30 seconds). */
export const DEFAULT_TIMEOUT = 30_000;

/** Raw result of a GraphQL HTTP request. */
export interface GraphQLExecutionResult {
    /** The data returned by the GraphQL operation, if successful. */
    data?: unknown;
    /** GraphQL errors returned by the server. */
    errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
}

/**
 * Execute a GraphQL operation against an HTTP endpoint.
 *
 * Sends a JSON `POST` request with `{ query, variables }` and returns the
 * parsed response. Handles authentication errors (401/403), non-JSON
 * responses, and request timeouts via `AbortController`.
 *
 * @param endpoint - The GraphQL endpoint URL
 * @param query - The GraphQL operation document string
 * @param variables - Variables to pass with the operation
 * @param headers - Additional HTTP headers
 * @param timeout - Request timeout in milliseconds
 * @returns The parsed GraphQL response
 * @throws On network errors, authentication failures, non-JSON responses, or timeouts
 */
export async function executeGraphQL(
    endpoint: string,
    query: string,
    variables: Record<string, unknown>,
    headers: Record<string, string>,
    timeout: number
): Promise<GraphQLExecutionResult> {
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

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error(`HTTP ${String(response.status)}: Authentication/authorization failed`);
            }
            const text = await response.text();
            throw new Error(`HTTP ${String(response.status)}: ${text.slice(0, 200)}`);
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('json')) {
            const text = await response.text();
            throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}: ${text.slice(0, 200)}`);
        }

        return (await response.json()) as GraphQLExecutionResult;
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
 * Create an async handler that executes a GraphQL tool's operation and
 * returns an MCP `CallToolResult`.
 *
 * The returned handler sends the tool's `queryDocument` to the endpoint,
 * formats successful results as JSON text content, and wraps GraphQL
 * errors or network failures as `isError: true` responses.
 *
 * @param tool - The tool definition containing the query document
 * @param endpoint - The GraphQL endpoint URL
 * @param headers - HTTP headers sent with every request
 * @param timeout - Request timeout in milliseconds
 * @returns An async handler suitable for MCP tool registration
 */
export function createToolHandler(
    tool: ToolDefinition,
    endpoint: string,
    headers: Record<string, string>,
    timeout: number
): (args: Record<string, unknown>) => Promise<CallToolResult> {
    return async (args: Record<string, unknown>) => {
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
    };
}
