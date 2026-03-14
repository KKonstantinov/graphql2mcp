# Validation Report: graphql-to-mcp

**Date**: 2026-03-14 **Validator**: Gimli (gimli-runner) **Status**: BLOCKED -- Implementation not yet complete

---

## Executive Summary

Validation of the `graphql-to-mcp` package could not be fully completed because the implementation code has not been written yet. Tasks #1 (requirements), #2 (development), and #3 (testing) are still in progress or pending. This report documents what has been verified from the
project scaffolding and documents, and identifies gaps that must be addressed before a complete validation can occur.

---

## 1. Requirements Document Review

**Status**: PASS

The requirements document (`docs/requirements.md`) is comprehensive and well-structured. It covers:

| Area                                 | Coverage | Notes                                                                 |
| ------------------------------------ | -------- | --------------------------------------------------------------------- |
| Input formats (SDL, file, glob, URL) | Complete | Three source types plus validation rules                              |
| Tool generation (queries, mutations) | Complete | Naming conventions, descriptions, filtering                           |
| Type mapping (GraphQL to Zod)        | Complete | All scalar types, lists, enums, input objects, custom scalars         |
| CLI interface                        | Complete | All flags documented with defaults                                    |
| Programmatic API                     | Complete | `graphqlToMcp()`, `loadGraphQLSchema()`, `generateTools()` with types |
| Error handling                       | Complete | Schema, tool generation, and runtime errors                           |
| Edge cases                           | Complete | 7.1-7.3 cover schema, naming, and execution edge cases                |
| Non-functional requirements          | Complete | Node 18+, TypeScript 5+, ESM, performance, security                   |
| Package configuration                | Complete | package.json structure, dependencies                                  |

---

## 2. Test Scenarios Review

**Status**: PASS

The test scenarios document (`docs/test-scenarios.md`) is thorough with 100+ test cases covering:

- Schema loading (6 subsections, ~20 scenarios)
- Type mapping (6 subsections, ~25 scenarios)
- Tool generation (5 subsections, ~20 scenarios)
- Field selection (8 scenarios)
- Server builder (4 scenarios)
- Tool execution (10 scenarios)
- CLI (12 scenarios)
- Programmatic API (8 scenarios)
- Integration/E2E tests (9 scenarios)
- Test fixtures (6 fixture files defined)

---

## 3. Project Scaffolding Review

**Status**: PARTIAL PASS -- Structure differs from requirements

### 3.1 Architecture Deviation

The requirements specified a single-package structure:

```
graphql-to-mcp/
  src/
    index.ts, cli.ts, schema/, converter/, server/
```

The actual implementation uses a **monorepo** with three packages:

```
packages/
  core/   -- @graphql-to-mcp/core (shared conversion engine)
  lib/    -- @graphql-to-mcp/lib (library for existing MCP servers)
  proxy/  -- graphql-to-mcp (standalone proxy with CLI)
```

**Assessment**: This is a reasonable architectural decision that provides better separation of concerns, but it deviates from the requirements document. The requirements should be updated to reflect this.

### 3.2 Package Manager

- Requirements specified: npm (implied by "npm package")
- Actual: **pnpm** (v10.29.3) with pnpm-workspace.yaml
- **Assessment**: Acceptable -- pnpm is a valid choice for monorepos

### 3.3 Node.js Version

- Requirements specified: `>=18.0.0`
- Actual: `>=24`
- **Assessment**: FAIL -- The requirement says Node 18+, but the package.json specifies Node 24+. This significantly limits compatibility.

### 3.4 Build Tool

- Requirements specified: `tsup`
- Actual: `tsdown`
- **Assessment**: Acceptable alternative -- tsdown is a newer/faster bundler

### 3.5 Source Files

All source files are currently **empty stubs**:

- `packages/core/src/index.ts` -- `export {};`
- `packages/lib/src/index.ts` -- `export {};`
- `packages/proxy/src/index.ts` -- `export {};`
- `packages/proxy/src/cli.ts` -- empty comment

**Assessment**: FAIL -- No implementation exists yet.

### 3.6 Dependencies

The `packages/core/package.json` has `"dependencies": {}` -- none of the required production dependencies have been added:

