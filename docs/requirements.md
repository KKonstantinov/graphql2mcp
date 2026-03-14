# Requirements: graphql-to-mcp

## 1. Overview

`graphql-to-mcp` is a monorepo that converts GraphQL schemas and endpoints into MCP (Model Context Protocol) servers. Each GraphQL query and mutation is mapped to a discrete MCP tool with validated parameters, tool annotations, and configurable mutation exposure.

### 1.1 Packages

| Package           | npm Name               | Purpose                                                                    |
| ----------------- | ---------------------- | -------------------------------------------------------------------------- |
| `packages/core/`  | `@graphql-to-mcp/core` | Shared conversion engine: GraphQL schema → MCP tool definitions            |
| `packages/proxy/` | `graphql-to-mcp`       | Standalone proxy with CLI: point at GraphQL endpoint(s), get an MCP server |
| `packages/lib/`   | `@graphql-to-mcp/lib`  | Library for integrating into existing TypeScript MCP SDK servers           |

Both `proxy` and `lib` depend on `core` via `workspace:*`.

---

## 2. Core Conversion Engine (`@graphql-to-mcp/core`)

### REQ-CORE-1: Schema Loading from SDL

Load a GraphQL schema from an SDL string or `.graphql` file(s).

**Acceptance Criteria:**

- AC1: `loadSchema(sdlString)` returns a `GraphQLSchema` from a valid SDL string.
- AC2: `loadSchema(filePath)` reads a `.graphql` or `.gql` file and returns a `GraphQLSchema`.
- AC3: `loadSchema(globPattern)` loads and merges multiple `.graphql` files matching a glob.
- AC4: Invalid SDL produces a clear error with parse details (line/column when available).
- AC5: File-not-found produces error: `"Schema file not found: <path>"`.
- AC6: Glob with no matches produces error: `"No .graphql files found matching pattern: <glob>"`.

### REQ-CORE-2: Schema Loading from Introspection JSON

Load a GraphQL schema from an introspection result JSON file.

**Acceptance Criteria:**

- AC1: Given a JSON file containing a valid introspection result, returns a `GraphQLSchema`.
- AC2: Invalid JSON or non-introspection JSON produces a clear error.

### REQ-CORE-3: Schema Introspection via URL

Introspect a GraphQL endpoint to obtain its schema. Uses `@gql.tada/cli-utils` `generateSchema()` programmatically (in-process, no shell spawning).

**Acceptance Criteria:**

- AC1: Given a URL with introspection enabled, fetches schema and returns `GraphQLSchema`.
- AC2: Supports auth headers: Bearer token, API key, Basic auth, and custom headers.
- AC3: If introspection is disabled, produces error: `"Introspection is disabled on <url>"`.
- AC4: Network errors produce error: `"Failed to introspect <url>: <details>"`.
- AC5: Non-GraphQL endpoints (returning HTML, etc.) produce a clear error.

### REQ-CORE-4: GraphQL Type → Zod Schema Mapping

Map GraphQL input types to Zod schemas for MCP tool parameter validation.

**Acceptance Criteria:**

| GraphQL Type                        | Zod Schema                             | AC   |
| ----------------------------------- | -------------------------------------- | ---- |
| `String`                            | `z.string().optional()`                | AC1  |
| `String!`                           | `z.string()`                           | AC2  |
| `Int`                               | `z.number().int().optional()`          | AC3  |
| `Int!`                              | `z.number().int()`                     | AC4  |
| `Float`                             | `z.number().optional()`                | AC5  |
| `Boolean`                           | `z.boolean().optional()`               | AC6  |
| `ID` / `ID!`                        | `z.string().optional()` / `z.string()` | AC7  |
| `[T]` (list)                        | `z.array(zodFor(T)).optional()`        | AC8  |
| `[T!]!` (non-null list of non-null) | `z.array(zodFor(T))`                   | AC9  |
| Enum                                | `z.enum(["VAL1", "VAL2", ...])`        | AC10 |
| Input object                        | `z.object({ field: ... })` (recursive) | AC11 |
| Custom scalar (unmapped)            | `z.string()` (default fallback)        | AC12 |
| Custom scalar (user-mapped)         | User-provided Zod schema               | AC13 |

- AC14: Nested input objects (5+ levels) work without stack overflow.
- AC15: Circular references in input types are detected and handled (depth limit or error).
- AC16: Field descriptions from GraphQL schema are propagated via `.describe()`.

### REQ-CORE-5: Tool Generation from Queries

Each field on the root `Query` type becomes an MCP tool definition.

**Acceptance Criteria:**

