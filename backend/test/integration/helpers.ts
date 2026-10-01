import { buildApp, type BuildAppOptions } from '../../src/app.js';
import type { AppEnv } from '../../src/lib/env.js';
import type { ContactRequest } from '../../src/schemas/contact.js';
import type { Repository } from '../../src/schemas/repository.js';
import type { ContactDelivery } from '../../src/services/contact.js';
import type { GithubService, ReposResult } from '../../src/services/github.js';

export function makeEnv(overrides: Partial<AppEnv> = {}): AppEnv {
    return {
        port: 8080,
        frontendOrigins: ['http://localhost:5173'],
        githubUsername: 'test-user',
        ...overrides,
    };
}

export function makeGithub(result: ReposResult | (() => Promise<ReposResult>)): GithubService {
    return {
        listPinnedRepos: typeof result === 'function' ? result : async () => result,
    };
}

export function makeDelivery(): { delivery: ContactDelivery; sent: ContactRequest[] } {
    const sent: ContactRequest[] = [];
    return {
        sent,
        delivery: {
            async send(message: ContactRequest): Promise<void> {
                sent.push(message);
            },
        },
    };
}

export function makeApp(overrides: Partial<BuildAppOptions> = {}) {
    return buildApp({ env: makeEnv(), ...overrides });
}

export function makeRepo(overrides: Partial<Repository> = {}): Repository {
    return {
        id: 1,
        name: 'alpha',
        full_name: 'demo/alpha',
        description: 'Demo repository',
        html_url: 'https://github.com/demo/alpha',
        clone_url: 'https://github.com/demo/alpha.git',
        language: 'TypeScript',
        stargazers_count: 3,
        forks_count: 1,
        watchers_count: 3,
        open_issues_count: 0,
        topics: ['demo'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-01T00:00:00Z',
        pushed_at: '2024-06-01T00:00:00Z',
        fork: false,
        archived: false,
        homepage: null,
        ...overrides,
    };
}
