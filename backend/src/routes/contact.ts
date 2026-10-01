import type { FastifyPluginAsync } from 'fastify';
import { ApiError } from '../lib/errors.js';
import { contactRequestSchema } from '../schemas/contact.js';
import type { ContactDelivery } from '../services/contact.js';

export interface ContactRateLimitOptions {
    max: number;
    timeWindow: number | string;
}

export interface ContactRoutesOptions {
    delivery?: ContactDelivery;
    rateLimit: ContactRateLimitOptions;
}

export const contactRoutes: FastifyPluginAsync<ContactRoutesOptions> = async (app, options) => {
    app.post('/api/contact', { config: { rateLimit: options.rateLimit } }, async (request) => {
        const parsed = contactRequestSchema.safeParse(request.body);
        if (!parsed.success) {
            const fields = [
                ...new Set(parsed.error.issues.map((issue) => issue.path.join('.') || 'body')),
            ];
            throw new ApiError(400, `Invalid contact request: ${fields.join(', ')}`);
        }

        const message = parsed.data;

        // Honeypot: silently accept without delivering when a bot fills it in.
        if (message.website?.trim()) {
            return { success: true, data: null };
        }

        if (!options.delivery) {
            throw new ApiError(500, 'Contact delivery is not configured');
        }

        try {
            await options.delivery.send(message);
        } catch (error) {
            request.log.error({ err: error }, 'contact delivery failed');
            throw new ApiError(500, 'Failed to send the message');
        }

        return { success: true, data: null };
    });
};
