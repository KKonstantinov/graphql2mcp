import type { MutationMode } from '@graphql2mcp/core';
import pkg from '../package.json' with { type: 'json' };

export const VERSION = pkg.version;

/** Raw CLI option values as parsed by Commander. */
export interface CliOptions {
    transport: string;
    port: string;
    mutations: string;
    mutationWhitelist: string[];
    header: string[];
    endpoint?: string;
    name: string;
    depth: string;
    include: string[];
    exclude: string[];
}

/** Resolved configuration ready to pass to server creation functions. */
export interface ResolvedConfig {
    isUrl: boolean;
    source: string;
    endpoint?: string;
    headers: Record<string, string>;
    mutations: MutationMode;
    name: string;
    version: string;
    depth: number;
    include: string[];
    exclude: string[];
    transport: string;
    port: number;
    warnings: string[];
}

/** Checks if a source string is an HTTP(S) URL. */
export function isUrl(source: string): boolean {
    return source.startsWith('http://') || source.startsWith('https://');
}

/** Parses CLI header flags (e.g. "Authorization: Bearer x") into a headers record. */
export function parseHeaders(headerValues: string[]): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const h of headerValues) {
        const colonIndex = h.indexOf(':');
        if (colonIndex > 0) {
            const key = h.slice(0, colonIndex).trim();
            const value = h.slice(colonIndex + 1).trim();
            headers[key] = value;
        }
    }
    return headers;
}

/** Parses a CLI mutation mode string into a MutationMode value. */
export function parseMutationMode(mode: string, whitelist: string[]): { mutations: MutationMode; warning?: string } {
    if (mode === 'all') return { mutations: 'all' };
    if (mode === 'whitelist') {
        if (whitelist.length === 0) {
            return {
                mutations: 'none',
                warning: '-m whitelist specified but --mutation-whitelist is empty; no mutations will be exposed'
            };
        }
        return { mutations: { whitelist } };
    }
    if (whitelist.length > 0) {
        return {
            mutations: { whitelist },
            warning: '--mutation-whitelist provided without -m whitelist; auto-switching to whitelist mode'
        };
    }
    return { mutations: 'none' };
}

/** Commander custom parser: splits on commas and accumulates across repeated flags. */
export function collectCsv(val: string, prev: string[]): string[] {
    return [
        ...prev,
        ...val
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
    ];
}

/** Commander custom parser: accumulates repeated flags without splitting. */
export function collectList(val: string, prev: string[]): string[] {
    return [...prev, val];
}

/** Resolves raw CLI options into a structured config for server creation. */
export function resolveCliConfig(source: string, opts: CliOptions): ResolvedConfig {
    const headers = parseHeaders(opts.header);
    const { mutations, warning } = parseMutationMode(opts.mutations, opts.mutationWhitelist);
    const depth = Number.parseInt(opts.depth, 10);
    const port = Number.parseInt(opts.port, 10);
    const warnings: string[] = [];
    if (warning) warnings.push(warning);

    return {
        isUrl: isUrl(source),
        source,
        endpoint: opts.endpoint,
        headers,
        mutations,
        name: opts.name,
        version: VERSION,
        depth,
        include: opts.include,
        exclude: opts.exclude,
        transport: opts.transport,
        port,
        warnings
    };
}
