import { isObjectType } from 'graphql';
import type { GraphQLSchema, GraphQLField, GraphQLArgument } from 'graphql';
import { argumentsToZodShape } from './type-mapper.js';
import { generateToolName } from './naming.js';
import { buildSelectionSet } from './selection-builder.js';
import type { ToolDefinition, ToolAnnotations, ConvertOptions, MutationMode, ConvertResult } from '../types.js';

const QUERY_ANNOTATIONS: ToolAnnotations = {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true
};

const MUTATION_ANNOTATIONS: ToolAnnotations = {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: true
};

/**
 * Build a GraphQL query/mutation document string for runtime execution.
 */
function buildQueryDocument(
    fieldName: string,
    operationType: 'query' | 'mutation',
    args: readonly GraphQLArgument[],
    selectionSet: string
): string {
    const opName = `${operationType === 'query' ? 'Query' : 'Mutation'}_${fieldName}`;

    if (args.length === 0) {
        const fieldPart = selectionSet ? `${fieldName} ${selectionSet}` : fieldName;
        return `${operationType} ${opName} { ${fieldPart} }`;
    }

    // Build variable declarations and field arguments
    const varDecls: string[] = [];
    const fieldArgs: string[] = [];

    for (const arg of args) {
        const typeName = arg.type.toString();
        varDecls.push(`$${arg.name}: ${typeName}`);
        fieldArgs.push(`${arg.name}: $${arg.name}`);
    }

    const varDeclStr = varDecls.join(', ');
    const fieldArgStr = fieldArgs.join(', ');
    const fieldPart = selectionSet ? `${fieldName}(${fieldArgStr}) ${selectionSet}` : `${fieldName}(${fieldArgStr})`;

    return `${operationType} ${opName}(${varDeclStr}) { ${fieldPart} }`;
}

/**
 * Generate tool definitions from a GraphQL field.
 */
function fieldToToolDefinition(
    field: GraphQLField<unknown, unknown>,
    operationType: 'query' | 'mutation',
    prefix: string,
    usedNames: Set<string>,
    schema: GraphQLSchema,
    options: ConvertOptions
): ToolDefinition {
    const name = generateToolName(field.name, prefix, usedNames);
    const titlePrefix = operationType === 'query' ? 'Query' : 'Mutation';
    const title = `${titlePrefix}: ${field.name}`;
    const description = field.description ?? `Execute the ${field.name} GraphQL ${operationType}`;

    const inputSchema = argumentsToZodShape(field.args, {
        customScalars: options.customScalars
    });

    const annotations = operationType === 'query' ? QUERY_ANNOTATIONS : MUTATION_ANNOTATIONS;
    const depth = options.depth ?? 3;
    const selectionSet = buildSelectionSet(field.type, schema, depth);

    const queryDocument = buildQueryDocument(field.name, operationType, field.args, selectionSet);

    return {
        name,
        title,
        description,
        inputSchema,
        annotations,
        queryDocument,
        operationType,
        fieldName: field.name
    };
}

/**
 * Check if a field name passes the include/exclude filters.
 */
function passesFilter(fieldName: string, include?: string[], exclude?: string[]): boolean {
    // Exclude takes precedence
    if (exclude && exclude.includes(fieldName)) {
        return false;
    }
    if (include && include.length > 0) {
        return include.includes(fieldName);
    }
    return true;
}

/**
 * Determine which mutation field names should be included based on mutation mode.
 */
function getMutationFieldNames(mutationFields: Record<string, GraphQLField<unknown, unknown>>, mutations: MutationMode): string[] {
    if (mutations === 'none') {
        return [];
    }
    if (mutations === 'all') {
        return Object.keys(mutationFields);
    }
    // Whitelist mode
    return mutations.whitelist.filter(name => name in mutationFields);
}

/** Logger interface for warnings */
export interface Logger {
    warn(message: string): void;
    info(message: string): void;
}

const defaultLogger: Logger = {
    warn: (message: string) => {
        console.error(`[warn] ${message}`);
    },
    info: (message: string) => {
        console.error(`[info] ${message}`);
    }
};

/**
 * Convert a GraphQL schema into MCP tool definitions.
 */
export function generateTools(options: ConvertOptions, logger?: Logger): ConvertResult {
    const log = logger ?? defaultLogger;
    const schema = options.schema;
    const mutations = options.mutations ?? 'none';
    const queryPrefix = options.queryPrefix ?? 'query_';
    const mutationPrefix = options.mutationPrefix ?? 'mutation_';
    const usedNames = new Set<string>();
    const tools: ToolDefinition[] = [];

    // Process Query type
    const queryType = schema.getQueryType();
    if (queryType && isObjectType(queryType)) {
        const queryFields = queryType.getFields();
        for (const [fieldName, field] of Object.entries(queryFields)) {
            if (!passesFilter(fieldName, options.include, options.exclude)) {
                continue;
            }
            tools.push(fieldToToolDefinition(field, 'query', queryPrefix, usedNames, schema, options));
        }
    } else {
        log.warn('Schema has no Query type. Zero query tools will be generated.');
    }

    // Process Mutation type
    if (mutations !== 'none') {
        const mutationType = schema.getMutationType();
        if (mutationType && isObjectType(mutationType)) {
            const mutationFields = mutationType.getFields();
            const allowedNames = getMutationFieldNames(mutationFields, mutations);
            for (const name of allowedNames) {
                if (!passesFilter(name, options.include, options.exclude)) {
                    continue;
                }
                tools.push(fieldToToolDefinition(mutationFields[name], 'mutation', mutationPrefix, usedNames, schema, options));
            }
        } else {
            log.warn('Mutations are enabled but schema has no Mutation type.');
        }
    }

    // Process Subscription type (ignore with info log)
    const subscriptionType = schema.getSubscriptionType();
    if (subscriptionType) {
        log.info('Schema contains subscriptions. Subscriptions are not converted to MCP tools.');
    }

    // Check if any tools were generated
    if (tools.length === 0) {
        // Check if the schema has any operations at all
        const hasQuery = queryType && isObjectType(queryType) && Object.keys(queryType.getFields()).length > 0;
        const mutType = schema.getMutationType();
        const hasMutation = mutType != null && isObjectType(mutType);
        if (!hasQuery && !hasMutation) {
            throw new Error('Schema contains no operations');
        }
        throw new Error('No tools were generated');
    }

    return { tools };
}
