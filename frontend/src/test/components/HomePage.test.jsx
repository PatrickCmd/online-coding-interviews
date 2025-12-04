import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../components/HomePage';

// Mock useSession hook
vi.mock('../../hooks/useSession', () => ({
    useSession: () => ({
        createSession: vi.fn().mockResolvedValue({
            success: true,
            session: { id: 'test123' },
            link: 'http://localhost:3000/interview/test123'
        }),
        joinSession: vi.fn().mockResolvedValue({ success: true }),
        loading: false,
        error: null
    })
}));

describe('HomePage', () => {
    const renderHomePage = () => {
        return render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
    };

    it('should render the home page', () => {
        renderHomePage();

        expect(screen.getByText(/CodeInterview/i)).toBeInTheDocument();
        expect(screen.getByText(/Real-time collaborative coding interviews/i)).toBeInTheDocument();
    });

    it('should display create interview button', () => {
        renderHomePage();

        const createButton = screen.getByRole('button', { name: /Create Interview Session/i });
        expect(createButton).toBeInTheDocument();
    });

    it('should display feature cards', () => {
        renderHomePage();

        expect(screen.getByText(/Real-time Collaboration/i)).toBeInTheDocument();
        expect(screen.getByText(/Syntax Highlighting/i)).toBeInTheDocument();
        expect(screen.getByText(/Code Execution/i)).toBeInTheDocument();
    });

    it('should show join interview option', () => {
        renderHomePage();

        const joinButton = screen.getByRole('button', { name: /Join Existing Interview/i });
        expect(joinButton).toBeInTheDocument();
    });

    it('should toggle join input when join button clicked', () => {
        renderHomePage();

        const joinButton = screen.getByRole('button', { name: /Join Existing Interview/i });
        fireEvent.click(joinButton);

        expect(screen.getByPlaceholderText(/Enter session ID/i)).toBeInTheDocument();
    });
});
