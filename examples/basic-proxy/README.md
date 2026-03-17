# Basic Proxy Example

The simplest usage of `graphql2mcp`: point at a public GraphQL API and get an MCP server via stdio.

This example connects to the [Countries GraphQL API](https://countries.trevorblades.com/graphql) (public, no auth required) and exposes its queries as MCP tools.

## How to run

```bash
# From the monorepo root
pnpm build
pnpm --filter @graphql2mcp/example-basic-proxy start
```

The server starts on stdio and is ready to accept MCP JSON-RPC messages on stdin/stdout.

## What it demonstrates

- Introspecting a live GraphQL endpoint to discover its schema
- Automatically generating MCP tools for each query field
- Running an MCP server over stdio transport
