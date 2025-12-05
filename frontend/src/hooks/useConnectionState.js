import { useState, useEffect } from 'react';
import collaborationService from '../services/collaboration.service.js';

/**
 * Custom hook for monitoring WebSocket connection state
 */
export const useConnectionState = (sessionId) => {
    const [connectionState, setConnectionState] = useState('disconnected');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            setConnectionState('disconnected');
            setIsConnected(false);
            return;
        }

        // Subscribe to connection state changes
        const unsubscribe = collaborationService.onConnectionStateChange((state) => {
            setConnectionState(state);
            setIsConnected(state === 'connected');
        });

        // Get initial state
        const initialState = collaborationService.getConnectionState();
        setConnectionState(initialState);
        setIsConnected(initialState === 'connected');

        return () => {
            unsubscribe();
        };
    }, [sessionId]);

    return {
        connectionState,
        isConnected,
        isConnecting: connectionState === 'connecting' || connectionState === 'reconnecting',
        isDisconnected: connectionState === 'disconnected',
        hasFailed: connectionState === 'failed',
    };
};
