# Package Research: graphql2mcp

## 1. Existing Solutions (Competitive Landscape)

### 1.1 mcp-graphql (by blurrah)

- **npm**: `mcp-graphql` v2.0.4
- **Approach**: Exposes two generic MCP tools (`introspect-schema`, `query-graphql`). The LLM writes raw GraphQL queries.
- **Pros**: Simple, works with any GraphQL API.
- **Cons**: Does not map individual operations to discrete MCP tools. No tool-level parameter validation. No tool annotations.
- **License**: MIT

### 1.2 graphql-mcp (by ctkadvisors)

- **Approach**: Dynamically generates one MCP tool per query/mutation via introspection. Mutations get `mutation_` prefix. Supports whitelisting.
- **Pros**: Per-operation tool generation, security-first (mutations off by default), strong typing.
- **Cons**: Business Source License 1.1 (non-MIT until 2029). Config via environment variables only.
- **License**: BSL 1.1

### 1.3 @toolprint/mcp-graphql-forge

- **Approach**: Auto-generates MCP tools from introspection. Multi-layer parameter validation. Dual transport (stdio + HTTP). Schema caching.
- **Pros**: Most feature-complete existing solution. Input sanitization, prototype pollution protection.
- **Cons**: No library/embeddable mode. No multi-endpoint support. No MCP tool annotations.

### 1.4 Apollo MCP Server

- **Approach**: First-party Apollo solution. Maps persisted queries or introspection-derived operations to MCP tools.
- **Pros**: Official Apollo backing, production-grade.
- **Cons**: Tightly coupled to Apollo ecosystem.

### Key Differentiators for Our Package

1. **Three consumption modes** via a monorepo: core engine (`@graphql2mcp/core`), standalone proxy with CLI (`graphql2mcp`), and embeddable library for existing MCP servers (`@graphql2mcp/lib`).
2. **Multi-endpoint support** — target one or more GraphQL servers from a single MCP server.
3. **Mutation configuration** — three modes: all, none, or explicit whitelist.
4. **MCP tool annotations** — `readOnlyHint`, `destructiveHint`, etc. set automatically based on operation type.
5. **Schema introspection via gql-tada** — modern, well-maintained introspection pipeline with auth header support.

---

## 2. Core Dependencies — Evaluation

### 2.1 Schema Introspection: `@gql.tada/cli-utils`

#### Overview

CLI/programmatic support package for `gql.tada`, maintained by the 0no.co team (Urql maintainers).

#### Key API: `generateSchema(opts)` (verified from context7 + official docs)

```typescript
import { generateSchema } from '@gql.tada/cli-utils';

// Method signature:
// generateSchema(options: {
//     input: string;                               — URL, .graphql file, or introspection JSON
//     output?: string;                             — File path to write SDL output
//     headers?: Record<string, string>;            — Auth headers for URL introspection
//     tsconfig?: string;                           — Optional tsconfig path
// }) => Promise<void>

await generateSchema({
    input: 'https://api.example.com/graphql',
    output: './schema.graphql',
    headers: { Authorization: 'Bearer TOKEN' },
    tsconfig: undefined
});
```

The module also exports: `generateOutput()`, `generatePersisted()`, `generateTurbo()` — but only `generateSchema()` is relevant to us.

#### Evaluation

| Criterion           | Rating            | Notes                                                        |
| ------------------- | ----------------- | ------------------------------------------------------------ |
| TypeScript support  | Excellent         | First-class TypeScript, fully typed API                      |
| API quality         | Good              | Clean, simple. Handles URL, SDL file, and introspection JSON |
| Maintenance         | Active            | Regularly updated by 0no.co team                             |
| Auth support        | Good              | Arbitrary headers (Bearer, API key, Basic, custom)           |
| Fit for our purpose | Good with caveats | See limitation below                                         |

#### Limitation: File-Based Output Only

`generateSchema()` returns `Promise<void>` and writes SDL to a file. It does not return the schema in memory. Our approach:

- Use `generateSchema()` to write SDL to a temp file, then read + parse with `graphql`'s `buildSchema()`.
- This is acceptable because introspection is a one-time setup operation.
- When the user provides an SDL file directly, skip gql-tada and use `buildSchema()` directly.

---

### 2.2 Schema Parsing & Type System: `graphql` (graphql-js)

#### Overview

The reference JavaScript implementation of GraphQL. Required regardless of introspection method.

#### Key Exports We Need

**Schema construction:**

- `buildSchema(sdl: string): GraphQLSchema` — parse SDL string into schema
- `buildClientSchema(introspectionResult): GraphQLSchema` — build from introspection JSON
- `getIntrospectionQuery(options?): string` — produce the standard introspection query
- `printSchema(schema): string` — serialize schema back to SDL

