# Core API Reference

The `@graphql2mcp/core` package is the shared conversion engine used by both the CLI proxy and the library. It parses GraphQL schemas and generates MCP tool definitions.

You typically do not need to use this package directly -- the [CLI](cli.md) and [library](library.md) packages provide higher-level APIs. Use `@graphql2mcp/core` when you need fine-grained control over schema loading or tool generation.

## Installation

```bash
npm install @graphql2mcp/core
```

## Schema Loading

All schema loading functions return a `GraphQLSchema` object from `graphql-js`.

### `loadSchema(source)`

Auto-detects the source type and loads accordingly.

```typescript
import { loadSchema } from '@graphql2mcp/core';

// SDL string (detected by newlines or type definitions)
const schema1 = loadSchema('type Query { hello: String }');

// SDL file
const schema2 = loadSchema('./schema.graphql');

// Glob pattern
const schema3 = loadSchema('./schemas/*.graphql');

// Introspection JSON file
const schema4 = loadSchema('./introspection.json');
```

Detection rules:

- Contains newlines or starts with `type`/`schema`/`input`/`enum`/`interface`/`union`/`scalar`/`extend`/`directive` -- treated as SDL string
- Ends with `.json` -- treated as introspection JSON file
- Contains `*` or `?` -- treated as glob pattern
- Ends with `.graphql` or `.gql` -- treated as SDL file
- Otherwise -- treated as SDL string (fallback)

### `loadSchemaFromString(sdl)`

Loads a schema from an SDL string.

```typescript
import { loadSchemaFromString } from '@graphql2mcp/core';

const schema = loadSchemaFromString(`
    type Query {
        user(id: ID!): User
    }
    type User {
        id: ID!
        name: String!
    }
`);
```

Throws if the string is empty or contains invalid SDL.

### `loadSchemaFromFile(filePath)`

Loads a schema from a `.graphql` or `.gql` file.

```typescript
import { loadSchemaFromFile } from '@graphql2mcp/core';

const schema = loadSchemaFromFile('./schema.graphql');
```

The path is resolved relative to the current working directory. Throws if the file does not exist.

### `loadSchemaFromGlob(pattern)`

Loads and merges schemas from files matching a glob pattern.

```typescript
import { loadSchemaFromGlob } from '@graphql2mcp/core';

const schema = loadSchemaFromGlob('./schemas/**/*.graphql');
```

All matching files are concatenated into a single SDL string and parsed together. Throws if no files match the pattern.

### `loadSchemaFromIntrospectionFile(filePath)`

Loads a schema from a JSON file containing an introspection result.

```typescript
import { loadSchemaFromIntrospectionFile } from '@graphql2mcp/core';

const schema = loadSchemaFromIntrospectionFile('./introspection.json');
```

Accepts both raw introspection results and wrapped results (with a `data` property).

### `loadSchemaFromIntrospectionResult(json)`

Loads a schema from an introspection result object.

```typescript
import { loadSchemaFromIntrospectionResult } from '@graphql2mcp/core';

const response = await fetch('https://api.example.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() })
});
const json = await response.json();

const schema = loadSchemaFromIntrospectionResult(json);
```

## Tool Generation

### `generateTools(options, logger?)`

Converts a GraphQL schema into MCP tool definitions.

```typescript
import { generateTools, loadSchema } from '@graphql2mcp/core';

const schema = loadSchema('./schema.graphql');

const { tools } = generateTools({
    schema,
    mutations: 'none',
    depth: 3
});

for (const tool of tools) {
    console.log(tool.name, tool.description);
}
```

Throws if the schema contains no operations or if no tools are generated after applying filters.

**Parameters:**

