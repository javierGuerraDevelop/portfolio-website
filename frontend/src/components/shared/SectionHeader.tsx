import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    align?: 'left' | 'center';
    level?: 1 | 2;
}

export function SectionHeader({
    title,
    subtitle,
    className,
    align = 'center',
    level = 2,
}: SectionHeaderProps) {
    const Heading = level === 1 ? 'h1' : 'h2';

    return (
        <div className={cn('space-y-4 mb-12', align === 'center' && 'text-center', className)}>
            <Heading className='text-3xl md:text-4xl font-display font-bold'>
                <span className='gradient-text'>{title}</span>
            </Heading>
            {subtitle && (
                <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{subtitle}</p>
            )}
        </div>
    );
}
