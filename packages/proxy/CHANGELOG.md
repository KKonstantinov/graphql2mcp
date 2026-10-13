# graphql2mcp

## 0.3.1

### Patch Changes

- [#6](https://github.com/KKonstantinov/graphql2mcp/pull/6) [`eda1771`](https://github.com/KKonstantinov/graphql2mcp/commit/eda1771daaceae15d8d0efb423836a3d21f592a4) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - Fix `--transport http`, which failed every request
  after the first one. The CLI now creates a new MCP server and stateless Streamable HTTP transport for each request, so MCP clients can connect and call tools. GET and DELETE requests now return 405.

## 0.3.0

### Minor Changes

- [#4](https://github.com/KKonstantinov/graphql2mcp/pull/4) [`43211fc`](https://github.com/KKonstantinov/graphql2mcp/commit/43211fc7a5ec9df6c7d0d8a86f33e2370a7e4b9e) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - docs update

## 0.2.0

### Minor Changes

- [#2](https://github.com/KKonstantinov/graphql2mcp/pull/2) [`6ef57c1`](https://github.com/KKonstantinov/graphql2mcp/commit/6ef57c159d8171e1d62764396e022ce11ab1d0db) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - tool execution and registration - consolidate into
  core

## 0.1.1

### Patch Changes

- [`121f7dd`](https://github.com/KKonstantinov/graphql2mcp/commit/121f7dd95d776930f18e6c081309a301c7c532fc) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - provenance add

## 0.1.0

### Minor Changes

- init version
