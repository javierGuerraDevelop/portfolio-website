import { describe, expect, it } from 'vitest';
import { makeApp, makeDelivery } from './helpers.js';

const validBody = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Hello',
    message: 'Hi there',
};

describe('POST /api/contact', () => {
    it('delivers the message and returns the success envelope', async () => {
        const { delivery, sent } = makeDelivery();
        const app = await makeApp({ contactDelivery: delivery });

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: validBody,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ success: true, data: null });
        expect(sent).toEqual([validBody]);

        await app.close();
    });

    it('trims name and message before delivery', async () => {
        const { delivery, sent } = makeDelivery();
        const app = await makeApp({ contactDelivery: delivery });

        await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: { ...validBody, name: '  Jane  ', message: '  Hi  ' },
        });

        expect(sent[0]).toMatchObject({ name: 'Jane', message: 'Hi' });

        await app.close();
    });

    it('rejects invalid input with 400 and does not deliver', async () => {
        const { delivery, sent } = makeDelivery();
        const app = await makeApp({ contactDelivery: delivery });

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: { name: '', email: 'nope', subject: '', message: '' },
        });

        expect(response.statusCode).toBe(400);
        const body = response.json();
        expect(body.success).toBe(false);
        expect(body.error).toContain('name');
        expect(body.error).toContain('email');
        expect(sent).toHaveLength(0);

        await app.close();
    });

    it('silently accepts a filled honeypot', async () => {
        const { delivery, sent } = makeDelivery();
        const app = await makeApp({ contactDelivery: delivery });

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: { ...validBody, website: 'http://spam.example' },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ success: true, data: null });
        expect(sent).toHaveLength(0);

        await app.close();
    });

    it('returns 500 when delivery fails', async () => {
        const app = await makeApp({
            contactDelivery: {
                async send(): Promise<void> {
                    throw new Error('smtp down');
                },
            },
        });

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: validBody,
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({ success: false, error: 'Failed to send the message' });

        await app.close();
    });

    it('returns 500 when delivery is not configured', async () => {
        const app = await makeApp();

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: validBody,
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({
            success: false,
            error: 'Contact delivery is not configured',
        });

        await app.close();
    });

    it('rate limits repeated submissions', async () => {
        const { delivery, sent } = makeDelivery();
        const app = await makeApp({
            contactDelivery: delivery,
            contactRateLimit: { max: 2, timeWindow: '1 minute' },
        });

        const first = await app.inject({ method: 'POST', url: '/api/contact', payload: validBody });
        const second = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: validBody,
        });
        const third = await app.inject({ method: 'POST', url: '/api/contact', payload: validBody });

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(200);
        expect(third.statusCode).toBe(429);
        expect(third.json()).toEqual({
            success: false,
            error: 'Too many requests. Please try again later.',
        });
        expect(sent).toHaveLength(2);

        await app.close();
    });

    it('returns the error envelope for malformed JSON', async () => {
        const { delivery } = makeDelivery();
        const app = await makeApp({ contactDelivery: delivery });

        const response = await app.inject({
            method: 'POST',
            url: '/api/contact',
            payload: '{"name":',
            headers: { 'content-type': 'application/json' },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({ success: false, error: 'Invalid request' });

        await app.close();
    });
});
