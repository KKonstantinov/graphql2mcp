# Test Scenarios: graphql2mcp

## Overview

Test scenarios organized by package and module. Each references requirement IDs from `requirements.md`. Tests use `vitest`. Unit tests in `test/unit/`, integration tests in `test/integration/`.

---

## 1. Core: Schema Loading (REQ-CORE-1, REQ-CORE-2, REQ-CORE-3)

### 1.1 Load from SDL String

| #     | Scenario                | Input                                     | Expected                                     | Req        |
| ----- | ----------------------- | ----------------------------------------- | -------------------------------------------- | ---------- |
| 1.1.1 | Valid SDL               | `"type Query { hello: String }"`          | Returns `GraphQLSchema` with `hello` field   | CORE-1 AC1 |
| 1.1.2 | Invalid SDL             | `"type Query { hello: }"`                 | Throws with "Syntax Error" and location info | CORE-1 AC4 |
| 1.1.3 | Empty string            | `""`                                      | Throws about empty/invalid schema            | CORE-1 AC4 |
| 1.1.4 | SDL with multiple types | Full SDL with Query, types, inputs, enums | Returns schema with all types resolved       | CORE-1 AC1 |

### 1.2 Load from File

| #     | Scenario                | Input                        | Expected                                 | Req        |
| ----- | ----------------------- | ---------------------------- | ---------------------------------------- | ---------- |
| 1.2.1 | Valid .graphql file     | Path to valid SDL file       | Returns `GraphQLSchema`                  | CORE-1 AC2 |
| 1.2.2 | File not found          | Path to non-existent file    | Throws `"Schema file not found: <path>"` | CORE-1 AC5 |
| 1.2.3 | Empty file              | Path to empty .graphql file  | Throws error                             | CORE-1 AC4 |
| 1.2.4 | Multiple files via glob | `"fixtures/**/*.graphql"`    | Returns merged schema                    | CORE-1 AC3 |
| 1.2.5 | Glob with no matches    | `"nonexistent/**/*.graphql"` | Throws `"No .graphql files found"`       | CORE-1 AC6 |

### 1.3 Load from Introspection JSON

| #     | Scenario               | Input                            | Expected                                | Req        |
| ----- | ---------------------- | -------------------------------- | --------------------------------------- | ---------- |
| 1.3.1 | Valid JSON file        | Path to valid introspection JSON | Returns `GraphQLSchema`                 | CORE-2 AC1 |
| 1.3.2 | Invalid JSON           | Path to malformed JSON           | Throws error                            | CORE-2 AC2 |
| 1.3.3 | Non-introspection JSON | Path to unrelated JSON           | Throws `"Invalid introspection result"` | CORE-2 AC2 |

### 1.4 Introspect from URL

| #     | Scenario                 | Input                                 | Expected                            | Req        |
| ----- | ------------------------ | ------------------------------------- | ----------------------------------- | ---------- |
| 1.4.1 | Valid endpoint           | URL with introspection enabled        | Returns `GraphQLSchema`             | CORE-3 AC1 |
| 1.4.2 | With auth headers        | URL + `{ Authorization: "Bearer x" }` | Sends header, returns schema        | CORE-3 AC2 |
| 1.4.3 | Introspection disabled   | URL returning error                   | Throws about introspection disabled | CORE-3 AC3 |
| 1.4.4 | Network error            | Unreachable URL                       | Throws `"Failed to introspect"`     | CORE-3 AC4 |
| 1.4.5 | Non-GraphQL endpoint     | URL returning HTML                    | Throws about non-GraphQL response   | CORE-3 AC5 |
| 1.4.6 | Uses gql-tada in-process | Any URL                               | Does not spawn a shell process      | CORE-3 AC1 |

---

## 2. Core: Type Mapping (REQ-CORE-4)

### 2.1 Scalar Types

