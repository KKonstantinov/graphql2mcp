import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import type { Server } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startHttpServer } from '../../src/http.js';
import { createProxyServerFactory } from '../../src/server.js';

const simpleSdl = path.join(import.meta.dirname, '../fixtures/simple.graphql');

describe('startHttpServer', () => {
    let httpServer: Server;
    let mcpUrl: string;

    beforeAll(async () => {
        const createServer = createProxyServerFactory({
            endpoints: [{ source: simpleSdl, endpoint: 'http://localhost:4000/graphql' }]
        });
        httpServer = await startHttpServer(createServer, 0);
        const address = httpServer.address();
        if (!address || typeof address === 'string') {
            throw new Error('Failed to get server address');
        }
        mcpUrl = `http://127.0.0.1:${String(address.port)}/mcp`;
    });

    afterAll(async () => {
        await new Promise<void>(resolve => {
            httpServer.close(() => {
                resolve();
            });
        });
    });

    it('handles several requests and clients on one server', async () => {
        for (let i = 0; i < 2; i++) {
            const client = new Client({ name: 'test-client', version: '1.0.0' });
            await client.connect(new StreamableHTTPClientTransport(new URL(mcpUrl)));
            const { tools } = await client.listTools();
            expect(tools.map(t => t.name)).toEqual(['query_hello', 'query_user', 'query_users']);
            await client.close();
        }
    });

    it('rejects GET with 405 because there are no sessions to stream', async () => {
        const response = await fetch(mcpUrl, { headers: { Accept: 'text/event-stream' } });
        expect(response.status).toBe(405);
    });
});
