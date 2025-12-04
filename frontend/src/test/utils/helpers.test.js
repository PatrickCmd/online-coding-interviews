import { describe, it, expect } from 'vitest';
import {
    generateId,
    generateShortId,
    generateSessionLink,
    debounce,
    throttle,
    copyToClipboard,
    getRandomColor,
    generateAnonymousName,
    isValidSessionId,
    formatOutput
} from '../../utils/helpers';

describe('Helper Functions', () => {
    describe('generateId', () => {
        it('should generate a valid UUID', () => {
            const id = generateId();
            expect(id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
        });

        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('generateShortId', () => {
        it('should generate 8-character hex ID', () => {
            const id = generateShortId();
            expect(id).toMatch(/^[a-f0-9]{8}$/);
        });

        it('should generate unique short IDs', () => {
            const id1 = generateShortId();
            const id2 = generateShortId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('generateSessionLink', () => {
        it('should generate valid session link', () => {
            const sessionId = 'abc12345';
            const link = generateSessionLink(sessionId);

            expect(link).toContain(sessionId);
            expect(link).toContain('/interview/');
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', async () => {
            let callCount = 0;
            const fn = () => callCount++;
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            expect(callCount).toBe(0);

            await new Promise(resolve => setTimeout(resolve, 150));
            expect(callCount).toBe(1);
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', async () => {
            let callCount = 0;
            const fn = () => callCount++;
            const throttledFn = throttle(fn, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(callCount).toBe(1);

            await new Promise(resolve => setTimeout(resolve, 150));
            throttledFn();
            expect(callCount).toBe(2);
        });
    });

    describe('getRandomColor', () => {
        it('should return a valid HSL color', () => {
            const color = getRandomColor();
            expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/);
        });

        it('should return different colors (probabilistically)', () => {
            const colors = new Set();
            for (let i = 0; i < 20; i++) {
                colors.add(getRandomColor());
            }
            expect(colors.size).toBeGreaterThan(1);
        });
    });

    describe('generateAnonymousName', () => {
        it('should generate a name with adjective and noun', () => {
            const name = generateAnonymousName();
            expect(name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
        });

        it('should generate different names (probabilistically)', () => {
            const names = new Set();
            for (let i = 0; i < 20; i++) {
                names.add(generateAnonymousName());
            }
            expect(names.size).toBeGreaterThan(1);
        });
    });

    describe('isValidSessionId', () => {
        it('should validate correct session IDs', () => {
            expect(isValidSessionId('abcd1234')).toBe(true);
            expect(isValidSessionId('12345678')).toBe(true);
            expect(isValidSessionId('ffffffff')).toBe(true);
        });

        it('should reject invalid session IDs', () => {
            expect(isValidSessionId('abc')).toBe(false);
            expect(isValidSessionId('abcd123g')).toBe(false);
            expect(isValidSessionId('ABCD1234')).toBe(false);
            expect(isValidSessionId('abcd-1234')).toBe(false);
            expect(isValidSessionId('abcd12345')).toBe(false);
        });
    });

    describe('formatOutput', () => {
        it('should format objects as JSON', () => {
            const obj = { key: 'value', num: 42 };
            const result = formatOutput(obj);
            expect(result).toContain('key');
            expect(result).toContain('value');
        });

        it('should format primitives as strings', () => {
            expect(formatOutput(42)).toBe('42');
            expect(formatOutput('test')).toBe('test');
            expect(formatOutput(true)).toBe('true');
        });

        it('should handle null and undefined', () => {
            expect(formatOutput(null)).toBe('null');
            expect(formatOutput(undefined)).toBe('undefined');
        });
    });
});
