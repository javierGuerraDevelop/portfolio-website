import { z } from 'zod';

export const skillSchema = z.object({
    category: z.string(),
    items: z.array(z.string()),
});

export const socialLinkSchema = z.object({
    name: z.string(),
    url: z.string(),
    icon: z.string(),
});

export const jobSchema = z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
});

export const schoolSchema = z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startYear: z.string(),
    endYear: z.string(),
});

export const profileSchema = z.object({
    name: z.string(),
    title: z.string(),
    email: z.string(),
    location: z.string(),
    bio: z.string(),
    shortBio: z.string(),
    skills: z.array(skillSchema),
    socialLinks: z.array(socialLinkSchema),
    experience: z.array(jobSchema),
    education: z.array(schoolSchema),
});

export type Skill = z.infer<typeof skillSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Job = z.infer<typeof jobSchema>;
export type School = z.infer<typeof schoolSchema>;
export type Profile = z.infer<typeof profileSchema>;