- AC1: Tool name follows pattern `query_<fieldName>` (e.g., `query_users`).
- AC2: Tool description is the field's GraphQL description, or `"Execute the <fieldName> GraphQL query"` if none.
- AC3: Tool `inputSchema` is a **Zod raw shape** (`Record<string, ZodType>`) derived from the field's arguments (per REQ-CORE-4). Note: MCP SDK's `registerTool` accepts a raw shape, not a `z.object()` wrapper.
- AC4: Tool annotations are set to: `{ readOnlyHint: true, destructiveHint: false, openWorldHint: true }`.
- AC5: Fields with zero arguments produce tools with no inputSchema (or empty object schema).
- AC6: If schema has no `Query` type, zero query tools are generated and a warning is logged.

### REQ-CORE-6: Tool Generation from Mutations

Each field on the root `Mutation` type becomes an MCP tool definition, subject to mutation configuration.

**Acceptance Criteria:**

- AC1: Tool name follows pattern `mutation_<fieldName>` (e.g., `mutation_createUser`).
- AC2: Tool description is the field's GraphQL description, or `"Execute the <fieldName> GraphQL mutation"` if none.
- AC3: Tool annotations are set to: `{ readOnlyHint: false, destructiveHint: true, openWorldHint: true }`.
- AC4: **Mutation mode "none"** (default): Zero mutation tools are generated.
- AC5: **Mutation mode "all"**: All mutation fields generate tools.
- AC6: **Mutation mode "whitelist"**: Only explicitly listed mutation names generate tools. Unlisted mutations are skipped silently.
- AC7: If mutations are enabled but schema has no `Mutation` type, a warning is logged.

### REQ-CORE-7: Subscriptions

**Acceptance Criteria:**

- AC1: Subscriptions are not converted to tools (they don't map to MCP's request-response model).
- AC2: If a schema contains subscriptions, they are silently ignored with an info-level log.

### REQ-CORE-8: Operation Filtering

Allow include/exclude lists to control which operations become tools.

**Acceptance Criteria:**

- AC1: `include` list: Only operations whose field names match are generated.
- AC2: `exclude` list: Operations whose field names match are skipped.
- AC3: If both are specified, `exclude` takes precedence.
- AC4: If filtering results in zero tools, an error is raised: `"No tools were generated"`.

### REQ-CORE-9: Field Selection for Return Types

When generating the GraphQL query document for runtime execution, the tool must select appropriate return fields.

**Acceptance Criteria:**

- AC1: All scalar fields of the return type are selected.
- AC2: Nested object fields are selected recursively up to a configurable depth (default: 3).
- AC3: Beyond the depth limit, only scalar fields are selected (no further nesting).
- AC4: Interface/union return types use `__typename` plus inline fragments for each concrete type.
- AC5: List return types use the same selection as their element type.

### REQ-CORE-10: Tool Naming

**Acceptance Criteria:**

- AC1: Default prefixes: `query_` for queries, `mutation_` for mutations.
- AC2: Prefixes are configurable by the consumer.
- AC3: Name collisions (after prefixing) are resolved by appending `_2`, `_3`, etc.
- AC4: Tool names are sanitized to alphanumeric + underscore characters.

---

## 3. Standalone Proxy (`graphql-to-mcp`)

### REQ-PROXY-1: CLI Interface

**Acceptance Criteria:**

| Flag                   | Alias | Type                       | Default                 | Description                                                                       | AC   |
| ---------------------- | ----- | -------------------------- | ----------------------- | --------------------------------------------------------------------------------- | ---- |
| `<source>`             |       | positional                 | required                | SDL file path, glob, or URL                                                       | AC1  |
| `--transport`          | `-t`  | `stdio \| http`            | `stdio`                 | MCP transport type                                                                | AC2  |
| `--port`               | `-p`  | number                     | `3000`                  | HTTP port (transport=http)                                                        | AC3  |
| `--mutations`          | `-m`  | `all \| none \| whitelist` | `none`                  | Mutation exposure mode                                                            | AC4  |
| `--mutation-whitelist` |       | string[]                   | `[]`                    | Mutation names to whitelist                                                       | AC5  |
| `--header`             | `-H`  | string[]                   | `[]`                    | HTTP headers for introspection + execution (e.g., `-H "Authorization: Bearer x"`) | AC6  |
| `--endpoint`           | `-e`  | string                     | (same as source if URL) | GraphQL execution endpoint                                                        | AC7  |
| `--name`               | `-n`  | string                     | `"graphql-mcp-server"`  | MCP server name                                                                   | AC8  |
| `--depth`              | `-d`  | number                     | `3`                     | Field selection depth                                                             | AC9  |
| `--include`            |       | string[]                   | `[]`                    | Only include these operations                                                     | AC10 |
| `--exclude`            |       | string[]                   | `[]`                    | Exclude these operations                                                          | AC11 |
| `--version`            | `-V`  |                            |                         | Show version                                                                      | AC12 |
| `--help`               | `-h`  |                            |                         | Show help                                                                         | AC13 |

