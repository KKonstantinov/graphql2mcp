# Mutation Configuration

By default, only GraphQL queries are exposed as MCP tools. Mutations are opt-in because they modify data and AI agents should not accidentally trigger destructive operations.

## Mutation Modes

There are three mutation exposure modes:

### `none` (default)

Only queries are converted to tools. Mutations are ignored entirely.

CLI:

```bash
graphql2mcp https://api.example.com/graphql
# or explicitly:
graphql2mcp https://api.example.com/graphql -m none
```

Library:

```typescript
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'none'
});
```

Core:

```typescript
const { tools } = generateTools({
    schema,
    mutations: 'none'
});
```

### `all`

All queries and all mutations are converted to tools.

CLI:

```bash
graphql2mcp https://api.example.com/graphql -m all
```

Library:

```typescript
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'all'
});
```

Core:

```typescript
const { tools } = generateTools({
    schema,
    mutations: 'all'
});
```

### `whitelist`

Only the named mutations are converted to tools. All queries are still included.

CLI:

```bash
graphql2mcp https://api.example.com/graphql \
  -m whitelist \
  --mutation-whitelist createUser updateUser
```

Library:

```typescript
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```

Core:

```typescript
const { tools } = generateTools({
    schema,
    mutations: { whitelist: ['createUser', 'updateUser'] }
});
```

Whitelisted names that do not match any mutation in the schema are silently ignored. This makes it safe to specify mutations that may not exist in all schema versions.

## Tool Annotations

MCP tool annotations communicate the nature of each tool to AI agents and clients. `graphql2mcp` sets these automatically based on the operation type.

### Query annotations

```typescript
{
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true
}
```

Queries are marked as read-only and non-destructive. This signals to AI agents that calling a query tool is safe and does not modify any data.

### Mutation annotations

```typescript
{
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: true
}
```

Mutations are marked as non-read-only and potentially destructive. MCP clients may use this to require user confirmation before executing mutation tools.

## Combining with Include/Exclude Filters

Mutation mode works alongside the `include` and `exclude` filters. Exclude takes precedence over include.

```typescript
// Only expose these specific queries and mutations
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: 'all',
    include: ['users', 'user', 'createUser'],
    exclude: ['deleteUser']
});
```

```bash
# Expose all mutations except deleteUser and dropDatabase
graphql2mcp https://api.example.com/graphql \
  -m all \
  --exclude deleteUser dropDatabase
```

## Recommended Approach

For production deployments, use whitelist mode. This provides explicit control over which mutations are available to AI agents:

```typescript
registerGraphQLTools(server, {
    source: './schema.graphql',
    endpoint: 'https://api.example.com/graphql',
    mutations: {
        whitelist: [
            'createUser',
            'updateUser',
            'createPost'
            // deleteUser intentionally omitted
        ]
    }
});
```

This is safer than `all` because new mutations added to the schema do not automatically become available to AI agents.
