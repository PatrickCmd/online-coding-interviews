import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import sessionService from '../../services/session.service';
import apiService from '../../services/api.service';

// Mock the API service
vi.mock('../../services/api.service', () => ({
    default: {
        createSession: vi.fn(),
        getSession: vi.fn(),
        joinSession: vi.fn(),
        updateSession: vi.fn(),
        saveCode: vi.fn(),
        deleteSession: vi.fn(),
        getParticipants: vi.fn(),
        updateParticipant: vi.fn(),
        removeParticipant: vi.fn(),
    }
}));

describe('SessionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create a new session with creator info', async () => {
            const creatorInfo = {
                id: 'user123',
                name: 'Test User',
                color: 'hsl(200, 70%, 50%)'
            };

            const mockResponse = {
                success: true,
                data: {
                    id: 'abc12345',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                    code: 'console.log("Hello, World!");',
                    language: 'javascript',
                    participants: [
                        {
                            id: 'user123',
                            name: 'Test User',
                            role: 'interviewer',
                            color: 'hsl(200, 70%, 50%)',
                            joinedAt: Date.now(),
                            isOnline: true
                        }
                    ],
                    creatorId: 'user123'
                }
            };

            apiService.createSession.mockResolvedValue(mockResponse);

            const result = await sessionService.createSession(creatorInfo);

            expect(result.success).toBe(true);
            expect(result.session).toBeDefined();
            expect(result.session.id).toBe('abc12345');
            expect(result.session.participants).toHaveLength(1);
            expect(result.session.participants[0].name).toBe('Test User');
            expect(result.session.participants[0].role).toBe('interviewer');
            expect(result.link).toContain('abc12345');
        });

        it('should handle API errors', async () => {
            const creatorInfo = {
                id: 'user123',
                name: 'Test User',
                color: 'hsl(200, 70%, 50%)'
            };

            const mockError = {
                success: false,
                error: 'Network error',
                code: 'NETWORK_ERROR'
            };

            apiService.createSession.mockRejectedValue(mockError);

            const result = await sessionService.createSession(creatorInfo);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });

    describe('joinSession', () => {
        it('should allow user to join existing session', async () => {
            const userInfo = {
                id: 'joiner123',
                name: 'Joiner',
                color: 'hsl(150, 70%, 50%)'
            };

            const mockResponse = {
                success: true,
                data: {
                    id: 'abc12345',
                    participants: [
                        { id: 'creator123', name: 'Creator', role: 'interviewer' },
                        { id: 'joiner123', name: 'Joiner', role: 'candidate' }
                    ]
                }
            };

            apiService.joinSession.mockResolvedValue(mockResponse);

            const result = await sessionService.joinSession('abc12345', userInfo);

            expect(result.success).toBe(true);
            expect(result.session.participants).toHaveLength(2);
            expect(result.session.participants[1].name).toBe('Joiner');
        });

        it('should return error for non-existent session', async () => {
            const userInfo = {
                id: 'user123',
                name: 'Test User',
                color: 'hsl(200, 70%, 50%)'
            };

            const mockError = {
                success: false,
                error: 'Session not found',
                code: 'HTTP_404',
                status: 404
            };

            apiService.joinSession.mockRejectedValue(mockError);

            const result = await sessionService.joinSession('nonexistent', userInfo);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session not found');
        });

        it('should return error for expired session', async () => {
            const userInfo = {
                id: 'user123',
                name: 'Test User',
                color: 'hsl(200, 70%, 50%)'
            };

            const mockError = {
                response: {
                    status: 410,
                    data: { error: 'Session has expired' }
                },
                status: 410
            };

            apiService.joinSession.mockRejectedValue(mockError);

            const result = await sessionService.joinSession('expired123', userInfo);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session has expired');
        });
    });

    describe('getSession', () => {
        it('should retrieve session details', async () => {
            const mockResponse = {
                success: true,
                data: {
                    id: 'abc12345',
                    code: 'console.log("test")',
                    language: 'javascript'
                }
            };

            apiService.getSession.mockResolvedValue(mockResponse);

            const result = await sessionService.getSession('abc12345');

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('abc12345');
        });

        it('should handle 404 errors', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { error: 'Session not found' }
                },
                status: 404
            };

            apiService.getSession.mockRejectedValue(mockError);

            const result = await sessionService.getSession('nonexistent');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session not found');
        });
    });

    describe('updateCode', () => {
        it('should update session code and language', async () => {
            const mockResponse = {
                success: true,
                data: {
                    id: 'abc12345',
                    code: 'print("hello")',
                    language: 'python'
                }
            };

            apiService.saveCode.mockResolvedValue(mockResponse);

            const result = await sessionService.updateCode(
                'abc12345',
                'print("hello")',
                'python'
            );

            expect(apiService.saveCode).toHaveBeenCalledWith(
                'abc12345',
                'print("hello")',
                'python'
            );
            expect(result.success).toBe(true);
        });
    });

    describe('leaveSession', () => {
        it('should remove participant from session', async () => {
            const mockResponse = {
                success: true
            };

            apiService.removeParticipant.mockResolvedValue(mockResponse);

            const result = await sessionService.leaveSession('abc12345', 'user123');

            expect(apiService.removeParticipant).toHaveBeenCalledWith('abc12345', 'user123');
            expect(result.success).toBe(true);
        });
    });

    describe('deleteSession', () => {
        it('should delete session successfully', async () => {
            const mockResponse = {
                success: true
            };

            apiService.deleteSession.mockResolvedValue(mockResponse);

            const result = await sessionService.deleteSession('abc12345');

            expect(apiService.deleteSession).toHaveBeenCalledWith('abc12345');
            expect(result.success).toBe(true);
        });
    });

    describe('isValidSessionId', () => {
        it('should validate correct session ID format', () => {
            expect(sessionService.isValidSessionId('abcd1234')).toBe(true);
            expect(sessionService.isValidSessionId('12345678')).toBe(true);
            expect(sessionService.isValidSessionId('ffffffff')).toBe(true);
        });

        it('should reject invalid session ID formats', () => {
            expect(sessionService.isValidSessionId('abc')).toBe(false);
            expect(sessionService.isValidSessionId('abcd123g')).toBe(false);
            expect(sessionService.isValidSessionId('ABCD1234')).toBe(false);
            expect(sessionService.isValidSessionId('abcd-1234')).toBe(false);
            expect(sessionService.isValidSessionId('abcd12345')).toBe(false); // Too long
        });
    });
});