- AC14: `graphql-to-mcp` with no arguments shows help and exits with code 1.
- AC15: Invalid source (non-existent file, unreachable URL) prints error to stderr and exits with code 1.

### REQ-PROXY-2: Multi-Endpoint Support

A single proxy can target multiple GraphQL endpoints.

**Acceptance Criteria:**

- AC1: Multiple `<source>` positional arguments or a config file can specify multiple endpoints.
- AC2: Tools from each endpoint are prefixed with an endpoint identifier to avoid name collisions.
- AC3: Each endpoint can have its own auth headers and mutation configuration.

### REQ-PROXY-3: Server Lifecycle

**Acceptance Criteria:**

- AC1: **stdio transport**: Starts immediately, reads/writes MCP JSON-RPC on stdin/stdout. Never writes to stdout except MCP messages (logs go to stderr).
- AC2: **HTTP transport**: Starts HTTP server on configured port, logs startup info to stderr.
- AC3: Graceful shutdown on SIGINT/SIGTERM.

### REQ-PROXY-4: Tool Execution (Runtime)

When an MCP tool is invoked via the proxy:

**Acceptance Criteria:**

- AC1: Validated input parameters are used to construct GraphQL variables.
- AC2: A GraphQL query/mutation document is constructed with the appropriate field selection (per REQ-CORE-9).
- AC3: The query is sent to the configured GraphQL endpoint via HTTP POST.
- AC4: Auth headers (from CLI `--header` flags) are included in the request.
- AC5: Success: Response returned as `{ content: [{ type: "text", text: JSON.stringify(data) }] }`.
- AC6: GraphQL errors: Returned in text content with `isError: true` and error details.
- AC7: Network error: Returned as text content with `isError: true` (not thrown as MCP protocol error).
- AC8: Timeout: Configurable (default 30s). Returns timeout error as text content.

### REQ-PROXY-5: Programmatic API

The proxy package also exports a programmatic API for non-CLI usage.

**Acceptance Criteria:**

- AC1: `createProxyServer(options)` returns a configured `McpServer` ready to connect to a transport.
- AC2: Options include: source(s), endpoint(s), headers, mutations config, name, version, depth, include/exclude.

---

## 4. Library (`@graphql-to-mcp/lib`)

### REQ-LIB-1: Register GraphQL Tools on Existing McpServer

**Acceptance Criteria:**

- AC1: `registerGraphQLTools(server, options)` registers tools on the user's existing `McpServer` instance.
- AC2: `server` parameter accepts an `McpServer` from `@modelcontextprotocol/sdk`.
- AC3: Options include: schema source (SDL string, file, URL, or `GraphQLSchema` object), endpoint, headers, mutations config, depth, include/exclude, custom scalars.
- AC4: Returns metadata about registered tools (names, count).
- AC5: Does not create or manage transports — the user controls their own server lifecycle.

### REQ-LIB-2: Peer Dependency

**Acceptance Criteria:**

- AC1: `@modelcontextprotocol/sdk` is a peer dependency (^1.0.0), not a direct dependency.
- AC2: The user provides their own `McpServer` and `zod` instances.

---

## 5. MCP Tool Annotations

### REQ-ANN-1: Query Annotations

**Acceptance Criteria:**

- AC1: All query tools have annotations: `{ readOnlyHint: true, destructiveHint: false, openWorldHint: true }`.

### REQ-ANN-2: Mutation Annotations

**Acceptance Criteria:**

- AC1: All mutation tools have annotations: `{ readOnlyHint: false, destructiveHint: true, openWorldHint: true }`.

### REQ-ANN-3: Tool Titles

**Acceptance Criteria:**

- AC1: Each tool has a `title` that is a human-readable version of the operation name (e.g., `"Query: users"`, `"Mutation: createUser"`).

---

## 6. Authentication / Headers

### REQ-AUTH-1: Header Support

**Acceptance Criteria:**

- AC1: Arbitrary HTTP headers can be provided for both schema introspection and runtime query execution.
- AC2: Supported auth patterns: Bearer token, API key, Basic auth, and any custom header.
- AC3: Headers are never logged or exposed in tool descriptions/error messages.

