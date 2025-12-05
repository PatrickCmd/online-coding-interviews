/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export const API_CONFIG = {
    // Base URLs
    BASE_URL: API_BASE_URL,
    WS_BASE_URL: WS_BASE_URL,

    // API version
    API_VERSION: 'v1',

    // Full API URL
    API_URL: `${API_BASE_URL}/api/v1`,

    // Endpoints
    ENDPOINTS: {
        HEALTH: '/health',
        SESSIONS: '/sessions',
        SESSION_BY_ID: (id) => `/sessions/${id}`,
        JOIN_SESSION: (id) => `/sessions/${id}/join`,
        SAVE_CODE: (id) => `/sessions/${id}/code`,
        PARTICIPANTS: (id) => `/sessions/${id}/participants`,
        PARTICIPANT_BY_ID: (sessionId, participantId) =>
            `/sessions/${sessionId}/participants/${participantId}`,
        WEBSOCKET: (id) => `/ws/sessions/${id}`,
    },

    // Request configuration
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // Headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

export default API_CONFIG;