- Missing: `graphql`
- Missing: `@modelcontextprotocol/sdk`
- Missing: `zod`
- Missing: `@graphql-tools/load`
- Missing: `@graphql-tools/graphql-file-loader`
- Missing: `@graphql-tools/url-loader`
- Missing: `@graphql-tools/utils`
- Missing: `commander`

**Assessment**: FAIL -- Dependencies not yet installed.

---

## 4. Build Validation

**Status**: NOT POSSIBLE

Cannot run `pnpm run build` -- source files are empty stubs and dependencies are not installed.

---

## 5. CLI Validation

**Status**: NOT POSSIBLE

Cannot test CLI -- no implementation exists.

---

## 6. Programmatic API Validation

**Status**: NOT POSSIBLE

Cannot test API -- no implementation exists.

---

## 7. Requirement-by-Requirement Validation Checklist

| Req # | Requirement                    | Status  | Notes                                |
| ----- | ------------------------------ | ------- | ------------------------------------ |
| 2.1   | SDL String/File input          | BLOCKED | No implementation                    |
| 2.2   | Multiple .graphql files (glob) | BLOCKED | No implementation                    |
| 2.3   | Introspection endpoint URL     | BLOCKED | No implementation                    |
| 2.4   | Input validation               | BLOCKED | No implementation                    |
| 3.1   | Tool generation from queries   | BLOCKED | No implementation                    |
| 3.2   | Tool generation from mutations | BLOCKED | No implementation                    |
| 3.3   | Subscriptions ignored          | BLOCKED | No implementation                    |
| 3.4   | GraphQL type to Zod mapping    | BLOCKED | No implementation                    |
| 3.5   | Tool execution                 | BLOCKED | No implementation                    |
| 3.6   | Field selection strategy       | BLOCKED | No implementation                    |
| 4.1   | CLI command structure          | BLOCKED | No implementation                    |
| 4.2   | CLI options                    | BLOCKED | No implementation                    |
| 5.1   | graphqlToMcp() function        | BLOCKED | No implementation                    |
| 5.2   | loadGraphQLSchema() function   | BLOCKED | No implementation                    |
| 5.3   | generateTools() function       | BLOCKED | No implementation                    |
| 5.4   | Type exports                   | BLOCKED | No implementation                    |
| 6.x   | Error handling                 | BLOCKED | No implementation                    |
| 7.x   | Edge cases                     | BLOCKED | No implementation                    |
| 8.1   | Node.js 18+                    | FAIL    | package.json specifies Node 24+      |
| 8.2   | Package quality                | BLOCKED | No implementation                    |
| 8.3   | Performance                    | BLOCKED | No implementation                    |
| 8.4   | Security                       | BLOCKED | No implementation                    |
| 9.1   | Package.json structure         | PARTIAL | Monorepo structure differs from spec |
| 9.2   | Dependencies                   | FAIL    | No production dependencies installed |

---

## 8. Issues Found

### Critical

1. **No implementation code** -- All source files are empty stubs
2. **No production dependencies** -- graphql, zod, MCP SDK, etc. not installed
3. **Node.js version mismatch** -- Requires Node 24+ instead of specified 18+

### Minor

4. **Architecture deviation** -- Monorepo instead of single package (may be intentional)
5. **Build tool change** -- tsdown instead of tsup (acceptable)
6. **Package manager change** -- pnpm instead of npm (acceptable)

---

## 9. Recommendations

1. **Complete implementation** -- Tasks #2 and #3 must be completed before validation can proceed
2. **Fix Node.js version** -- Change `engines.node` from `>=24` to `>=18.0.0` per requirements
3. **Add production dependencies** -- Install all required packages per requirements section 9.2
4. **Update requirements** -- If the monorepo structure is intentional, update requirements.md to reflect the actual architecture
5. **Re-run validation** -- Once implementation is complete, this report should be updated with full validation results

---

## 10. Conclusion

The project is in early scaffolding phase. Requirements and test scenarios are well-documented and ready for implementation. The validation cannot proceed until the implementation is complete. Once Tasks #2 (development) and #3 (testing) are finished, a full validation pass
should be conducted against all requirements.