| #     | Scenario        | GraphQL Type | Expected Zod                           | Req        |
| ----- | --------------- | ------------ | -------------------------------------- | ---------- |
| 2.1.1 | Nullable String | `String`     | `z.string().optional()`                | CORE-4 AC1 |
| 2.1.2 | Non-null String | `String!`    | `z.string()`                           | CORE-4 AC2 |
| 2.1.3 | Nullable Int    | `Int`        | `z.number().int().optional()`          | CORE-4 AC3 |
| 2.1.4 | Non-null Int    | `Int!`       | `z.number().int()`                     | CORE-4 AC4 |
| 2.1.5 | Float           | `Float`      | `z.number().optional()`                | CORE-4 AC5 |
| 2.1.6 | Boolean         | `Boolean`    | `z.boolean().optional()`               | CORE-4 AC6 |
| 2.1.7 | ID / ID!        | `ID` / `ID!` | `z.string().optional()` / `z.string()` | CORE-4 AC7 |

### 2.2 List Types

| #     | Scenario                  | GraphQL Type | Expected Zod                                | Req        |
| ----- | ------------------------- | ------------ | ------------------------------------------- | ---------- |
| 2.2.1 | Nullable list of nullable | `[String]`   | `z.array(z.string().optional()).optional()` | CORE-4 AC8 |
| 2.2.2 | Non-null list of non-null | `[String!]!` | `z.array(z.string())`                       | CORE-4 AC9 |
| 2.2.3 | Non-null list of nullable | `[String]!`  | `z.array(z.string().optional())`            | CORE-4 AC8 |
| 2.2.4 | Nullable list of non-null | `[String!]`  | `z.array(z.string()).optional()`            | CORE-4 AC8 |
| 2.2.5 | Nested list               | `[[Int!]!]!` | `z.array(z.array(z.number().int()))`        | CORE-4 AC8 |

### 2.3 Enum Types

| #     | Scenario          | GraphQL Type                      | Expected Zod                       | Req         |
| ----- | ----------------- | --------------------------------- | ---------------------------------- | ----------- |
| 2.3.1 | Simple enum       | `enum Status { ACTIVE INACTIVE }` | `z.enum(["ACTIVE", "INACTIVE"])`   | CORE-4 AC10 |
| 2.3.2 | Non-null enum arg | `status: Status!`                 | `z.enum([...])` (no `.optional()`) | CORE-4 AC10 |
| 2.3.3 | Nullable enum arg | `status: Status`                  | `z.enum([...]).optional()`         | CORE-4 AC10 |

### 2.4 Input Object Types

| #     | Scenario                 | GraphQL Type                                             | Expected Zod                                                   | Req         |
| ----- | ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| 2.4.1 | Simple input             | `input CreateUserInput { name: String!, email: String }` | `z.object({ name: z.string(), email: z.string().optional() })` | CORE-4 AC11 |
| 2.4.2 | Nested input             | Input containing another input type                      | Nested `z.object()`                                            | CORE-4 AC11 |
| 2.4.3 | Input with list field    | `input Filters { ids: [ID!]! }`                          | `z.object({ ids: z.array(z.string()) })`                       | CORE-4 AC11 |
| 2.4.4 | Input with enum field    | `input Filters { status: Status }`                       | `z.object({ status: z.enum([...]).optional() })`               | CORE-4 AC11 |
| 2.4.5 | Deeply nested (5 levels) | 5 levels of nested input types                           | Correct nested Zod, no stack overflow                          | CORE-4 AC14 |

### 2.5 Custom Scalars

| #     | Scenario              | Config                                | Expected Zod           | Req         |
| ----- | --------------------- | ------------------------------------- | ---------------------- | ----------- |
| 2.5.1 | Unknown custom scalar | No mapping for `DateTime`             | `z.string()` (default) | CORE-4 AC12 |
| 2.5.2 | Mapped custom scalar  | `{ DateTime: z.string().datetime() }` | Uses provided schema   | CORE-4 AC13 |

