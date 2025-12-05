import websocketService from './websocket.service.js';
import { MESSAGE_TYPES } from '../utils/constants.js';

/**
 * Collaboration Service
 * Handles real-time synchronization using WebSocket
 */

class CollaborationService {
    constructor() {
        this.sessionId = null;
        this.listeners = new Map();
        this.unsubscribers = [];
    }

    /**
     * Initialize collaboration for a session
     */
    init(sessionId) {
        if (this.sessionId) {
            this.cleanup();
        }

        this.sessionId = sessionId;

        // Connect WebSocket
        websocketService.connect(sessionId);

        // Subscribe to WebSocket messages
        this.setupWebSocketListeners();

        return true;
    }

    /**
     * Setup WebSocket message listeners
     */
    setupWebSocketListeners() {
        // Subscribe to code changes
        const unsubCodeChange = websocketService.on('code_change', (message) => {
            this.handleMessage(MESSAGE_TYPES.CODE_CHANGE, message.data);
        });
        this.unsubscribers.push(unsubCodeChange);

        // Subscribe to language changes
        const unsubLangChange = websocketService.on('language_change', (message) => {
            this.handleMessage(MESSAGE_TYPES.LANGUAGE_CHANGE, message.data);
        });
        this.unsubscribers.push(unsubLangChange);

        // Subscribe to user join
        const unsubUserJoin = websocketService.on('user_join', (message) => {
            this.handleMessage(MESSAGE_TYPES.USER_JOIN, message.data);
        });
        this.unsubscribers.push(unsubUserJoin);

        // Subscribe to user leave
        const unsubUserLeave = websocketService.on('user_leave', (message) => {
            this.handleMessage(MESSAGE_TYPES.USER_LEAVE, message.data);
        });
        this.unsubscribers.push(unsubUserLeave);

        // Subscribe to cursor position
        const unsubCursor = websocketService.on('cursor_position', (message) => {
            this.handleMessage(MESSAGE_TYPES.CURSOR_POSITION, message.data);
        });
        this.unsubscribers.push(unsubCursor);
    }

    /**
     * Handle incoming messages
     */
    handleMessage(type, data) {
        // Call all registered listeners for this message type
        const listeners = this.listeners.get(type) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in collaboration listener:', error);
            }
        });
    }

    /**
     * Subscribe to a specific message type
     */
    subscribe(messageType, callback) {
        if (!this.listeners.has(messageType)) {
            this.listeners.set(messageType, []);
        }

        this.listeners.get(messageType).push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(messageType);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    /**
     * Broadcast code change
     */
    broadcastCodeChange(code, userId) {
        websocketService.send('code_change', {
            code,
            userId,
        });
    }

    /**
     * Broadcast language change
     */
    broadcastLanguageChange(language, userId) {
        websocketService.send('language_change', {
            language,
            userId,
        });
    }

    /**
     * Broadcast user join
     */
    broadcastUserJoin(user) {
        websocketService.send('user_join', {
            user,
        });
    }

    /**
     * Broadcast user leave
     */
    broadcastUserLeave(userId) {
        websocketService.send('user_leave', {
            userId,
        });
    }

    /**
     * Broadcast cursor position (optional feature)
     */
    broadcastCursorPosition(position, userId) {
        websocketService.send('cursor_position', {
            position,
            userId,
        });
    }

    /**
     * Get connection state
     */
    getConnectionState() {
        return websocketService.getConnectionState();
    }

    /**
     * Check if connected
     */
    isConnected() {
        return websocketService.isConnected();
    }

    /**
     * Subscribe to connection state changes
     */
    onConnectionStateChange(callback) {
        return websocketService.onConnectionStateChange(callback);
    }

    /**
     * Cleanup and close connection
     */
    cleanup() {
        // Unsubscribe from all WebSocket messages
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];

        // Clear local listeners
        this.listeners.clear();

        // Disconnect WebSocket
        websocketService.disconnect();

        this.sessionId = null;
    }

    /**
     * Check if collaboration is supported
     */
    isSupported() {
        return typeof WebSocket !== 'undefined';
    }
}

// Export singleton instance
export default new CollaborationService();
