# Backend Makefile Quick Reference

## Common Workflows

### First Time Setup
```bash
cd backend
make setup          # Install dependencies and show next steps
make db-setup       # Set up PostgreSQL database
cp .env.example .env  # Configure environment
make test           # Verify everything works
make dev            # Start development server
```

### Daily Development
```bash
make dev            # Start server with auto-reload
make test           # Run tests after changes
```

### Before Committing
```bash
make test           # Ensure tests pass
make clean          # Clean generated files
```

### Using Docker
```bash
make docker-up      # Start all services (PostgreSQL + API)
make docker-logs    # View logs
make docker-down    # Stop services
```

## All Available Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install dependencies with uv |
| `make dev` | Start development server (port 8000) |
| `make test` | Run all tests |
| `make test-watch` | Run tests in watch mode |
| `make test-coverage` | Run tests with coverage report |
| `make lint` | Run linting checks |
| `make format` | Format code |
| `make db-setup` | Set up PostgreSQL database |
| `make db-reset` | Reset database (drop and recreate) |
| `make docker-up` | Start Docker services |
| `make docker-down` | Stop Docker services |
| `make docker-logs` | View Docker logs |
| `make docker-shell` | Open shell in API container |
| `make docker-build` | Build Docker images |
| `make clean` | Clean all generated files |
| `make setup` | Complete project setup |
| `make ci` | Run full CI pipeline |
| `make quick` | Quick start (install + dev) |
| `make docs` | Show API documentation URLs |

## Development Workflows

### Testing Workflow
```bash
# Run tests
make test

# Run with coverage
make test-coverage

# Watch mode for TDD
make test-watch
```

### Database Workflow
```bash
# Initial setup
make db-setup

# Reset if needed
make db-reset
```

### Docker Workflow
```bash
# Start services
make docker-up

# View logs
make docker-logs

# Access API container
make docker-shell

# Stop services
make docker-down
```

### CI/CD Simulation
```bash
# Run full pipeline locally
make ci
# This runs: clean, install, test
```

## Tips

- Run `make help` anytime to see available commands
- Use `make setup` when first cloning the repository
- Use `make test` before committing code
- Use `make docker-up` for full stack development
- Use `make clean` if you encounter issues

## Examples

### New Developer Onboarding
```bash
git clone <repository>
cd online-coding-interviews/backend
make setup
make db-setup
make test
make dev
```

### Pre-commit Checklist
```bash
make test           # Ensure tests pass
make clean          # Clean artifacts
```

### Troubleshooting
```bash
make clean          # Clean everything
make install        # Reinstall dependencies
make test           # Verify it works
```

### Full Stack Development
```bash
# Terminal 1: Backend
cd backend
make docker-up      # Start PostgreSQL + API

# Terminal 2: Frontend
cd frontend
make dev            # Start frontend
```