### 2.6 Edge Cases

| #     | Scenario                 | Input                               | Expected                            | Req         |
| ----- | ------------------------ | ----------------------------------- | ----------------------------------- | ----------- |
| 2.6.1 | Circular input reference | `input A { b: B } input B { a: A }` | Detected, depth-limited or error    | CORE-4 AC15 |
| 2.6.2 | Self-referencing input   | `input Node { children: [Node] }`   | Handled with depth limit            | CORE-4 AC15 |
| 2.6.3 | Description propagation  | Field with description in schema    | `.describe()` present on Zod schema | CORE-4 AC16 |

---

## 3. Core: Tool Generation (REQ-CORE-5, REQ-CORE-6, REQ-CORE-7, REQ-CORE-8)

### 3.1 Query Tools

| #     | Scenario                  | Schema                                          | Expected                                         | Req            |
| ----- | ------------------------- | ----------------------------------------------- | ------------------------------------------------ | -------------- |
| 3.1.1 | Single query, no args     | `type Query { hello: String }`                  | Tool: `query_hello`, no params                   | CORE-5 AC1,AC5 |
| 3.1.2 | Query with scalar args    | `type Query { user(id: ID!): User }`            | Tool: `query_user`, params: `{ id: z.string() }` | CORE-5 AC1,AC3 |
| 3.1.3 | Query with input arg      | `type Query { users(filter: Filter!): [User] }` | Tool with nested input schema                    | CORE-5 AC3     |
| 3.1.4 | Multiple queries          | 5 query fields                                  | 5 tools generated                                | CORE-5 AC1     |
| 3.1.5 | Query with description    | `"Fetch user" user(id: ID!): User`              | Description: `"Fetch user"`                      | CORE-5 AC2     |
| 3.1.6 | Query without description | No description                                  | Description: `"Execute the user GraphQL query"`  | CORE-5 AC2     |
| 3.1.7 | No Query type             | Only Mutation type                              | Zero query tools, warning logged                 | CORE-5 AC6     |

### 3.2 Query Tool Annotations

| #     | Scenario       | Expected Annotations                                                  | Req               |
| ----- | -------------- | --------------------------------------------------------------------- | ----------------- |
| 3.2.1 | Any query tool | `{ readOnlyHint: true, destructiveHint: false, openWorldHint: true }` | CORE-5 AC4, ANN-1 |
| 3.2.2 | Tool title     | `"Query: <fieldName>"`                                                | ANN-3 AC1         |

### 3.3 Mutation Tools

| #     | Scenario                     | Config                                       | Expected                                                              | Req               |
| ----- | ---------------------------- | -------------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| 3.3.1 | Mutations disabled (default) | `mutations: "none"`                          | Zero mutation tools                                                   | CORE-6 AC4        |
| 3.3.2 | Mutations "all"              | `mutations: "all"`                           | All mutation fields become tools                                      | CORE-6 AC5        |
| 3.3.3 | Mutations whitelist          | `mutations: { whitelist: ["createUser"] }`   | Only `mutation_createUser`                                            | CORE-6 AC6        |
| 3.3.4 | Whitelist non-existent       | `mutations: { whitelist: ["nonexistent"] }`  | Zero mutation tools                                                   | CORE-6 AC6        |
| 3.3.5 | Mutation with input arg      | `createUser(input: CreateUserInput!): User`  | Tool params match input type                                          | CORE-6 AC1        |
| 3.3.6 | Mutation annotations         | Any mutation tool                            | `{ readOnlyHint: false, destructiveHint: true, openWorldHint: true }` | CORE-6 AC3, ANN-2 |
| 3.3.7 | Mutation title               | Any mutation tool                            | `"Mutation: <fieldName>"`                                             | ANN-3 AC1         |
| 3.3.8 | No Mutation type (enabled)   | Schema without Mutation + `mutations: "all"` | Warning logged                                                        | CORE-6 AC7        |

