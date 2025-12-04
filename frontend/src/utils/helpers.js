import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 */
export const generateId = () => {
    return uuidv4();
};

/**
 * Generate a short unique ID for session links
 */
export const generateShortId = () => {
    return uuidv4().split('-')[0];
};

/**
 * Generate a session link
 */
export const generateSessionLink = (sessionId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/interview/${sessionId}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Format timestamp
 */
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Get random color for user avatar
 */
export const getRandomColor = () => {
    const colors = [
        'hsl(250, 84%, 54%)',
        'hsl(280, 70%, 60%)',
        'hsl(340, 82%, 52%)',
        'hsl(142, 71%, 45%)',
        'hsl(45, 93%, 47%)',
        'hsl(200, 84%, 54%)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generate random name for anonymous users
 */
export const generateAnonymousName = () => {
    const adjectives = ['Quick', 'Clever', 'Bright', 'Swift', 'Smart', 'Sharp'];
    const nouns = ['Coder', 'Developer', 'Programmer', 'Engineer', 'Hacker', 'Builder'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
};

/**
 * Simulate network delay
 */
export const simulateDelay = (min = 200, max = 500) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Format code output
 */
export const formatOutput = (output) => {
    if (typeof output === 'object') {
        try {
            return JSON.stringify(output, null, 2);
        } catch (e) {
            return String(output);
        }
    }
    return String(output);
};

/**
 * Validate session ID format
 */
export const isValidSessionId = (sessionId) => {
    return /^[a-f0-9]{8}$/.test(sessionId);
};
