import { z } from 'zod';

/**
 * Contact form body. `website` is an optional honeypot: when it is filled the API
 * returns a silent success without delivering anything.
 */
export const contactRequestSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(254),
    subject: z.string().max(150),
    message: z.string().trim().min(1).max(5000),
    website: z.string().max(200).optional(),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
