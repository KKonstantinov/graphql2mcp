---
name: graphql-mcp-server
description:
    Turns GraphQL APIs into MCP tools with the graphql2mcp CLI or the @graphql2mcp/lib library. Use when connecting a GraphQL endpoint to Claude Code, Claude Desktop, Cursor, VS Code or another MCP client; when serving a .graphql SDL file, schema glob or introspection JSON as an
    MCP server; when exposing selected GraphQL queries or mutations to an AI agent; or when adding GraphQL-backed tools to an existing TypeScript MCP server.
license: MIT
---

# GraphQL MCP Server (graphql2mcp)

graphql2mcp turns every field on a GraphQL schema's `Query` type (and any `Mutation` fields you opt in to) into an MCP tool. When a tool is called, it runs the matching operation against the GraphQL endpoint and returns the JSON result.

| Situation                                                           | Use                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| An MCP client (Claude Code, Cursor, …) should talk to a GraphQL API | CLI: `npx -y graphql2mcp <source> [options]`                        |
| You already have a TypeScript `McpServer` and want GraphQL tools    | `@graphql2mcp/lib` → `registerGraphQLTools(server, options)`        |
| Several GraphQL APIs in one server, built in code                   | `createProxyServer` from `graphql2mcp`, see `references/library.md` |

Runtime: Node.js >= 22, Bun >= 1.2, or Deno >= 2.

## CLI

```bash
# Live endpoint: the schema is introspected and queries go to the same URL
npx -y graphql2mcp https://api.example.com/graphql -H "Authorization: Bearer $TOKEN"

# Local schema (SDL file, quoted glob, or introspection .json): -e is REQUIRED
npx -y graphql2mcp ./schema.graphql -e https://api.example.com/graphql
```

How `<source>` is interpreted: `http(s)://` means live introspection. `*.json` is a saved introspection result. Anything containing `*` or `?` is a glob, and the matched files are merged. `*.graphql`/`*.gql` is an SDL file.

Main flags (full table in `references/cli.md`):

| Flag                       | Default              | Notes                                                                      |
| -------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `-e, --endpoint <url>`     | source URL           | Where queries are executed. Required for non-URL sources                   |
| `-H, --header "K: V"`      |                      | One header per flag; repeat the flag. Used for introspection and execution |
| `-m, --mutations <mode>`   | `none`               | `none`, `all`, `whitelist`                                                 |
| `--mutation-whitelist a,b` |                      | Comma-separated. Switches to whitelist mode automatically                  |
| `--include a,b`            |                      | Comma-separated GraphQL field names. Applies to queries **and** mutations  |
| `--exclude a,b`            |                      | Comma-separated. Overrides `--include`                                     |
| `-d, --depth <n>`          | `3`                  | How deep nested objects are selected in results                            |
| `-t, --transport <type>`   | `stdio`              | `stdio` or `http`                                                          |
| `-p, --port <n>`           | `3000`               | Only used with `-t http`                                                   |
| `-n, --name <name>`        | `graphql-mcp-server` | MCP server name                                                            |

## Rules that are easy to get wrong

1. **List flags take a single comma-separated value.** Write `--include users,user`. `--include users user` fails with `error: too many arguments`, and so does the same form for `--exclude` and `--mutation-whitelist`. Some older docs show the space-separated form, but it doesn't
   work.
2. **Non-URL sources need `-e`.** Without it the server still starts, but every tool call fails with `Failed to parse URL from ./schema.graphql`.
3. **Mutations are off by default.** Turn them on with `-m whitelist --mutation-whitelist createUser,updateUser`, which is the preferred option, or with `-m all`. Mutation tools are annotated `destructiveHint: true` and query tools `readOnlyHint: true`.
4. **`--include` filters mutations too.** If you combine `--include` with whitelisted mutations, list the mutations in `--include` as well. Otherwise they are dropped without any warning.
5. **Filters match GraphQL field names, not tool names.** Use `--include user`, not `--include query_user`. Names that don't exist in the schema are ignored without a warning, so check the tool list.
6. **Tool names** are the prefix followed by the field name, with nothing in between: `query_<field>` and `mutation_<field>`. Characters other than letters, digits and `_` become `_`, and a name that collides gets a `_2` suffix.
7. **Selections are fixed when the server starts.** The agent can't pick fields per call. Every scalar field is selected. `-d 1` returns only the scalars of the returned type, `-d 2` adds one level of nested objects, and the default `-d 3` adds two. Lower `-d` if responses are
   too large, and raise it if nested data is missing.
