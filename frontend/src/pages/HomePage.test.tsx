import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

vi.mock('@/hooks', () => ({
    useApi: () => ({ data: null, loading: false, error: null, refetch: vi.fn() }),
    postApi: vi.fn(),
}));

function renderHome() {
    return render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <HomePage />
        </MemoryRouter>,
    );
}

describe('HomePage', () => {
    it('renders the fallback hero content when profile data is unavailable', () => {
        renderHome();

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Javier Guerra');
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('links to the repos and contact pages', () => {
        renderHome();

        expect(screen.getByRole('link', { name: /view my work/i })).toHaveAttribute(
            'href',
            '/repos',
        );
        expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute(
            'href',
            '/contact',
        );
    });
});
