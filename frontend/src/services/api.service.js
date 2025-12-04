import { API_DELAY } from '../utils/constants.js';
import { simulateDelay } from '../utils/helpers.js';

/**
 * Mock API Service
 * Centralizes all "backend" API calls with simulated network delays
 */

class ApiService {
    /**
     * Simulate an API call with delay
     */
    async mockApiCall(callback) {
        await simulateDelay(API_DELAY.MIN, API_DELAY.MAX);
        return callback();
    }

    /**
     * Create a new session
     */
    async createSession(sessionData) {
        return this.mockApiCall(() => {
            return {
                success: true,
                data: sessionData
            };
        });
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            return {
                success: true,
                data: session
            };
        });
    }

    /**
     * Update session
     */
    async updateSession(sessionId, updates) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const index = sessions.findIndex(s => s.id === sessionId);

            if (index === -1) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            sessions[index] = { ...sessions[index], ...updates, updatedAt: Date.now() };
            this.saveStoredSessions(sessions);

            return {
                success: true,
                data: sessions[index]
            };
        });
    }

    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const filtered = sessions.filter(s => s.id !== sessionId);
            this.saveStoredSessions(filtered);

            return {
                success: true
            };
        });
    }

    /**
     * Add participant to session
     */
    async addParticipant(sessionId, participant) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            if (!session.participants) {
                session.participants = [];
            }

            // Check if participant already exists
            const existingIndex = session.participants.findIndex(p => p.id === participant.id);
            if (existingIndex !== -1) {
                session.participants[existingIndex] = participant;
            } else {
                session.participants.push(participant);
            }

            this.saveStoredSessions(sessions);

            return {
                success: true,
                data: session
            };
        });
    }

    /**
     * Remove participant from session
     */
    async removeParticipant(sessionId, participantId) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            if (session.participants) {
                session.participants = session.participants.filter(p => p.id !== participantId);
            }

            this.saveStoredSessions(sessions);

            return {
                success: true,
                data: session
            };
        });
    }

    /**
     * Save code snapshot
     */
    async saveCodeSnapshot(sessionId, code, language) {
        return this.mockApiCall(() => {
            const sessions = this.getStoredSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            session.code = code;
            session.language = language;
            session.updatedAt = Date.now();

            this.saveStoredSessions(sessions);

            return {
                success: true,
                data: session
            };
        });
    }

    /**
     * Helper: Get sessions from localStorage
     */
    getStoredSessions() {
        try {
            const stored = localStorage.getItem('codeinterview_sessions');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading sessions:', e);
            return [];
        }
    }

    /**
     * Helper: Save sessions to localStorage
     */
    saveStoredSessions(sessions) {
        try {
            localStorage.setItem('codeinterview_sessions', JSON.stringify(sessions));
        } catch (e) {
            console.error('Error saving sessions:', e);
        }
    }
}

// Export singleton instance
export default new ApiService();
