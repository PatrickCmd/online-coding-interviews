import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
    cleanup();
    localStorage.clear();
});

// Mock BroadcastChannel
global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
        this.name = name;
        this.onmessage = null;
    }

    postMessage(message) {
        // Mock implementation
    }

    close() {
        // Mock implementation
    }
};

// Mock window.loadPyodide for execution service tests
global.loadPyodide = vi.fn(() => Promise.resolve({
    runPythonAsync: vi.fn((code) => Promise.resolve(''))
}));
