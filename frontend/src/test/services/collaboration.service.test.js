import { describe, it, expect, beforeEach, vi } from 'vitest';
import collaborationService from '../../services/collaboration.service';
import { MESSAGE_TYPES } from '../../utils/constants';

describe('CollaborationService', () => {
    beforeEach(() => {
        collaborationService.cleanup();
    });

    describe('init', () => {
        it('should initialize BroadcastChannel with session ID', () => {
            const channel = collaborationService.init('test-session');

            expect(channel).toBeDefined();
            expect(collaborationService.channel).toBeDefined();
        });

        it('should cleanup previous channel before initializing new one', () => {
            collaborationService.init('session1');
            const firstChannel = collaborationService.channel;

            collaborationService.init('session2');
            const secondChannel = collaborationService.channel;

            expect(secondChannel).not.toBe(firstChannel);
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

    describe('broadcast', () => {
        it('should broadcast message through channel', () => {
            collaborationService.init('test-session');
            const postMessageSpy = vi.spyOn(collaborationService.channel, 'postMessage');

            collaborationService.broadcast(MESSAGE_TYPES.CODE_CHANGE, { code: 'test' });

            expect(postMessageSpy).toHaveBeenCalledWith({
                type: MESSAGE_TYPES.CODE_CHANGE,
                data: { code: 'test' }
            });
        });

        it('should warn if channel not initialized', () => {
            const consoleSpy = vi.spyOn(console, 'warn');

            collaborationService.broadcast(MESSAGE_TYPES.CODE_CHANGE, { code: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith('Collaboration channel not initialized');
        });
    });

    describe('broadcastCodeChange', () => {
        it('should broadcast code change with timestamp', () => {
            collaborationService.init('test-session');
            const broadcastSpy = vi.spyOn(collaborationService, 'broadcast');

            collaborationService.broadcastCodeChange('console.log("test")', 'user123');

            expect(broadcastSpy).toHaveBeenCalledWith(
                MESSAGE_TYPES.CODE_CHANGE,
                expect.objectContaining({
                    code: 'console.log("test")',
                    userId: 'user123',
                    timestamp: expect.any(Number)
                })
            );
        });
    });

    describe('broadcastLanguageChange', () => {
        it('should broadcast language change with timestamp', () => {
            collaborationService.init('test-session');
            const broadcastSpy = vi.spyOn(collaborationService, 'broadcast');

            collaborationService.broadcastLanguageChange('python', 'user123');

            expect(broadcastSpy).toHaveBeenCalledWith(
                MESSAGE_TYPES.LANGUAGE_CHANGE,
                expect.objectContaining({
                    language: 'python',
                    userId: 'user123',
                    timestamp: expect.any(Number)
                })
            );
        });
    });

    describe('broadcastUserJoin', () => {
        it('should broadcast user join event', () => {
            collaborationService.init('test-session');
            const broadcastSpy = vi.spyOn(collaborationService, 'broadcast');

            const user = { id: 'user123', name: 'Test User' };
            collaborationService.broadcastUserJoin(user);

            expect(broadcastSpy).toHaveBeenCalledWith(
                MESSAGE_TYPES.USER_JOIN,
                expect.objectContaining({
                    user,
                    timestamp: expect.any(Number)
                })
            );
        });
    });

    describe('broadcastUserLeave', () => {
        it('should broadcast user leave event', () => {
            collaborationService.init('test-session');
            const broadcastSpy = vi.spyOn(collaborationService, 'broadcast');

            collaborationService.broadcastUserLeave('user123');

            expect(broadcastSpy).toHaveBeenCalledWith(
                MESSAGE_TYPES.USER_LEAVE,
                expect.objectContaining({
                    userId: 'user123',
                    timestamp: expect.any(Number)
                })
            );
        });
    });

    describe('cleanup', () => {
        it('should close channel and clear listeners', () => {
            collaborationService.init('test-session');
            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, vi.fn());

            collaborationService.cleanup();

            expect(collaborationService.channel).toBeNull();
            expect(collaborationService.listeners.size).toBe(0);
        });
    });

    describe('isSupported', () => {
        it('should return true when BroadcastChannel is available', () => {
            expect(collaborationService.isSupported()).toBe(true);
        });
    });

    describe('handleMessage', () => {
        it('should call registered listeners when message received', () => {
            collaborationService.init('test-session');
            const callback = vi.fn();

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, callback);

            const message = {
                type: MESSAGE_TYPES.CODE_CHANGE,
                data: { code: 'test', userId: 'user123' }
            };

            collaborationService.handleMessage(message);

            expect(callback).toHaveBeenCalledWith(message.data);
        });

        it('should not throw if listener throws error', () => {
            collaborationService.init('test-session');
            const errorCallback = vi.fn(() => {
                throw new Error('Listener error');
            });

            collaborationService.subscribe(MESSAGE_TYPES.CODE_CHANGE, errorCallback);

            const message = {
                type: MESSAGE_TYPES.CODE_CHANGE,
                data: { code: 'test' }
            };

            expect(() => {
                collaborationService.handleMessage(message);
            }).not.toThrow();
        });
    });
});