---

## 7. Error Handling

### REQ-ERR-1: Schema Loading Errors

| Error Condition            | Message Pattern                                      | AC  |
| -------------------------- | ---------------------------------------------------- | --- |
| File not found             | `"Schema file not found: <path>"`                    | AC1 |
| Invalid SDL                | `"Invalid GraphQL SDL: <details>"`                   | AC2 |
| Introspection failed       | `"Failed to introspect <url>: <details>"`            | AC3 |
| Introspection disabled     | `"Introspection is disabled on <url>"`               | AC4 |
| No files matched glob      | `"No .graphql files found matching pattern: <glob>"` | AC5 |
| Invalid introspection JSON | `"Invalid introspection result: <details>"`          | AC6 |

### REQ-ERR-2: Tool Generation Errors

| Error Condition                      | Behavior                            | AC  |
| ------------------------------------ | ----------------------------------- | --- |
| No Query type                        | Warning logged, zero query tools    | AC1 |
| No Mutation type (mutations enabled) | Warning logged, zero mutation tools | AC2 |
| No tools generated (after filtering) | Error: `"No tools were generated"`  | AC3 |
| Circular input type                  | Warning logged, depth-limited       | AC4 |

### REQ-ERR-3: Runtime Errors (Tool Execution)

| Error Condition   | Behavior                                                       | AC  |
| ----------------- | -------------------------------------------------------------- | --- |
| Network error     | `{ isError: true, content: [{ type: "text", text: "..." }] }`  | AC1 |
| GraphQL errors    | Return `{ data, errors }` as text content with `isError: true` | AC2 |
| Timeout           | Return timeout error as text content with `isError: true`      | AC3 |
| Non-JSON response | Return error about unexpected response format                  | AC4 |
| HTTP 401/403      | Return auth error as text content with `isError: true`         | AC5 |

---

## 8. Edge Cases

### REQ-EDGE-1: Schema Edge Cases

- AC1: Schema with only `Mutation` (no `Query`) — works if mutations enabled.
- AC2: Schema with only subscriptions — produces zero tools with warning.
- AC3: Schema with custom directives — directives are ignored.
- AC4: Schema with interfaces/unions in return types — uses `__typename` + inline fragments.
- AC5: Deeply nested input types (5+ levels) — no stack overflow.
- AC6: Enum arguments — mapped to `z.enum()`.
- AC7: Default argument values — noted in tool parameter description.
- AC8: Empty schema (no operations) — error: `"Schema contains no operations"`.

### REQ-EDGE-2: Naming Edge Cases

- AC1: Name collisions after prefixing — append numeric suffix.
- AC2: Special characters in names — sanitize to alphanumeric + underscore.

---

## 9. Non-Functional Requirements

### REQ-NFR-1: Compatibility

- AC1: Node.js >= 24 (as specified in package.json `engines`).
- AC2: TypeScript >= 5.0.
- AC3: ESM only (`"type": "module"`).
- AC4: MCP SDK v1.x (`@modelcontextprotocol/sdk` ^1.0.0).

### REQ-NFR-2: Quality

- AC1: Full TypeScript types — no `any` in public API.
- AC2: JSDoc comments on all public exports.
- AC3: All imports use `.js` extension (ESM convention).

### REQ-NFR-3: Performance

- AC1: Schema parsing and tool generation < 1s for schemas up to 1000 types.
- AC2: Introspection timeout: configurable, default 30 seconds.

### REQ-NFR-4: Security

- AC1: Auth headers never logged or exposed.
- AC2: Mutations disabled by default.
- AC3: Operation whitelisting supported.
- AC4: No `eval()` or dynamic code execution.

---

## 10. Dependency Summary

### `packages/core/`

| Dependency | Purpose                               |
| ---------- | ------------------------------------- |
| `graphql`  | Schema parsing, type system traversal |
| `zod`      | Dynamic Zod schema construction       |

### `packages/proxy/`

| Dependency                       | Purpose                      |
| -------------------------------- | ---------------------------- |
| `@graphql-to-mcp/core`           | Shared conversion engine     |
| `@modelcontextprotocol/sdk` ^1.x | MCP server + transports      |
| `@gql.tada/cli-utils`            | Schema introspection via URL |
| `commander`                      | CLI framework                |

### `packages/lib/`

| Dependency                                 | Purpose                  |
| ------------------------------------------ | ------------------------ |
| `@graphql-to-mcp/core`                     | Shared conversion engine |
| **Peer**: `@modelcontextprotocol/sdk` ^1.x | User provides McpServer  |
