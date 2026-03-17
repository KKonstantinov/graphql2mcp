# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**graphql2mcp** converts GraphQL schemas and endpoints into MCP (Model Context Protocol) servers. Monorepo with pnpm workspaces.

## Common Commands

```bash
pnpm build                # Build all packages (tsdown)
pnpm test                 # Run all unit tests (vitest)
pnpm test:watch           # Watch mode
pnpm test:integration     # Build + run integration tests
pnpm lint                 # ESLint (includes Prettier checks)
pnpm lint:fix             # ESLint with auto-fix
pnpm format               # Prettier --write
pnpm typecheck            # TypeScript type checking
```

Run for a specific package:

```bash
pnpm --filter graphql2mcp test
pnpm --filter @graphql2mcp/core test
pnpm --filter @graphql2mcp/lib test
```

Run a single test file:

```bash
pnpm vitest run packages/core/test/unit/example.test.ts
```

## Architecture

### Package Structure

- `packages/core/` — Shared conversion engine (`@graphql2mcp/core`). GraphQL schema parsing → MCP tool definitions
- `packages/proxy/` — Standalone proxy (`graphql2mcp`). CLI + server that proxies a GraphQL endpoint as an MCP server
- `packages/lib/` — Library (`@graphql2mcp/lib`). For integrating into existing TypeScript MCP servers

Both `proxy` and `lib` depend on `core` via `workspace:*`.

## Code Conventions

- **ESM only** — all imports use `.js` extension (TypeScript ESM convention)
- **No `as any`** — use proper type guards
- Prettier: 140 char width, 4-space indent, single quotes, no trailing commas, `arrowParens: "avoid"`
- Enforce `import type` for type-only imports

## Testing Conventions

- Test through the public API when possible
- Use `toContain` for flexible output assertions (avoids whitespace brittleness)
- Use `toBe` only for exact formatting tests
- Unit tests in `test/unit/`, integration tests in `test/integration/`

## After Making Changes

Always run lint, typecheck, and tests before considering a change complete:

```bash
pnpm lint:fix && pnpm typecheck && pnpm test
```
