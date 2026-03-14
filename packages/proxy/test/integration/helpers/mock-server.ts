import { createServer } from 'node:http';
import type { Server, IncomingMessage, ServerResponse } from 'node:http';
import { buildSchema, graphql } from 'graphql';

export interface MockGraphQLServer {
    server: Server;
    url: string;
    close: () => Promise<void>;
}

export function createMockGraphQLServer(sdl: string, rootValue: Record<string, unknown> = {}): Promise<MockGraphQLServer> {
    const schema = buildSchema(sdl);

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString('utf8');

        let parsed: { query: string; variables?: Record<string, unknown>; operationName?: string };
        try {
            parsed = JSON.parse(body);
        } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
        }

        const result = await graphql({
            schema,
            source: parsed.query,
            rootValue,
            variableValues: parsed.variables,
            operationName: parsed.operationName
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Failed to get server address');
            }
            const url = `http://127.0.0.1:${address.port}/graphql`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        server.close(err => {
                            if (err) rejectClose(err);
                            else resolveClose();
                        });
                    })
            });
        });
    });
}

/**
 * Creates a mock server that returns an error for introspection queries.
 */
export function createIntrospectionDisabledServer(): Promise<MockGraphQLServer> {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(body) as { query?: string };

        if (parsed.query?.includes('__schema')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    errors: [{ message: 'Introspection is not allowed' }]
                })
            );
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: {} }));
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Failed to get server address');
            }
            const url = `http://127.0.0.1:${address.port}/graphql`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        server.close(err => {
                            if (err) rejectClose(err);
                            else resolveClose();
                        });
                    })
            });
        });
    });
}

/**
 * Creates a mock server that returns non-JSON (HTML) responses.
 */
export function createNonGraphQLServer(): Promise<MockGraphQLServer> {
    const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body>Not a GraphQL server</body></html>');
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Failed to get server address');
            }
            const url = `http://127.0.0.1:${address.port}`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        server.close(err => {
                            if (err) rejectClose(err);
                            else resolveClose();
                        });
                    })
            });
        });
    });
}

/**
 * Creates a mock server that captures request headers for assertion.
 */
export function createHeaderCapturingServer(
    sdl: string,
    rootValue: Record<string, unknown> = {}
): Promise<MockGraphQLServer & { getLastHeaders: () => Record<string, string | string[] | undefined> }> {
    const schema = buildSchema(sdl);
    let lastHeaders: Record<string, string | string[] | undefined> = {};

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        lastHeaders = { ...req.headers };

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(body) as { query: string; variables?: Record<string, unknown> };

        const result = await graphql({
            schema,
            source: parsed.query,
            rootValue,
            variableValues: parsed.variables
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Failed to get server address');
            }
            const url = `http://127.0.0.1:${address.port}/graphql`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        server.close(err => {
                            if (err) rejectClose(err);
                            else resolveClose();
                        });
                    }),
                getLastHeaders: () => lastHeaders
            });
        });
    });
}

/**
 * Creates a server that responds with a specific HTTP status code.
 */
export function createErrorServer(statusCode: number): Promise<MockGraphQLServer> {
    const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `HTTP ${statusCode}` }));
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Failed to get server address');
            }
            const url = `http://127.0.0.1:${address.port}/graphql`;
            resolve({
                server,
                url,
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        server.close(err => {
                            if (err) rejectClose(err);
                            else resolveClose();
                        });
                    })
            });
        });
    });
}
