import { useState, useRef, useEffect } from 'react';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { EXECUTION_STATUS } from '../utils/constants';
import './ExecutionPanel.css';

const ExecutionPanel = ({ code, language }) => {
    const { executionState, isExecuting, executeCode, clearOutput } = useCodeExecution();
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const outputRef = useRef(null);

    // Auto-scroll to bottom when output changes
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [executionState.output, executionState.error]);

    const handleRun = async () => {
        // Show loading for Python if Pyodide not ready
        if (language === 'python') {
            setPyodideLoading(true);
        }

        await executeCode(code, language);
        setPyodideLoading(false);
    };

    const getStatusIcon = () => {
        switch (executionState.status) {
            case EXECUTION_STATUS.RUNNING:
                return '⏳';
            case EXECUTION_STATUS.SUCCESS:
                return '✅';
            case EXECUTION_STATUS.ERROR:
                return '❌';
            default:
                return '▶️';
        }
    };

    const getStatusText = () => {
        switch (executionState.status) {
            case EXECUTION_STATUS.RUNNING:
                return 'Running...';
            case EXECUTION_STATUS.SUCCESS:
                return 'Success';
            case EXECUTION_STATUS.ERROR:
                return 'Error';
            default:
                return 'Ready';
        }
    };

    return (
        <div className="execution-panel">
            {/* Header */}
            <div className="execution-header">
                <div className="execution-status">
                    <span className="status-icon">{getStatusIcon()}</span>
                    <span className="status-text">{getStatusText()}</span>
                </div>

                <div className="execution-actions">
                    <button
                        className="btn-clear"
                        onClick={clearOutput}
                        disabled={executionState.status === EXECUTION_STATUS.IDLE}
                    >
                        Clear
                    </button>
                    <button
                        className="btn-run"
                        onClick={handleRun}
                        disabled={isExecuting || !code.trim()}
                    >
                        {isExecuting ? (
                            <>
                                <span className="spinner-small"></span>
                                <span>Running...</span>
                            </>
                        ) : (
                            <>
                                <span>▶️</span>
                                <span>Run Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Output Area */}
            <div className="execution-output" ref={outputRef}>
                {pyodideLoading && (
                    <div className="pyodide-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading Python runtime (first time only)...</p>
                    </div>
                )}

                {executionState.status === EXECUTION_STATUS.IDLE && !pyodideLoading && (
                    <div className="output-placeholder">
                        <p>Click "Run Code" to execute your code</p>
                        <p className="output-hint">Output will appear here</p>
                    </div>
                )}

                {executionState.isHTML && executionState.output ? (
                    <iframe
                        srcDoc={executionState.output}
                        title="HTML Preview"
                        className="html-preview"
                        sandbox="allow-scripts"
                    />
                ) : (
                    <>
                        {executionState.output && (
                            <div className="output-section">
                                <div className="output-label">Output:</div>
                                <pre className="output-content">{executionState.output}</pre>
                            </div>
                        )}

                        {executionState.error && (
                            <div className="output-section error-section">
                                <div className="output-label error-label">Error:</div>
                                <pre className="output-content error-content">{executionState.error}</pre>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ExecutionPanel;
