# graphql2mcp programmatic API

Two packages expose the same engine:

- `@graphql2mcp/lib` adds GraphQL tools to an `McpServer` you already have. Its peer dependency is `@modelcontextprotocol/sdk` ^1.27, and it uses zod v4.
- `graphql2mcp` (the CLI package) also exports `createProxyServer`, `createSimpleProxyServer` and `createProxyServerFromUrl`, which build a new `McpServer` for you.

## `registerGraphQLTools(server, options)` → `{ tools, count }`

This function is synchronous. It loads the schema, generates the tools, and calls `server.registerTool` for each one. It doesn't touch transports. `server` can be any object with a compatible `registerTool(name, config, handler)` method.

## `getGraphQLTools(options)` → `{ tools, count }`

Takes the same options but registers nothing. Each entry has the fields `name`, `title`, `description`, `inputSchema` (a zod raw shape), `annotations`, `handler(args)`, `operationType`, `fieldName` and `queryDocument`. Use it to rename, wrap, or filter tools before you register
them:

```ts
const { tools } = getGraphQLTools({ source: './schema.graphql', endpoint });
for (const tool of tools) {
    server.registerTool(tool.name, { title: tool.title, description: tool.description, inputSchema: tool.inputSchema, annotations: tool.annotations }, tool.handler);
}
```

## Options (`GraphQLToolsOptions`)

| Option           | Type                                         | Default       | Notes                                                                  |
| ---------------- | -------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| `source`         | `string`                                     |               | SDL string, `.graphql`/`.gql` path, glob, or introspection `.json`     |
| `schema`         | `GraphQLSchema`                              |               | Use instead of `source`. Takes precedence if both are given            |
| `endpoint`       | `string`                                     | **required**  | Execution URL                                                          |
| `headers`        | `Record<string, string>`                     | `{}`          | Sent with every execution request                                      |
| `mutations`      | `'none' \| 'all' \| { whitelist: string[] }` | `'none'`      | Unknown whitelist names are ignored                                    |
| `include`        | `string[]`                                   |               | Field names. Applies to queries and mutations                          |
| `exclude`        | `string[]`                                   |               | Field names. Overrides `include`                                       |
| `depth`          | `number`                                     | `3`           | Nesting depth of result selections                                     |
| `queryPrefix`    | `string`                                     | `'query_'`    | Replaces the default prefix completely                                 |
| `mutationPrefix` | `string`                                     | `'mutation_'` | Replaces the default prefix completely                                 |
| `customScalars`  | `Record<string, z.ZodType>`                  |               | Input validation for custom scalars. Unmapped scalars are `z.string()` |
| `timeout`        | `number`                                     | `30000`       | Request timeout in milliseconds                                        |

Schema loading for `source` happens synchronously from disk. A `source` string that contains a newline or starts with `type `, `schema `, `input `, `enum ` and so on is parsed as inline SDL.

## Live introspection

```ts
import { loadSchemaFromUrl, registerGraphQLTools } from '@graphql2mcp/lib';

const headers = { Authorization: `Bearer ${process.env.API_TOKEN}` };
const schema = await loadSchemaFromUrl({ url: 'https://api.example.com/graphql', headers });
registerGraphQLTools(server, { schema, endpoint: 'https://api.example.com/graphql', headers });
```

If you have a code-first schema (a `GraphQLSchema` built in-process), pass it as `schema` the same way.

## Custom scalars (zod v4)

These schemas validate tool arguments only. Responses are passed through as they arrive.

```ts
customScalars: {
    DateTime: z.iso.datetime({ offset: true }), // without offset: true, '+02:00' is rejected
    Money: z.string().regex(/^-?\d+(\.\d{1,2})?$/),
    JSON: z.record(z.string(), z.unknown())
}
```

## Several APIs in one server: `createProxyServer` (package `graphql2mcp`)

```ts
import { createProxyServer } from 'graphql2mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createProxyServer({
    name: 'company-apis',
    depth: 3,
    endpoints: [
        { source: './billing.graphql', endpoint: 'https://billing.example.com/graphql', prefix: 'billing' },
        { source: './crm.graphql', endpoint: 'https://crm.example.com/graphql', prefix: 'crm', mutations: { whitelist: ['createLead'] } }
    ]
});
await server.connect(new StdioServerTransport());
```

With `prefix: 'billing'`, tools are named `billing_query_<field>` and `billing_mutation_<field>`. Each endpoint config takes `source`, `endpoint`, `headers`, `mutations`, `include`, `exclude` and `prefix`. `depth`, `timeout`, `name` and `version` apply to the whole server.

`createProxyServer` doesn't introspect. For a live endpoint, call `createProxyServerFromUrl({ url, headers, mutations, include, exclude })`, which is async and handles a single endpoint. For several live endpoints, introspect each one with `loadSchemaFromUrl`, convert it with
`printSchema(schema)` from `graphql`, and pass the result as `source`.

## Serving over HTTP from your own code

For stateless Streamable HTTP, create a new `McpServer` and a new `StreamableHTTPServerTransport({ sessionIdGenerator: undefined })` for each request. In MCP SDK 1.27, a stateless transport throws if it is reused across requests.
