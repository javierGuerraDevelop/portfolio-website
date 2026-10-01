import { describe, expect, it } from 'vitest';
import { ApiError } from '../../src/lib/errors.js';
import { makeApp, makeGithub, makeRepo } from './helpers.js';

describe('GET /api/repos', () => {
    it('returns the repositories in the success envelope', async () => {
        const app = await makeApp({ github: makeGithub({ repos: [makeRepo()] }) });

        const response = await app.inject({ method: 'GET', url: '/api/repos' });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ success: true, data: [makeRepo()] });

        await app.close();
    });

    it('forwards the stale-cache message', async () => {
        const app = await makeApp({
            github: makeGithub({
                repos: [makeRepo()],
                message: 'Serving cached results; GitHub is currently unavailable',
            }),
        });

        const response = await app.inject({ method: 'GET', url: '/api/repos' });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(body.message).toContain('cached');
        expect(body.data).toHaveLength(1);

        await app.close();
    });

    it('maps rate limit errors to 429', async () => {
        const app = await makeApp({
            github: makeGithub(async () => {
                throw new ApiError(429, 'GitHub rate limit exceeded');
            }),
        });

        const response = await app.inject({ method: 'GET', url: '/api/repos' });

        expect(response.statusCode).toBe(429);
        expect(response.json()).toEqual({ success: false, error: 'GitHub rate limit exceeded' });

        await app.close();
    });

    it('maps upstream failures to 502', async () => {
        const app = await makeApp({
            github: makeGithub(async () => {
                throw new ApiError(502, 'GitHub is currently unavailable');
            }),
        });

        const response = await app.inject({ method: 'GET', url: '/api/repos' });

        expect(response.statusCode).toBe(502);
        expect(response.json()).toEqual({
            success: false,
            error: 'GitHub is currently unavailable',
        });

        await app.close();
    });
});
