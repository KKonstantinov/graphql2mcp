// @graphql-to-mcp/lib — library for existing MCP servers

export { registerGraphQLTools } from './registration.js';
export type { RegisterGraphQLToolsOptions, RegisterGraphQLToolsResult, RegisteredToolInfo } from './registration.js';

// Re-export core types for convenience
export type { ConvertOptions, ToolDefinition, MutationMode, ToolAnnotations } from '@graphql-to-mcp/core';
