// Public API for @graphql2mcp/core

// Schema loading
export {
    loadSchema,
    loadSchemaFromString,
    loadSchemaFromFile,
    loadSchemaFromGlob,
    loadSchemaFromIntrospectionFile,
    loadSchemaFromIntrospectionResult
} from './schema/loader.js';

// Tool generation
export { generateTools } from './converter/tool-generator.js';

// Type mapping (for advanced use cases)
export { graphqlTypeToZod, argumentsToZodShape } from './converter/type-mapper.js';

// Naming utilities
export { generateToolName, sanitizeName } from './converter/naming.js';

// Selection builder
export { buildSelectionSet } from './converter/selection-builder.js';

// Types
export type { ConvertOptions, ConvertResult, ToolDefinition, ToolAnnotations, MutationMode, LoadSchemaOptions } from './types.js';

export type { Logger } from './converter/tool-generator.js';
export type { TypeMapperOptions } from './converter/type-mapper.js';
