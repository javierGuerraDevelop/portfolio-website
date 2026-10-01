import { Briefcase, GraduationCap, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SectionHeader, SkillCard, LoadingSpinner, ErrorMessage } from '@/components/shared';
import { useApi } from '@/hooks';
import { Profile } from '@/types';

export function AboutPage() {
    const { data: profile, loading, error, refetch } = useApi<Profile>('/api/profile');

    if (loading) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <LoadingSpinner size='lg' text='Loading profile...' />
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className='container mx-auto px-4 py-16 md:py-24'>
            {/* Hero Section */}
            <section className='mb-20'>
                <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-start'>
                    {/* Resume Preview */}
                    <div className='flex flex-col items-center gap-4 opacity-0 animate-fade-in'>
                        <div className='relative w-full max-w-md'>
                            <div className='absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl' />
                            <div className='relative z-10 rounded-2xl overflow-hidden border border-border shadow-2xl bg-white'>
                                <img
                                    src='/resume.png'
                                    alt='Resume Preview'
                                    className='w-full h-auto'
                                />
                            </div>
                        </div>
                        {/* Download Button */}
                        <Button asChild variant='gradient' size='lg' className='mt-4'>
                            <a href='/resume.pdf' download='Javier_Guerra_Resume.pdf'>
                                <Download className='w-5 h-5 mr-2' />
                                Download Resume
                            </a>
                        </Button>
                    </div>

                    {/* Content */}
                    <div className='space-y-6'>
                        <div className='space-y-2 opacity-0 animate-fade-in animation-delay-150'>
                            <p className='text-primary font-mono text-sm'>About Me</p>
                            <h1 className='text-4xl md:text-5xl font-display font-bold'>
                                <span className='gradient-text'>
                                    {profile?.name || 'Javier Guerra'}
                                </span>
                            </h1>
                            <p className='text-xl text-muted-foreground'>
                                {profile?.title || 'Software Engineer'}
                            </p>
                        </div>

                        <div className='prose prose-invert max-w-none opacity-0 animate-fade-in animation-delay-300'>
                            {profile?.bio?.split('\n\n').map((paragraph, index) => (
                                <p key={index} className='text-muted-foreground leading-relaxed'>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Separator className='my-16' />

            {/* Skills Section */}
            <section className='mb-20'>
                <SectionHeader
                    title='Skills & Technologies'
                    subtitle='Technologies and tools I work with on a daily basis'
                />
                <div className='flex flex-wrap justify-center gap-6'>
                    {profile?.skills?.map((skill, index) => (
                        <div
                            key={skill.category}
                            className='w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]'
                        >
                            <SkillCard skill={skill} index={index} />
                        </div>
                    ))}
                </div>
            </section>

            <Separator className='my-16' />

            {/* Experience Section */}
            {profile?.experience && profile.experience.length > 0 && (
                <>
                    <section className='mb-20'>
                        <SectionHeader
                            title='Work Experience'
                            subtitle='My professional journey and accomplishments'
                        />
                        <div className='space-y-6'>
                            {profile.experience.map((job, index) => (
                                <Card
                                    key={`${job.company}-${job.position}`}
                                    className='bg-card/50 border-border/50 opacity-0 animate-fade-in-up'
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardHeader>
                                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                                                    <Briefcase className='w-6 h-6 text-primary' />
                                                </div>
                                                <div>
                                                    <CardTitle className='text-lg'>
                                                        {job.position}
                                                    </CardTitle>
                                                    <p className='text-muted-foreground'>
                                                        {job.company}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant='secondary'
                                                className='flex items-center gap-1 w-fit'
                                            >
                                                <Calendar className='w-3 h-3' />
                                                {job.startDate} — {job.endDate}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-muted-foreground mb-4'>
                                            {job.description}
                                        </p>
                                        {job.highlights && job.highlights.length > 0 && (
                                            <ul className='space-y-2'>
                                                {job.highlights.map((highlight, i) => (
                                                    <li
                                                        key={i}
                                                        className='flex items-start gap-2 text-sm text-muted-foreground'
                                                    >
                                                        <span className='w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0' />
                                                        {highlight}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                    <Separator className='my-16' />
                </>
            )}

            {/* Education Section */}
            {profile?.education && profile.education.length > 0 && (
                <section>
                    <SectionHeader
                        title='Education'
                        subtitle='Academic background and qualifications'
                    />
                    <div className='space-y-6'>
                        {profile.education.map((school, index) => (
                            <Card
                                key={`${school.institution}-${school.degree}`}
                                className='bg-card/50 border-border/50 opacity-0 animate-fade-in-up'
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardHeader>
                                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                                                <GraduationCap className='w-6 h-6 text-primary' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-lg'>
                                                    {school.degree}
                                                </CardTitle>
                                                <p className='text-muted-foreground'>
                                                    {school.institution}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant='secondary'
                                            className='flex items-center gap-1 w-fit'
                                        >
                                            <Calendar className='w-3 h-3' />
                                            {school.startYear} — {school.endYear}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-muted-foreground'>
                                        Field of Study: {school.field}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
