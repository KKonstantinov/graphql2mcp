# SDL File Example

Load a GraphQL schema from a local `.graphql` file and point tool execution at a GraphQL endpoint.

This is useful when you have a schema file but the endpoint does not support introspection, or when you want to control exactly which schema version is used.

## How to run

```bash
# From the monorepo root
pnpm build
pnpm --filter @graphql2mcp/example-sdl-file start
```

Note: This example expects a GraphQL server running at `http://localhost:4000/graphql` that matches the schema in `schema.graphql`. You can change the endpoint URL in `src/index.ts`.

## What it demonstrates

- Loading a schema from a `.graphql` file
- Specifying a separate execution endpoint
- Using `createProxyServer()` with file-based schema sources
