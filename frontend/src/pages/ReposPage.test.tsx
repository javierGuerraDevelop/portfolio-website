import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReposPage } from './ReposPage';
import type { Repository } from '@/types';

const { useApiMock } = vi.hoisted(() => ({ useApiMock: vi.fn() }));

vi.mock('@/hooks', () => ({
    useApi: useApiMock,
    postApi: vi.fn(),
}));

function makeRepo(overrides: Partial<Repository> = {}): Repository {
    return {
        id: 1,
        name: 'alpha',
        full_name: 'javier/alpha',
        description: 'Demo repository',
        html_url: 'https://github.com/javier/alpha',
        clone_url: 'https://github.com/javier/alpha.git',
        language: 'TypeScript',
        stargazers_count: 3,
        forks_count: 1,
        watchers_count: 3,
        open_issues_count: 0,
        topics: ['demo'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-01T00:00:00Z',
        pushed_at: '2024-06-01T00:00:00Z',
        fork: false,
        archived: false,
        homepage: null,
        ...overrides,
    };
}

function renderRepos() {
    return render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ReposPage />
        </MemoryRouter>,
    );
}

describe('ReposPage', () => {
    beforeEach(() => {
        useApiMock.mockReset();
    });

    it('shows skeleton placeholders while loading', () => {
        useApiMock.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });

        const { container } = renderRepos();

        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
        expect(screen.queryByText(/no repositories found/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/showing .* repositories/i)).not.toBeInTheDocument();
    });

    it('renders the repositories returned by the API', () => {
        useApiMock.mockReturnValue({
            data: [
                makeRepo(),
                makeRepo({ id: 2, name: 'beta', description: 'Second repo', language: 'Go' }),
            ],
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        renderRepos();

        expect(
            screen.getByRole('heading', { level: 1, name: 'GitHub Repositories' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'alpha' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'beta' })).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 2 repositories')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View alpha on GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/javier/alpha',
        );
    });

    it('shows the empty state when the API returns no repositories', () => {
        useApiMock.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

        renderRepos();

        expect(screen.getByText('No repositories found')).toBeInTheDocument();
        expect(screen.getByText(/check back later for new projects/i)).toBeInTheDocument();
    });

    it('shows the error state with a retry action', () => {
        const refetch = vi.fn();
        useApiMock.mockReturnValue({
            data: null,
            loading: false,
            error: 'Failed to load repositories',
            refetch,
        });

        renderRepos();

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Failed to load repositories')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
