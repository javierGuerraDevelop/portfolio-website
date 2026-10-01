import type { FastifyPluginAsync } from 'fastify';
import { profile } from '../content/profile.js';

export const contentRoutes: FastifyPluginAsync = async (app) => {
    app.get('/api/profile', async () => ({ success: true, data: profile }));
};
