import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const PKG_ROOT = path.join(import.meta.dirname, '../..');
const BIN_PATH = path.join(PKG_ROOT, 'bin/graphql2mcp.mjs');

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
    try {
        const stdout = execFileSync(process.execPath, [BIN_PATH, ...args], {
            encoding: 'utf8',
            timeout: 10_000,
            cwd: PKG_ROOT,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        return { stdout, stderr: '', exitCode: 0 };
    } catch (error: unknown) {
        const e = error as { stdout?: string; stderr?: string; status?: number };
        return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', exitCode: e.status ?? 1 };
    }
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
});
