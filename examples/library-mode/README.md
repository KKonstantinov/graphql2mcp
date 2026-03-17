# Library Mode Example

Use `@graphql2mcp/lib` to add GraphQL tools to an existing MCP server that already has other custom tools.

This is the recommended approach when you have your own MCP server and want to augment it with GraphQL-backed tools without giving up control of the server lifecycle.

## How to run

```bash
# From the monorepo root
pnpm build
pnpm --filter @graphql2mcp/example-library-mode start
```

## What it demonstrates

- Creating your own `McpServer` with custom tools (e.g., `ping`)
- Using `registerGraphQLTools()` to add GraphQL tools alongside existing tools
- Passing an SDL string directly as the schema source
- Getting metadata about registered tools (names, count)
- The library does not manage transports -- you control your own server lifecycle
