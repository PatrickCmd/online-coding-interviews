import API_CONFIG from '../config/api.config.js';

/**
 * WebSocket Service
 * Handles real-time collaboration via WebSocket connection
 */

class WebSocketService {
    constructor() {
        this.ws = null;
        this.sessionId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.messageHandlers = new Map();
        this.connectionStateHandlers = [];
        this.isIntentionallyClosed = false;
    }

    /**
     * Connect to WebSocket for a session
     */
    connect(sessionId) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        this.sessionId = sessionId;
        this.isIntentionallyClosed = false;

        const wsUrl = `${API_CONFIG.WS_BASE_URL}${API_CONFIG.ENDPOINTS.WEBSOCKET(sessionId)}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.notifyConnectionState('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.notifyConnectionState('error');
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.notifyConnectionState('disconnected');

                // Attempt to reconnect if not intentionally closed
                if (!this.isIntentionallyClosed) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.notifyConnectionState('error');
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.notifyConnectionState('failed');
            return;
        }

        this.reconnectAttempts++;
        this.notifyConnectionState('reconnecting');

        setTimeout(() => {
            console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
            this.connect(this.sessionId);
        }, this.reconnectDelay);

        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
    }

    /**
     * Send message through WebSocket
     */
    send(type, data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return false;
        }

        try {
            const message = {
                type,
                data,
            };
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Failed to send WebSocket message:', error);
            return false;
        }
    }

    /**
     * Handle incoming message
     */
    handleMessage(message) {
        const { type, data, timestamp } = message;

        // Call registered handlers for this message type
        const handlers = this.messageHandlers.get(type) || [];
        handlers.forEach(handler => {
            try {
                handler({ type, data, timestamp });
            } catch (error) {
                console.error(`Error in message handler for ${type}:`, error);
            }
        });
    }

    /**
     * Subscribe to message type
     */
    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.messageHandlers.get(type);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        };
    }

    /**
     * Subscribe to connection state changes
     */
    onConnectionStateChange(handler) {
        this.connectionStateHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            const index = this.connectionStateHandlers.indexOf(handler);
            if (index > -1) {
                this.connectionStateHandlers.splice(index, 1);
            }
        };
    }

    /**
     * Notify connection state change
     */
    notifyConnectionState(state) {
        this.connectionStateHandlers.forEach(handler => {
            try {
                handler(state);
            } catch (error) {
                console.error('Error in connection state handler:', error);
            }
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        this.isIntentionallyClosed = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.reconnectAttempts = 0;
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection state
     */
    getConnectionState() {
        if (!this.ws) return 'disconnected';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'connecting';
            case WebSocket.OPEN:
                return 'connected';
            case WebSocket.CLOSING:
                return 'closing';
            case WebSocket.CLOSED:
                return 'disconnected';
            default:
                return 'unknown';
        }
    }
}

// Export singleton instance
export default new WebSocketService();
