import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { VERSION, isUrl, parseHeaders, parseMutationMode, collectCsv, collectList, resolveCliConfig } from '../../src/cli-utils.js';
import type { CliOptions } from '../../src/cli-utils.js';

const PKG_ROOT = path.join(import.meta.dirname, '../..');
const BIN_PATH = path.join(PKG_ROOT, 'bin/graphql2mcp.mjs');

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const result = spawnSync(process.execPath, [BIN_PATH, ...args], {
        encoding: 'utf8',
        timeout: 10_000,
        cwd: PKG_ROOT
    });
    return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.status ?? 1
    };
}

function defaultOpts(overrides: Partial<CliOptions> = {}): CliOptions {
    return {
        transport: 'stdio',
        port: '3000',
        mutations: 'none',
        mutationWhitelist: [],
        header: [],
        name: 'graphql-mcp-server',
        depth: '3',
        include: [],
        exclude: [],
        ...overrides
    };
}

describe('CLI', () => {
    // ─── 5.8 No arguments ───

    it('5.8 No arguments shows help and exits', () => {
        const { exitCode, stderr } = runCli([]);
        // REQ-PROXY-1 AC14: exits with code 1 when no arguments
        expect(exitCode).toBe(1);
        expect(stderr).toContain('Usage:');
    });

    // ─── 5.9 --help ───

    it('5.9 --help shows help and exits code 0', () => {
        const { exitCode, stdout } = runCli(['--help']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('graphql2mcp');
    });

    // ─── 5.10 --version ───

    it('5.10 --version shows version', () => {
        const { exitCode, stdout } = runCli(['-V']);
        expect(exitCode).toBe(0);
        // Should contain a version string
        expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    // ─── 5.11 Invalid file ───

    it('5.11 Invalid file exits code 1 with error', () => {
        const { exitCode, stderr } = runCli(['nonexistent.graphql', '-e', 'http://localhost:4000/graphql']);
        expect(exitCode).toBe(1);
        expect(stderr).toContain('Error');
    });

    // ─── Invalid mutation mode ───

    it('rejects invalid mutation mode', () => {
        const { exitCode, stderr } = runCli(['test/fixtures/simple.graphql', '-e', 'http://localhost:4000/graphql', '-m', 'bogus']);
        expect(exitCode).toBe(1);
        expect(stderr).toContain('bogus');
    });
});

describe('isUrl', () => {
    it('detects http URLs', () => {
        expect(isUrl('http://example.com/graphql')).toBe(true);
    });

    it('detects https URLs', () => {
        expect(isUrl('https://example.com/graphql')).toBe(true);
    });

    it('rejects file paths', () => {
        expect(isUrl('schema.graphql')).toBe(false);
    });

    it('rejects relative paths', () => {
        expect(isUrl('./schemas/api.graphql')).toBe(false);
    });

    it('rejects empty string', () => {
        expect(isUrl('')).toBe(false);
    });
});

describe('parseHeaders', () => {
    it('parses a single header', () => {
        expect(parseHeaders(['Authorization: Bearer token123'])).toEqual({ Authorization: 'Bearer token123' });
    });

    it('parses multiple headers', () => {
        expect(parseHeaders(['Authorization: Bearer x', 'X-Api-Key: abc'])).toEqual({
            Authorization: 'Bearer x',
            'X-Api-Key': 'abc'
        });
    });

    it('handles values with colons', () => {
        expect(parseHeaders(['X-Custom: foo:bar:baz'])).toEqual({ 'X-Custom': 'foo:bar:baz' });
    });

    it('skips malformed headers', () => {
        expect(parseHeaders(['no-colon-here'])).toEqual({});
    });

    it('skips headers with empty key', () => {
        expect(parseHeaders([': value'])).toEqual({});
    });

    it('returns empty object for empty input', () => {
        expect(parseHeaders([])).toEqual({});
    });
});

describe('parseMutationMode', () => {
    it('returns none by default', () => {
        expect(parseMutationMode('none', [])).toEqual({ mutations: 'none' });
    });

    it('returns all', () => {
        expect(parseMutationMode('all', [])).toEqual({ mutations: 'all' });
    });

    it('returns whitelist with names', () => {
        expect(parseMutationMode('whitelist', ['createUser', 'deleteUser'])).toEqual({
            mutations: { whitelist: ['createUser', 'deleteUser'] }
        });
    });

    it('warns when -m whitelist is given with no names', () => {
        const result = parseMutationMode('whitelist', []);
        expect(result.mutations).toBe('none');
        expect(result.warning).toContain('empty');
    });

    it('auto-switches to whitelist when names provided without -m whitelist', () => {
        const result = parseMutationMode('none', ['createUser']);
        expect(result.mutations).toEqual({ whitelist: ['createUser'] });
        expect(result.warning).toContain('auto-switching');
    });

    it('no warning when whitelist is empty and mode is none', () => {
        expect(parseMutationMode('none', []).warning).toBeUndefined();
    });
});

describe('collectCsv', () => {
    it('splits comma-separated values', () => {
        expect(collectCsv('a,b,c', [])).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace', () => {
        expect(collectCsv('a , b , c', [])).toEqual(['a', 'b', 'c']);
    });

    it('accumulates across calls', () => {
        const first = collectCsv('a,b', []);
        const second = collectCsv('c', first);
        expect(second).toEqual(['a', 'b', 'c']);
    });

    it('filters empty entries', () => {
        expect(collectCsv('a,,b,', [])).toEqual(['a', 'b']);
    });

    it('filters leading comma', () => {
        expect(collectCsv(',a,b', [])).toEqual(['a', 'b']);
    });
});

describe('collectList', () => {
    it('appends a single value', () => {
        expect(collectList('Authorization: Bearer x', [])).toEqual(['Authorization: Bearer x']);
    });

    it('accumulates across calls', () => {
        const first = collectList('Authorization: Bearer x', []);
        const second = collectList('X-Api-Key: abc', first);
        expect(second).toEqual(['Authorization: Bearer x', 'X-Api-Key: abc']);
    });
});

describe('resolveCliConfig', () => {
    it('sets version from package.json', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts());
        expect(config.version).toBe(VERSION);
        expect(config.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('detects URL sources', () => {
        const config = resolveCliConfig('https://api.example.com/graphql', defaultOpts());
        expect(config.isUrl).toBe(true);
    });

    it('detects file sources', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts());
        expect(config.isUrl).toBe(false);
    });

    it('parses headers', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ header: ['Authorization: Bearer x'] }));
        expect(config.headers).toEqual({ Authorization: 'Bearer x' });
    });

    it('parses depth as integer', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ depth: '5' }));
        expect(config.depth).toBe(5);
    });

    it('parses port as integer', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ port: '8080' }));
        expect(config.port).toBe(8080);
    });

    it('passes name through', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ name: 'my-server' }));
        expect(config.name).toBe('my-server');
    });

    it('passes endpoint through', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ endpoint: 'http://localhost:4000/graphql' }));
        expect(config.endpoint).toBe('http://localhost:4000/graphql');
    });

    it('passes include through', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ include: ['users', 'posts'] }));
        expect(config.include).toEqual(['users', 'posts']);
    });

    it('passes exclude through', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ exclude: ['internal'] }));
        expect(config.exclude).toEqual(['internal']);
    });

    it('defaults mutations to none', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts());
        expect(config.mutations).toBe('none');
    });

    it('resolves mutations all', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ mutations: 'all' }));
        expect(config.mutations).toBe('all');
    });

    it('resolves mutations whitelist', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ mutations: 'whitelist', mutationWhitelist: ['createUser'] }));
        expect(config.mutations).toEqual({ whitelist: ['createUser'] });
    });

    it('auto-switches to whitelist and emits warning', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ mutationWhitelist: ['createUser'] }));
        expect(config.mutations).toEqual({ whitelist: ['createUser'] });
        expect(config.warnings).toHaveLength(1);
        expect(config.warnings[0]).toContain('auto-switching');
    });

    it('warns when -m whitelist has no names', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ mutations: 'whitelist' }));
        expect(config.mutations).toBe('none');
        expect(config.warnings).toHaveLength(1);
        expect(config.warnings[0]).toContain('empty');
    });

    it('has no warnings for normal usage', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts());
        expect(config.warnings).toEqual([]);
    });

    it('passes transport through', () => {
        const config = resolveCliConfig('schema.graphql', defaultOpts({ transport: 'http' }));
        expect(config.transport).toBe('http');
    });
});
