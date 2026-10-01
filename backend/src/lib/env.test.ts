import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

const base = {
    FRONTEND_ORIGIN: 'http://localhost:5173, http://localhost:3000',
    GITHUB_USERNAME: 'test-user',
};

describe('loadEnv', () => {
    it('parses required values with defaults', () => {
        const env = loadEnv(base);

        expect(env.port).toBe(8080);
        expect(env.frontendOrigins).toEqual(['http://localhost:5173', 'http://localhost:3000']);
        expect(env.githubUsername).toBe('test-user');
        expect(env.githubToken).toBeUndefined();
        expect(env.contact).toBeUndefined();
    });

    it('treats empty optional values as unset', () => {
        const env = loadEnv({
            ...base,
            PORT: '',
            GITHUB_TOKEN: '',
            RESEND_API_KEY: '',
            CONTACT_TO: '',
            CONTACT_FROM: '',
        });

        expect(env.port).toBe(8080);
        expect(env.githubToken).toBeUndefined();
        expect(env.contact).toBeUndefined();
    });

    it('builds the contact config when all three values are present', () => {
        const env = loadEnv({
            ...base,
            RESEND_API_KEY: 'key',
            CONTACT_TO: 'to@example.com',
            CONTACT_FROM: 'from@example.com',
        });

        expect(env.contact).toEqual({
            apiKey: 'key',
            to: 'to@example.com',
            from: 'from@example.com',
        });
    });

    it('fails fast when required values are missing', () => {
        expect(() => loadEnv({ GITHUB_USERNAME: 'test-user' })).toThrow(/FRONTEND_ORIGIN/);
        expect(() => loadEnv({ FRONTEND_ORIGIN: 'http://localhost:5173' })).toThrow(
            /GITHUB_USERNAME/,
        );
    });

    it('fails fast on partially configured contact delivery', () => {
        expect(() => loadEnv({ ...base, RESEND_API_KEY: 'key' })).toThrow(/together/);
    });
});
