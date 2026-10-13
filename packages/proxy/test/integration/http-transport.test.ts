import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createMockGraphQLServer } from './helpers/mock-server.js';
import type { MockGraphQLServer } from './helpers/mock-server.js';

const BIN_PATH = path.join(import.meta.dirname, '../../bin/graphql2mcp.mjs');

const SDL = `
type Query {
    hello: String
}
`;

/** Finds a free TCP port by briefly binding to port 0. */
function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const probe = createServer();
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => {
            const address = probe.address();
            if (!address || typeof address === 'string') {
                reject(new Error('Failed to get probe address'));
                return;
            }
            probe.close(() => {
                resolve(address.port);
            });
        });
    });
}

/** Spawns the CLI and resolves once it reports that the HTTP server is listening. */
function startCli(args: string[]): Promise<ChildProcess> {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [BIN_PATH, ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
        let stderr = '';
        child.stderr.on('data', (chunk: Buffer) => {
            stderr += chunk.toString('utf8');
            if (stderr.includes('listening on port')) {
                resolve(child);
            }
        });
        child.once('exit', code => {
            reject(new Error(`CLI exited with code ${String(code)}: ${stderr}`));
        });
    });
}

async function connectClient(url: string): Promise<Client> {
    const client = new Client({ name: 'http-test-client', version: '1.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(url)));
    return client;
}

describe('CLI Streamable HTTP transport', () => {
    let mockServer: MockGraphQLServer;
    let cli: ChildProcess;
    let mcpUrl: string;

    beforeAll(async () => {
        mockServer = await createMockGraphQLServer(SDL, { hello: () => 'world' });
        const port = await getFreePort();
        cli = await startCli([mockServer.url, '-t', 'http', '-p', String(port)]);
        mcpUrl = `http://127.0.0.1:${String(port)}/mcp`;
    });

    afterAll(async () => {
        cli.kill();
        await mockServer.close();
    });

    it('serves multiple requests from one client', async () => {
        const client = await connectClient(mcpUrl);

        const { tools } = await client.listTools();
        expect(tools.map(t => t.name)).toContain('query_hello');

        const result = await client.callTool({ name: 'query_hello', arguments: {} });
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        expect(text).toContain('world');

        await client.close();
    });

    it('serves several clients one after another', async () => {
        for (let i = 0; i < 3; i++) {
            const client = await connectClient(mcpUrl);
            const { tools } = await client.listTools();
            expect(tools).toHaveLength(1);
            await client.close();
        }
    });
});
