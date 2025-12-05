import apiService from './api.service.js';
import { generateSessionLink } from '../utils/helpers.js';
import { DEFAULT_LANGUAGE, USER_ROLES } from '../utils/constants.js';

/**
 * Session Service
 * Handles session creation, management using backend API
 */

class SessionService {
    /**
     * Create a new interview session
     */
    async createSession(creatorInfo) {
        try {
            const requestData = {
                creator: {
                    id: creatorInfo.id,
                    name: creatorInfo.name,
                    color: creatorInfo.color,
                },
                code: DEFAULT_LANGUAGE.defaultCode,
                language: DEFAULT_LANGUAGE.id,
            };

            const result = await apiService.createSession(requestData);

            if (result.success) {
                return {
                    success: true,
                    session: result.data,
                    link: generateSessionLink(result.data.id)
                };
            }

            return result;
        } catch (error) {
            return error;
        }
    }

    /**
     * Join an existing session
     */
    async joinSession(sessionId, userInfo) {
        try {
            const userData = {
                id: userInfo.id,
                name: userInfo.name,
                color: userInfo.color,
            };

            const result = await apiService.joinSession(sessionId, userData);

            if (result.success) {
                return {
                    success: true,
                    session: result.data
                };
            }

            return result;
        } catch (error) {
            // Handle specific error codes
            if (error.status === 410) {
                return {
                    success: false,
                    error: 'Session has expired'
                };
            }
            if (error.status === 404) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }
            return error;
        }
    }

    /**
     * Leave a session
     */
    async leaveSession(sessionId, userId) {
        try {
            return await apiService.removeParticipant(sessionId, userId);
        } catch (error) {
            return error;
        }
    }

    /**
     * Get session details
     */
    async getSession(sessionId) {
        try {
            return await apiService.getSession(sessionId);
        } catch (error) {
            if (error.status === 410) {
                return {
                    success: false,
                    error: 'Session has expired'
                };
            }
            if (error.status === 404) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }
            return error;
        }
    }

    /**
     * Update session code
     */
    async updateCode(sessionId, code, language) {
        try {
            return await apiService.saveCode(sessionId, code, language);
        } catch (error) {
            return error;
        }
    }

    /**
     * Update session
     */
    async updateSession(sessionId, updates) {
        try {
            return await apiService.updateSession(sessionId, updates);
        } catch (error) {
            return error;
        }
    }

    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        try {
            return await apiService.deleteSession(sessionId);
        } catch (error) {
            return error;
        }
    }

    /**
     * Get participants
     */
    async getParticipants(sessionId) {
        try {
            return await apiService.getParticipants(sessionId);
        } catch (error) {
            return error;
        }
    }

    /**
     * Update participant status
     */
    async updateParticipant(sessionId, participantId, updates) {
        try {
            return await apiService.updateParticipant(sessionId, participantId, updates);
        } catch (error) {
            return error;
        }
    }

    /**
     * Validate session ID
     */
    isValidSessionId(sessionId) {
        return /^[a-f0-9]{8}$/.test(sessionId);
    }
}

// Export singleton instance
export default new SessionService();
