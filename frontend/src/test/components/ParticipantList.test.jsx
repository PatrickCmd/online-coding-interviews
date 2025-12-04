import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParticipantList from '../../components/ParticipantList';

describe('ParticipantList', () => {
    const mockParticipants = [
        {
            id: 'user1',
            name: 'John Doe',
            role: 'interviewer',
            color: '#ff0000',
            isOnline: true
        },
        {
            id: 'user2',
            name: 'Jane Smith',
            role: 'candidate',
            color: '#00ff00',
            isOnline: true
        }
    ];

    it('should render participant count', () => {
        render(
            <ParticipantList
                participants={mockParticipants}
                currentUserId="user1"
            />
        );

        expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('should show zero participants when list is empty', () => {
        render(
            <ParticipantList
                participants={[]}
                currentUserId="user1"
            />
        );

        expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should only count online participants', () => {
        const participants = [
            { ...mockParticipants[0], isOnline: true },
            { ...mockParticipants[1], isOnline: false }
        ];

        render(
            <ParticipantList
                participants={participants}
                currentUserId="user1"
            />
        );

        expect(screen.getByText(/1/)).toBeInTheDocument();
    });

    it('should handle undefined participants', () => {
        render(
            <ParticipantList
                currentUserId="user1"
            />
        );

        expect(screen.getByText(/0/)).toBeInTheDocument();
    });
});
