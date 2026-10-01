import { z } from 'zod';

/** Error envelope returned for every failure response. */
export const errorEnvelopeSchema = z.object({
    success: z.literal(false),
    message: z.string().optional(),
    error: z.string(),
});

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

/**
 * Success envelope returned by every normal endpoint. `message` carries optional
 * notices, such as repositories served from a stale cache.
 */
export const successEnvelopeSchema = <T extends z.ZodType>(data: T) =>
    z.object({
        success: z.literal(true),
        message: z.string().optional(),
        data,
    });

export type SuccessEnvelope<T> = {
    success: true;
    message?: string;
    data: T;
};
