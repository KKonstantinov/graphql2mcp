import { Command, Option } from 'commander';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createProxyServerFactory, resolveUrlProxyOptions } from './server.js';
import type { ProxyServerOptions } from './server.js';
import { VERSION, collectCsv, collectList, resolveCliConfig } from './cli-utils.js';
import type { CliOptions } from './cli-utils.js';

const program = new Command()
    .name('graphql2mcp')
    .description('Convert GraphQL endpoints into MCP servers')
    .version(VERSION, '-V, --version')
    .argument('[source]', 'SDL file path, glob, or URL')
    .option('-t, --transport <type>', 'MCP transport type (stdio | http)', 'stdio')
    .option('-p, --port <number>', 'HTTP port (transport=http)', '3000')
    .addOption(new Option('-m, --mutations <mode>', 'Mutation exposure mode').choices(['all', 'none', 'whitelist']).default('none'))
    .option('--mutation-whitelist <names>', 'Mutation names to whitelist (comma-separated)', collectCsv, [] as string[])
    .option('-H, --header <header>', 'HTTP header (e.g., "Authorization: Bearer x"), repeatable', collectList, [] as string[])
    .option('-e, --endpoint <url>', 'GraphQL execution endpoint')
    .option('-n, --name <name>', 'MCP server name', 'graphql-mcp-server')
    .option('-d, --depth <number>', 'Field selection depth', '3')
    .option('--include <names>', 'Only include these operations (comma-separated)', collectCsv, [] as string[])
    .option('--exclude <names>', 'Exclude these operations (comma-separated)', collectCsv, [] as string[])
    .action(async (source: string | undefined, opts: CliOptions) => {
        if (!source) {
            program.help({ error: true });
            return;
        }

        try {
            const config = resolveCliConfig(source, opts);

            for (const w of config.warnings) {
                console.error(`Warning: ${w}`);
            }

            const proxyOptions: ProxyServerOptions = config.isUrl
                ? await resolveUrlProxyOptions({
                      url: config.source,
                      endpoint: config.endpoint,
                      headers: config.headers,
                      mutations: config.mutations,
                      name: config.name,
                      version: config.version,
                      depth: config.depth,
                      include: config.include,
                      exclude: config.exclude
                  })
                : {
                      endpoints: [
                          {
                              source: config.source,
                              endpoint: config.endpoint,
                              headers: config.headers,
                              mutations: config.mutations,
                              include: config.include,
                              exclude: config.exclude
                          }
                      ],
                      name: config.name,
                      version: config.version,
                      depth: config.depth
                  };
            const createServer = createProxyServerFactory(proxyOptions);

            if (config.transport === 'http') {
                const { startHttpServer } = await import('./http.js');
                const httpServer = await startHttpServer(createServer, config.port);
                console.error(`MCP HTTP server listening on port ${String(config.port)}`);

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
                await createServer().connect(transport);

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
    });

program.parse();
