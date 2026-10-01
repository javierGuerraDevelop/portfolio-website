import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { repositorySchema, type Repository } from '../schemas/repository.js';

const fixtureReposSchema = z.array(repositorySchema);

/**
 * Seeded GitHub payloads used when no token is configured and by tests.
 * Path works both from `src/` (tsx, vitest) and `dist/` (built server).
 */
export function loadFixtureRepos(): Repository[] {
    const path = new URL('../../fixtures/pinned-repos.json', import.meta.url);
    const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return fixtureReposSchema.parse(raw);
}
