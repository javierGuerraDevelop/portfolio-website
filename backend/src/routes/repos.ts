import type { FastifyPluginAsync } from 'fastify';
import type { GithubService } from '../services/github.js';

export interface ReposRoutesOptions {
    github: GithubService;
}

export const reposRoutes: FastifyPluginAsync<ReposRoutesOptions> = async (app, options) => {
    app.get('/api/repos', async () => {
        const { repos, message } = await options.github.listPinnedRepos();
        return message ? { success: true, message, data: repos } : { success: true, data: repos };
    });
};