**Type system traversal (critical for type-mapper):**

- `GraphQLSchema`, `GraphQLObjectType`, `GraphQLField`, `GraphQLArgument`
- `GraphQLInputObjectType`, `GraphQLEnumType`, `GraphQLScalarType`
- `GraphQLList`, `GraphQLNonNull`
- Type guards: `isNonNullType()`, `isListType()`, `isInputObjectType()`, `isEnumType()`, `isScalarType()`, `isUnionType()`, `isInterfaceType()`
- Unwrapping: `getNullableType()`, `getNamedType()`

#### Evaluation

| Criterion           | Rating    | Notes                                         |
| ------------------- | --------- | --------------------------------------------- |
| TypeScript support  | Excellent | Built-in type definitions                     |
| Weekly downloads    | ~10M+     | Industry standard                             |
| API quality         | Excellent | Complete type system API with type guards     |
| Maintenance         | Active    | Core GraphQL foundation project               |
| Fit for our purpose | Essential | Required for schema traversal and SDL parsing |

**Assessment**: **Must-have.** Core dependency for all packages.

---

### 2.3 MCP Server Creation: `@modelcontextprotocol/sdk` (v1.x)

#### Overview

The official TypeScript SDK for the Model Context Protocol. We target the **v1.x branch** (latest: v1.27.1), which is the current stable release recommended for production use.

#### Key API for Server Creation (verified from v1.x source)

**Server instantiation:**

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer({
    name: 'my-server',
    version: '1.0.0'
});
```

**Tool registration — `registerTool()` (recommended v1.x API):**

```typescript
// Full signature (from v1.x src/server/mcp.ts):
// registerTool<OutputArgs, InputArgs>(
//     name: string,
//     config: {
//         title?: string;
//         description?: string;
//         inputSchema?: InputArgs;       // Zod raw shape (Record<string, ZodType>)
//         outputSchema?: OutputArgs;
//         annotations?: ToolAnnotations;
//         _meta?: Record<string, unknown>;
//     },
//     cb: ToolCallback<InputArgs>
// ): RegisteredTool

server.registerTool(
    'query_users',
    {
        title: 'Query: users',
        description: 'Fetch a list of users',
        inputSchema: {
            limit: z.number().int().optional().describe('Max results to return'),
            offset: z.number().int().optional().describe('Number of results to skip')
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true
        }
    },
    async ({ limit, offset }) => ({
        content: [{ type: 'text', text: JSON.stringify(result) }]
    })
);
```

Note: `inputSchema` is a **Zod raw shape** (object of `{ fieldName: z.ZodType }`), not a `z.object()` wrapper. The SDK wraps it internally.

**Older `tool()` API** (also available, simpler but less flexible):

```typescript
server.tool('tool-name', { param: z.string() }, async ({ param }, extra) => {
    return { content: [{ type: 'text', text: 'result' }] };
});
```

**Transports:**

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
```

#### ToolAnnotations Type (verified from v1.x src/types.ts)

```typescript
// Defined via Zod in the SDK:
const ToolAnnotationsSchema = z.object({
    title: z.string().optional(), // Human-readable title
    readOnlyHint: z.boolean().optional(), // Default: false. Tool doesn't modify environment
    destructiveHint: z.boolean().optional(), // Default: true. May perform destructive updates
    idempotentHint: z.boolean().optional(), // Default: false. Repeated calls = no additional effect
    openWorldHint: z.boolean().optional() // Default: true. Interacts with external entities
});
type ToolAnnotations = z.infer<typeof ToolAnnotationsSchema>;
```

**Title precedence**: When both `config.title` and `annotations.title` are set, `config.title` takes precedence. Use `getDisplayName()` from `@modelcontextprotocol/sdk/shared/metadataUtils.js` for resolution: `title > annotations.title > name`.

**Real-world annotation example** (from v1.x `src/examples/server/simpleStreamableHttp.ts`):

```typescript
server.registerTool(
    'multi-greet',
    {
        description: 'A tool that sends different greetings',
        inputSchema: { name: z.string().describe('Name to greet') },
        annotations: {
            title: 'Multiple Greeting Tool',
            readOnlyHint: true,
            openWorldHint: false
        }
    },
    async ({ name }, extra): Promise<CallToolResult> => {
        /* ... */
    }
);
```

**Our annotation mapping:**

- **GraphQL queries** → `{ readOnlyHint: true, destructiveHint: false, openWorldHint: true }`
- **GraphQL mutations** → `{ readOnlyHint: false, destructiveHint: true, openWorldHint: true }`

#### Error Handling Pattern

Tool errors should be returned in the result (not thrown), so the LLM can see and handle them:

```typescript
return {
    isError: true,
    content: [{ type: 'text', text: `Error: ${error.message}` }]
};
```

