import { Command } from 'commander';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createProxyServer, createProxyServerFromUrl } from './server.js';
import type { MutationMode } from '@graphql-to-mcp/core';

const VERSION = '0.0.0';

function isUrl(source: string): boolean {
    return source.startsWith('http://') || source.startsWith('https://');
}

function parseHeaders(headerValues: string[]): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const h of headerValues) {
        const colonIndex = h.indexOf(':');
        if (colonIndex > 0) {
            const key = h.slice(0, colonIndex).trim();
            const value = h.slice(colonIndex + 1).trim();
            headers[key] = value;
        }
    }
    return headers;
}

function parseMutationMode(mode: string, whitelist: string[]): MutationMode {
    if (mode === 'all') return 'all';
    if (mode === 'whitelist') return { whitelist };
    return 'none';
}

const program = new Command()
    .name('graphql-to-mcp')
    .description('Convert GraphQL endpoints into MCP servers')
    .version(VERSION, '-V, --version')
    .argument('[source]', 'SDL file path, glob, or URL')
    .option('-t, --transport <type>', 'MCP transport type (stdio | http)', 'stdio')
    .option('-p, --port <number>', 'HTTP port (transport=http)', '3000')
    .option('-m, --mutations <mode>', 'Mutation exposure mode (all | none | whitelist)', 'none')
    .option('--mutation-whitelist <names...>', 'Mutation names to whitelist')
    .option('-H, --header <headers...>', 'HTTP headers (e.g., "Authorization: Bearer x")')
    .option('-e, --endpoint <url>', 'GraphQL execution endpoint')
    .option('-n, --name <name>', 'MCP server name', 'graphql-mcp-server')
    .option('-d, --depth <number>', 'Field selection depth', '3')
    .option('--include <names...>', 'Only include these operations')
    .option('--exclude <names...>', 'Exclude these operations')
    .action(
        async (
            source: string | undefined,
            opts: {
                transport: string;
                port: string;
                mutations: string;
                mutationWhitelist?: string[];
                header?: string[];
                endpoint?: string;
                name: string;
                depth: string;
                include?: string[];
                exclude?: string[];
            }
        ) => {
            if (!source) {
                program.help({ error: true });
                return;
            }

            try {
                const headers = parseHeaders(opts.header ?? []);
                const mutations = parseMutationMode(opts.mutations, opts.mutationWhitelist ?? []);
                const depth = Number.parseInt(opts.depth, 10);

                const server = isUrl(source)
                    ? await createProxyServerFromUrl({
                          url: source,
                          endpoint: opts.endpoint,
                          headers,
                          mutations,
                          name: opts.name,
                          depth,
                          include: opts.include,
                          exclude: opts.exclude
                      })
                    : createProxyServer({
                          endpoints: [
                              {
                                  source,
                                  endpoint: opts.endpoint,
                                  headers,
                                  mutations,
                                  include: opts.include,
                                  exclude: opts.exclude
                              }
                          ],
                          name: opts.name,
                          depth
                      });

                if (opts.transport === 'http') {
                    const port = Number.parseInt(opts.port, 10);
                    const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
                    const { createServer } = await import('node:http');

                    const httpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
                    await server.connect(httpTransport);

                    const httpServer = createServer((req, res) => {
                        void httpTransport.handleRequest(req, res);
                    });

                    httpServer.listen(port, () => {
                        console.error(`MCP HTTP server listening on port ${String(port)}`);
                    });

                    const shutdown = () => {
                        console.error('Shutting down...');
                        httpServer.close();
                        process.exit(0);
                    };
                    process.on('SIGINT', shutdown);
                    process.on('SIGTERM', shutdown);
                } else {
                    // stdio transport
                    const transport = new StdioServerTransport();
                    await server.connect(transport);

                    const shutdown = () => {
                        process.exit(0);
                    };
                    process.on('SIGINT', shutdown);
                    process.on('SIGTERM', shutdown);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`Error: ${message}`);
                process.exit(1);
            }
        }
    );

program.parse();
