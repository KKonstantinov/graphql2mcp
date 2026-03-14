# graphql-to-mcp

Convert GraphQL schemas and endpoints into [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) servers.

## Packages

| Package                                  | Description                                                       |
| ---------------------------------------- | ----------------------------------------------------------------- |
| [`graphql-to-mcp`](packages/proxy/)      | Standalone proxy — point at a GraphQL endpoint, get an MCP server |
| [`@graphql-to-mcp/core`](packages/core/) | Shared conversion engine (GraphQL schema → MCP tool definitions)  |
| [`@graphql-to-mcp/lib`](packages/lib/)   | Library for integrating into existing TypeScript MCP servers      |

## Quick Start

### Proxy Mode

```bash
npx graphql-to-mcp --endpoint https://api.example.com/graphql
```

### Library Mode

```typescript
import { addGraphQLTools } from '@graphql-to-mcp/lib';
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
