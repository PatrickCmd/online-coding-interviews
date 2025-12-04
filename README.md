# CodeInterview - Online Coding Interview Platform

A real-time collaborative coding platform for conducting technical interviews. Built with React and Vite, featuring live code editing, syntax highlighting, and browser-based code execution.

![CodeInterview Platform](https://img.shields.io/badge/React-18+-blue) ![Vite](https://img.shields.io/badge/Vite-5+-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🔗 Session Creation & Sharing** - Generate unique interview sessions with shareable links
- **⚡ Real-time Collaboration** - See code changes instantly as participants type
- **🎨 Syntax Highlighting** - Monaco Editor with support for multiple languages
- **▶️ Code Execution** - Run code directly in the browser
- **🌐 Multi-language Support** - JavaScript, Python (via Pyodide), and HTML/CSS
- **👥 Participant Tracking** - See who's online with avatars and roles
- **🎯 Modern UI** - Beautiful dark mode with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd online-coding-interviews

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:3000**

### Building for Production

```bash
cd frontend
npm run build
npm run preview
```

## 📖 Usage

### Creating an Interview Session

1. Open the application in your browser
2. Click **"Create Interview Session"**
3. Copy the generated session link
4. Share the link with your candidate

### Joining a Session

1. Click **"Join Existing Interview"** on the home page
2. Enter the session ID
3. Click **"Join"**

### During the Interview

- **Write Code**: Use the Monaco editor on the left panel
- **Switch Languages**: Select from JavaScript, Python, or HTML/CSS
- **Run Code**: Click the "Run Code" button to execute
- **View Output**: See results in the execution panel on the right
- **See Participants**: Click the participant count to view online users

## 🏗️ Architecture

### Project Structure

```
online-coding-interviews/
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── HomePage.jsx
│   │   │   ├── InterviewRoom.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── ExecutionPanel.jsx
│   │   │   └── ParticipantList.jsx
│   │   ├── services/        # Mock backend services (centralized)
│   │   │   ├── api.service.js
│   │   │   ├── session.service.js
│   │   │   ├── collaboration.service.js
│   │   │   └── execution.service.js
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useSession.js
│   │   │   ├── useCollaboration.js
│   │   │   └── useCodeExecution.js
│   │   ├── utils/           # Utilities
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── test/            # Test suites
│   │   ├── App.jsx          # Main app with routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Makefile             # Frontend automation
│   ├── TESTING.md           # Testing documentation
│   └── MAKEFILE.md          # Makefile reference
├── docs/                    # Additional documentation
├── Makefile                 # Root Makefile (delegates to frontend)
└── README.md                # This file
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Code Editor | Monaco Editor |
| Python Runtime | Pyodide (WebAssembly) |
| Real-time Sync | BroadcastChannel API |
| Styling | Vanilla CSS with CSS Variables |
| State Management | React Hooks |

### Mock Backend

All backend functionality is simulated and centralized in the `services/` directory:

- **api.service.js** - Central mock API with simulated network delays
- **session.service.js** - Session CRUD operations with localStorage persistence
- **collaboration.service.js** - Real-time synchronization using BroadcastChannel API
- **execution.service.js** - Browser-based code execution for multiple languages

## 🔧 How It Works

### Real-time Collaboration

The application uses the **BroadcastChannel API** to synchronize code changes across browser tabs:

1. When a user types, changes are debounced (300ms)
2. Changes are broadcast to all tabs with the same session ID
3. Other users receive updates and see code changes in real-time

> **Note**: BroadcastChannel only works across tabs in the same browser. For production, implement WebSocket-based synchronization.

### Code Execution

Different execution strategies based on language:

- **JavaScript**: Native execution using sandboxed `Function()` constructor with console output capture
- **Python**: Pyodide WebAssembly runtime (loaded on-demand, ~50MB first time)
- **HTML/CSS**: Rendered in a sandboxed `<iframe>` element

### Session Management

Sessions are stored in localStorage with:
- Unique 8-character hex ID
- 24-hour expiration
- Participant list with roles (interviewer/candidate)
- Current code and language state

## 🎨 Design System

The application features a modern dark mode design with:

- **CSS Variables** for consistent theming
- **Glassmorphism** effects on cards and panels
- **Smooth Animations** (fade-in, slide-in, hover effects)
- **Gradient Accents** for primary actions
- **Inter Font** from Google Fonts
- **Responsive Layout** for mobile and desktop

## 🔒 Security Considerations

> **⚠️ Important**: This is a demonstration/prototype application with the following limitations:

- **Code Execution**: Runs in browser sandbox with security limitations
- **No Authentication**: Sessions are accessible to anyone with the link
- **Client-side Storage**: Data stored in localStorage (not persistent across devices)
- **BroadcastChannel**: Only works within the same browser instance

For production use, consider:
- Implementing proper backend with WebSocket support
- Adding authentication and authorization
- Using server-side code execution in isolated containers
- Implementing rate limiting and input validation

## 🧪 Testing

The project includes a comprehensive unit testing suite with **80 tests** covering services, utilities, and components.

### Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- **Services**: 82.51% coverage
- **Utilities**: 95.34% coverage
- **Overall**: 80 tests, 100% pass rate ✅

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Makefile Commands

For convenience, Makefiles are provided to automate common tasks. The root Makefile delegates to the frontend:

```bash
# Show all available commands
make help

# Development (from root directory)
make install        # Install frontend dependencies
make dev            # Start frontend development server
make build          # Build frontend for production
make preview        # Preview frontend production build

# Testing
make test           # Run all tests
make test-ui        # Run tests with UI
make test-coverage  # Run tests with coverage
make test-watch     # Run tests in watch mode

# Maintenance
make clean          # Clean all artifacts
make setup          # Complete project setup
make verify         # Verify project health (test + build)
make ci             # Run full CI pipeline locally
```

You can also run commands directly in the frontend directory:

```bash
cd frontend
make help           # See frontend-specific commands
npm run dev         # Or use npm directly
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Pyodide](https://pyodide.org/) - Python in WebAssembly
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

---

**Built with ❤️ for better technical interviews**
