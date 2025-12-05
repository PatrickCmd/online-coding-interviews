# CodeInterview - Online Coding Interview Platform

A full-stack real-time collaborative coding platform for conducting technical interviews. Built with React frontend and FastAPI backend, featuring live code editing, syntax highlighting, browser-based code execution, and persistent sessions with PostgreSQL.

![CodeInterview Platform](https://img.shields.io/badge/React-18+-blue) ![Vite](https://img.shields.io/badge/Vite-5+-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Frontend
- **🔗 Session Creation & Sharing** - Generate unique interview sessions with shareable links
- **⚡ Real-time Collaboration** - See code changes instantly as participants type
- **🎨 Syntax Highlighting** - Monaco Editor with support for multiple languages
- **▶️ Code Execution** - Run code directly in the browser
- **🌐 Multi-language Support** - JavaScript, Python (via Pyodide), and HTML/CSS
- **👥 Participant Tracking** - See who's online with avatars and roles
- **🎯 Modern UI** - Beautiful dark mode with glassmorphism effects

### Backend
- **🔧 RESTful API** - FastAPI with PostgreSQL for persistent sessions
- **🔌 WebSocket Support** - Real-time collaboration across devices via WebSocket
- **🗄️ Database Migrations** - Alembic for schema versioning
- **🐳 Docker Ready** - Containerized deployment with docker-compose
- **📚 API Documentation** - Auto-generated Swagger/OpenAPI docs
- **✅ Comprehensive Tests** - 18 backend + 84 frontend tests, all passing

### Integration
- **🔗 Full-Stack Architecture** - Frontend integrated with backend API
- **⚡ Real-time Sync** - WebSocket replaces BroadcastChannel for cross-device collaboration
- **💾 Persistent Sessions** - Sessions stored in PostgreSQL database
- **🔄 Automatic Reconnection** - WebSocket auto-reconnect with exponential backoff
- **🛡️ Error Handling** - Graceful degradation and user-friendly error messages

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (for backend)
- Python 3.12+ (for local backend development)

### Full-Stack Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/PatrickCmd/online-coding-interviews.git
cd online-coding-interviews

# Start backend with Docker
cd backend
make docker-up

# In a new terminal, start frontend
cd frontend
npm install
npm run dev
```

**Access the application:**
- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**

### Frontend Only (Legacy Mode)

> ⚠️ **Note**: Frontend-only mode is deprecated. The application now requires the backend for full functionality.

```bash
cd frontend
npm install
npm run dev
```

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
│   │   ├── services/        # Backend integration services
│   │   │   ├── api.service.js         # Axios HTTP client
│   │   │   ├── websocket.service.js   # WebSocket client
│   │   │   ├── session.service.js     # Session management
│   │   │   ├── collaboration.service.js # Real-time collaboration
│   │   │   └── execution.service.js   # Code execution
│   │   ├── config/          # Configuration
│   │   │   └── api.config.js          # API endpoints
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useSession.js
│   │   │   ├── useCollaboration.js
│   │   │   ├── useCodeExecution.js
│   │   │   ├── useConnectionState.js  # WebSocket connection monitoring
│   │   │   └── index.js               # Barrel exports
│   │   ├── utils/           # Utilities
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── test/            # Test suites
│   │   ├── App.jsx          # Main app with routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── Makefile             # Frontend automation
├── backend/                 # Backend API (FastAPI + PostgreSQL)
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   ├── sessions.py
│   │   │   └── participants.py
│   │   ├── models/          # SQLAlchemy models
│   │   │   └── models.py
│   │   ├── schemas/         # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── services/        # Business logic
│   │   │   ├── session_service.py
│   │   │   └── websocket_manager.py
│   │   ├── db/              # Database connection
│   │   │   └── database.py
│   │   ├── core/            # Configuration
│   │   │   └── config.py
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Pytest tests
│   ├── alembic/             # Database migrations
│   ├── pyproject.toml       # Python dependencies
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── Makefile             # Backend automation
├── docs/                    # Documentation
│   ├── API.md               # API documentation
│   ├── openapi.yaml         # OpenAPI specification
│   └── BACKEND_GUIDE.md     # Backend implementation guide
├── Makefile                 # Root automation (delegates to frontend/backend)
└── README.md                # This file
```

### Frontend Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Code Editor | Monaco Editor |
| HTTP Client | Axios |
| WebSocket | Native WebSocket API |
| Python Runtime | Pyodide (WebAssembly) |
| Styling | Vanilla CSS with CSS Variables |
| State Management | React Hooks |
| Testing | Vitest + React Testing Library |

### Backend Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| WebSocket | FastAPI WebSocket |
| Validation | Pydantic |
| Testing | Pytest |
| Containerization | Docker + Docker Compose |
| Package Manager | uv |

### Backend Services

The backend provides persistent session storage and real-time collaboration:

- **api.service.js** - Axios HTTP client with error handling and retry logic
- **websocket.service.js** - WebSocket client with automatic reconnection
- **session.service.js** - Session management via backend API
- **collaboration.service.js** - Real-time synchronization using WebSocket
- **execution.service.js** - Browser-based code execution for multiple languages

## 🔧 How It Works

### Real-time Collaboration

The application uses **WebSocket** for real-time synchronization across devices:

1. When a user types, changes are debounced (300ms)
2. Changes are sent to the backend via WebSocket
3. Backend broadcasts updates to all connected clients in the session
4. Other users receive updates and see code changes in real-time
5. Automatic reconnection with exponential backoff if connection drops

**Connection States:**
- `connecting` - Initial connection
- `connected` - Successfully connected
- `reconnecting` - Attempting to reconnect
- `disconnected` - Not connected
- `failed` - Max reconnection attempts reached

### Code Execution

Different execution strategies based on language:

- **JavaScript**: Native execution using sandboxed `Function()` constructor with console output capture
- **Python**: Pyodide WebAssembly runtime (loaded on-demand, ~50MB first time)
- **HTML/CSS**: Rendered in a sandboxed `<iframe>` element

### Session Management

Sessions are stored in **PostgreSQL database** with:
- Unique 8-character hex ID
- 24-hour expiration (enforced by backend)
- Participant list with roles (interviewer/candidate)
- Current code and language state
- Timestamps (created, updated, expires)

**Session Lifecycle:**
1. Frontend creates session via `POST /api/v1/sessions`
2. Backend generates ID, stores in PostgreSQL
3. Users join via `POST /api/v1/sessions/{id}/join`
4. Code updates saved via `PUT /api/v1/sessions/{id}/code`
5. Sessions expire after 24 hours (410 Gone response)

## 🎨 Design System

The application features a modern dark mode design with:

- **CSS Variables** for consistent theming
- **Glassmorphism** effects on cards and panels
- **Smooth Animations** (fade-in, slide-in, hover effects)
- **Gradient Accents** for primary actions
- **Inter Font** from Google Fonts
- **Responsive Layout** for mobile and desktop

## 🔒 Security Considerations

> **⚠️ Important**: This application is designed for technical interviews with the following security model:

**Current Implementation:**
- **Code Execution**: Runs in browser sandbox (JavaScript, Python via Pyodide, HTML/CSS)
- **Session Access**: Sessions accessible to anyone with the link (no authentication)
- **Data Persistence**: Sessions stored in PostgreSQL with 24-hour expiration
- **WebSocket**: Real-time collaboration across devices

**For Production Use, Consider:**
- Implementing JWT authentication and user accounts
- Adding authorization (session creators can manage participants)
- Server-side code execution in isolated Docker containers
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS/WSS for encrypted connections
- CORS configuration for specific domains

## 📚 Documentation

### Frontend Documentation
- [Frontend Integration Guide](frontend/INTEGRATION.md) - Frontend-backend integration details
- [Frontend README](frontend/README.md) - Frontend-specific documentation

### Backend Documentation
- [Backend README](backend/README.md) - Backend setup and usage
- [Backend Guide](docs/BACKEND_GUIDE.md) - Comprehensive backend implementation guide
- [API Documentation](docs/API.md) - API endpoints and usage
- [OpenAPI Specification](docs/openapi.yaml) - Complete API specification
- [Database Migrations](backend/MIGRATIONS.md) - Alembic migration guide
- [Docker Guide](backend/DOCKER.md) - Docker setup and commands
- [Permissions Fix](backend/PERMISSIONS_FIX.md) - PostgreSQL permissions troubleshooting

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/sessions` | POST | Create session |
| `/api/v1/sessions/{id}` | GET | Get session details |
| `/api/v1/sessions/{id}` | PATCH | Update session |
| `/api/v1/sessions/{id}` | DELETE | Delete session |
| `/api/v1/sessions/{id}/join` | POST | Join session |
| `/api/v1/sessions/{id}/code` | PUT | Save code |
| `/api/v1/sessions/{id}/participants` | GET | Get participants |
| `/api/v1/sessions/{id}/participants/{pid}` | PATCH | Update participant |
| `/api/v1/sessions/{id}/participants/{pid}` | DELETE | Remove participant |
| `/ws/sessions/{id}` | WS | WebSocket connection |

**Interactive API Docs**: http://localhost:8000/docs (when backend is running)

## 🔧 Backend API

The project includes a complete **FastAPI backend** with PostgreSQL database for production-ready deployments.

### Backend Features

- ✅ **RESTful API** - Session and participant management
- ✅ **WebSocket Support** - Real-time collaboration
- ✅ **PostgreSQL Database** - Persistent data storage
- ✅ **Database Migrations** - Alembic for schema versioning
- ✅ **Docker Support** - Containerized deployment
- ✅ **Comprehensive Tests** - 18 pytest tests (100% pass rate)
- ✅ **API Documentation** - Auto-generated OpenAPI/Swagger docs

### Quick Start (Backend)

#### Option 1: Docker (Recommended)

```bash
cd backend
make docker-up              # Starts PostgreSQL + API
```

Access:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

#### Option 2: Local Development

```bash
cd backend

# Install dependencies
make install

# Set up database
make db-setup

# Run migrations
make db-migrate

# Start server
make dev
```

### Backend Commands

```bash
# Development
make install        # Install dependencies with uv
make dev            # Start development server
make test           # Run all tests

# Database
make db-setup       # Set up PostgreSQL database
make db-migrate     # Run database migrations
make db-migrate-create  # Create new migration

# Docker
make docker-up      # Start all services
make docker-migrate # Run migrations in Docker
make docker-db-shell # Access database shell
```

### Backend Documentation

- **[Backend README](backend/README.md)** - Complete setup guide
- **[API Documentation](docs/API.md)** - API endpoints and data models
- **[OpenAPI Spec](docs/openapi.yaml)** - OpenAPI 3.0 specification
- **[Backend Guide](docs/BACKEND_GUIDE.md)** - Implementation guide
- **[Migrations Guide](backend/MIGRATIONS.md)** - Database migrations
- **[Docker Guide](backend/DOCKER.md)** - Docker setup and commands
- **[Permissions Fix](backend/PERMISSIONS_FIX.md)** - PostgreSQL permissions

### Backend Stack

- **Framework**: FastAPI 0.115.6
- **Database**: PostgreSQL 17 with SQLAlchemy 2.0.36
- **Python**: 3.12+
- **Migrations**: Alembic 1.17.2
- **Testing**: pytest 8.3.4
- **Dependency Management**: uv

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/sessions` | POST | Create session |
| `/api/v1/sessions/{id}` | GET | Get session |
| `/api/v1/sessions/{id}` | PATCH | Update session |
| `/api/v1/sessions/{id}` | DELETE | Delete session |
| `/api/v1/sessions/{id}/join` | POST | Join session |
| `/api/v1/sessions/{id}/code` | PUT | Save code |
| `/api/v1/sessions/{id}/participants` | GET | List participants |
| `/ws/sessions/{id}` | WS | WebSocket connection |

See [API.md](docs/API.md) for detailed documentation.

## 🧪 Testing

The project includes comprehensive testing for both frontend and backend.

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Results:**
- **84 tests** across 8 test files
- **100% pass rate** ✅
- Tests cover: API service, session service, collaboration service, WebSocket integration, utilities, and components

### Backend Tests

```bash
cd backend

# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test file
uv run pytest tests/test_sessions.py
```

**Test Results:**
- **18 tests** covering API endpoints, WebSocket, and database operations
- **100% pass rate** ✅
- Tests include: Session CRUD, participant management, WebSocket connections, database migrations

### Integration Testing

To test the full stack:

```bash
# Start backend
cd backend && make docker-up

# In another terminal, run frontend tests
cd frontend && npm test

# Test API manually
curl http://localhost:8000/api/v1/health
```

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

For convenience, Makefiles are provided to automate common tasks. The root Makefile delegates to frontend and backend:

```bash
# Show all available commands
make help

# Frontend Commands
make install        # Install frontend dependencies
make dev            # Start frontend development server
make build          # Build frontend for production
make preview        # Preview frontend production build

# Backend Commands
make backend-install # Install backend dependencies
make backend-dev     # Start backend development server
make backend-test    # Run backend tests
make backend-docker  # Start backend with Docker

# Testing
make test           # Run frontend tests
make test-ui        # Run tests with UI
make test-coverage  # Run tests with coverage

# Full Stack
make fullstack-dev  # Start both frontend and backend
make fullstack-test # Run all tests (frontend + backend)

# Maintenance
make clean          # Clean all artifacts (frontend + backend)
make setup          # Complete project setup (frontend + backend)
```

You can also run commands directly in each directory:

```bash
# Frontend
cd frontend
make help           # See frontend-specific commands

# Backend
cd backend
make help           # See backend-specific commands
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
