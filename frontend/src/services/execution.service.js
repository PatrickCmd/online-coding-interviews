import { EXECUTION_STATUS } from '../utils/constants.js';

/**
 * Execution Service
 * Handles browser-based code execution for multiple languages
 */

class ExecutionService {
    constructor() {
        this.pyodideReady = false;
        this.pyodide = null;
    }

    /**
     * Execute code based on language
     */
    async executeCode(code, language) {
        try {
            switch (language) {
                case 'javascript':
                    return await this.executeJavaScript(code);
                case 'python':
                    return await this.executePython(code);
                case 'html':
                    return await this.executeHTML(code);
                default:
                    return {
                        status: EXECUTION_STATUS.ERROR,
                        output: '',
                        error: `Unsupported language: ${language}`
                    };
            }
        } catch (error) {
            return {
                status: EXECUTION_STATUS.ERROR,
                output: '',
                error: error.message
            };
        }
    }

    /**
     * Execute JavaScript code
     */
    async executeJavaScript(code) {
        const output = [];
        const errors = [];

        // Override console methods to capture output
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        console.log = (...args) => {
            output.push(args.map(arg => this.formatValue(arg)).join(' '));
            originalConsole.log(...args);
        };

        console.error = (...args) => {
            errors.push(args.map(arg => this.formatValue(arg)).join(' '));
            originalConsole.error(...args);
        };

        console.warn = (...args) => {
            output.push('⚠️ ' + args.map(arg => this.formatValue(arg)).join(' '));
            originalConsole.warn(...args);
        };

        console.info = (...args) => {
            output.push('ℹ️ ' + args.map(arg => this.formatValue(arg)).join(' '));
            originalConsole.info(...args);
        };

        try {
            // Execute code in a function scope to avoid polluting global scope
            const result = new Function(code)();

            // If the code returns a value, add it to output
            if (result !== undefined) {
                output.push(this.formatValue(result));
            }

            // Restore console
            Object.assign(console, originalConsole);

            return {
                status: errors.length > 0 ? EXECUTION_STATUS.ERROR : EXECUTION_STATUS.SUCCESS,
                output: output.join('\n'),
                error: errors.join('\n')
            };
        } catch (error) {
            // Restore console
            Object.assign(console, originalConsole);

            return {
                status: EXECUTION_STATUS.ERROR,
                output: output.join('\n'),
                error: error.message
            };
        }
    }

    /**
     * Execute Python code using Pyodide
     */
    async executePython(code) {
        try {
            // Load Pyodide if not already loaded
            if (!this.pyodideReady) {
                await this.loadPyodide();
            }

            // Capture stdout
            const output = [];

            // Redirect Python stdout to capture output
            await this.pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

            // Execute the user code
            await this.pyodide.runPythonAsync(code);

            // Get the output
            const stdout = await this.pyodide.runPythonAsync('sys.stdout.getvalue()');
            const stderr = await this.pyodide.runPythonAsync('sys.stderr.getvalue()');

            return {
                status: stderr ? EXECUTION_STATUS.ERROR : EXECUTION_STATUS.SUCCESS,
                output: stdout,
                error: stderr
            };
        } catch (error) {
            return {
                status: EXECUTION_STATUS.ERROR,
                output: '',
                error: error.message
            };
        }
    }

    /**
     * Execute HTML/CSS code
     */
    async executeHTML(code) {
        try {
            // For HTML, we'll return a special status that indicates it should be rendered
            return {
                status: EXECUTION_STATUS.SUCCESS,
                output: code,
                error: '',
                isHTML: true
            };
        } catch (error) {
            return {
                status: EXECUTION_STATUS.ERROR,
                output: '',
                error: error.message
            };
        }
    }

    /**
     * Load Pyodide WebAssembly runtime
     */
    async loadPyodide() {
        if (this.pyodideReady) return;

        try {
            // Load Pyodide from CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            // Initialize Pyodide
            this.pyodide = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });

            this.pyodideReady = true;
        } catch (error) {
            console.error('Failed to load Pyodide:', error);
            throw new Error('Failed to initialize Python runtime. Please refresh the page.');
        }
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    }

    /**
     * Check if Pyodide is ready
     */
    isPyodideReady() {
        return this.pyodideReady;
    }
}

// Export singleton instance
export default new ExecutionService();
