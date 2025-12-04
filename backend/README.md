# CodeInterview Backend

FastAPI backend for the Online Coding Interview Platform with PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL 17
- uv (for dependency management)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the application
uv run uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## �️ Makefile Commands

For convenience, a Makefile is provided to automate common tasks:

```bash
# Show all available commands
make help

# Development
make install        # Install dependencies with uv
make dev            # Start development server
make setup          # Complete project setup

# Testing
make test           # Run all tests
make test-watch     # Run tests in watch mode
make test-coverage  # Run tests with coverage report

# Database
make db-setup       # Set up PostgreSQL database
make db-reset       # Reset database

# Docker
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make docker-logs    # View Docker logs
make docker-shell   # Open shell in API container

# Maintenance
make clean          # Clean generated files
make ci             # Run full CI pipeline
```

## �📚 API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: See `/docs/openapi.yaml` in project root

## 🧪 Testing

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_sessions.py -v
```

**Test Results**: ✅ 18/18 tests passing

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

Services:
- **API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### Docker with Migrations

```bash
# Start services (migrations run automatically)
make docker-up

# Or run migrations manually
make docker-migrate

# Create new migration in Docker
make docker-migrate-create

# Access database shell
make docker-db-shell

# Reset database (removes all data)
make docker-db-reset
```

See [MIGRATIONS.md](./MIGRATIONS.md#docker-setup--migrations) for detailed Docker migration guide.

### Manual Docker Build

```bash
# Build image
docker build -t codeinterview-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  codeinterview-api
```

### Database Migrations

This project uses **Alembic** for database migrations:

```bash
# Run migrations
make db-migrate

# Create new migration
make db-migrate-create

# Rollback last migration
make db-migrate-rollback

# View migration history
make db-migrate-history
```

See [MIGRATIONS.md](./MIGRATIONS.md) for detailed migration guide.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                  # API endpoints
│   │   ├── sessions.py       # Session routes
│   │   └── participants.py   # Participant routes
│   ├── core/
│   │   └── config.py         # Configuration
│   ├── db/
│   │   └── database.py       # Database connection
│   ├── models/
│   │   └── models.py         # SQLAlchemy models
│   ├── schemas/
│   │   └── schemas.py        # Pydantic schemas
│   ├── services/
│   │   ├── session_service.py    # Business logic
│   │   └── websocket_manager.py  # WebSocket handling
│   └── main.py               # FastAPI application
├── tests/                    # Pytest tests
│   ├── conftest.py          # Test configuration
│   ├── test_sessions.py     # Session tests
│   ├── test_participants.py # Participant tests
│   └── test_websocket.py    # WebSocket tests
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
├── pyproject.toml           # uv dependencies
└── README.md                # This file
```

## 🔧 Configuration

Environment variables (`.env`):

```env
DATABASE_URL=postgresql://codeinterview:password@localhost:5432/codeinterview
CORS_ORIGINS=["http://localhost:3000"]
```

## 📊 Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
    id VARCHAR(8) PRIMARY KEY,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    creator_id VARCHAR(36) NOT NULL
);
```

### Participants Table
```sql
CREATE TABLE participants (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(8) REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    joined_at BIGINT NOT NULL,
    is_online BOOLEAN DEFAULT true
);
```

## 🛣️ API Endpoints

### Sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions/{id}` - Get session
- `PATCH /api/v1/sessions/{id}` - Update session
- `DELETE /api/v1/sessions/{id}` - Delete session
- `POST /api/v1/sessions/{id}/join` - Join session
- `PUT /api/v1/sessions/{id}/code` - Save code

### Participants
- `GET /api/v1/sessions/{id}/participants` - Get participants
- `DELETE /api/v1/sessions/{id}/participants/{pid}` - Remove participant
- `PATCH /api/v1/sessions/{id}/participants/{pid}` - Update participant

### WebSocket
- `WS /ws/sessions/{id}` - Real-time collaboration

### Health
- `GET /api/v1/health` - Health check

## 🔒 Security Notes

- **Code Execution**: No server-side code execution. All code runs in the browser using WASM/Pyodide
- **CORS**: Configured for frontend origin
- **Session Expiration**: Automatic cleanup after 24 hours
- **Authentication**: Not implemented in MVP (planned for future)

## 🚧 Development

### Database Setup

```bash
# Create PostgreSQL database
createdb codeinterview

# Or using psql
psql -U postgres
CREATE DATABASE codeinterview;
CREATE USER codeinterview WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE codeinterview TO codeinterview;
```

### Running Locally

```bash
# Start development server with auto-reload
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with different port
uv run uvicorn app.main:app --reload --port 8080
```

### Adding Dependencies

```bash
# Add a new package
uv add <package-name>

# Add dev dependency
uv add --dev <package-name>

# Sync dependencies
uv sync
```

## 📝 Testing Details

### Test Coverage

- **Sessions API**: 10 tests
- **Participants API**: 5 tests  
- **WebSocket**: 3 tests
- **Total**: 18 tests, 100% pass rate

### Test Categories

1. **Unit Tests**: Service layer logic
2. **Integration Tests**: API endpoints
3. **WebSocket Tests**: Real-time functionality

## 🔮 Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Database migrations (Alembic)
- [ ] Logging and monitoring
- [ ] API versioning
- [ ] User management
- [ ] Session analytics

## 📖 Additional Documentation

- [OpenAPI Specification](../docs/openapi.yaml)
- [API Documentation](../docs/API.md)
- [Backend Implementation Guide](../docs/BACKEND_GUIDE.md)

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass before committing

## 📄 License

MIT License - see LICENSE file for details
