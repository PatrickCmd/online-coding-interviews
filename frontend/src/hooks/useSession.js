import { useState, useEffect } from 'react';
import sessionService from '../services/session.service.js';
import { generateId, generateAnonymousName, getRandomColor } from '../utils/helpers.js';

/**
 * Custom hook for managing interview sessions
 */
export const useSession = () => {
    const [currentSession, setCurrentSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Initialize current user
    useEffect(() => {
        const storedUser = localStorage.getItem('codeinterview_user_info');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            const newUser = {
                id: generateId(),
                name: generateAnonymousName(),
                color: getRandomColor()
            };
            localStorage.setItem('codeinterview_user_info', JSON.stringify(newUser));
            setCurrentUser(newUser);
        }
    }, []);

    /**
     * Create a new session
     */
    const createSession = async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const result = await sessionService.createSession(currentUser);

            if (result.success) {
                setCurrentSession(result.session);
                return result;
            } else {
                setError(result.error);
                return result;
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Join an existing session
     */
    const joinSession = async (sessionId) => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const result = await sessionService.joinSession(sessionId, currentUser);

            if (result.success) {
                setCurrentSession(result.session);
                return result;
            } else {
                setError(result.error);
                return result;
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Leave current session
     */
    const leaveSession = async () => {
        if (!currentSession || !currentUser) return;

        try {
            await sessionService.leaveSession(currentSession.id, currentUser.id);
            setCurrentSession(null);
        } catch (err) {
            console.error('Error leaving session:', err);
        }
    };

    /**
     * Update session code
     */
    const updateSessionCode = async (code, language) => {
        if (!currentSession) return;

        try {
            await sessionService.updateCode(currentSession.id, code, language);
        } catch (err) {
            console.error('Error updating code:', err);
        }
    };

    /**
     * Refresh session data
     */
    const refreshSession = async () => {
        if (!currentSession) return;

        try {
            const result = await sessionService.getSession(currentSession.id);
            if (result.success) {
                setCurrentSession(result.data);
            }
        } catch (err) {
            console.error('Error refreshing session:', err);
        }
    };

    return {
        currentSession,
        currentUser,
        loading,
        error,
        createSession,
        joinSession,
        leaveSession,
        updateSessionCode,
        refreshSession
    };
};
