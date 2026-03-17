# CLI Reference

The `graphql2mcp` CLI converts a GraphQL endpoint or schema file into a standalone MCP server.

## Installation

```bash
npm install -g graphql2mcp
```

Or run without installing:

```bash
npx graphql2mcp <source>
```

## Usage

```bash
graphql2mcp <source> [options]
```

The `<source>` argument can be:

- A URL (`https://api.example.com/graphql`) -- introspects the endpoint
- An SDL file path (`./schema.graphql` or `./schema.gql`)
- A glob pattern (`./schemas/*.graphql`) -- merges matched files
- An introspection JSON file (`./introspection.json`)

## Options

| Flag                              | Alias | Type                       | Default              | Description                                      |
| --------------------------------- | ----- | -------------------------- | -------------------- | ------------------------------------------------ |
| `--transport <type>`              | `-t`  | `stdio \| http`            | `stdio`              | MCP transport type                               |
| `--port <number>`                 | `-p`  | `number`                   | `3000`               | HTTP port (when transport is `http`)             |
| `--mutations <mode>`              | `-m`  | `all \| none \| whitelist` | `none`               | Mutation exposure mode                           |
| `--mutation-whitelist <names...>` |       | `string[]`                 |                      | Mutation names to whitelist                      |
| `--header <headers...>`           | `-H`  | `string[]`                 |                      | HTTP headers (e.g., `"Authorization: Bearer x"`) |
| `--endpoint <url>`                | `-e`  | `string`                   |                      | GraphQL execution endpoint                       |
| `--name <name>`                   | `-n`  | `string`                   | `graphql-mcp-server` | MCP server name                                  |
| `--depth <number>`                | `-d`  | `number`                   | `3`                  | Field selection depth for return types           |
| `--include <names...>`            |       | `string[]`                 |                      | Only include these operation names               |
| `--exclude <names...>`            |       | `string[]`                 |                      | Exclude these operation names                    |
| `--version`                       | `-V`  |                            |                      | Show version number                              |
| `--help`                          | `-h`  |                            |                      | Show help                                        |

## Examples

### Basic URL introspection

Introspect a public GraphQL API and expose all queries as MCP tools:

```bash
graphql2mcp https://countries.trevorblades.com/graphql
```

### SDL file with execution endpoint

Load the schema from a local file and execute queries against a different endpoint:

```bash
graphql2mcp ./schema.graphql -e https://api.example.com/graphql
```

### With authentication headers

Pass an authorization header for both introspection and runtime execution:

```bash
graphql2mcp https://api.example.com/graphql \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

Multiple headers are supported:

```bash
graphql2mcp https://api.example.com/graphql \
  -H "Authorization: Bearer token123" \
  -H "X-API-Key: key456"
```

### Enabling mutations

Expose all mutations:

```bash
graphql2mcp https://api.example.com/graphql -m all
```

Expose specific mutations by name:

```bash
graphql2mcp https://api.example.com/graphql \
  -m whitelist \
  --mutation-whitelist createUser updateUser
```

See the [Mutations guide](mutations.md) for details on mutation modes and tool annotations.

### Filtering operations

Only include specific operations:

```bash
graphql2mcp https://api.example.com/graphql \
  --include users user searchUsers
```

Exclude specific operations:

```bash
graphql2mcp https://api.example.com/graphql \
  --exclude internalMetrics debugQuery
```

### HTTP transport

Start the MCP server as an HTTP server instead of stdio:

```bash
graphql2mcp https://api.example.com/graphql -t http -p 8080
```

This starts a Streamable HTTP MCP server on port 8080.

### Glob pattern

Merge multiple schema files into a single MCP server:

```bash
graphql2mcp './schemas/*.graphql' -e https://api.example.com/graphql
```

### Introspection JSON file

Load a schema from a saved introspection result:

```bash
graphql2mcp ./introspection.json -e https://api.example.com/graphql
```

## Transport Options

### stdio (default)

The server communicates over stdin/stdout using the MCP stdio transport. This is the standard transport for MCP clients like Claude Desktop and Cursor.

Example Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
    "mcpServers": {
        "my-graphql-api": {
            "command": "npx",
            "args": ["graphql2mcp", "https://api.example.com/graphql", "-H", "Authorization: Bearer token123"]
        }
    }
}
```

### http

The server starts an HTTP server using the MCP Streamable HTTP transport. Useful for remote MCP clients or debugging.

```bash
graphql2mcp https://api.example.com/graphql -t http -p 3000
```

## Execution Endpoint

When the source is a URL, the same URL is used for both schema introspection and runtime query execution by default.

When the source is a file, glob, or SDL string, you must specify the execution endpoint with `--endpoint` (`-e`). This is the URL where GraphQL queries will be sent at runtime.

You can also use `--endpoint` to override the execution URL when the introspection and execution endpoints differ:

```bash
graphql2mcp https://admin.example.com/graphql \
  -e https://api.example.com/graphql
```
