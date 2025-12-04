import apiService from './api.service.js';
import { generateShortId, generateSessionLink } from '../utils/helpers.js';
import { DEFAULT_LANGUAGE, SESSION_EXPIRATION, USER_ROLES } from '../utils/constants.js';

/**
 * Session Service
 * Handles session creation, management, and persistence
 */

class SessionService {
    /**
     * Create a new interview session
     */
    async createSession(creatorInfo) {
        const sessionId = generateShortId();
        const now = Date.now();

        const session = {
            id: sessionId,
            createdAt: now,
            updatedAt: now,
            expiresAt: now + SESSION_EXPIRATION,
            code: DEFAULT_LANGUAGE.defaultCode,
            language: DEFAULT_LANGUAGE.id,
            participants: [
                {
                    id: creatorInfo.id,
                    name: creatorInfo.name,
                    role: USER_ROLES.INTERVIEWER,
                    color: creatorInfo.color,
                    joinedAt: now,
                    isOnline: true
                }
            ],
            creatorId: creatorInfo.id
        };

        const result = await apiService.createSession(session);

        if (result.success) {
            // Save to localStorage
            const sessions = apiService.getStoredSessions();
            sessions.push(session);
            apiService.saveStoredSessions(sessions);

            return {
                success: true,
                session,
                link: generateSessionLink(sessionId)
            };
        }

        return result;
    }

    /**
     * Join an existing session
     */
    async joinSession(sessionId, userInfo) {
        const result = await apiService.getSession(sessionId);

        if (!result.success) {
            return result;
        }

        const session = result.data;

        // Check if session is expired
        if (session.expiresAt < Date.now()) {
            return {
                success: false,
                error: 'Session has expired'
            };
        }

        // Add participant
        const participant = {
            id: userInfo.id,
            name: userInfo.name,
            role: USER_ROLES.CANDIDATE,
            color: userInfo.color,
            joinedAt: Date.now(),
            isOnline: true
        };

        const addResult = await apiService.addParticipant(sessionId, participant);

        if (addResult.success) {
            return {
                success: true,
                session: addResult.data
            };
        }

        return addResult;
    }

    /**
     * Leave a session
     */
    async leaveSession(sessionId, userId) {
        return await apiService.removeParticipant(sessionId, userId);
    }

    /**
     * Get session details
     */
    async getSession(sessionId) {
        return await apiService.getSession(sessionId);
    }

    /**
     * Update session code
     */
    async updateCode(sessionId, code, language) {
        return await apiService.saveCodeSnapshot(sessionId, code, language);
    }

    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        return await apiService.deleteSession(sessionId);
    }

    /**
     * Validate session ID
     */
    isValidSessionId(sessionId) {
        return /^[a-f0-9]{8}$/.test(sessionId);
    }

    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        const sessions = apiService.getStoredSessions();
        const now = Date.now();
        const activeSessions = sessions.filter(s => s.expiresAt > now);
        apiService.saveStoredSessions(activeSessions);
    }
}

// Export singleton instance
export default new SessionService();
