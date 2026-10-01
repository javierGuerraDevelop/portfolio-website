import { describe, expect, it } from 'vitest';
import { makeApp } from './helpers.js';

describe('GET /api/health', () => {
    it('returns the health envelope', async () => {
        const app = await makeApp();

        const response = await app.inject({ method: 'GET', url: '/api/health' });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ success: true, data: { status: 'ok' } });

        await app.close();
    });
});
