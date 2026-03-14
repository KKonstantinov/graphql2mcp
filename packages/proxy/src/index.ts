// graphql-to-mcp — standalone proxy public API

export { createProxyServer, createSimpleProxyServer, createProxyServerFromUrl } from './server.js';
export type { ProxyServerOptions, EndpointConfig } from './server.js';

// Re-export core types for convenience
export type { ConvertOptions, ToolDefinition, MutationMode, ToolAnnotations } from '@graphql-to-mcp/core';
