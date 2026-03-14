import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { createProxyServer, createSimpleProxyServer } from '../../src/server.js';

const FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures');
const simpleSdl = path.join(FIXTURES_DIR, 'simple.graphql');
const complexSdl = path.join(FIXTURES_DIR, 'complex.graphql');

describe('Proxy Server', () => {
    // ─── 5.1 File source ───

    it('5.1 createProxyServer loads from file and creates McpServer', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: simpleSdl,
                    endpoint: 'http://localhost:4000/graphql'
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── 7.1 Default server name ───

    it('creates server with default name', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: simpleSdl,
                    endpoint: 'http://localhost:4000/graphql'
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── Custom name and version ───

    it('creates server with custom name and version', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: simpleSdl,
                    endpoint: 'http://localhost:4000/graphql'
                }
            ],
            name: 'my-server',
            version: '2.0.0'
        });
        expect(server).toBeDefined();
    });

    // ─── Mutations config ───

    it('5.5 creates server with mutations enabled', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: complexSdl,
                    endpoint: 'http://localhost:4000/graphql',
                    mutations: 'all'
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── Mutations whitelist ───

    it('5.6 creates server with mutations whitelist', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: complexSdl,
                    endpoint: 'http://localhost:4000/graphql',
                    mutations: { whitelist: ['createUser'] }
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── Include/exclude ───

    it('5.7 creates server with include/exclude filters', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: complexSdl,
                    endpoint: 'http://localhost:4000/graphql',
                    include: ['user']
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── createSimpleProxyServer ───

    it('createSimpleProxyServer convenience function works', () => {
        const server = createSimpleProxyServer({
            source: simpleSdl,
            endpoint: 'http://localhost:4000/graphql'
        });
        expect(server).toBeDefined();
    });

    // ─── Multi-endpoint (8.1) ───

    it('8.1 Multi-endpoint with two sources', () => {
        const server = createProxyServer({
            endpoints: [
                {
                    source: simpleSdl,
                    endpoint: 'http://localhost:4000/graphql',
                    prefix: 'api1'
                },
                {
                    source: complexSdl,
                    endpoint: 'http://localhost:4001/graphql',
                    prefix: 'api2'
                }
            ]
        });
        expect(server).toBeDefined();
    });

    // ─── Error case ───

    it('throws on invalid source', () => {
        expect(() =>
            createProxyServer({
                endpoints: [
                    {
                        source: 'nonexistent.graphql',
                        endpoint: 'http://localhost:4000/graphql'
                    }
                ]
            })
        ).toThrow();
    });
});
