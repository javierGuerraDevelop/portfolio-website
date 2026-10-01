import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
    return (
        <div className='min-h-[calc(100vh-5rem)] flex items-center justify-center'>
            <div className='container mx-auto px-4 text-center'>
                <div className='space-y-6 max-w-md mx-auto'>
                    {/* 404 */}
                    <div className='relative'>
                        <span className='text-[150px] md:text-[200px] font-display font-bold gradient-text opacity-20'>
                            404
                        </span>
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <h1 className='text-4xl md:text-5xl font-display font-bold gradient-text'>
                                Page Not Found
                            </h1>
                        </div>
                    </div>

                    <p className='text-muted-foreground text-lg'>
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Button asChild variant='gradient' size='lg'>
                            <Link to='/'>
                                <Home className='w-4 h-4 mr-2' />
                                Go Home
                            </Link>
                        </Button>
                        <Button variant='outline' size='lg' onClick={() => window.history.back()}>
                            <ArrowLeft className='w-4 h-4 mr-2' />
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
