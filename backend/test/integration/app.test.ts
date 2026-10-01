import { describe, expect, it } from 'vitest';
import { makeApp, makeEnv } from './helpers.js';

describe('unknown routes', () => {
    it('returns the error envelope with 404', async () => {
        const app = await makeApp();

        const response = await app.inject({ method: 'GET', url: '/api/does-not-exist' });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({ success: false, error: 'Not found' });

        await app.close();
    });
});

describe('CORS', () => {
    it('allows configured frontend origins', async () => {
        const app = await makeApp({ env: makeEnv({ frontendOrigins: ['http://localhost:5173'] }) });

        const response = await app.inject({
            method: 'GET',
            url: '/api/health',
            headers: { origin: 'http://localhost:5173' },
        });

        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');

        await app.close();
    });

    it('does not allow unknown origins', async () => {
        const app = await makeApp({ env: makeEnv({ frontendOrigins: ['http://localhost:5173'] }) });

        const response = await app.inject({
            method: 'GET',
            url: '/api/health',
            headers: { origin: 'https://evil.example' },
        });

        expect(response.headers['access-control-allow-origin']).toBeUndefined();

        await app.close();
    });
});
