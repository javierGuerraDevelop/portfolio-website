import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastify, type FastifyError, type FastifyInstance } from 'fastify';
import type { AppEnv } from './lib/env.js';
import { ApiError } from './lib/errors.js';
import { contactRoutes, type ContactRateLimitOptions } from './routes/contact.js';
import { contentRoutes } from './routes/content.js';
import { healthRoutes } from './routes/health.js';
import { reposRoutes } from './routes/repos.js';
import { createResendDelivery, type ContactDelivery } from './services/contact.js';
import { createGithubService, type GithubService } from './services/github.js';

export const DEFAULT_CONTACT_RATE_LIMIT: ContactRateLimitOptions = {
    max: 5,
    timeWindow: '1 minute',
};

export interface BuildAppOptions {
    env: AppEnv;
    logger?: boolean;
    github?: GithubService;
    contactDelivery?: ContactDelivery;
    contactRateLimit?: ContactRateLimitOptions;
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
    const app = fastify({ logger: options.logger ?? false });

    await app.register(cors, { origin: options.env.frontendOrigins });
    await app.register(helmet);
    await app.register(rateLimit, { global: false });

    const github =
        options.github ??
        createGithubService({
            username: options.env.githubUsername,
            token: options.env.githubToken,
        });
    const contactDelivery =
        options.contactDelivery ??
        (options.env.contact ? createResendDelivery(options.env.contact) : undefined);

    app.setNotFoundHandler((_request, reply) => {
        reply.status(404).send({ success: false, error: 'Not found' });
    });

    app.setErrorHandler((error: FastifyError, request, reply) => {
        if (error instanceof ApiError) {
            reply.status(error.statusCode).send({ success: false, error: error.message });
            return;
        }

        if (
            typeof error.statusCode === 'number' &&
            error.statusCode >= 400 &&
            error.statusCode < 500
        ) {
            const message =
                error.statusCode === 429
                    ? 'Too many requests. Please try again later.'
                    : 'Invalid request';
            reply.status(error.statusCode).send({ success: false, error: message });
            return;
        }

        request.log.error({ err: error }, 'request failed');
        reply.status(500).send({ success: false, error: 'Internal server error' });
    });

    await app.register(healthRoutes);
    await app.register(contentRoutes);
    await app.register(reposRoutes, { github });
    await app.register(contactRoutes, {
        ...(contactDelivery ? { delivery: contactDelivery } : {}),
        rateLimit: options.contactRateLimit ?? DEFAULT_CONTACT_RATE_LIMIT,
    });

    return app;
}