#### Evaluation

| Criterion           | Rating    | Notes                                                 |
| ------------------- | --------- | ----------------------------------------------------- |
| TypeScript support  | Excellent | Native TypeScript                                     |
| API quality         | Excellent | Clean registerTool API with Zod schemas + annotations |
| Maintenance         | Active    | Maintained by Anthropic                               |
| Fit for our purpose | Essential | The only choice for MCP server creation               |

**Peer dependency**: `zod` (v3.25+ or v4). The SDK internally uses `zod/v4` but has a compatibility layer (`src/server/zod-compat.ts`) that detects Zod version at runtime and normalizes schema operations. Consumers can use either `import { z } from 'zod'` (v3.25+) or
`import * as z from 'zod/v4'`. Do not mix versions in the same `inputSchema` object.

**Assessment**: **Must-have.** Pin to `^1.27.0` (v1.x range).

---

### 2.4 Schema Validation: `zod`

#### Overview

TypeScript-first schema validation. Required peer dependency of `@modelcontextprotocol/sdk`.

- **Latest**: v4.3.6 (v4 released), SDK also supports v3.25+
- **Role**: MCP tool parameter schemas + dynamic Zod construction from GraphQL types

#### Key API for Dynamic Schema Construction

```typescript
import { z } from 'zod';

// Scalars
z.string();
z.number().int();
z.number();
z.boolean();

// Composites
z.array(innerSchema);
z.object({ field1: schema1, field2: schema2 });
z.enum(['VALUE1', 'VALUE2']);

// Modifiers
schema.optional();
schema.describe('description text');
```

**Assessment**: **Must-have.** Both a direct dependency and the bridge between GraphQL types and MCP tool schemas.

---

### 2.5 CLI Framework: `commander`

- **Latest**: 13.x
- **Weekly downloads**: ~100M+
- Built-in TypeScript types. Clean declarative API.
- **Alternative**: `yargs` — heavier, more powerful validation. Overkill for our CLI needs.

**Assessment**: **Recommended** for the proxy package.

---

## 3. Recommended Package Stack

### `packages/core/` — `@graphql2mcp/core`

```
graphql                    — Schema parsing, type system traversal
zod                        — Dynamic Zod schema construction for tool parameters
```

### `packages/proxy/` — `graphql2mcp`

```
@graphql2mcp/core       — workspace:* (shared conversion engine)
@modelcontextprotocol/sdk   — MCP server creation (^1.27.0, v1.x)
@gql.tada/cli-utils         — Schema introspection via URL
commander                   — CLI framework
```

### `packages/lib/` — `@graphql2mcp/lib`

```
@graphql2mcp/core       — workspace:* (shared conversion engine)
```

**Peer dependency**: `@modelcontextprotocol/sdk` (^1.0.0) — user provides their own McpServer

### Development Dependencies (monorepo root — already configured)

```
typescript    @types/node    vitest    tsdown    prettier    eslint
```

---

## 4. Architecture & Package Responsibilities

```
packages/
├── core/                              @graphql2mcp/core
│   └── src/
│       ├── index.ts                   Public API exports
│       ├── schema/
│       │   ├── loader.ts              Load schema from SDL string or file
│       │   └── introspect.ts          Fetch schema via URL (uses gql-tada or graphql-js)
│       ├── converter/
│       │   ├── type-mapper.ts         GraphQL input types → Zod schemas
│       │   ├── tool-generator.ts      GraphQL operations → MCP tool definitions
│       │   ├── selection-builder.ts   Build field selection sets for return types
│       │   └── naming.ts             Tool naming strategies
│       └── types.ts                   Shared TypeScript types
│
├── proxy/                             graphql2mcp
│   └── src/
│       ├── index.ts                   Programmatic proxy API
│       ├── cli.ts                     CLI entry point (commander)
│       └── server.ts                  McpServer setup, multi-endpoint, transport
│
└── lib/                               @graphql2mcp/lib
    └── src/
        ├── index.ts                   Public API: registerGraphQLTools(server, options)
        └── registration.ts           Tool registration on user's existing McpServer
```

### Data Flow

1. **Schema acquisition**: SDL file → `buildSchema()` OR URL → `@gql.tada/cli-utils generateSchema()` → temp file → `buildSchema()`
2. **Schema traversal** (core): Walk `Query`/`Mutation` root types → extract fields, arguments, return types
3. **Type mapping** (core): GraphQL argument types → Zod schemas (recursive: scalars, enums, input objects, lists, non-null wrappers)
4. **Tool definition** (core): Produce tool name, description, Zod inputSchema, annotations, and query/selection set
5. **Tool registration** (proxy or lib): Register tools on `McpServer`, each tool executes GraphQL against the endpoint at runtime
