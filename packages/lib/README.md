# @graphql2mcp/lib

[![npm version](https://img.shields.io/npm/v/@graphql2mcp/lib)](https://www.npmjs.com/package/@graphql2mcp/lib)

Library for integrating GraphQL-to-MCP conversion into existing TypeScript MCP servers. Register GraphQL-backed tools on your own `McpServer` instance alongside your custom tools.

## Install

```bash
npm install @graphql2mcp/lib
```

Peer dependency: [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) (>= 1.27.1).

```bash
npm install @modelcontextprotocol/sdk
```

## Usage

### Basic registration

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

const result = registerGraphQLTools(server, {
    source: 'schema.graphql',
    endpoint: 'https://api.example.com/graphql'
});

console.log(`Registered ${result.count} tools`);
// result.tools contains metadata about each registered tool

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
```

### Mix custom tools with GraphQL tools

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'hybrid-server', version: '1.0.0' });

// Your own custom tools
server.registerTool(
    'ping',
    {
        title: 'Ping',
        description: 'Health check',
        inputSchema: { message: z.string().optional() }
    },
    ({ message }) => ({
        content: [{ type: 'text', text: `pong: ${message ?? ''}` }]
    })
);

// Add GraphQL tools from an SDL string
registerGraphQLTools(server, {
    source: `
        type Query {
            users(limit: Int): [User!]!
            user(id: ID!): User
        }

        type User {
            id: ID!
            name: String!
            email: String
        }
    `,
    endpoint: 'https://api.example.com/graphql'
});

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
```

### With authentication headers

```typescript
registerGraphQLTools(server, {
    source: 'schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'X-API-Key': 'your-api-key'
    }
});
```

### From a pre-built schema

If you already have a `GraphQLSchema` object, pass it directly instead of a source string:

```typescript
import { buildSchema } from 'graphql';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const schema = buildSchema(`
    type Query {
        hello: String
    }
`);

registerGraphQLTools(server, {
    schema,
    endpoint: 'https://api.example.com/graphql'
});
```

### Mutation configuration

```typescript
// Expose all mutations
registerGraphQLTools(server, {
    source: 'schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'all'
});

// Expose no mutations (default)
registerGraphQLTools(server, {
    source: 'schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'none'
});

// Expose specific mutations only
registerGraphQLTools(server, {
    source: 'schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```

## Options

| Option           | Type                        | Default       | Description                                                           |
| ---------------- | --------------------------- | ------------- | --------------------------------------------------------------------- |
| `source`         | `string`                    | `undefined`   | SDL string, file path, glob, or introspection JSON path               |
| `schema`         | `GraphQLSchema`             | `undefined`   | Pre-built GraphQL schema (alternative to `source`)                    |
| `endpoint`       | `string`                    | (required)    | GraphQL execution endpoint URL                                        |
| `headers`        | `Record<string, string>`    | `undefined`   | HTTP headers for runtime execution                                    |
| `mutations`      | `MutationMode`              | `'none'`      | Mutation exposure mode (`'none'`, `'all'`, or `{ whitelist: [...] }`) |
| `depth`          | `number`                    | `3`           | Maximum depth for return type field selection                         |
| `include`        | `string[]`                  | `undefined`   | Only include these operations                                         |
| `exclude`        | `string[]`                  | `undefined`   | Exclude these operations                                              |
| `queryPrefix`    | `string`                    | `'query_'`    | Prefix for query tool names                                           |
| `mutationPrefix` | `string`                    | `'mutation_'` | Prefix for mutation tool names                                        |
| `customScalars`  | `Record<string, z.ZodType>` | `undefined`   | Custom Zod schemas for GraphQL custom scalars                         |
| `timeout`        | `number`                    | `30000`       | Request timeout in milliseconds                                       |

Either `source` or `schema` must be provided. If both are given, `schema` takes precedence.

## Return Value

`registerGraphQLTools` returns a `RegisterGraphQLToolsResult`:

```typescript
interface RegisterGraphQLToolsResult {
    tools: RegisteredToolInfo[];
    count: number;
}

interface RegisteredToolInfo {
    name: string; // e.g. "query_users"
    title: string; // e.g. "Query: users"
    operationType: 'query' | 'mutation';
    fieldName: string; // original GraphQL field name
}
```

## License

MIT
