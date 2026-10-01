import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className='min-h-screen flex flex-col'>
            {/* Background effects */}
            <div className='fixed inset-0 -z-10 overflow-hidden'>
                {/* Gradient orbs */}
                <div className='absolute top-0 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-float' />
                <div className='absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-float animation-delay-300' />
                <div className='absolute bottom-0 left-1/3 w-72 h-72 bg-pink-500/15 rounded-full blur-[100px] animate-float animation-delay-600' />

                {/* Grid pattern */}
                <div
                    className='absolute inset-0 opacity-[0.02]'
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px',
                    }}
                />
            </div>

            <Navbar />
            <main className='flex-1 pt-16 md:pt-20'>{children}</main>
            <Footer />
        </div>
    );
}
