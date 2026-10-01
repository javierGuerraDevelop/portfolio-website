import { describe, expect, it } from 'vitest';
import { profileSchema } from '../../src/schemas/profile.js';
import { makeApp } from './helpers.js';

describe('GET /api/profile', () => {
    it('returns profile content matching the frozen schema', async () => {
        const app = await makeApp();

        const response = await app.inject({ method: 'GET', url: '/api/profile' });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(profileSchema.safeParse(body.data).success).toBe(true);

        await app.close();
    });
});
