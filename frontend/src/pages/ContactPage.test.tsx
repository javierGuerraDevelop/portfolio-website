import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactPage } from './ContactPage';

const { postApiMock } = vi.hoisted(() => ({ postApiMock: vi.fn() }));

vi.mock('@/hooks', () => ({
    useApi: () => ({ data: null, loading: false, error: null, refetch: vi.fn() }),
    postApi: postApiMock,
}));

function renderContact() {
    return render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ContactPage />
        </MemoryRouter>,
    );
}

function fillForm() {
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^subject/i), { target: { value: 'Project inquiry' } });
    fireEvent.change(screen.getByLabelText(/^message/i), {
        target: { value: 'Hello from the test suite.' },
    });
}

describe('ContactPage', () => {
    beforeEach(() => {
        postApiMock.mockReset();
    });

    it('submits the form and shows the success state', async () => {
        postApiMock.mockResolvedValue({ success: true, data: null });

        renderContact();
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() =>
            expect(postApiMock).toHaveBeenCalledWith('/api/contact', {
                name: 'Jane Doe',
                email: 'jane@example.com',
                subject: 'Project inquiry',
                message: 'Hello from the test suite.',
            }),
        );
        expect(await screen.findByRole('heading', { name: /message sent/i })).toBeInTheDocument();
    });

    it('shows the validation error returned by the backend', async () => {
        postApiMock.mockResolvedValue({
            success: false,
            error: 'Please enter a valid email address',
        });

        renderContact();
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });
});
