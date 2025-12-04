# Makefile for Online Coding Interview Platform
# Root-level Makefile that delegates to frontend

.PHONY: help install dev build preview test test-ui test-coverage clean setup verify

# Default target - show help
help:
	@echo "📋 Available commands (delegates to frontend/ and backend/):"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make install        - Install frontend dependencies"
	@echo "  make dev            - Start frontend development server"
	@echo "  make build          - Build frontend for production"
	@echo "  make preview        - Preview frontend production build"
	@echo ""
	@echo "Backend Commands:"
	@echo "  make backend-install - Install backend dependencies"
	@echo "  make backend-dev     - Start backend development server"
	@echo "  make backend-test    - Run backend tests"
	@echo "  make backend-docker  - Start backend with Docker"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run frontend tests"
	@echo "  make test-ui        - Run frontend tests with UI"
	@echo "  make test-coverage  - Run frontend tests with coverage"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Clean all artifacts (frontend + backend)"
	@echo "  make setup          - Complete project setup (frontend + backend)"
	@echo "  make verify         - Verify project health"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && $(MAKE) install

# Start development server
dev:
	@echo "🚀 Starting frontend development server..."
	cd frontend && $(MAKE) dev

# Build for production
build:
	@echo "🏗️  Building frontend for production..."
	cd frontend && $(MAKE) build

# Preview production build
preview:
	@echo "👀 Previewing frontend production build..."
	cd frontend && $(MAKE) preview

# Run tests
test:
	@echo "🧪 Running frontend tests..."
	cd frontend && $(MAKE) test

# Run tests with UI
test-ui:
	@echo "🧪 Running frontend tests with UI..."
	cd frontend && $(MAKE) test-ui

# Run# Test with coverage
test-coverage:
	@echo "🧪 Running frontend tests with coverage..."
	cd frontend && $(MAKE) test-coverage

# Verify project
verify:
	@echo "✅ Verifying project..."
	cd frontend && $(MAKE) verify

# CI pipeline
ci:
	@echo "🔄 Running CI pipeline..."
	cd frontend && $(MAKE) ci
	cd backend && $(MAKE) ci

# Backend commands
backend-install:
	@echo "📦 Installing backend dependencies..."
	cd backend && $(MAKE) install

backend-dev:
	@echo "🚀 Starting backend development server..."
	cd backend && $(MAKE) dev

backend-test:
	@echo "🧪 Running backend tests..."
	cd backend && $(MAKE) test

backend-docker:
	@echo "🐳 Starting backend with Docker..."
	cd backend && $(MAKE) docker-up

backend-clean:
	@echo "🧹 Cleaning backend artifacts..."
	cd backend && $(MAKE) clean

# Full stack commands
fullstack-dev:
	@echo "🚀 Starting full stack (frontend + backend)..."
	@echo "Starting backend..."
	cd backend && $(MAKE) docker-up &
	@echo "Starting frontend..."
	cd frontend && $(MAKE) dev

fullstack-test:
	@echo "🧪 Running all tests (frontend + backend)..."
	cd frontend && $(MAKE) test
	cd backend && $(MAKE) test
	@echo "✅ All tests complete!"

# Override clean to clean both frontend and backend
clean: 
	@echo "🧹 Cleaning all artifacts..."
	cd frontend && $(MAKE) clean
	cd backend && $(MAKE) clean
	@echo "✅ Cleanup complete!"

# Override setup to setup both frontend and backend
setup:
	@echo "🔧 Setting up full project..."
	cd frontend && $(MAKE) setup
	cd backend && $(MAKE) setup
	@echo "✅ Full project setup complete!"

