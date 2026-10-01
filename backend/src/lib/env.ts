import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const rawEnvSchema = z.object({
    PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(8080)),
    FRONTEND_ORIGIN: z.string().min(1),
    GITHUB_USERNAME: z.string().min(1),
    GITHUB_TOKEN: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CONTACT_TO: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CONTACT_FROM: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
});

export interface ContactConfig {
    apiKey: string;
    to: string;
    from: string;
}

export interface AppEnv {
    port: number;
    frontendOrigins: string[];
    githubUsername: string;
    githubToken?: string;
    contact?: ContactConfig;
}

/**
 * Reads and validates process configuration. Throws with the offending field
 * names when required configuration is missing or malformed (fail fast).
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
    const parsed = rawEnvSchema.safeParse(source);
    if (!parsed.success) {
        const fields = parsed.error.issues
            .map((issue) => issue.path.join('.') || '(root)')
            .join(', ');
        throw new Error(`Invalid environment configuration: ${fields}`);
    }

    const {
        PORT,
        FRONTEND_ORIGIN,
        GITHUB_USERNAME,
        GITHUB_TOKEN,
        RESEND_API_KEY,
        CONTACT_TO,
        CONTACT_FROM,
    } = parsed.data;

    const contact =
        RESEND_API_KEY && CONTACT_TO && CONTACT_FROM
            ? { apiKey: RESEND_API_KEY, to: CONTACT_TO, from: CONTACT_FROM }
            : undefined;

    if (!contact && (RESEND_API_KEY ?? CONTACT_TO ?? CONTACT_FROM)) {
        throw new Error(
            'Invalid environment configuration: set RESEND_API_KEY, CONTACT_TO, and CONTACT_FROM together',
        );
    }

    return {
        port: PORT,
        frontendOrigins: FRONTEND_ORIGIN.split(',')
            .map((origin) => origin.trim())
            .filter((origin) => origin.length > 0),
        githubUsername: GITHUB_USERNAME,
        ...(GITHUB_TOKEN ? { githubToken: GITHUB_TOKEN } : {}),
        ...(contact ? { contact } : {}),
    };
}
