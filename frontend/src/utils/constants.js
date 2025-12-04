/**
 * Constants for the application
 */

// Supported programming languages
export const LANGUAGES = {
    JAVASCRIPT: {
        id: 'javascript',
        name: 'JavaScript',
        monacoId: 'javascript',
        icon: '🟨',
        defaultCode: `// Welcome to CodeInterview!
// Write your JavaScript code here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}
`
    },
    PYTHON: {
        id: 'python',
        name: 'Python',
        monacoId: 'python',
        icon: '🐍',
        defaultCode: `# Welcome to CodeInterview!
# Write your Python code here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print('Fibonacci sequence:')
for i in range(10):
    print(f'F({i}) = {fibonacci(i)}')
`
    },
    HTML: {
        id: 'html',
        name: 'HTML/CSS',
        monacoId: 'html',
        icon: '🌐',
        defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeInterview Preview</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      color: #667eea;
      margin: 0 0 1rem 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to CodeInterview! 🚀</h1>
    <p>Edit this HTML/CSS code to see live changes</p>
  </div>
</body>
</html>
`
    }
};

// Default language
export const DEFAULT_LANGUAGE = LANGUAGES.JAVASCRIPT;

// Monaco Editor theme
export const EDITOR_THEME = 'vs-dark';

// Editor options
export const EDITOR_OPTIONS = {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    padding: { top: 16, bottom: 16 }
};

// Mock API delay (milliseconds)
export const API_DELAY = {
    MIN: 200,
    MAX: 500
};

// Session expiration time (24 hours in milliseconds)
export const SESSION_EXPIRATION = 24 * 60 * 60 * 1000;

// LocalStorage keys
export const STORAGE_KEYS = {
    SESSIONS: 'codeinterview_sessions',
    CURRENT_SESSION: 'codeinterview_current_session',
    USER_INFO: 'codeinterview_user_info'
};

// BroadcastChannel name
export const BROADCAST_CHANNEL_NAME = 'codeinterview_sync';

// Message types for collaboration
export const MESSAGE_TYPES = {
    CODE_CHANGE: 'CODE_CHANGE',
    LANGUAGE_CHANGE: 'LANGUAGE_CHANGE',
    USER_JOIN: 'USER_JOIN',
    USER_LEAVE: 'USER_LEAVE',
    CURSOR_POSITION: 'CURSOR_POSITION'
};

// User roles
export const USER_ROLES = {
    INTERVIEWER: 'interviewer',
    CANDIDATE: 'candidate'
};

// Execution status
export const EXECUTION_STATUS = {
    IDLE: 'idle',
    RUNNING: 'running',
    SUCCESS: 'success',
    ERROR: 'error'
};
