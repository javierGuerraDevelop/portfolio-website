import { z } from 'zod';

/** Exactly the 19 fields the frontend declares in `frontend/src/types/index.ts`. */
export const repositorySchema = z.object({
    id: z.number().int(),
    name: z.string(),
    full_name: z.string(),
    description: z.string().nullable(),
    html_url: z.string(),
    clone_url: z.string(),
    language: z.string().nullable(),
    stargazers_count: z.number().int(),
    forks_count: z.number().int(),
    watchers_count: z.number().int(),
    open_issues_count: z.number().int(),
    topics: z.array(z.string()),
    created_at: z.string(),
    updated_at: z.string(),
    pushed_at: z.string(),
    fork: z.boolean(),
    archived: z.boolean(),
    homepage: z.string().nullable(),
});

export type Repository = z.infer<typeof repositorySchema>;
