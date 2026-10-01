import { graphql } from '@octokit/graphql';
import { z } from 'zod';
import { TtlCache } from '../lib/cache.js';
import { ApiError } from '../lib/errors.js';
import { loadFixtureRepos } from '../lib/fixtures.js';
import { repositorySchema, type Repository } from '../schemas/repository.js';

/** How long a successful fetch stays fresh before a refresh is attempted. */
export const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;

export const STALE_RESULTS_MESSAGE = 'Serving cached results; GitHub is currently unavailable';

const PINNED_REPOS_QUERY = `
    query PinnedRepositories($login: String!, $count: Int!) {
        user(login: $login) {
            pinnedItems(first: $count, types: REPOSITORY) {
                nodes {
                    ... on Repository {
                        databaseId
                        name
                        nameWithOwner
                        description
                        url
                        homepageUrl
                        primaryLanguage {
                            name
                        }
                        stargazerCount
                        forkCount
                        watchers {
                            totalCount
                        }
                        issues(states: OPEN) {
                            totalCount
                        }
                        repositoryTopics(first: 20) {
                            nodes {
                                topic {
                                    name
                                }
                            }
                        }
                        createdAt
                        updatedAt
                        pushedAt
                        isFork
                        isArchived
                    }
                }
            }
        }
    }
`;

const pinnedRepoNodeSchema = z.object({
    databaseId: z.number().int(),
    name: z.string(),
    nameWithOwner: z.string(),
    description: z.string().nullable(),
    url: z.string(),
    homepageUrl: z.string().nullable(),
    primaryLanguage: z.object({ name: z.string() }).nullable(),
    stargazerCount: z.number().int(),
    forkCount: z.number().int(),
    watchers: z.object({ totalCount: z.number().int() }),
    issues: z.object({ totalCount: z.number().int() }),
    repositoryTopics: z.object({
        nodes: z.array(z.object({ topic: z.object({ name: z.string() }) })),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
    pushedAt: z.string().nullable(),
    isFork: z.boolean(),
    isArchived: z.boolean(),
});

const pinnedReposResponseSchema = z.object({
    user: z
        .object({
            pinnedItems: z.object({ nodes: z.array(pinnedRepoNodeSchema) }),
        })
        .nullable(),
});

export type PinnedRepoNode = z.infer<typeof pinnedRepoNodeSchema>;

export function mapPinnedRepo(node: PinnedRepoNode): Repository {
    return repositorySchema.parse({
        id: node.databaseId,
        name: node.name,
        full_name: node.nameWithOwner,
        description: node.description,
        html_url: node.url,
        clone_url: `${node.url}.git`,
        language: node.primaryLanguage?.name ?? null,
        stargazers_count: node.stargazerCount,
        forks_count: node.forkCount,
        watchers_count: node.watchers.totalCount,
        open_issues_count: node.issues.totalCount,
        topics: node.repositoryTopics.nodes.map((entry) => entry.topic.name),
        created_at: node.createdAt,
        updated_at: node.updatedAt,
        pushed_at: node.pushedAt ?? node.updatedAt,
        fork: node.isFork,
        archived: node.isArchived,
        homepage: node.homepageUrl,
    });
}

export type GraphqlRequest = (
    query: string,
    variables: Record<string, unknown>,
) => Promise<unknown>;

export interface GithubServiceOptions {
    username: string;
    token?: string;
    ttlMs?: number;
    now?: () => number;
    request?: GraphqlRequest;
    loadFixtures?: () => Repository[];
}

export interface ReposResult {
    repos: Repository[];
    message?: string;
}

export interface GithubService {
    listPinnedRepos(): Promise<ReposResult>;
}

export interface RateLimitInfo {
    rateLimited: boolean;
    resetAt?: number;
}

/**
 * Reads rate-limit details from an Octokit GraphQL error. The error carries the
 * upstream headers, which is where the primary rate-limit state lives.
 */
export function readRateLimit(error: unknown): RateLimitInfo {
    if (typeof error !== 'object' || error === null) {
        return { rateLimited: false };
    }

    const candidate = error as {
        status?: number;
        headers?: Record<string, unknown>;
        errors?: Array<{ type?: string }>;
    };
    const headers = candidate.headers ?? {};
    const remainingHeader = headers['x-ratelimit-remaining'];
    const remaining =
        typeof remainingHeader === 'string' || typeof remainingHeader === 'number'
            ? Number(remainingHeader)
            : Number.NaN;
    const resetHeader = Number(headers['x-ratelimit-reset'] ?? 0);

    const rateLimited =
        candidate.status === 429 ||
        remaining === 0 ||
        candidate.errors?.some((entry) => entry.type === 'RATE_LIMITED') === true;

    return { rateLimited, ...(resetHeader > 0 ? { resetAt: resetHeader * 1000 } : {}) };
}

/**
 * Pinned repositories with an in-memory TTL cache and serve-stale-on-failure
 * (D-004). Tokenless runs serve fixtures; while a rate limit is active the
 * service avoids hammering the upstream and serves the last known list instead.
 */
export function createGithubService(options: GithubServiceOptions): GithubService {
    const now = options.now ?? Date.now;
    const cache = new TtlCache<Repository[]>(options.ttlMs ?? GITHUB_CACHE_TTL_MS, now);
    const loadFixtures = options.loadFixtures ?? loadFixtureRepos;
    const useFixtures = !options.token && !options.request;

    const request: GraphqlRequest =
        options.request ??
        ((query, variables) =>
            graphql(query, {
                ...variables,
                headers: {
                    authorization: `token ${options.token ?? ''}`,
                    'user-agent': 'portfolio-backend',
                },
            }) as Promise<unknown>);

    let blockedUntil = 0;

    async function fetchPinnedRepos(): Promise<Repository[]> {
        const response = pinnedReposResponseSchema.parse(
            await request(PINNED_REPOS_QUERY, { login: options.username, count: 6 }),
        );
        const nodes = response.user?.pinnedItems.nodes ?? [];
        return nodes.map(mapPinnedRepo);
    }

    return {
        async listPinnedRepos(): Promise<ReposResult> {
            if (useFixtures) {
                return { repos: loadFixtures() };
            }

            const cached = cache.get();
            if (cached?.fresh) {
                return { repos: cached.value };
            }

            if (blockedUntil > now()) {
                if (cached) {
                    return { repos: cached.value, message: STALE_RESULTS_MESSAGE };
                }
                throw new ApiError(429, 'GitHub rate limit exceeded');
            }

            try {
                const repos = await fetchPinnedRepos();
                cache.set(repos);
                blockedUntil = 0;
                return { repos };
            } catch (error) {
                const rateLimit = readRateLimit(error);
                if (rateLimit.rateLimited) {
                    blockedUntil = rateLimit.resetAt ?? now() + 60_000;
                }

                const stale = cache.get();
                if (stale) {
                    return { repos: stale.value, message: STALE_RESULTS_MESSAGE };
                }
                if (rateLimit.rateLimited) {
                    throw new ApiError(429, 'GitHub rate limit exceeded');
                }
                throw new ApiError(502, 'GitHub is currently unavailable');
            }
        },
    };
}
