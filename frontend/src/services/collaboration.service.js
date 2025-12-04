import { BROADCAST_CHANNEL_NAME, MESSAGE_TYPES } from '../utils/constants.js';

/**
 * Collaboration Service
 * Handles real-time synchronization using BroadcastChannel API
 */

class CollaborationService {
    constructor() {
        this.channel = null;
        this.listeners = new Map();
    }

    /**
     * Initialize collaboration channel for a session
     */
    init(sessionId) {
        if (this.channel) {
            this.cleanup();
        }

        // Create a session-specific channel
        this.channel = new BroadcastChannel(`${BROADCAST_CHANNEL_NAME}_${sessionId}`);

        // Set up message handler
        this.channel.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        return this.channel;
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message) {
        const { type, data } = message;

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
     * Broadcast a message to all connected clients
     */
    broadcast(type, data) {
        if (!this.channel) {
            console.warn('Collaboration channel not initialized');
            return;
        }

        this.channel.postMessage({ type, data });
    }

    /**
     * Broadcast code change
     */
    broadcastCodeChange(code, userId) {
        this.broadcast(MESSAGE_TYPES.CODE_CHANGE, { code, userId, timestamp: Date.now() });
    }

    /**
     * Broadcast language change
     */
    broadcastLanguageChange(language, userId) {
        this.broadcast(MESSAGE_TYPES.LANGUAGE_CHANGE, { language, userId, timestamp: Date.now() });
    }

    /**
     * Broadcast user join
     */
    broadcastUserJoin(user) {
        this.broadcast(MESSAGE_TYPES.USER_JOIN, { user, timestamp: Date.now() });
    }

    /**
     * Broadcast user leave
     */
    broadcastUserLeave(userId) {
        this.broadcast(MESSAGE_TYPES.USER_LEAVE, { userId, timestamp: Date.now() });
    }

    /**
     * Broadcast cursor position (optional feature)
     */
    broadcastCursorPosition(position, userId) {
        this.broadcast(MESSAGE_TYPES.CURSOR_POSITION, { position, userId, timestamp: Date.now() });
    }

    /**
     * Cleanup and close channel
     */
    cleanup() {
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
        this.listeners.clear();
    }

    /**
     * Check if collaboration is supported
     */
    isSupported() {
        return typeof BroadcastChannel !== 'undefined';
    }
}

// Export singleton instance
export default new CollaborationService();