- `options` -- a [ConvertOptions](#convertoptions) object
- `logger` -- optional logger with `warn(message)` and `info(message)` methods

**Returns:** [ConvertResult](#convertresult)

## Types

### `ConvertOptions`

```typescript
interface ConvertOptions {
    schema: GraphQLSchema;
    mutations?: MutationMode;
    depth?: number;
    include?: string[];
    exclude?: string[];
    queryPrefix?: string;
    mutationPrefix?: string;
    customScalars?: Record<string, z.ZodType>;
}
```

| Property         | Type                        | Default        | Description                                    |
| ---------------- | --------------------------- | -------------- | ---------------------------------------------- |
| `schema`         | `GraphQLSchema`             | **(required)** | The GraphQL schema to convert                  |
| `mutations`      | `MutationMode`              | `'none'`       | Mutation exposure mode                         |
| `depth`          | `number`                    | `3`            | Maximum depth for return type field selection  |
| `include`        | `string[]`                  |                | Only include operations with these field names |
| `exclude`        | `string[]`                  |                | Exclude operations with these field names      |
| `queryPrefix`    | `string`                    | `'query_'`     | Prefix for query tool names                    |
| `mutationPrefix` | `string`                    | `'mutation_'`  | Prefix for mutation tool names                 |
| `customScalars`  | `Record<string, z.ZodType>` |                | Custom scalar-to-Zod mappings                  |

### `MutationMode`

```typescript
type MutationMode = 'none' | 'all' | { whitelist: string[] };
```

- `'none'` -- only queries are converted to tools
- `'all'` -- all queries and mutations are converted
- `{ whitelist: ['name1', 'name2'] }` -- only the named mutations are converted

See the [Mutations guide](mutations.md) for details.

### `ConvertResult`

```typescript
interface ConvertResult {
    tools: ToolDefinition[];
}
```

### `ToolDefinition`

Each generated tool contains everything needed to register it with an MCP server and execute the corresponding GraphQL operation.

```typescript
interface ToolDefinition {
    name: string;
    title: string;
    description: string;
    inputSchema: Record<string, z.ZodType>;
    annotations: ToolAnnotations;
    queryDocument: string;
    operationType: 'query' | 'mutation';
    fieldName: string;
}
```

| Property        | Type                        | Description                                                               |
| --------------- | --------------------------- | ------------------------------------------------------------------------- |
| `name`          | `string`                    | Tool name (e.g., `'query_users'`)                                         |
| `title`         | `string`                    | Human-readable title (e.g., `'Query: users'`)                             |
| `description`   | `string`                    | Tool description (from GraphQL field description, or a generated default) |
| `inputSchema`   | `Record<string, z.ZodType>` | Zod shape for input parameters, matching the GraphQL arguments            |
| `annotations`   | `ToolAnnotations`           | MCP tool annotations (readOnly, destructive, etc.)                        |
| `queryDocument` | `string`                    | The GraphQL query/mutation document string for runtime execution          |
| `operationType` | `'query' \| 'mutation'`     | Whether this tool runs a query or mutation                                |
| `fieldName`     | `string`                    | The original GraphQL field name                                           |

### `ToolAnnotations`

```typescript
interface ToolAnnotations {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
}
```

Queries automatically get `readOnlyHint: true, destructiveHint: false`. Mutations get `readOnlyHint: false, destructiveHint: true`. See the [Mutations guide](mutations.md) for details.

### `LoadSchemaOptions`

```typescript
interface LoadSchemaOptions {
    headers?: Record<string, string>;
}
```

### `Logger`

```typescript
interface Logger {
    warn(message: string): void;
    info(message: string): void;
}
```

## Advanced Exports

These are exported for advanced use cases. Most users will not need them.

### `graphqlTypeToZod(type, options?, visited?, depth?)`

Converts a GraphQL input type to a Zod schema. Handles non-null wrappers, lists, scalars, enums, and input objects recursively.

```typescript
import { graphqlTypeToZod } from '@graphql2mcp/core';
```

### `argumentsToZodShape(args, options?)`

Converts GraphQL arguments to a Zod raw shape (`Record<string, ZodType>`). This is the format expected by the MCP SDK's `registerTool` input schema.

```typescript
import { argumentsToZodShape } from '@graphql2mcp/core';
```

### `generateToolName(fieldName, prefix, usedNames)`

Generates a unique tool name with a prefix, resolving collisions by appending a numeric suffix.

```typescript
import { generateToolName } from '@graphql2mcp/core';
```

### `sanitizeName(name)`

Sanitizes a name to contain only alphanumeric characters and underscores.

```typescript
import { sanitizeName } from '@graphql2mcp/core';
```

### `buildSelectionSet(type, schema, maxDepth, currentDepth?)`

Builds a field selection string for a return type, recursing into nested object types up to `maxDepth`.

```typescript
import { buildSelectionSet } from '@graphql2mcp/core';
```
