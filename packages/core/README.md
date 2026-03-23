# @graphql2mcp/core

[![npm version](https://img.shields.io/npm/v/@graphql2mcp/core)](https://www.npmjs.com/package/@graphql2mcp/core)

Shared conversion engine that transforms GraphQL schemas into MCP (Model Context Protocol) tool definitions. Used internally by [`graphql2mcp`](https://www.npmjs.com/package/graphql2mcp) and [`@graphql2mcp/lib`](https://www.npmjs.com/package/@graphql2mcp/lib). Also usable
directly — includes high-level functions for generating tools with bound handlers and registering them on any MCP server.

## Install

```bash
npm install @graphql2mcp/core
```

## Usage

### Load a schema and generate tools

```typescript
import { loadSchemaFromFile, generateTools } from '@graphql2mcp/core';

const schema = loadSchemaFromFile('schema.graphql');
const { tools } = generateTools({ schema });

for (const tool of tools) {
    console.log(tool.name, tool.description);
    console.log(tool.queryDocument); // pre-built GraphQL query string
}
```

### Load from an SDL string

```typescript
import { loadSchemaFromString, generateTools } from '@graphql2mcp/core';

const schema = loadSchemaFromString(`
    type Query {
        users(limit: Int): [User!]!
        user(id: ID!): User
    }

    type User {
        id: ID!
        name: String!
        email: String
    }
`);

const { tools } = generateTools({ schema });
// tools[0].name === "query_users"
// tools[1].name === "query_user"
```

### Auto-detect source type

The `loadSchema` function detects the source type automatically — SDL strings, `.graphql` files, `.json` introspection files, or glob patterns:

```typescript
import { loadSchema, generateTools } from '@graphql2mcp/core';

// SDL file
const schema1 = loadSchema('schema.graphql');

// Glob pattern (merges all matched files)
const schema2 = loadSchema('schemas/**/*.graphql');

// Introspection JSON
const schema3 = loadSchema('introspection.json');

// Inline SDL string
const schema4 = loadSchema('type Query { hello: String }');
```

### Enable mutations

```typescript
import { loadSchemaFromFile, generateTools } from '@graphql2mcp/core';

const schema = loadSchemaFromFile('schema.graphql');

// Expose all mutations
const { tools: allTools } = generateTools({ schema, mutations: 'all' });

// Expose specific mutations only
const { tools: safeTools } = generateTools({
    schema,
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```

### Filter operations

```typescript
import { loadSchemaFromFile, generateTools } from '@graphql2mcp/core';

const schema = loadSchemaFromFile('schema.graphql');

// Only include specific operations
const { tools } = generateTools({
    schema,
    include: ['users', 'user']
});

// Exclude specific operations
const { tools: filtered } = generateTools({
    schema,
    exclude: ['internalMetrics']
});
```

## ConvertOptions

| Option           | Type                        | Default       | Description                                    |
| ---------------- | --------------------------- | ------------- | ---------------------------------------------- |
| `schema`         | `GraphQLSchema`             | (required)    | The GraphQL schema to convert                  |
| `mutations`      | `MutationMode`              | `'none'`      | Mutation exposure mode                         |
| `depth`          | `number`                    | `3`           | Maximum depth for return type field selection  |
| `include`        | `string[]`                  | `undefined`   | Only include operations with these field names |
| `exclude`        | `string[]`                  | `undefined`   | Exclude operations with these field names      |
| `queryPrefix`    | `string`                    | `'query_'`    | Prefix for query tool names                    |
| `mutationPrefix` | `string`                    | `'mutation_'` | Prefix for mutation tool names                 |
| `customScalars`  | `Record<string, z.ZodType>` | `undefined`   | Custom Zod schemas for GraphQL custom scalars  |

## MutationMode

Controls which mutations are exposed as MCP tools:

| Value                     | Behavior                                   |
| ------------------------- | ------------------------------------------ |
| `'none'`                  | No mutations are exposed (default)         |
| `'all'`                   | All mutations are exposed as tools         |
| `{ whitelist: string[] }` | Only the listed mutation names are exposed |

Mutations get `destructiveHint: true` in their MCP tool annotations. Queries get `readOnlyHint: true`.

## High-Level API

For most use cases, the high-level functions are the easiest way to use core directly. They handle schema loading, tool generation, execution handler creation, and (optionally) MCP server registration in a single call.

### `getGraphQLTools(options)`

Generate tools with bound execution handlers, without registering them on a server:

```typescript
import { getGraphQLTools } from '@graphql2mcp/core';

const { tools, count } = getGraphQLTools({
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'all'
});

for (const tool of tools) {
    console.log(tool.name, tool.operationType);
    // tool.handler is an async function ready to call
}
```

### `registerGraphQLTools(server, options)`

Generate tools and register them on any MCP server (or compatible object):

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGraphQLTools } from '@graphql2mcp/core';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

const result = registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql'
});

console.log(`Registered ${result.count} tools`);
```

### `GraphQLToolsOptions`

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

## API Summary

### Schema Loading

| Function                                  | Description                                      |
| ----------------------------------------- | ------------------------------------------------ |
| `loadSchema(source)`                      | Auto-detect source type and load                 |
| `loadSchemaFromString(sdl)`               | Load from an SDL string                          |
| `loadSchemaFromFile(path)`                | Load from a `.graphql` / `.gql` file             |
| `loadSchemaFromGlob(pattern)`             | Load and merge from a glob pattern               |
| `loadSchemaFromIntrospectionFile(path)`   | Load from an introspection result JSON file      |
| `loadSchemaFromIntrospectionResult(json)` | Load from an introspection result object         |
| `loadSchemaFromUrl(options)`              | Introspect a live endpoint and return the schema |

### High-Level Tool API

| Function                                | Description                                                 |
| --------------------------------------- | ----------------------------------------------------------- |
| `getGraphQLTools(options)`              | Generate tools with bound handlers (no server registration) |
| `registerGraphQLTools(server, options)` | Generate tools and register them on an MCP server           |

### Low-Level Tool Generation

| Function                 | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `generateTools(options)` | Convert a `GraphQLSchema` into MCP `ToolDefinition[]` |

### Execution

| Function                                          | Description                                   |
| ------------------------------------------------- | --------------------------------------------- |
| `executeGraphQL(endpoint, query, variables, ...)` | Send a GraphQL operation via HTTP POST        |
| `createToolHandler(tool, endpoint, headers, ...)` | Create an async handler for a tool definition |

### Utilities

| Function                                         | Description                                            |
| ------------------------------------------------ | ------------------------------------------------------ |
| `graphqlTypeToZod(type, options?)`               | Convert a GraphQL type to a Zod schema                 |
| `argumentsToZodShape(args, options?)`            | Convert GraphQL arguments to a Zod raw shape           |
| `generateToolName(fieldName, prefix, usedNames)` | Generate a unique tool name with prefix                |
| `sanitizeName(name)`                             | Sanitize a name for use as an MCP tool name            |
| `buildSelectionSet(type, schema, depth)`         | Build a GraphQL selection set string for a return type |

## License

MIT
