import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import collaborationService from '../../services/collaboration.service';
import websocketService from '../../services/websocket.service';
import { MESSAGE_TYPES } from '../../utils/constants';

// Mock the WebSocket service
vi.mock('../../services/websocket.service', () => ({
    default: {
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: vi.fn(),
        on: vi.fn(() => vi.fn()), // Returns unsubscribe function
        isConnected: vi.fn(() => true),
        getConnectionState: vi.fn(() => 'connected'),
        onConnectionStateChange: vi.fn(() => vi.fn()),
    }
}));

describe('CollaborationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        collaborationService.cleanup();
    });

    describe('init', () => {
        it('should connect to WebSocket with session ID', () => {
            const result = collaborationService.init('test-session');

            expect(websocketService.connect).toHaveBeenCalledWith('test-session');
            expect(result).toBe(true);
        });

        it('should cleanup previous connection before initializing new one', () => {
            collaborationService.init('session1');
            collaborationService.init('session2');

            expect(websocketService.disconnect).toHaveBeenCalled();
            expect(websocketService.connect).toHaveBeenCalledWith('session2');
        });

        it('should set up WebSocket listeners', () => {
            collaborationService.init('test-session');

            // Should subscribe to all event types
            expect(websocketService.on).toHaveBeenCalledWith('code_change', expect.any(Function));
            expect(websocketService.on).toHaveBeenCalledWith('language_change', expect.any(Function));
            expect(websocketService.on).toHaveBeenCalledWith('user_join', expect.any(Function));
            expect(websocketService.on).toHaveBeenCalledWith('user_leave', expect.any(Function));
            expect(websocketService.on).toHaveBeenCalledWith('cursor_position', expect.any(Function));
        });
    });

    describe('subscribe', () => {
        it('should register listener for message type', () => {
            collaborationService.init('test-session');
            const callback = vi.fn();

            const unsubscribe = collaborationService.subscribe(
                MESSAGE_TYPES.CODE_CHANGE,
                callback
            );

            expect(typeof unsubscribe).toBe('function');
        });

        it('should return unsubscribe function', () => {
            collaborationService.init('test-session');
            const callback = vi.fn();

            const unsubscribe = collaborationService.subscribe(
                MESSAGE_TYPES.CODE_CHANGE,
                callback
            );

            unsubscribe();

            const listeners = collaborationService.listeners.get(MESSAGE_TYPES.CODE_CHANGE);
            expect(listeners).toHaveLength(0);
        });

        it('should allow multiple listeners for same message type', () => {
            collaborationService.init('test-session');
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback1);
            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback2);

            const listeners = collaborationService.listeners.get(MESSAGE_TYPES.CODE_CHANGE);
            expect(listeners).toHaveLength(2);
        });
    });

    describe('broadcastCodeChange', () => {
        it('should send code change via WebSocket', () => {
            collaborationService.init('test-session');

            collaborationService.broadcastCodeChange('console.log("test")', 'user123');

            expect(websocketService.send).toHaveBeenCalledWith(
                'code_change',
                {
                    code: 'console.log("test")',
                    userId: 'user123'
                }
            );
        });
    });

    describe('broadcastLanguageChange', () => {
        it('should send language change via WebSocket', () => {
            collaborationService.init('test-session');

            collaborationService.broadcastLanguageChange('python', 'user123');

            expect(websocketService.send).toHaveBeenCalledWith(
                'language_change',
                {
                    language: 'python',
                    userId: 'user123'
                }
            );
        });
    });

    describe('broadcastUserJoin', () => {
        it('should send user join event via WebSocket', () => {
            collaborationService.init('test-session');

            const user = { id: 'user123', name: 'Test User' };
            collaborationService.broadcastUserJoin(user);

            expect(websocketService.send).toHaveBeenCalledWith(
                'user_join',
                { user }
            );
        });
    });

    describe('broadcastUserLeave', () => {
        it('should send user leave event via WebSocket', () => {
            collaborationService.init('test-session');

            collaborationService.broadcastUserLeave('user123');

            expect(websocketService.send).toHaveBeenCalledWith(
                'user_leave',
                { userId: 'user123' }
            );
        });
    });

    describe('broadcastCursorPosition', () => {
        it('should send cursor position via WebSocket', () => {
            collaborationService.init('test-session');

            const position = { line: 10, column: 5 };
            collaborationService.broadcastCursorPosition(position, 'user123');

            expect(websocketService.send).toHaveBeenCalledWith(
                'cursor_position',
                {
                    position,
                    userId: 'user123'
                }
            );
        });
    });

    describe('cleanup', () => {
        it('should disconnect WebSocket and clear listeners', () => {
            collaborationService.init('test-session');
            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, vi.fn());

            collaborationService.cleanup();

            expect(websocketService.disconnect).toHaveBeenCalled();
            expect(collaborationService.listeners.size).toBe(0);
        });
    });

    describe('isSupported', () => {
        it('should return true when WebSocket is available', () => {
            expect(collaborationService.isSupported()).toBe(true);
        });
    });

    describe('isConnected', () => {
        it('should return WebSocket connection status', () => {
            const result = collaborationService.isConnected();

            expect(websocketService.isConnected).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('getConnectionState', () => {
        it('should return WebSocket connection state', () => {
            const result = collaborationService.getConnectionState();

            expect(websocketService.getConnectionState).toHaveBeenCalled();
            expect(result).toBe('connected');
        });
    });

    describe('onConnectionStateChange', () => {
        it('should subscribe to connection state changes', () => {
            const callback = vi.fn();

            collaborationService.onConnectionStateChange(callback);

            expect(websocketService.onConnectionStateChange).toHaveBeenCalledWith(callback);
        });
    });

    describe('handleMessage', () => {
        it('should call registered listeners when message received', () => {
            collaborationService.init('test-session');
            const callback = vi.fn();

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback);

            const data = { code: 'test', userId: 'user123' };
            collaborationService.handleMessage(MESSAGE_TYPES.CODE_CHANGE, data);

            expect(callback).toHaveBeenCalledWith(data);
        });

        it('should not throw if listener throws error', () => {
            collaborationService.init('test-session');
            const errorCallback = vi.fn(() => {
                throw new Error('Listener error');
            });

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, errorCallback);

            const data = { code: 'test' };

            expect(() => {
                collaborationService.handleMessage(MESSAGE_TYPES.CODE_CHANGE, data);
            }).not.toThrow();
        });

        it('should call multiple listeners for same message type', () => {
            collaborationService.init('test-session');
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback1);
            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback2);

            const data = { code: 'test', userId: 'user123' };
            collaborationService.handleMessage(MESSAGE_TYPES.CODE_CHANGE, data);

            expect(callback1).toHaveBeenCalledWith(data);
            expect(callback2).toHaveBeenCalledWith(data);
        });
    });
});
