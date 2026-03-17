# Library Mode

The `@graphql2mcp/lib` package lets you register GraphQL tools on an existing MCP server instance. This is useful when you want to combine GraphQL tools with your own custom tools in a single server.

## Installation

```bash
npm install @graphql2mcp/lib
```

## Basic Usage

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

const result = registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql'
});

console.error(`Registered ${result.count} tools`);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## `registerGraphQLTools(server, options)`

Registers GraphQL tools on an MCP server instance and returns metadata about the registered tools. Does not create or manage transports -- the caller controls the server lifecycle.

**Parameters:**

- `server` -- an MCP server instance (or any object with a compatible `registerTool` method)
- `options` -- a [RegisterGraphQLToolsOptions](#options-reference) object

**Returns:** [RegisterGraphQLToolsResult](#result-type)

## Options Reference

| Property         | Type                        | Default        | Description                                                           |
| ---------------- | --------------------------- | -------------- | --------------------------------------------------------------------- |
| `source`         | `string`                    |                | SDL string, file path, glob, or introspection JSON path               |
| `schema`         | `GraphQLSchema`             |                | Pre-built GraphQL schema object (alternative to `source`)             |
| `endpoint`       | `string`                    | **(required)** | GraphQL execution endpoint URL                                        |
| `headers`        | `Record<string, string>`    | `{}`           | HTTP headers for runtime execution                                    |
| `mutations`      | `MutationMode`              | `'none'`       | Mutation exposure mode (`'all'`, `'none'`, or `{ whitelist: [...] }`) |
| `depth`          | `number`                    | `3`            | Field selection depth for return types                                |
| `include`        | `string[]`                  |                | Only include these operation names                                    |
| `exclude`        | `string[]`                  |                | Exclude these operation names                                         |
| `queryPrefix`    | `string`                    | `'query_'`     | Prefix for query tool names                                           |
| `mutationPrefix` | `string`                    | `'mutation_'`  | Prefix for mutation tool names                                        |
| `customScalars`  | `Record<string, z.ZodType>` |                | Custom scalar-to-Zod mappings                                         |
| `timeout`        | `number`                    | `30000`        | Request timeout in milliseconds                                       |

Either `source` or `schema` must be provided. If both are given, `schema` takes precedence.

## Result Type

```typescript
interface RegisterGraphQLToolsResult {
    tools: RegisteredToolInfo[];
    count: number;
}

interface RegisteredToolInfo {
    name: string;
    title: string;
    operationType: 'query' | 'mutation';
    fieldName: string;
}
```

The result tells you which tools were registered and how many. This is useful for logging or validation.

## Combining with Custom Tools

A common pattern is to register your own tools alongside GraphQL tools:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'my-hybrid-server', version: '1.0.0' });

// Register custom tools
server.registerTool(
    'ping',
    {
        title: 'Ping',
        description: 'Simple health check tool',
        inputSchema: {
            message: z.string().optional().describe('Optional message to echo back')
        }
    },
    ({ message }) => ({
        content: [{ type: 'text', text: `pong: ${message ?? 'no message'}` }]
    })
);

// Register GraphQL tools alongside custom tools
const result = registerGraphQLTools(server, {
    source: `
        type Query {
            "Get a list of countries"
            countries(filter: CountryFilter): [Country!]!
            "Get a specific country by code"
            country(code: ID!): Country
        }

        type Country {
            code: ID!
            name: String!
            capital: String
            currency: String
        }

        input CountryFilter {
            code: String
            continent: String
        }
    `,
    endpoint: 'https://countries.trevorblades.com/graphql'
});

console.error(`Registered ${result.count} GraphQL tools`);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Using a Pre-built Schema

If you already have a `GraphQLSchema` object (e.g., from `graphql-js` or a code-first framework), pass it directly:

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

## Custom Scalars

Map custom GraphQL scalars to Zod schemas for proper input validation:

```typescript
import { z } from 'zod';
import { registerGraphQLTools } from '@graphql2mcp/lib';

registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    customScalars: {
        DateTime: z.string().datetime(),
        JSON: z.record(z.string(), z.unknown()),
        BigInt: z.number().int()
    }
});
```

Without custom scalar mappings, unknown scalars default to `z.string()`.

## With Mutations

See the [Mutations guide](mutations.md) for a detailed explanation of mutation modes. Here is a quick example:

```typescript
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```
