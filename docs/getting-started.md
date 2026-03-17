# Getting Started

This guide walks you through installing `graphql2mcp` and converting your first GraphQL schema into an MCP server.

## Installation

### CLI Proxy (standalone server)

Run directly with `npx` (no install needed):

```bash
npx graphql2mcp https://api.example.com/graphql
```

Or install globally:

```bash
npm install -g graphql2mcp
```

### Library (integrate into existing MCP server)

```bash
npm install @graphql2mcp/lib
```

## Your First MCP Server

### From a URL

The simplest way to get started is to point at a GraphQL endpoint. The CLI will introspect the schema and start an MCP server:

```bash
npx graphql2mcp https://countries.trevorblades.com/graphql
```

This creates MCP tools for every query in the schema. The server communicates over stdio, ready for use with Claude Desktop, Cursor, or any MCP client.

### From an SDL File

If you have a local `.graphql` schema file, provide a file path and an execution endpoint:

```bash
npx graphql2mcp ./schema.graphql -e https://api.example.com/graphql
```

Here is an example `schema.graphql`:

```graphql
type Query {
    "Get a user by ID"
    user(id: ID!): User
    "List all users with optional pagination"
    users(limit: Int, offset: Int): [User!]!
}

type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
}

enum Role {
    ADMIN
    USER
    MODERATOR
}
```

The CLI generates MCP tools named `query_user` and `query_users`, each with a Zod input schema matching the GraphQL arguments.

### From Code

If you have an existing MCP server and want to add GraphQL tools alongside your own:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGraphQLTools } from '@graphql2mcp/lib';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

// Register GraphQL tools from a schema
const result = registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql'
});

console.error(`Registered ${result.count} tools`);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## What's Next

- [CLI Reference](cli.md) -- all flags, options, and usage patterns
- [Library Mode](library.md) -- integrate into existing MCP servers
- [Mutations](mutations.md) -- configure which mutations are exposed as tools
- [Core API](core.md) -- use the conversion engine directly
- [Architecture](architecture.md) -- how GraphQL schemas become MCP tools