### 3.4 Subscriptions

| #     | Scenario                  | Schema                                   | Expected                             | Req            |
| ----- | ------------------------- | ---------------------------------------- | ------------------------------------ | -------------- |
| 3.4.1 | Schema with subscriptions | `type Subscription { onUpdate: Update }` | Zero subscription tools, info logged | CORE-7 AC1,AC2 |

### 3.5 Filtering

| #     | Scenario            | Config                                   | Expected                           | Req        |
| ----- | ------------------- | ---------------------------------------- | ---------------------------------- | ---------- |
| 3.5.1 | Include filter      | `{ include: ["user"] }`                  | Only `query_user`                  | CORE-8 AC1 |
| 3.5.2 | Exclude filter      | `{ exclude: ["internal"] }`              | All except `query_internal`        | CORE-8 AC2 |
| 3.5.3 | Include + exclude   | `{ include: ["a","b"], exclude: ["b"] }` | Only `query_a`                     | CORE-8 AC3 |
| 3.5.4 | Everything excluded | All ops excluded                         | Error: `"No tools were generated"` | CORE-8 AC4 |

### 3.6 Naming

| #     | Scenario           | Input                          | Expected Tool Name                     | Req         |
| ----- | ------------------ | ------------------------------ | -------------------------------------- | ----------- |
| 3.6.1 | Simple name        | `users` query                  | `query_users`                          | CORE-10 AC1 |
| 3.6.2 | Custom prefix      | `{ queryPrefix: "q_" }`        | `q_users`                              | CORE-10 AC2 |
| 3.6.3 | Name collision     | Two fields producing same name | Second gets `_2` suffix                | CORE-10 AC3 |
| 3.6.4 | Special characters | Field with special chars       | Sanitized to alphanumeric + underscore | CORE-10 AC4 |

---

## 4. Core: Field Selection (REQ-CORE-9)

| #   | Scenario            | Return Type                      | Depth | Expected                                         | Req        |
| --- | ------------------- | -------------------------------- | ----- | ------------------------------------------------ | ---------- |
| 4.1 | Scalar return       | `String`                         | any   | No selection set                                 | CORE-9 AC1 |
| 4.2 | Object with scalars | `User { id name email }`         | 1     | `{ id name email }`                              | CORE-9 AC1 |
| 4.3 | Nested object       | `User { id posts { id title } }` | 2     | `{ id posts { id title } }`                      | CORE-9 AC2 |
| 4.4 | Depth limit hit     | 3-level nesting                  | 1     | Only scalar fields at depth 1                    | CORE-9 AC3 |
| 4.5 | Default depth 3     | Deep nesting                     | 3     | Selects up to 3 levels                           | CORE-9 AC2 |
| 4.6 | Interface return    | `Node` (User, Post)              | 2     | `{ __typename ... on User { } ... on Post { } }` | CORE-9 AC4 |
| 4.7 | Union return        | `SearchResult = User \| Post`    | 2     | Same as interface pattern                        | CORE-9 AC4 |
| 4.8 | List return         | `[User!]!`                       | 2     | Same selection as single User                    | CORE-9 AC5 |

---

## 5. Proxy: CLI (REQ-PROXY-1)

