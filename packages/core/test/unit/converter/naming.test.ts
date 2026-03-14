import { describe, it, expect } from 'vitest';
import { sanitizeName, generateToolName } from '../../../src/converter/naming.js';

describe('Naming', () => {
    // ─── 3.6.1 Simple name ───

    it('3.6.1 Simple name -> query_users', () => {
        const usedNames = new Set<string>();
        const name = generateToolName('users', 'query_', usedNames);
        expect(name).toBe('query_users');
    });

    // ─── 3.6.2 Custom prefix ───

    it('3.6.2 Custom prefix -> q_users', () => {
        const usedNames = new Set<string>();
        const name = generateToolName('users', 'q_', usedNames);
        expect(name).toBe('q_users');
    });

    // ─── 3.6.3 Name collision ───

    it('3.6.3 Name collision appends _2 suffix', () => {
        const usedNames = new Set<string>();
        const name1 = generateToolName('test', 'query_', usedNames);
        const name2 = generateToolName('test', 'query_', usedNames);
        expect(name1).toBe('query_test');
        expect(name2).toBe('query_test_2');
    });

    it('3.6.3b Multiple collisions append incrementing suffixes', () => {
        const usedNames = new Set<string>();
        const name1 = generateToolName('test', 'query_', usedNames);
        const name2 = generateToolName('test', 'query_', usedNames);
        const name3 = generateToolName('test', 'query_', usedNames);
        expect(name1).toBe('query_test');
        expect(name2).toBe('query_test_2');
        expect(name3).toBe('query_test_3');
    });

    // ─── 3.6.4 Special characters ───

    it('3.6.4 Special characters are sanitized', () => {
        expect(sanitizeName('get-user')).toBe('get_user');
        expect(sanitizeName('get.user')).toBe('get_user');
        expect(sanitizeName('get user')).toBe('get_user');
        expect(sanitizeName('get@user!')).toBe('get_user_');
    });

    it('sanitizeName preserves alphanumeric and underscores', () => {
        expect(sanitizeName('hello_world_123')).toBe('hello_world_123');
    });

    it('generateToolName with mutation prefix', () => {
        const usedNames = new Set<string>();
        const name = generateToolName('createUser', 'mutation_', usedNames);
        expect(name).toBe('mutation_createUser');
    });
});
