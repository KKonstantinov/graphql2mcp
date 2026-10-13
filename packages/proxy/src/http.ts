import { createServer } from 'node:http';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Start an HTTP server that serves MCP over stateless Streamable HTTP.
 *
 * A stateless transport can handle only one request, so every POST gets a new
 * server from `createMcpServer` and a new transport, both closed when the
 * response ends. GET and DELETE return 405 because there are no sessions to
 * stream to or terminate.
 *
 * @param createMcpServer - Returns a new, fully configured MCP server on each call
 * @param port - Port to listen on (`0` picks a free port)
 * @returns The listening HTTP server
 */
export function startHttpServer(createMcpServer: () => McpServer, port: number): Promise<Server> {
    const httpServer = createServer((req, res) => {
        if (req.method !== 'POST') {
            sendJsonRpcError(res, 405, -32_000, 'Method not allowed.');
            return;
        }
        void handleMcpRequest(createMcpServer, req, res);
    });

    return new Promise((resolve, reject) => {
        httpServer.once('error', reject);
        httpServer.listen(port, () => {
            httpServer.off('error', reject);
            resolve(httpServer);
        });
    });
}

/** Serve one MCP request with its own server and transport. */
async function handleMcpRequest(createMcpServer: () => McpServer, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
        void transport.close();
        void server.close();
    });

    try {
        await server.connect(transport);
        await transport.handleRequest(req, res);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error handling MCP request: ${message}`);
        if (!res.headersSent) {
            sendJsonRpcError(res, 500, -32_603, 'Internal server error');
        }
    }
}

/** Write a JSON-RPC error response that has no request id. */
function sendJsonRpcError(res: ServerResponse, status: number, code: number, message: string): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));
}
