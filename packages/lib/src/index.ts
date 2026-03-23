// @graphql2mcp/lib — library for existing MCP servers

export { getGraphQLTools, registerGraphQLTools } from './registration.js';
export type {
    GraphQLToolsOptions,
    GraphQLToolEntry,
    GetGraphQLToolsResult,
    McpServerLike,
    RegisteredToolInfo,
    RegisterGraphQLToolsResult
} from './registration.js';

// Re-export core utilities and types for convenience
export { loadSchemaFromUrl } from '@graphql2mcp/core';
export type { ConvertOptions, ToolDefinition, MutationMode, ToolAnnotations, LoadSchemaFromUrlOptions } from '@graphql2mcp/core';

// Re-export MCP SDK types for convenience
export type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
