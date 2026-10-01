import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorMessage({
    title = 'Something went wrong',
    message,
    onRetry,
    className,
}: ErrorMessageProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-4 p-8 text-center',
                className,
            )}
        >
            <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
                <AlertCircle className='w-8 h-8 text-destructive' />
            </div>
            <div className='space-y-2'>
                <h3 className='font-semibold text-lg'>{title}</h3>
                <p className='text-muted-foreground max-w-md'>{message}</p>
            </div>
            {onRetry && (
                <Button onClick={onRetry} variant='outline' className='gap-2'>
                    <RefreshCw className='w-4 h-4' />
                    Try Again
                </Button>
            )}
        </div>
    );
}
