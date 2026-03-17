import { isObjectType, isInterfaceType, isUnionType, isListType, isNonNullType, isScalarType, isEnumType } from 'graphql';
import type { GraphQLOutputType, GraphQLNamedType, GraphQLSchema } from 'graphql';

/**
 * Unwrap NonNull and List wrappers to get the named type.
 */
function unwrapType(type: GraphQLOutputType): GraphQLNamedType {
    if (isNonNullType(type) || isListType(type)) {
        return unwrapType(type.ofType as GraphQLOutputType);
    }
    return type as GraphQLNamedType;
}

/**
 * Build a field selection string for a return type at a given depth.
 * Returns empty string for scalar/enum types (no selection needed).
 */
export function buildSelectionSet(type: GraphQLOutputType, schema: GraphQLSchema, maxDepth: number, currentDepth = 0): string {
    const depth = currentDepth;
    const namedType = unwrapType(type);

    // Scalar and enum types need no selection
    if (isScalarType(namedType) || isEnumType(namedType)) {
        return '';
    }

    if (isUnionType(namedType)) {
        return buildUnionSelection(namedType, schema, maxDepth, depth);
    }

    if (isInterfaceType(namedType)) {
        return buildInterfaceSelection(namedType, schema, maxDepth, depth);
    }

    if (isObjectType(namedType)) {
        return buildObjectSelection(namedType, schema, maxDepth, depth);
    }

    return '';
}

/** Builds field selection for an object type, recursing into nested objects up to maxDepth. */
function buildObjectSelection(
    type: ReturnType<typeof isObjectType extends (t: unknown) => t is infer R ? () => R : never>,
    schema: GraphQLSchema,
    maxDepth: number,
    depth: number
): string {
    if (!isObjectType(type)) return '';
    const fields = type.getFields();
    const selections: string[] = [];

    for (const [fieldName, field] of Object.entries(fields)) {
        const fieldNamedType = unwrapType(field.type);

        if (isScalarType(fieldNamedType) || isEnumType(fieldNamedType)) {
            selections.push(fieldName);
        } else if (depth < maxDepth - 1) {
            const nested = buildSelectionSet(field.type, schema, maxDepth, depth + 1);
            if (nested) {
                selections.push(`${fieldName} ${nested}`);
            }
        }
        // Beyond max depth, skip non-scalar fields
    }

    if (selections.length === 0) return '';
    return `{ ${selections.join(' ')} }`;
}

/** Builds inline fragment selection for a union type, including __typename. */
function buildUnionSelection(
    type: ReturnType<typeof isUnionType extends (t: unknown) => t is infer R ? () => R : never>,
    schema: GraphQLSchema,
    maxDepth: number,
    depth: number
): string {
    if (!isUnionType(type)) return '';
    const types = type.getTypes();
    const fragments: string[] = ['__typename'];

    for (const memberType of types) {
        const selection = buildObjectSelection(memberType, schema, maxDepth, depth);
        if (selection) {
            fragments.push(`... on ${memberType.name} ${selection}`);
        }
    }

    return `{ ${fragments.join(' ')} }`;
}

/** Builds selection for an interface type with shared scalar fields and inline fragments per implementation. */
function buildInterfaceSelection(
    type: ReturnType<typeof isInterfaceType extends (t: unknown) => t is infer R ? () => R : never>,
    schema: GraphQLSchema,
    maxDepth: number,
    depth: number
): string {
    if (!isInterfaceType(type)) return '';
    const implementations = schema.getPossibleTypes(type);

    // Get interface's own scalar fields
    const interfaceFields = type.getFields();
    const sharedSelections: string[] = ['__typename'];
    for (const [fieldName, field] of Object.entries(interfaceFields)) {
        const fieldNamedType = unwrapType(field.type);
        if (isScalarType(fieldNamedType) || isEnumType(fieldNamedType)) {
            sharedSelections.push(fieldName);
        }
    }

    // Add inline fragments for each implementation
    for (const implType of implementations) {
        const selection = buildObjectSelection(implType, schema, maxDepth, depth);
        if (selection) {
            sharedSelections.push(`... on ${implType.name} ${selection}`);
        }
    }

    return `{ ${sharedSelections.join(' ')} }`;
}