8. **Quote globs** (`'./schemas/*.graphql'`). If the shell expands an unquoted glob into several files, you get `too many arguments`.
9. **stdio mode prints nothing and waits for a client.** It is meant to be launched by an MCP client, not run interactively. Logs go to stderr.
10. Subscriptions are skipped.

## Connecting a client (stdio)

Claude Code:

```bash
claude mcp add my-api -- npx -y graphql2mcp https://api.example.com/graphql -H "Authorization: Bearer $TOKEN"
```

That command stores the expanded token in your local Claude Code config. To keep secrets out of shared files, use a project `.mcp.json`, where Claude Code expands `${VAR}`:

```json
{
    "mcpServers": {
        "my-api": {
            "command": "npx",
            "args": ["-y", "graphql2mcp", "https://api.example.com/graphql", "-H", "Authorization: Bearer ${API_TOKEN}"]
        }
    }
}
```

Claude Desktop (`claude_desktop_config.json`) and Cursor (`.cursor/mcp.json`) use the same `mcpServers` → `command`/`args` shape. VS Code (`.vscode/mcp.json`) uses `"servers"` with `"type": "stdio"`.

## HTTP transport

```bash
npx -y graphql2mcp https://api.example.com/graphql -t http -p 3000
# MCP clients connect to http://localhost:3000/mcp (any path is accepted)
```

The HTTP server has no authentication of its own and listens on all interfaces. Anyone who can reach the port can use the upstream credentials you passed with `-H`. Restrict it to a trusted network or put an authenticating proxy in front of it.

## Library (existing TypeScript MCP server)

```bash
npm install @graphql2mcp/lib @modelcontextprotocol/sdk zod   # zod v4
```

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGraphQLTools } from '@graphql2mcp/lib';
import { z } from 'zod';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

const { count } = registerGraphQLTools(server, {
    source: './schema/*.graphql', // SDL string, file, glob, or introspection .json
    endpoint: 'https://api.example.com/graphql', // always required
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    mutations: { whitelist: ['createOrder'] }, // 'none' (default) | 'all' | { whitelist }
    queryPrefix: 'shop_query_', // used verbatim: 'shop_query_' + 'products' = 'shop_query_products'
    mutationPrefix: 'shop_mutation_', // replaces 'mutation_' entirely
    customScalars: { DateTime: z.iso.datetime({ offset: true }) } // validates arguments; scalars without a mapping are treated as z.string()
});
```

`registerGraphQLTools` is synchronous and only registers tools. You still connect the transport yourself. For a live endpoint, introspect first: `const schema = await loadSchemaFromUrl({ url, headers })`, then pass `{ schema, endpoint }`. `getGraphQLTools`, multi-endpoint
`createProxyServer`, and the full options table are in `references/library.md`.

## Verify before handing off

- `npx -y graphql2mcp --help` shows the flags of the installed version.
- `npx @modelcontextprotocol/inspector npx -y graphql2mcp <source> [flags]` lets you list the generated tools and try a call.

## Errors

| Message                                         | Cause → fix                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `error: too many arguments`                     | Space-separated list, or an unquoted glob → use commas, quote the glob                      |
| `Failed to parse URL from ./schema.graphql`     | Non-URL source without an endpoint → add `-e <url>`                                         |
| `Introspection is disabled on <url>`            | The server blocks introspection → use a saved SDL or introspection JSON plus `-e`           |
| `HTTP 401: Authentication/authorization failed` | Missing or wrong `-H`. Write headers as `"Name: value"`; a value without a colon is ignored |
| `No tools were generated`                       | Filters removed everything → check that `--include` names are GraphQL field names           |
| `No .graphql files found matching pattern`      | The glob matched nothing (paths are relative to the working directory)                      |
| `Request timed out after 30000ms`               | Slow endpoint → library `timeout` option (the CLI has no timeout flag)                      |
