import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface ProfileImageProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
};

export function ProfileImage({ src, alt, size = 'lg', className }: ProfileImageProps) {
    return (
        <div
            className={cn(
                'relative rounded-2xl overflow-hidden gradient-border glow',
                sizeClasses[size],
                className,
            )}
        >
            <div className='absolute inset-[1px] rounded-2xl overflow-hidden bg-background'>
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className='w-full h-full object-cover'
                        loading='lazy'
                    />
                ) : (
                    <div className='w-full h-full bg-muted flex items-center justify-center'>
                        <User className='w-1/3 h-1/3 text-muted-foreground' />
                    </div>
                )}
            </div>
        </div>
    );
}