| #    | Scenario            | Command                                                     | Expected                        | Req               |
| ---- | ------------------- | ----------------------------------------------------------- | ------------------------------- | ----------------- |
| 5.1  | File source         | `graphql2mcp schema.graphql -e http://...`                  | Loads file, starts stdio server | PROXY-1 AC1       |
| 5.2  | URL source          | `graphql2mcp https://api.example.com/graphql`               | Introspects URL, starts server  | PROXY-1 AC1       |
| 5.3  | HTTP transport      | `graphql2mcp schema.graphql -t http -p 8080 -e http://...`  | HTTP server on 8080             | PROXY-1 AC2,AC3   |
| 5.4  | Headers             | `... -H "Auth: Bearer x" -H "X-Key: y"`                     | Both headers passed             | PROXY-1 AC6       |
| 5.5  | Mutations all       | `... --mutations all`                                       | Includes all mutation tools     | PROXY-1 AC4       |
| 5.6  | Mutations whitelist | `... --mutations whitelist --mutation-whitelist createUser` | Only whitelisted                | PROXY-1 AC4,AC5   |
| 5.7  | Include/exclude     | `... --include users --exclude admin`                       | Filters tools                   | PROXY-1 AC10,AC11 |
| 5.8  | No arguments        | `graphql2mcp`                                               | Shows help, exits code 1        | PROXY-1 AC14      |
| 5.9  | --help              | `graphql2mcp --help`                                        | Shows help, exits code 0        | PROXY-1 AC13      |
| 5.10 | --version           | `graphql2mcp --version`                                     | Shows version                   | PROXY-1 AC12      |
| 5.11 | Invalid file        | `graphql2mcp nonexistent.graphql`                           | Error to stderr, exits code 1   | PROXY-1 AC15      |

---

## 6. Proxy: Tool Execution (REQ-PROXY-4)

### 6.1 Successful Execution

| #     | Scenario           | Input                                    | Expected                                               | Req                 |
| ----- | ------------------ | ---------------------------------------- | ------------------------------------------------------ | ------------------- |
| 6.1.1 | Simple query       | Invoke `query_hello`                     | Returns `{ content: [{ type: "text", text: '...' }] }` | PROXY-4 AC5         |
| 6.1.2 | Query with args    | Invoke `query_user` with `{ id: "123" }` | Sends query with variables, returns data               | PROXY-4 AC1,AC2,AC5 |
| 6.1.3 | Mutation execution | Invoke `mutation_createUser`             | Sends mutation, returns result                         | PROXY-4 AC1,AC5     |
| 6.1.4 | Auth headers sent  | Any tool invocation                      | Request includes configured auth headers               | PROXY-4 AC4         |

### 6.2 Error Handling

| #     | Scenario          | Condition                          | Expected                                   | Req         |
| ----- | ----------------- | ---------------------------------- | ------------------------------------------ | ----------- |
| 6.2.1 | GraphQL errors    | Server returns `{ errors: [...] }` | `{ isError: true }` with error details     | PROXY-4 AC6 |
| 6.2.2 | Network error     | Endpoint unreachable               | `{ isError: true }` with network error     | PROXY-4 AC7 |
| 6.2.3 | Timeout           | Request > 30s                      | `{ isError: true }` with timeout message   | PROXY-4 AC8 |
| 6.2.4 | Non-JSON response | HTML response                      | `{ isError: true }` about invalid response | ERR-3 AC4   |
| 6.2.5 | Auth failure      | 401/403 response                   | `{ isError: true }` with HTTP status       | ERR-3 AC5   |

---

## 7. Proxy: Server Lifecycle (REQ-PROXY-3)

| #   | Scenario                  | Expected                                      | Req         |
| --- | ------------------------- | --------------------------------------------- | ----------- |
| 7.1 | stdio transport startup   | Reads/writes MCP JSON-RPC on stdin/stdout     | PROXY-3 AC1 |
| 7.2 | No stdout logging (stdio) | Only stderr for logs, stdout for MCP messages | PROXY-3 AC1 |
| 7.3 | HTTP transport startup    | HTTP server starts on configured port         | PROXY-3 AC2 |
| 7.4 | Graceful shutdown         | SIGINT/SIGTERM triggers clean shutdown        | PROXY-3 AC3 |

---

## 8. Proxy: Multi-Endpoint (REQ-PROXY-2)

