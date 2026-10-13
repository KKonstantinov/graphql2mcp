# graphql2mcp CLI reference

```
graphql2mcp <source> [options]
```

Run it without installing using `npx -y graphql2mcp`, or install it globally with `npm install -g graphql2mcp`.

## Source detection

| `<source>`                         | Treated as                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Starts with `http://` / `https://` | Live endpoint. The schema is introspected and the same URL executes queries |
| Ends with `.json`                  | Introspection result (raw, or wrapped in `{ "data": ... }`)                 |
| Contains `*` or `?`                | Glob. All matched files are concatenated into one SDL document              |
| Ends with `.graphql` / `.gql`      | SDL file                                                                    |

For any source other than a URL, pass `-e <url>`.

## Options

| Flag                          | Alias | Default              | Description                                                                 |
| ----------------------------- | ----- | -------------------- | --------------------------------------------------------------------------- |
| `--transport <type>`          | `-t`  | `stdio`              | `stdio` or `http` (Streamable HTTP)                                         |
| `--port <number>`             | `-p`  | `3000`               | HTTP port when `-t http`                                                    |
| `--mutations <mode>`          | `-m`  | `none`               | `all`, `none`, `whitelist`                                                  |
| `--mutation-whitelist <list>` |       |                      | Comma-separated mutation field names. Switches to whitelist mode on its own |
| `--header <header>`           | `-H`  |                      | `"Name: value"`. Repeat the flag for several headers                        |
| `--endpoint <url>`            | `-e`  | source URL           | GraphQL execution endpoint                                                  |
| `--name <name>`               | `-n`  | `graphql-mcp-server` | MCP server name                                                             |
| `--depth <number>`            | `-d`  | `3`                  | Object nesting depth of result selections                                   |
| `--include <list>`            |       |                      | Comma-separated field names to keep (queries and mutations)                 |
| `--exclude <list>`            |       |                      | Comma-separated field names to drop. Overrides include                      |
| `--version`                   | `-V`  |                      | Print version                                                               |
| `--help`                      | `-h`  |                      | Print help                                                                  |

You can repeat the list flags (`--include a --include b`), and each value may contain commas (`--include a,b`). A space-separated list (`--include a b`) is a parse error.

Edge cases:

- `-m whitelist` with no `--mutation-whitelist` prints a warning and exposes no mutations.
- Whitelisted names that aren't in the schema are ignored without a warning.

## Recipes

```bash
# Read-only, a handful of queries
npx -y graphql2mcp https://api.example.com/graphql --include users,user,searchUsers

# Queries plus two mutations, combined with an include filter (the mutations must appear in --include too)
npx -y graphql2mcp https://api.example.com/graphql \
  --include viewer,repository,addComment \
  -m whitelist --mutation-whitelist addComment

# Everything except some dangerous operations
npx -y graphql2mcp https://api.example.com/graphql -m all --exclude deleteUser,dropDatabase

# Introspection is disabled in production: use a saved schema and point -e at the real API
npx -y graphql2mcp ./schema.graphql -e https://api.example.com/graphql -H "Authorization: Bearer $TOKEN"

# Several SDL files (quote the glob)
npx -y graphql2mcp './schemas/*.graphql' -e https://api.example.com/graphql

# Introspect an admin URL but execute against a different one
npx -y graphql2mcp https://admin.example.com/graphql -e https://api.example.com/graphql

# Streamable HTTP on port 8080, shallow result objects
npx -y graphql2mcp ./schema.graphql -e https://api.example.com/graphql -t http -p 8080 -d 2
```

## Saving an introspection result

If introspection works somewhere (for example in staging) but not where the server will run, save the result once and reuse it:

```bash
curl -s https://staging.example.com/graphql \
  -H 'Content-Type: application/json' \
  -d "$(node -e "const {getIntrospectionQuery}=require('graphql');console.log(JSON.stringify({query:getIntrospectionQuery()}))")" \
  > introspection.json
npx -y graphql2mcp ./introspection.json -e https://api.example.com/graphql
```

(The `node -e` step needs the `graphql` package to be resolvable. Any GraphQL tooling that writes an introspection JSON or SDL file works just as well.)
