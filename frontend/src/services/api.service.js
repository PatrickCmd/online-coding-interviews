import axios from 'axios';
import API_CONFIG from '../config/api.config.js';

/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

class ApiService {
    constructor() {
        // Create axios instance with default config
        this.client = axios.create({
            baseURL: API_CONFIG.API_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.HEADERS,
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add any auth tokens here if needed
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                return this.handleError(error);
            }
        );
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Return structured error
            return Promise.reject({
                success: false,
                error: data?.error || data?.detail || 'An error occurred',
                code: data?.code || `HTTP_${status}`,
                status,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                success: false,
                error: 'Unable to connect to server. Please ensure the backend is running.',
                code: 'NETWORK_ERROR',
            });
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                error: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
            });
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.client.get(API_CONFIG.ENDPOINTS.HEALTH);
            return { success: true, data: response };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new session
     */
    async createSession(sessionData) {
        try {
            const response = await this.client.post(
                API_CONFIG.ENDPOINTS.SESSIONS,
                sessionData
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId) {
        try {
            const response = await this.client.get(
                API_CONFIG.ENDPOINTS.SESSION_BY_ID(sessionId)
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update session
     */
    async updateSession(sessionId, updates) {
        try {
            const response = await this.client.patch(
                API_CONFIG.ENDPOINTS.SESSION_BY_ID(sessionId),
                updates
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        try {
            await this.client.delete(
                API_CONFIG.ENDPOINTS.SESSION_BY_ID(sessionId)
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Join a session
     */
    async joinSession(sessionId, userData) {
        try {
            const response = await this.client.post(
                API_CONFIG.ENDPOINTS.JOIN_SESSION(sessionId),
                { user: userData }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Save code snapshot
     */
    async saveCode(sessionId, code, language) {
        try {
            const response = await this.client.put(
                API_CONFIG.ENDPOINTS.SAVE_CODE(sessionId),
                { code, language }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get participants
     */
    async getParticipants(sessionId) {
        try {
            const response = await this.client.get(
                API_CONFIG.ENDPOINTS.PARTICIPANTS(sessionId)
            );
            return { success: true, data: response.participants };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update participant
     */
    async updateParticipant(sessionId, participantId, updates) {
        try {
            const response = await this.client.patch(
                API_CONFIG.ENDPOINTS.PARTICIPANT_BY_ID(sessionId, participantId),
                updates
            );
            return { success: true, data: response };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Remove participant
     */
    async removeParticipant(sessionId, participantId) {
        try {
            await this.client.delete(
                API_CONFIG.ENDPOINTS.PARTICIPANT_BY_ID(sessionId, participantId)
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
export default new ApiService();
