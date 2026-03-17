# Contributing

Thanks for your interest in contributing to `graphql2mcp`. This document covers the development workflow, coding standards, and how to submit changes.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 24
- [pnpm](https://pnpm.io/) >= 10

### Getting Started

```bash
# Clone the repository
git clone https://github.com/KKonstantinov/graphql2mcp.git
cd graphql2mcp

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Project Structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces):

```
packages/
  core/                     # @graphql2mcp/core
    src/                    # Shared conversion engine
    test/
      unit/                 # Vitest unit tests
      integration/          # Integration tests
  proxy/                    # graphql2mcp
    src/                    # Standalone proxy + CLI
    bin/                    # CLI entry point
    test/
      unit/
      integration/
  lib/                      # @graphql2mcp/lib
    src/                    # Library for existing MCP servers
    test/
      unit/
      integration/
docs/                       # VitePress documentation
```

## Scripts

All scripts can be run from the root of the monorepo:

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `pnpm build`            | Build all packages (tsdown)                    |
| `pnpm test`             | Run all unit tests (vitest)                    |
| `pnpm test:watch`       | Run tests in watch mode                        |
| `pnpm test:integration` | Build + run integration tests for all packages |
| `pnpm lint`             | Run ESLint (includes Prettier checks)          |
| `pnpm lint:fix`         | Run ESLint with auto-fix (includes formatting) |
| `pnpm format`           | Format all files with Prettier                 |
| `pnpm format:check`     | Check formatting without writing               |
| `pnpm typecheck`        | Run TypeScript type checking for all packages  |

You can also run scripts for a specific package:

```bash
pnpm --filter graphql2mcp test
pnpm --filter @graphql2mcp/core test
```

## Testing

### Unit Tests

Unit tests use [Vitest](https://vitest.dev/) and live in each package's `test/` directory:

```bash
pnpm test
```

### Writing Tests

- Test behavior through the public API when possible
- Use `toContain` for flexible output assertions
- Use `toBe` for exact formatting tests

## Linting

The project uses [ESLint](https://eslint.org/) v10 with:

- [`typescript-eslint`](https://typescript-eslint.io/) — strict type-checked rules
- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn) — recommended rules

```bash
pnpm lint        # Check for errors
pnpm lint:fix    # Auto-fix what's possible
```

## Code Style

- **ESM only** — all imports use `.js` extension (TypeScript convention for ESM)
- **No `as any`** — use proper type guards
- **Keep it simple** — prefer straightforward code over abstractions
- Prettier: 140 char width, 4-space indent, single quotes, no trailing commas

## Submitting Changes

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run the full validation suite:
    ```bash
    pnpm lint && pnpm typecheck && pnpm test
    ```
5. Open a pull request with a clear description of the change

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Update documentation if the public API changes
- Ensure all CI checks pass

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
