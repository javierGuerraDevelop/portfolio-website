export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    clone_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    open_issues_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
    pushed_at: string;
    fork: boolean;
    archived: boolean;
    homepage: string | null;
}

export interface Skill {
    category: string;
    items: string[];
}

export interface Social {
    name: string;
    url: string;
    icon: string;
}

export interface Job {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    highlights: string[];
}

export interface School {
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
}

export interface Profile {
    name: string;
    title: string;
    email: string;
    location: string;
    bio: string;
    shortBio: string;
    skills: Skill[];
    socialLinks: Social[];
    experience: Job[];
    education: School[];
}

export interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface APIResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
