---
layout: home

hero:
    name: graphql2mcp
    tagline: Convert GraphQL schemas and endpoints into Model Context Protocol servers. Let AI agents talk to any GraphQL API.
    actions:
        - theme: brand
          text: Get Started
          link: /getting-started
        - theme: alt
          text: API Reference
          link: /core
        - theme: alt
          text: GitHub
          link: https://github.com/KKonstantinov/graphql2mcp

features:
    - title: CLI Proxy
      details: Point at a GraphQL endpoint URL or SDL file and get a fully functional MCP server in one command. Zero code required.
    - title: Library Mode
      details: Import into your existing TypeScript MCP server and register GraphQL tools alongside your own custom tools.
    - title: Mutation Control
      details: Expose all mutations, none, or an explicit whitelist. Each mode sets appropriate MCP tool annotations automatically.
    - title: Multi-endpoint
      details: Combine multiple GraphQL APIs into a single MCP server with per-endpoint prefixes to avoid tool name collisions.
    - title: Auth Headers
      details: Pass Authorization headers, API keys, or any custom headers for both schema introspection and runtime execution.
    - title: Automatic Type Mapping
      details: GraphQL scalars, enums, input objects, lists, and non-null wrappers are mapped to Zod schemas for validated tool inputs.
    - title: Smart Selection Sets
      details: Return types are traversed to generate field selections with configurable depth, including inline fragments for unions and interfaces.
    - title: Node.js, Bun, Deno
      details: ESM-only, fully typed, works in any JavaScript runtime that supports ES2022. Core package tested on all three runtimes.
---

## Why?

AI agents using MCP can call tools, but most APIs speak GraphQL — not MCP. Manually writing MCP tool definitions for every GraphQL query is tedious, error-prone, and falls out of sync as schemas evolve.

**graphql2mcp** reads your GraphQL schema (from a file, URL, or inline SDL) and automatically generates MCP tools with proper input validation, descriptions, and annotations. Each query becomes a callable tool. Each argument becomes a validated Zod input. The agent calls the
tool, the tool executes the GraphQL query, and the result comes back as structured JSON.

## Quick Start

One command. No code.

```bash
npx graphql2mcp https://countries.trevorblades.com/graphql
```

This introspects the endpoint, generates MCP tools for every query, and starts a server over stdio. An AI agent connected to this server can now call tools like `query_countries` and `query_country`.

## Library Mode

Already have an MCP server? Add GraphQL tools alongside your existing tools:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    headers: { Authorization: 'Bearer my-token' }
});
```

Every query in the schema becomes a tool. The agent sends arguments, the tool builds and executes the GraphQL query, and the result is returned as JSON text.

## Mutation Control

By default, only queries are exposed — mutations are opt-in. You can enable all mutations, or whitelist specific ones:

```typescript
// Expose only safe mutations
registerGraphQLTools(server, {
    source: schema,
    endpoint: 'https://api.example.com/graphql',
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```

Mutation tools are automatically annotated with `destructiveHint: true` and `readOnlyHint: false`, so AI agents know they're making changes.

## Multi-endpoint

Combine multiple GraphQL APIs into one MCP server with prefixed tool names:

```typescript
import { createProxyServer } from 'graphql2mcp';

const server = createProxyServer({
    endpoints: [
        {
            source: './github.graphql',
            endpoint: 'https://api.github.com/graphql',
            prefix: 'github',
            headers: { Authorization: 'Bearer gh-token' }
        },
        {
            source: './stripe.graphql',
            endpoint: 'https://api.stripe.com/graphql',
            prefix: 'stripe',
            headers: { Authorization: 'Bearer sk-token' }
        }
    ]
});
```

Tools are named `github_query_viewer`, `stripe_query_customers`, etc. — no collisions.

## How It Works

```mermaid
flowchart LR
    subgraph Source["GraphQL SDL"]
        S["type Query {\n  users\n  user(id)\n}"]
    end

    subgraph Core["@graphql2mcp/core"]
        P[Parse schema]
        M[Map types to Zod]
        B[Build selections]
        G[Generate queries]
        P --> M --> B --> G
    end

    subgraph Server["MCP Server"]
        T1[query_users]
        T2[query_user]
    end

    S --> P
    G --> T1
    G --> T2
    T1 & T2 -->|"POST { query, variables }"| E[GraphQL Endpoint]
    E -->|JSON response| T1 & T2
```

1. **Parse** — SDL string, `.graphql` file, or introspection result is loaded into a `GraphQLSchema`
2. **Map** — Each argument type is converted to a Zod schema (String to `z.string()`, Int to `z.number().int()`, enums to `z.enum()`, input objects to `z.object()`)
3. **Select** — Return types are traversed to build field selection sets with configurable depth
4. **Register** — Each query/mutation becomes an MCP tool with validated inputs, a description, and annotations

## Packages

| Package                        | Description                                                              |
| ------------------------------ | ------------------------------------------------------------------------ |
| [`graphql2mcp`](/cli)          | Standalone CLI proxy — run any GraphQL endpoint as an MCP server         |
| [`@graphql2mcp/lib`](/library) | Library for adding GraphQL tools to an existing MCP server               |
| [`@graphql2mcp/core`](/core)   | Shared conversion engine — schema parsing, type mapping, tool generation |

## Runtime Compatibility

| Runtime | Version | Status                          |
| ------- | ------- | ------------------------------- |
| Node.js | >= 24   | Full support (proxy, lib, core) |
| Bun     | >= 1.2  | Core package tested             |
| Deno    | >= 2.0  | Core package tested             |
