import { useState, useCallback } from 'react';
import executionService from '../services/execution.service.js';
import { EXECUTION_STATUS } from '../utils/constants.js';

/**
 * Custom hook for managing code execution
 */
export const useCodeExecution = () => {
    const [executionState, setExecutionState] = useState({
        status: EXECUTION_STATUS.IDLE,
        output: '',
        error: '',
        isHTML: false
    });
    const [isExecuting, setIsExecuting] = useState(false);

    /**
     * Execute code
     */
    const executeCode = useCallback(async (code, language) => {
        setIsExecuting(true);
        setExecutionState({
            status: EXECUTION_STATUS.RUNNING,
            output: '',
            error: '',
            isHTML: false
        });

        try {
            const result = await executionService.executeCode(code, language);

            setExecutionState({
                status: result.status,
                output: result.output,
                error: result.error,
                isHTML: result.isHTML || false
            });

            return result;
        } catch (error) {
            setExecutionState({
                status: EXECUTION_STATUS.ERROR,
                output: '',
                error: error.message,
                isHTML: false
            });

            return {
                status: EXECUTION_STATUS.ERROR,
                output: '',
                error: error.message
            };
        } finally {
            setIsExecuting(false);
        }
    }, []);

    /**
     * Clear execution output
     */
    const clearOutput = useCallback(() => {
        setExecutionState({
            status: EXECUTION_STATUS.IDLE,
            output: '',
            error: '',
            isHTML: false
        });
    }, []);

    /**
     * Check if Pyodide is ready
     */
    const isPyodideReady = useCallback(() => {
        return executionService.isPyodideReady();
    }, []);

    return {
        executionState,
        isExecuting,
        executeCode,
        clearOutput,
        isPyodideReady
    };
};
