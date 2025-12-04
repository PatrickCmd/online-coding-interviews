import { useEffect, useCallback, useRef } from 'react';
import collaborationService from '../services/collaboration.service.js';
import { MESSAGE_TYPES } from '../utils/constants.js';
import { debounce } from '../utils/helpers.js';

/**
 * Custom hook for managing real-time collaboration
 */
export const useCollaboration = (sessionId, currentUserId, onCodeChange, onLanguageChange, onUserJoin, onUserLeave) => {
    const unsubscribersRef = useRef([]);

    // Debounced broadcast functions to avoid excessive updates
    const debouncedBroadcastCode = useCallback(
        debounce((code) => {
            collaborationService.broadcastCodeChange(code, currentUserId);
        }, 300),
        [currentUserId]
    );

    /**
     * Initialize collaboration
     */
    useEffect(() => {
        if (!sessionId) return;

        // Initialize the collaboration channel
        collaborationService.init(sessionId);

        // Subscribe to code changes
        const unsubCodeChange = collaborationService.subscribe(
            MESSAGE_TYPES.CODE_CHANGE,
            (data) => {
                // Ignore changes from current user
                if (data.userId !== currentUserId && onCodeChange) {
                    onCodeChange(data.code);
                }
            }
        );

        // Subscribe to language changes
        const unsubLanguageChange = collaborationService.subscribe(
            MESSAGE_TYPES.LANGUAGE_CHANGE,
            (data) => {
                if (data.userId !== currentUserId && onLanguageChange) {
                    onLanguageChange(data.language);
                }
            }
        );

        // Subscribe to user join events
        const unsubUserJoin = collaborationService.subscribe(
            MESSAGE_TYPES.USER_JOIN,
            (data) => {
                if (onUserJoin) {
                    onUserJoin(data.user);
                }
            }
        );

        // Subscribe to user leave events
        const unsubUserLeave = collaborationService.subscribe(
            MESSAGE_TYPES.USER_LEAVE,
            (data) => {
                if (onUserLeave) {
                    onUserLeave(data.userId);
                }
            }
        );

        // Store unsubscribers
        unsubscribersRef.current = [
            unsubCodeChange,
            unsubLanguageChange,
            unsubUserJoin,
            unsubUserLeave
        ];

        // Cleanup on unmount
        return () => {
            unsubscribersRef.current.forEach(unsub => unsub());
            collaborationService.cleanup();
        };
    }, [sessionId, currentUserId, onCodeChange, onLanguageChange, onUserJoin, onUserLeave]);

    /**
     * Broadcast code change
     */
    const broadcastCode = useCallback((code) => {
        debouncedBroadcastCode(code);
    }, [debouncedBroadcastCode]);

    /**
     * Broadcast language change
     */
    const broadcastLanguage = useCallback((language) => {
        collaborationService.broadcastLanguageChange(language, currentUserId);
    }, [currentUserId]);

    /**
     * Broadcast user join
     */
    const broadcastJoin = useCallback((user) => {
        collaborationService.broadcastUserJoin(user);
    }, []);

    /**
     * Broadcast user leave
     */
    const broadcastLeave = useCallback(() => {
        collaborationService.broadcastUserLeave(currentUserId);
    }, [currentUserId]);

    return {
        broadcastCode,
        broadcastLanguage,
        broadcastJoin,
        broadcastLeave,
        isSupported: collaborationService.isSupported()
    };
};
