/**
 * Sanitize a name to contain only alphanumeric characters and underscores.
 */
export function sanitizeName(name: string): string {
    return name.replaceAll(/[^\w]/g, '_');
}

/**
 * Generate a unique tool name with prefix and collision resolution.
 */
export function generateToolName(fieldName: string, prefix: string, usedNames: Set<string>): string {
    const base = `${prefix}${sanitizeName(fieldName)}`;
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) {
        candidate = `${base}_${String(suffix)}`;
        suffix++;
    }
    usedNames.add(candidate);
    return candidate;
}
