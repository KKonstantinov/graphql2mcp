# graphql2mcp

[![npm version](https://img.shields.io/npm/v/graphql2mcp)](https://www.npmjs.com/package/graphql2mcp)

Standalone CLI proxy that converts GraphQL endpoints into MCP (Model Context Protocol) servers. Point it at a GraphQL endpoint and get an MCP server with tools mapped from queries and mutations.

## Install

```bash
npm install -g graphql2mcp
```

Or run directly with `npx`:

```bash
npx graphql2mcp https://api.example.com/graphql
```

## CLI Usage

```bash
graphql2mcp <source> [options]
```

The `source` argument can be a GraphQL endpoint URL, an SDL file path, a glob pattern, or an introspection JSON file.

### From a live endpoint (introspects automatically)

```bash
graphql2mcp https://api.example.com/graphql
```

### From a GraphQL File

```bash
graphql2mcp schema.graphql -e https://api.example.com/graphql
```

### With authentication headers

```bash
graphql2mcp https://api.example.com/graphql \
    -H "Authorization: Bearer YOUR_TOKEN"
```

### Enable mutations

```bash
# All mutations
graphql2mcp schema.graphql -e https://api.example.com/graphql -m all

# Specific mutations only
graphql2mcp schema.graphql -e https://api.example.com/graphql \
    -m whitelist --mutation-whitelist createUser updateUser
```

### Filter operations

```bash
# Only include specific queries
graphql2mcp schema.graphql -e https://api.example.com/graphql \
    --include users user

# Exclude specific queries
graphql2mcp schema.graphql -e https://api.example.com/graphql \
    --exclude internalMetrics debugInfo
```

### Streamable HTTP transport (recommended)

```bash
graphql2mcp https://api.example.com/graphql -t http -p 8080
```

### CLI Flags

| Flag                              | Description                                            | Default              |
| --------------------------------- | ------------------------------------------------------ | -------------------- |
| `-e, --endpoint <url>`            | GraphQL execution endpoint (required for file sources) | -                    |
| `-t, --transport <type>`          | MCP transport type (`stdio` or `http`)                 | `stdio`              |
| `-p, --port <number>`             | HTTP port (when transport is `http`)                   | `3000`               |
| `-m, --mutations <mode>`          | Mutation exposure mode (`all`, `none`, or `whitelist`) | `none`               |
| `--mutation-whitelist <names...>` | Mutation names to whitelist                            | -                    |
| `-H, --header <headers...>`       | HTTP headers (e.g. `"Authorization: Bearer x"`)        | -                    |
| `-n, --name <name>`               | MCP server name                                        | `graphql-mcp-server` |
| `-d, --depth <number>`            | Field selection depth for return types                 | `3`                  |
| `--include <names...>`            | Only include these operations                          | -                    |
| `--exclude <names...>`            | Exclude these operations                               | -                    |
| `-V, --version`                   | Show version number                                    | -                    |

## Programmatic Usage

The package also exports functions for creating proxy servers programmatically.

### From a live URL (with introspection)

```typescript
import { createProxyServerFromUrl } from 'graphql2mcp';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = await createProxyServerFromUrl({
    url: 'https://api.example.com/graphql',
    headers: { Authorization: 'Bearer YOUR_TOKEN' },
    mutations: 'all'
});

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
```

### From a GraphQL File

```typescript
import { createProxyServer } from 'graphql2mcp';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = createProxyServer({
    endpoints: [
        {
            source: 'schema.graphql',
            endpoint: 'https://api.example.com/graphql',
            headers: { Authorization: 'Bearer YOUR_TOKEN' }
        }
    ]
});

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
```

### Multi-endpoint

Combine multiple GraphQL APIs into a single MCP server. Use the `prefix` option to namespace tools and avoid collisions:

```typescript
import { createProxyServer } from 'graphql2mcp';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = createProxyServer({
    endpoints: [
        {
            source: 'schemas/users.graphql',
            endpoint: 'https://users-api.example.com/graphql',
            prefix: 'users'
        },
        {
            source: 'schemas/products.graphql',
            endpoint: 'https://products-api.example.com/graphql',
            prefix: 'products',
            mutations: { whitelist: ['createProduct'] }
        }
    ],
    name: 'multi-api-server'
});

// Tools are named: users_query_getUser, products_query_listProducts, products_mutation_createProduct, etc.
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
```

### ProxyServerOptions

| Option           | Type               | Default                | Description                            |
| ---------------- | ------------------ | ---------------------- | -------------------------------------- |
| `endpoints`      | `EndpointConfig[]` | (required)             | Endpoint configurations (at least one) |
| `name`           | `string`           | `'graphql-mcp-server'` | MCP server name                        |
| `version`        | `string`           | `'1.0.0'`              | MCP server version                     |
| `depth`          | `number`           | `3`                    | Field selection depth                  |
| `timeout`        | `number`           | `30000`                | Request timeout in milliseconds        |
| `queryPrefix`    | `string`           | `'query_'`             | Prefix for query tool names            |
| `mutationPrefix` | `string`           | `'mutation_'`          | Prefix for mutation tool names         |

### EndpointConfig

| Option      | Type                     | Default     | Description                                                               |
| ----------- | ------------------------ | ----------- | ------------------------------------------------------------------------- |
| `source`    | `string`                 | (required)  | SDL file path, glob, SDL string, or introspection JSON path               |
| `endpoint`  | `string`                 | `undefined` | GraphQL execution endpoint URL                                            |
| `headers`   | `Record<string, string>` | `undefined` | HTTP headers for introspection and runtime execution                      |
| `mutations` | `MutationMode`           | `'none'`    | Mutation exposure mode (`'none'`, `'all'`, or `{ whitelist: [...] }`)     |
| `include`   | `string[]`               | `undefined` | Only include these operations                                             |
| `exclude`   | `string[]`               | `undefined` | Exclude these operations                                                  |
| `prefix`    | `string`                 | `undefined` | Prefix for this endpoint's tools (for multi-endpoint collision avoidance) |

## License

MIT
