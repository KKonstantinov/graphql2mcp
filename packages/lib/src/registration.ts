// Re-export the high-level tool API from core.
// The lib package provides these as its primary API for convenience,
// along with additional re-exports of core types and utilities.

export { getGraphQLTools, registerGraphQLTools } from '@graphql2mcp/core';
export type {
    GraphQLToolsOptions,
    GraphQLToolEntry,
    GetGraphQLToolsResult,
    McpServerLike,
    RegisteredToolInfo,
    RegisterGraphQLToolsResult
} from '@graphql2mcp/core';
