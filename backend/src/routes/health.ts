import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
    app.get('/api/health', async () => ({ success: true, data: { status: 'ok' as const } }));
};
