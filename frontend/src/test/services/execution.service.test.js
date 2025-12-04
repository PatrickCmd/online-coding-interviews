import { describe, it, expect, beforeEach, vi } from 'vitest';
import executionService from '../../services/execution.service';
import { EXECUTION_STATUS } from '../../utils/constants';

describe('ExecutionService', () => {
    describe('executeJavaScript', () => {
        it('should execute simple JavaScript code', async () => {
            const code = 'console.log("Hello, World!")';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('Hello, World!');
            expect(result.error).toBe('');
        });

        it('should capture multiple console.log statements', async () => {
            const code = `
        console.log("First");
        console.log("Second");
        console.log("Third");
      `;
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('First');
            expect(result.output).toContain('Second');
            expect(result.output).toContain('Third');
        });

        it('should handle return values', async () => {
            const code = 'return 42';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('42');
        });

        it('should handle errors', async () => {
            const code = 'throw new Error("Test error")';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.ERROR);
            expect(result.error).toContain('Test error');
        });

        it('should handle syntax errors', async () => {
            const code = 'const x = ;';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.ERROR);
            expect(result.error).toBeDefined();
        });

        it('should format objects in output', async () => {
            const code = 'console.log({ name: "Test", value: 42 })';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('name');
            expect(result.output).toContain('Test');
        });

        it('should handle console.warn', async () => {
            const code = 'console.warn("Warning message")';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('⚠️');
            expect(result.output).toContain('Warning message');
        });

        it('should handle console.info', async () => {
            const code = 'console.info("Info message")';
            const result = await executionService.executeJavaScript(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toContain('ℹ️');
            expect(result.output).toContain('Info message');
        });
    });

    describe('executeHTML', () => {
        it('should return HTML code for rendering', async () => {
            const code = '<h1>Hello World</h1>';
            const result = await executionService.executeHTML(code);

            expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(result.output).toBe(code);
            expect(result.isHTML).toBe(true);
        });
    });

    describe('executeCode', () => {
        it('should route to correct executor based on language', async () => {
            const jsResult = await executionService.executeCode('console.log("test")', 'javascript');
            expect(jsResult.status).toBe(EXECUTION_STATUS.SUCCESS);

            const htmlResult = await executionService.executeCode('<div>test</div>', 'html');
            expect(htmlResult.status).toBe(EXECUTION_STATUS.SUCCESS);
            expect(htmlResult.isHTML).toBe(true);
        });

        it('should return error for unsupported language', async () => {
            const result = await executionService.executeCode('code', 'unsupported');

            expect(result.status).toBe(EXECUTION_STATUS.ERROR);
            expect(result.error).toContain('Unsupported language');
        });
    });

    describe('formatValue', () => {
        it('should format null', () => {
            const result = executionService.formatValue(null);
            expect(result).toBe('null');
        });

        it('should format undefined', () => {
            const result = executionService.formatValue(undefined);
            expect(result).toBe('undefined');
        });

        it('should format objects as JSON', () => {
            const obj = { key: 'value' };
            const result = executionService.formatValue(obj);
            expect(result).toContain('key');
            expect(result).toContain('value');
        });

        it('should format primitives as strings', () => {
            expect(executionService.formatValue(42)).toBe('42');
            expect(executionService.formatValue('test')).toBe('test');
            expect(executionService.formatValue(true)).toBe('true');
        });
    });
});
