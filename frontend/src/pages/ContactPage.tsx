import { useState } from 'react';
import { Send, Mail, MapPin, Github, Linkedin, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/shared';
import { useApi, postApi } from '@/hooks';
import { Profile, ContactMessage } from '@/types';

export function ContactPage() {
    const { data: profile } = useApi<Profile>('/api/profile');
    const [formData, setFormData] = useState<ContactMessage>({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await postApi<null, ContactMessage>('/api/contact', formData);

            if (response.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setSubmitStatus('error');
                setErrorMessage(response.error || 'Failed to send message');
            }
        } catch {
            setSubmitStatus('error');
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const socialLinks = profile?.socialLinks || [
        { name: 'GitHub', url: 'https://github.com', icon: 'github' },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/javierguerradevelop/',
            icon: 'linkedin',
        },
    ];

    return (
        <div className='container mx-auto px-4 py-16 md:py-24'>
            <SectionHeader
                title='Get in Touch'
                subtitle="Have a question or want to work together? I'd love to hear from you."
                level={1}
            />

            <div className='grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto'>
                {/* Contact Info */}
                <div className='space-y-8 opacity-0 animate-fade-in'>
                    <Card className='bg-card/50 border-border/50'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Contact Information</CardTitle>
                            <CardDescription>
                                Feel free to reach out through any of these channels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {/* Email */}
                            <a
                                href={`mailto:${profile?.email || 'guerrajavierswe@att.net'}`}
                                className='flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                            >
                                <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors'>
                                    <Mail className='w-6 h-6 text-primary' />
                                </div>
                                <div>
                                    <p className='font-medium text-foreground'>Email</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {profile?.email || 'guerrajavierswe@att.net'}
                                    </p>
                                </div>
                            </a>

                            {/* Location */}
                            <div className='flex items-center gap-4 p-4 rounded-lg bg-muted/30'>
                                <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                                    <MapPin className='w-6 h-6 text-primary' />
                                </div>
                                <div>
                                    <p className='font-medium text-foreground'>Location</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {profile?.location || 'United States'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className='bg-card/50 border-border/50'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Connect With Me</CardTitle>
                            <CardDescription>Find me on social media</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='flex gap-3'>
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-12 h-12 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 group'
                                        aria-label={social.name}
                                    >
                                        {social.icon === 'github' && (
                                            <Github className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors' />
                                        )}
                                        {social.icon === 'linkedin' && (
                                            <Linkedin className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors' />
                                        )}
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className='bg-card/50 border-border/50 opacity-0 animate-fade-in animation-delay-150'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Send a Message</CardTitle>
                        <CardDescription>
                            Fill out the form below and I'll get back to you as soon as possible
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitStatus === 'success' ? (
                            <div className='text-center py-8 space-y-4'>
                                <div className='w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto'>
                                    <CheckCircle2 className='w-8 h-8 text-green-500' />
                                </div>
                                <div>
                                    <h3 className='font-semibold text-lg'>Message Sent!</h3>
                                    <p className='text-muted-foreground'>
                                        Thank you for reaching out. I'll get back to you soon.
                                    </p>
                                </div>
                                <Button variant='outline' onClick={() => setSubmitStatus('idle')}>
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className='space-y-6'>
                                <div className='grid sm:grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='name'>Name *</Label>
                                        <Input
                                            id='name'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder='Your name'
                                            required
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='email'>Email *</Label>
                                        <Input
                                            id='email'
                                            name='email'
                                            type='email'
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder='your@email.com'
                                            required
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='subject'>Subject</Label>
                                    <Input
                                        id='subject'
                                        name='subject'
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='message'>Message *</Label>
                                    <Textarea
                                        id='message'
                                        name='message'
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder='Your message...'
                                        rows={5}
                                        required
                                    />
                                </div>

                                {submitStatus === 'error' && (
                                    <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type='submit'
                                    className='w-full'
                                    variant='gradient'
                                    size='lg'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className='w-4 h-4 mr-2' />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
