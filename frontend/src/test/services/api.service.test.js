import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiService from '../../services/api.service';

describe('ApiService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('createSession', () => {
        it('should create a session successfully', async () => {
            const sessionData = {
                id: 'test123',
                code: 'console.log("test")',
                language: 'javascript'
            };

            const result = await apiService.createSession(sessionData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(sessionData);
        });
    });

    describe('getSession', () => {
        it('should retrieve an existing session', async () => {
            const sessionData = {
                id: 'test123',
                code: 'console.log("test")',
                language: 'javascript'
            };

            // Store session first
            const sessions = [sessionData];
            apiService.saveStoredSessions(sessions);

            const result = await apiService.getSession('test123');

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('test123');
        });

        it('should return error for non-existent session', async () => {
            const result = await apiService.getSession('nonexistent');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session not found');
        });
    });

    describe('updateSession', () => {
        it('should update session successfully', async () => {
            const sessionData = {
                id: 'test123',
                code: 'console.log("test")',
                language: 'javascript'
            };

            apiService.saveStoredSessions([sessionData]);

            const result = await apiService.updateSession('test123', {
                code: 'console.log("updated")'
            });

            expect(result.success).toBe(true);
            expect(result.data.code).toBe('console.log("updated")');
        });

        it('should return error when updating non-existent session', async () => {
            const result = await apiService.updateSession('nonexistent', {
                code: 'test'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session not found');
        });
    });

    describe('addParticipant', () => {
        it('should add participant to session', async () => {
            const sessionData = {
                id: 'test123',
                participants: []
            };

            apiService.saveStoredSessions([sessionData]);

            const participant = {
                id: 'user1',
                name: 'Test User',
                role: 'interviewer'
            };

            const result = await apiService.addParticipant('test123', participant);

            expect(result.success).toBe(true);
            expect(result.data.participants).toHaveLength(1);
            expect(result.data.participants[0].name).toBe('Test User');
        });

        it('should update existing participant', async () => {
            const sessionData = {
                id: 'test123',
                participants: [
                    { id: 'user1', name: 'Old Name', role: 'interviewer' }
                ]
            };

            apiService.saveStoredSessions([sessionData]);

            const updatedParticipant = {
                id: 'user1',
                name: 'New Name',
                role: 'interviewer'
            };

            const result = await apiService.addParticipant('test123', updatedParticipant);

            expect(result.success).toBe(true);
            expect(result.data.participants).toHaveLength(1);
            expect(result.data.participants[0].name).toBe('New Name');
        });
    });

    describe('removeParticipant', () => {
        it('should remove participant from session', async () => {
            const sessionData = {
                id: 'test123',
                participants: [
                    { id: 'user1', name: 'User 1' },
                    { id: 'user2', name: 'User 2' }
                ]
            };

            apiService.saveStoredSessions([sessionData]);

            const result = await apiService.removeParticipant('test123', 'user1');

            expect(result.success).toBe(true);
            expect(result.data.participants).toHaveLength(1);
            expect(result.data.participants[0].id).toBe('user2');
        });
    });

    describe('saveCodeSnapshot', () => {
        it('should save code and language to session', async () => {
            const sessionData = {
                id: 'test123',
                code: '',
                language: 'javascript'
            };

            apiService.saveStoredSessions([sessionData]);

            const result = await apiService.saveCodeSnapshot(
                'test123',
                'console.log("hello")',
                'python'
            );

            expect(result.success).toBe(true);
            expect(result.data.code).toBe('console.log("hello")');
            expect(result.data.language).toBe('python');
        });
    });

    describe('localStorage operations', () => {
        it('should save and retrieve sessions from localStorage', () => {
            const sessions = [
                { id: 'session1', code: 'test1' },
                { id: 'session2', code: 'test2' }
            ];

            apiService.saveStoredSessions(sessions);
            const retrieved = apiService.getStoredSessions();

            expect(retrieved).toHaveLength(2);
            expect(retrieved[0].id).toBe('session1');
        });

        it('should return empty array when localStorage is empty', () => {
            const sessions = apiService.getStoredSessions();
            expect(sessions).toEqual([]);
        });
    });
});
