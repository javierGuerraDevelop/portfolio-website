import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/errors.js';
import type { Repository } from '../schemas/repository.js';
import {
    createGithubService,
    readRateLimit,
    STALE_RESULTS_MESSAGE,
    type GraphqlRequest,
} from './github.js';

function makeNode(overrides: Record<string, unknown> = {}) {
    return {
        databaseId: 1,
        name: 'alpha',
        nameWithOwner: 'demo/alpha',
        description: 'Demo repository',
        url: 'https://github.com/demo/alpha',
        homepageUrl: null,
        primaryLanguage: { name: 'TypeScript' },
        stargazerCount: 5,
        forkCount: 1,
        watchers: { totalCount: 5 },
        issues: { totalCount: 2 },
        repositoryTopics: { nodes: [{ topic: { name: 'demo' } }] },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        pushedAt: '2024-02-01T00:00:00Z',
        isFork: false,
        isArchived: false,
        ...overrides,
    };
}

function makeResponse(nodes: unknown[]) {
    return { user: { pinnedItems: { nodes } } };
}

function makeRepo(): Repository {
    return {
        id: 99,
        name: 'fixture',
        full_name: 'demo/fixture',
        description: null,
        html_url: 'https://github.com/demo/fixture',
        clone_url: 'https://github.com/demo/fixture.git',
        language: null,
        stargazers_count: 0,
        forks_count: 0,
        watchers_count: 0,
        open_issues_count: 0,
        topics: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        pushed_at: '2024-01-01T00:00:00Z',
        fork: false,
        archived: false,
        homepage: null,
    };
}

function rateLimitError(resetAtSeconds: number) {
    return {
        status: 403,
        headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': String(resetAtSeconds),
        },
        errors: [{ type: 'RATE_LIMITED' }],
    };
}

describe('readRateLimit', () => {
    it('detects rate limits from status, headers, and GraphQL errors', () => {
        expect(readRateLimit({ status: 429 })).toMatchObject({ rateLimited: true });
        expect(readRateLimit(rateLimitError(2_000_000))).toEqual({
            rateLimited: true,
            resetAt: 2_000_000_000,
        });
        expect(readRateLimit({ errors: [{ type: 'RATE_LIMITED' }] })).toMatchObject({
            rateLimited: true,
        });
        expect(readRateLimit(new Error('boom'))).toMatchObject({ rateLimited: false });
    });
});

describe('createGithubService', () => {
    it('serves fixtures when no token or request is configured', async () => {
        const fixtures = [makeRepo()];
        const service = createGithubService({
            username: 'test-user',
            loadFixtures: () => fixtures,
        });

        await expect(service.listPinnedRepos()).resolves.toEqual({ repos: fixtures });
    });

    it('maps GraphQL nodes to the frontend Repository shape', async () => {
        const request: GraphqlRequest = vi.fn().mockResolvedValue(
            makeResponse([
                makeNode({
                    databaseId: 7,
                    name: 'alpha',
                    nameWithOwner: 'demo/alpha',
                    description: null,
                    homepageUrl: null,
                    primaryLanguage: null,
                    pushedAt: null,
                    isFork: true,
                    isArchived: true,
                }),
            ]),
        );
        const service = createGithubService({ username: 'test-user', token: 'token', request });

        const { repos } = await service.listPinnedRepos();

        expect(repos).toEqual([
            {
                id: 7,
                name: 'alpha',
                full_name: 'demo/alpha',
                description: null,
                html_url: 'https://github.com/demo/alpha',
                clone_url: 'https://github.com/demo/alpha.git',
                language: null,
                stargazers_count: 5,
                forks_count: 1,
                watchers_count: 5,
                open_issues_count: 2,
                topics: ['demo'],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-02-01T00:00:00Z',
                pushed_at: '2024-02-01T00:00:00Z',
                fork: true,
                archived: true,
                homepage: null,
            },
        ]);
    });

    it('caches fresh results and refreshes after the TTL', async () => {
        let nowMs = 1_000_000;
        const request: GraphqlRequest = vi.fn().mockResolvedValue(makeResponse([makeNode()]));
        const service = createGithubService({
            username: 'test-user',
            token: 'token',
            request,
            ttlMs: 500,
            now: () => nowMs,
        });

        await service.listPinnedRepos();
        await service.listPinnedRepos();
        expect(request).toHaveBeenCalledTimes(1);

        nowMs += 501;
        await service.listPinnedRepos();
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('serves stale cached results with a message when GitHub fails', async () => {
        let nowMs = 1_000_000;
        const request: GraphqlRequest = vi
            .fn()
            .mockResolvedValueOnce(makeResponse([makeNode()]))
            .mockRejectedValueOnce(new Error('upstream down'));
        const service = createGithubService({
            username: 'test-user',
            token: 'token',
            request,
            ttlMs: 500,
            now: () => nowMs,
        });

        const first = await service.listPinnedRepos();
        nowMs += 501;
        const second = await service.listPinnedRepos();

        expect(second.repos).toEqual(first.repos);
        expect(second.message).toBe(STALE_RESULTS_MESSAGE);
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('marks the service rate-limited and stops calling upstream while blocked', async () => {
        let nowMs = 1_000_000;
        const resetAtSeconds = Math.floor(nowMs / 1000) + 60;
        const request: GraphqlRequest = vi
            .fn()
            .mockResolvedValueOnce(makeResponse([makeNode()]))
            .mockRejectedValueOnce(rateLimitError(resetAtSeconds));
        const service = createGithubService({
            username: 'test-user',
            token: 'token',
            request,
            ttlMs: 500,
            now: () => nowMs,
        });

        await service.listPinnedRepos();
        nowMs += 501;

        const second = await service.listPinnedRepos();
        expect(second.message).toBe(STALE_RESULTS_MESSAGE);

        nowMs += 501;
        const third = await service.listPinnedRepos();
        expect(third.message).toBe(STALE_RESULTS_MESSAGE);
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('throws 429 when rate-limited without cached data', async () => {
        const request: GraphqlRequest = vi.fn().mockRejectedValue(rateLimitError(2_000_000_000));
        const service = createGithubService({ username: 'test-user', token: 'token', request });

        await expect(service.listPinnedRepos()).rejects.toMatchObject({ statusCode: 429 });
        await expect(service.listPinnedRepos()).rejects.toBeInstanceOf(ApiError);
    });

    it('throws 502 when the upstream fails without cached data', async () => {
        const request: GraphqlRequest = vi.fn().mockRejectedValue(new Error('boom'));
        const service = createGithubService({ username: 'test-user', token: 'token', request });

        await expect(service.listPinnedRepos()).rejects.toMatchObject({ statusCode: 502 });
    });

    it('rejects malformed upstream payloads', async () => {
        const request: GraphqlRequest = vi
            .fn()
            .mockResolvedValue({ user: { pinnedItems: { nodes: [{ name: 1 }] } } });
        const service = createGithubService({ username: 'test-user', token: 'token', request });

        await expect(service.listPinnedRepos()).rejects.toMatchObject({ statusCode: 502 });
    });
});
