# Makefile for CodeInterview Backend
# Automates common development tasks

.PHONY: help install dev test test-watch test-coverage clean lint format db-setup docker-up docker-down

# Default target - show help
help:
	@echo "📋 Backend Commands:"
	@echo ""
	@echo "  make install        - Install dependencies with uv"
	@echo "  make dev            - Start development server"
	@echo "  make test           - Run all tests"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo ""
	@echo "  make lint           - Run linting checks"
	@echo "  make format         - Format code"
	@echo ""
	@echo "  make db-setup       - Set up PostgreSQL database"
	@echo "  make db-reset       - Reset database (drop and recreate)"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-migrate-create - Create new migration"
	@echo "  make db-migrate-rollback - Rollback last migration"
	@echo "  make db-migrate-history - Show migration history"
	@echo ""
	@echo "  make docker-up      - Start Docker services"
	@echo "  make docker-down    - Stop Docker services"
	@echo "  make docker-logs    - View Docker logs"
	@echo "  make docker-shell   - Open shell in API container"
	@echo "  make docker-migrate - Run migrations in Docker"
	@echo "  make docker-migrate-create - Create migration in Docker"
	@echo "  make docker-db-shell - Open database shell in Docker"
	@echo ""
	@echo "  make clean          - Clean all generated files"
	@echo "  make setup          - Complete project setup"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies with uv..."
	uv sync
	@echo "✅ Dependencies installed!"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test:
	@echo "🧪 Running tests..."
	uv run pytest tests/ -v
	@echo "✅ Tests complete!"

# Run tests in watch mode
test-watch:
	@echo "🧪 Running tests in watch mode..."
	uv run pytest-watch tests/

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	uv run pytest tests/ --cov=app --cov-report=html --cov-report=term
	@echo "📊 Coverage report generated in htmlcov/"

# Lint code
lint:
	@echo "🔍 Running linting checks..."
	uv run ruff check app/ tests/
	@echo "✅ Linting complete!"

# Format code
format:
	@echo "✨ Formatting code..."
	uv run ruff format app/ tests/
	@echo "✅ Code formatted!"

# Database setup
db-setup:
	@echo "🗄️  Setting up PostgreSQL database..."
	@command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL not installed"; exit 1; }
	psql -U postgres -c "CREATE DATABASE codeinterview;" || echo "Database may already exist"
	psql -U postgres -c "CREATE USER codeinterview WITH PASSWORD 'password';" || echo "User may already exist"
	psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE codeinterview TO codeinterview;"
	@echo "Granting schema permissions..."
	psql -U postgres -d codeinterview -c "GRANT ALL ON SCHEMA public TO codeinterview;"
	psql -U postgres -d codeinterview -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO codeinterview;"
	psql -U postgres -d codeinterview -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO codeinterview;"
	psql -U postgres -d codeinterview -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeinterview;"
	psql -U postgres -d codeinterview -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codeinterview;"
	@echo "✅ Database setup complete!"

# Reset database
db-reset:
	@echo "🗄️  Resetting database..."
	psql -U postgres -c "DROP DATABASE IF EXISTS codeinterview;"
	psql -U postgres -c "CREATE DATABASE codeinterview;"
	@echo "Re-running setup to grant permissions..."
	@$(MAKE) db-setup
	@echo "✅ Database reset complete!"

# Database migrations with Alembic
db-migrate:
	@echo "🔄 Running database migrations..."
	uv run alembic upgrade head
	@echo "✅ Migrations complete!"

db-migrate-create:
	@echo "📝 Creating new migration..."
	@read -p "Enter migration message: " msg; \
	uv run alembic revision --autogenerate -m "$$msg"
	@echo "✅ Migration created!"

db-migrate-rollback:
	@echo "⏪ Rolling back last migration..."
	uv run alembic downgrade -1
	@echo "✅ Rollback complete!"

db-migrate-history:
	@echo "📜 Migration history:"
	uv run alembic history

db-migrate-current:
	@echo "📍 Current migration:"
	uv run alembic current

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   API: http://localhost:8000"
	@echo "   PostgreSQL: localhost:5432"

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down
	@echo "✅ Services stopped!"

docker-logs:
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

docker-shell:
	@echo "🐚 Opening shell in API container..."
	docker-compose exec api /bin/bash

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Build complete!"

# Docker migration commands
docker-migrate:
	@echo "🔄 Running migrations in Docker..."
	docker-compose exec api uv run alembic upgrade head
	@echo "✅ Migrations complete!"

docker-migrate-create:
	@echo "📝 Creating migration in Docker..."
	@read -p "Enter migration message: " msg; \
	docker-compose exec api uv run alembic revision --autogenerate -m "$$msg"
	@echo "✅ Migration created!"

docker-migrate-rollback:
	@echo "⏪ Rolling back migration in Docker..."
	docker-compose exec api uv run alembic downgrade -1
	@echo "✅ Rollback complete!"

docker-db-shell:
	@echo "🐚 Opening database shell in Docker..."
	docker-compose exec db psql -U codeinterview -d codeinterview

docker-db-reset:
	@echo "🗄️  Resetting database in Docker..."
	docker-compose down -v
	docker-compose up -d
	@echo "✅ Database reset complete!"

# Clean generated files
clean:
	@echo "🧹 Cleaning generated files..."
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage
	rm -rf dist
	rm -rf *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "test.db" -delete
	@echo "✅ Cleanup complete!"

# Complete project setup
setup: install
	@echo ""
	@echo "✅ Backend setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Set up database: make db-setup"
	@echo "  2. Copy .env.example to .env and configure"
	@echo "  3. Run tests: make test"
	@echo "  4. Start server: make dev"
	@echo ""

# Run full CI pipeline
ci: clean install test
	@echo ""
	@echo "✅ CI pipeline complete!"
	@echo "   All tests passed"

# Quick development start
quick: install dev

# Show API documentation
docs:
	@echo "📚 API Documentation:"
	@echo "   Swagger UI: http://localhost:8000/docs"
	@echo "   ReDoc: http://localhost:8000/redoc"
	@echo ""
	@echo "Starting server..."
	@make dev
