import { describe, it, expect, beforeEach, vi } from 'vitest';
import sessionService from '../../services/session.service';
import apiService from '../../services/api.service';

describe('SessionService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('createSession', () => {
        it('should create a new session with creator info', async () => {
            const creatorInfo = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const result = await sessionService.createSession(creatorInfo);

            expect(result.success).toBe(true);
            expect(result.session).toBeDefined();
            expect(result.session.id).toMatch(/^[a-f0-9]{8}$/);
            expect(result.session.participants).toHaveLength(1);
            expect(result.session.participants[0].name).toBe('Test User');
            expect(result.session.participants[0].role).toBe('interviewer');
            expect(result.link).toContain(result.session.id);
        });

        it('should set default code and language', async () => {
            const creatorInfo = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const result = await sessionService.createSession(creatorInfo);

            expect(result.session.code).toBeDefined();
            expect(result.session.language).toBe('javascript');
        });

        it('should set expiration time to 24 hours', async () => {
            const creatorInfo = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const result = await sessionService.createSession(creatorInfo);
            const expectedExpiration = result.session.createdAt + (24 * 60 * 60 * 1000);

            expect(result.session.expiresAt).toBe(expectedExpiration);
        });
    });

    describe('joinSession', () => {
        it('should allow user to join existing session', async () => {
            // Create a session first
            const creator = {
                id: 'creator123',
                name: 'Creator',
                color: '#ff0000'
            };

            const createResult = await sessionService.createSession(creator);
            const sessionId = createResult.session.id;

            // Join the session
            const joiner = {
                id: 'joiner123',
                name: 'Joiner',
                color: '#00ff00'
            };

            const joinResult = await sessionService.joinSession(sessionId, joiner);

            expect(joinResult.success).toBe(true);
            expect(joinResult.session.participants).toHaveLength(2);
            expect(joinResult.session.participants[1].name).toBe('Joiner');
            expect(joinResult.session.participants[1].role).toBe('candidate');
        });

        it('should return error for non-existent session', async () => {
            const userInfo = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const result = await sessionService.joinSession('nonexistent', userInfo);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session not found');
        });

        it('should return error for expired session', async () => {
            // Create an expired session
            const expiredSession = {
                id: 'expired123',
                expiresAt: Date.now() - 1000, // Expired 1 second ago
                participants: []
            };

            apiService.saveStoredSessions([expiredSession]);

            const userInfo = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const result = await sessionService.joinSession('expired123', userInfo);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session has expired');
        });
    });

    describe('updateCode', () => {
        it('should update session code and language', async () => {
            const creator = {
                id: 'user123',
                name: 'Test User',
                color: '#ff0000'
            };

            const createResult = await sessionService.createSession(creator);
            const sessionId = createResult.session.id;

            const updateResult = await sessionService.updateCode(
                sessionId,
                'print("hello")',
                'python'
            );

            expect(updateResult.success).toBe(true);
        });
    });

    describe('isValidSessionId', () => {
        it('should validate correct session ID format', () => {
            expect(sessionService.isValidSessionId('abcd1234')).toBe(true);
            expect(sessionService.isValidSessionId('12345678')).toBe(true);
        });

        it('should reject invalid session ID formats', () => {
            expect(sessionService.isValidSessionId('abc')).toBe(false);
            expect(sessionService.isValidSessionId('abcd123g')).toBe(false);
            expect(sessionService.isValidSessionId('ABCD1234')).toBe(false);
            expect(sessionService.isValidSessionId('abcd-1234')).toBe(false);
        });
    });

    describe('cleanupExpiredSessions', () => {
        it('should remove expired sessions', () => {
            const now = Date.now();
            const sessions = [
                { id: 'active1', expiresAt: now + 1000 },
                { id: 'expired1', expiresAt: now - 1000 },
                { id: 'active2', expiresAt: now + 2000 },
                { id: 'expired2', expiresAt: now - 2000 }
            ];

            apiService.saveStoredSessions(sessions);
            sessionService.cleanupExpiredSessions();

            const remaining = apiService.getStoredSessions();
            expect(remaining).toHaveLength(2);
            expect(remaining.every(s => s.expiresAt > now)).toBe(true);
        });
    });
});
