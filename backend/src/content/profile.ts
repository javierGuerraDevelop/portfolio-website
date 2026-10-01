import { profileSchema, type Profile } from '../schemas/profile.js';

/**
 * Static profile content served by `GET /api/profile` (D-006).
 *
 * PLACEHOLDER CONTENT: seeded from the public values already present in the
 * frontend fallbacks. Fill in the real skills, experience, and education
 * before deployment, then keep the file in sync with the resume.
 */
const content: Profile = {
    name: 'Javier Guerra',
    title: 'Software Engineer',
    email: 'guerrajavierswe@att.net',
    location: 'United States',
    bio: 'Software engineer passionate about low-level, high-performance computing with modern C++. I build low latency software with C++ and backend services with Golang.',
    shortBio:
        'Software engineer passionate about low-level, high-performance computing with modern C++. I build low latency software with C++ and backend services with Golang.',
    skills: [],
    socialLinks: [
        { name: 'GitHub', url: 'https://github.com/javierGuerraDevelop', icon: 'github' },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/javierguerradevelop/',
            icon: 'linkedin',
        },
    ],
    experience: [],
    education: [],
};

export const profile: Profile = profileSchema.parse(content);