| #   | Scenario               | Config                         | Expected                                      | Req             |
| --- | ---------------------- | ------------------------------ | --------------------------------------------- | --------------- |
| 8.1 | Two endpoints          | Two GraphQL URLs               | Tools from both, prefixed to avoid collisions | PROXY-2 AC1,AC2 |
| 8.2 | Per-endpoint auth      | Different headers per endpoint | Each endpoint uses its own headers            | PROXY-2 AC3     |
| 8.3 | Per-endpoint mutations | One all, one none              | Correct mutation config per endpoint          | PROXY-2 AC3     |

---

## 9. Library: registerGraphQLTools (REQ-LIB-1, REQ-LIB-2)

| #   | Scenario                    | Input                                                                         | Expected                                       | Req       |
| --- | --------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| 9.1 | Register from SDL           | `registerGraphQLTools(server, { sdl: "...", endpoint: "..." })`               | Tools registered on server                     | LIB-1 AC1 |
| 9.2 | Register from file          | `registerGraphQLTools(server, { source: "schema.graphql", endpoint: "..." })` | Tools registered                               | LIB-1 AC3 |
| 9.3 | Register from URL           | `registerGraphQLTools(server, { source: "https://...", })`                    | Introspects + registers                        | LIB-1 AC3 |
| 9.4 | Register from schema object | `registerGraphQLTools(server, { schema: graphqlSchema, endpoint: "..." })`    | Tools registered                               | LIB-1 AC3 |
| 9.5 | Returns metadata            | Any valid config                                                              | Returns `{ tools: [{ name, ... }], count: N }` | LIB-1 AC4 |
| 9.6 | No transport management     | Any config                                                                    | Does not create/manage transports              | LIB-1 AC5 |
| 9.7 | Mutations whitelist         | `{ mutations: { whitelist: ["create"] } }`                                    | Only whitelisted mutations registered          | LIB-1 AC3 |
| 9.8 | Peer dep check              | No @modelcontextprotocol/sdk installed                                        | Clear error about missing peer dep             | LIB-2 AC1 |

---

## 10. Integration Tests: End-to-End

### 10.1 Full Pipeline

| #      | Scenario                      | Steps                                                                                                   | Expected                                      | Packages     |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------ |
| 10.1.1 | SDL → proxy → tool invocation | 1. Write SDL to temp file. 2. Start mock GraphQL server. 3. Call `createProxyServer()`. 4. Invoke tool. | Tool executes query, returns data.            | core + proxy |
| 10.1.2 | URL → proxy → tool invocation | 1. Start mock GraphQL server with introspection. 2. Create proxy from URL. 3. Invoke tool.              | Introspects, generates tools, executes query. | core + proxy |
| 10.1.3 | SDL → lib → tool invocation   | 1. Create McpServer. 2. Call `registerGraphQLTools()`. 3. Invoke tool.                                  | Tools work on user's server.                  | core + lib   |
| 10.1.4 | Mutations whitelist E2E       | Schema with mutations. Whitelist one. Invoke whitelisted + non-whitelisted.                             | Only whitelisted works.                       | core + proxy |
| 10.1.5 | Multi-endpoint E2E            | Two mock GraphQL servers. Single proxy. Invoke tools from both.                                         | Both work independently.                      | core + proxy |

### 10.2 Real-World Schemas

| #      | Scenario       | Schema                                         | Expected                                 |
| ------ | -------------- | ---------------------------------------------- | ---------------------------------------- |
| 10.2.1 | Complex schema | Nested types, enums, input objects, interfaces | All tools generated with correct schemas |
| 10.2.2 | Minimal schema | `type Query { ping: String }`                  | Single `query_ping` tool, no params      |

### 10.3 CLI Integration

| #      | Scenario               | Steps                                  | Expected                                 |
| ------ | ---------------------- | -------------------------------------- | ---------------------------------------- |
| 10.3.1 | CLI starts stdio       | Run CLI as child process with SDL file | Process starts, responds to MCP messages |
| 10.3.2 | CLI starts HTTP        | Run CLI with `-t http`                 | HTTP server starts on port               |
| 10.3.3 | CLI error on bad input | Run CLI with non-existent file         | Exits code 1, error on stderr            |

