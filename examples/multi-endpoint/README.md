# Multi-Endpoint Example

Combine two GraphQL APIs into a single MCP server with prefixed tool names to avoid collisions.

In this example, both endpoints happen to be the same API (countries.trevorblades.com) but with different schema subsets. In a real scenario, these would be different GraphQL services.

## How to run

```bash
# From the monorepo root
pnpm build
pnpm --filter @graphql-to-mcp/example-multi-endpoint start
```

## Generated tools

With the `prefix` option, tools are namespaced per endpoint:

- `geo_query_countries` -- Countries from the geo endpoint
- `geo_query_country` -- Single country lookup
- `lang_query_languages` -- Languages from the lang endpoint
- `lang_query_language` -- Single language lookup

## What it demonstrates

- Configuring multiple endpoints in a single `createProxyServer()` call
- Using the `prefix` option to namespace tools per endpoint
- Each endpoint can have its own auth headers and mutation configuration
