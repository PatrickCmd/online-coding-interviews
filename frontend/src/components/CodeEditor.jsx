import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { EDITOR_OPTIONS, EDITOR_THEME, LANGUAGES } from '../utils/constants';
import './CodeEditor.css';

const CodeEditor = ({ code, language, onChange }) => {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Focus the editor
        editor.focus();
    };

    const handleEditorChange = (value) => {
        if (onChange) {
            onChange(value || '');
        }
    };

    // Get Monaco language ID
    const getMonacoLanguage = () => {
        const langConfig = Object.values(LANGUAGES).find(l => l.id === language);
        return langConfig?.monacoId || 'javascript';
    };

    return (
        <div className="code-editor-container">
            <Editor
                height="100%"
                language={getMonacoLanguage()}
                value={code}
                theme={EDITOR_THEME}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={EDITOR_OPTIONS}
                loading={
                    <div className="editor-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading editor...</p>
                    </div>
                }
            />
        </div>
    );
};

export default CodeEditor;