---

## 11. Test Fixtures

Create in each package's `test/fixtures/` directory:

### `simple.graphql`

```graphql
type Query {
    hello: String
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
}

type User {
    id: ID!
    name: String!
    email: String
}
```

### `complex.graphql`

```graphql
type Query {
    "Search for users by filter"
    searchUsers(filter: UserFilter!, pagination: PaginationInput): UserConnection!
    "Get a specific user by ID"
    user(id: ID!): User
    "List all available roles"
    roles: [Role!]!
}

type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
}

type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts: [Post!]!
    createdAt: DateTime
}

type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
    tags: [String!]!
}

type UserConnection {
    nodes: [User!]!
    totalCount: Int!
    pageInfo: PageInfo!
}

type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
}

input UserFilter {
    nameContains: String
    role: Role
    createdAfter: DateTime
}

input PaginationInput {
    first: Int
    after: String
}

input CreateUserInput {
    name: String!
    email: String!
    role: Role!
}

input UpdateUserInput {
    name: String
    email: String
    role: Role
}

enum Role {
    ADMIN
    USER
    MODERATOR
}

scalar DateTime
```

### `interfaces.graphql`

```graphql
type Query {
    node(id: ID!): Node
    search(query: String!): [SearchResult!]!
}

interface Node {
    id: ID!
}

type User implements Node {
    id: ID!
    name: String!
}

type Post implements Node {
    id: ID!
    title: String!
}

union SearchResult = User | Post
```

### `no-query.graphql`

```graphql
type Mutation {
    doSomething(input: String!): Boolean!
}
```

### `empty-schema.graphql`

```graphql
type Query
```

### `circular-input.graphql`

```graphql
type Query {
    findNodes(filter: NodeFilter!): [Node!]!
}

type Node {
    id: ID!
    name: String!
}

input NodeFilter {
    name: String
    children: NodeFilter
}
```

---

## 12. Mock GraphQL Server

For integration tests, create a lightweight mock server:

```typescript
// test/helpers/mock-server.ts
import { createServer, type Server } from 'node:http';
import { buildSchema, graphql } from 'graphql';

export function createMockGraphQLServer(sdl: string, rootValue: Record<string, unknown>): { server: Server; url: string; close: () => Promise<void> } {
    const schema = buildSchema(sdl);
    const server = createServer(async (req, res) => {
        // Parse JSON body, execute graphql(), return JSON response
        // Handle introspection queries too
    });
    // Listen on random port, return url
}
```

---

## 13. Test Organization

```
packages/core/
└── test/
    ├── unit/
    │   ├── schema/
    │   │   └── loader.test.ts              — Section 1 scenarios
    │   ├── converter/
    │   │   ├── type-mapper.test.ts          — Section 2 scenarios
    │   │   ├── tool-generator.test.ts       — Section 3 scenarios
    │   │   ├── selection-builder.test.ts    — Section 4 scenarios
    │   │   └── naming.test.ts              — Section 3.6 scenarios
    │   └── fixtures/
    │       └── *.graphql
    └── integration/
        └── e2e.test.ts                     — Section 10.2 scenarios

packages/proxy/
└── test/
    ├── unit/
    │   ├── cli.test.ts                     — Section 5 scenarios
    │   ├── server.test.ts                  — Section 7 scenarios
    │   └── execution.test.ts              — Section 6 scenarios
    └── integration/
        ├── e2e.test.ts                     — Section 10.1, 10.3 scenarios
        ├── multi-endpoint.test.ts          — Section 8 scenarios
        └── helpers/
            └── mock-server.ts

packages/lib/
└── test/
    ├── unit/
    │   └── registration.test.ts            — Section 9 scenarios
    └── integration/
        └── e2e.test.ts                     — Section 10.1.3 scenarios
```
