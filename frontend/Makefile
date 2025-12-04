# Makefile for Online Coding Interview Platform
# Automates common development tasks

.PHONY: help install dev build preview test test-ui test-coverage clean lint format setup

# Default target - show help
help:
	@echo "📋 Available commands:"
	@echo ""
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Start development server"
	@echo "  make build          - Build for production"
	@echo "  make preview        - Preview production build"
	@echo ""
	@echo "  make test           - Run all tests"
	@echo "  make test-ui        - Run tests with UI"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo ""
	@echo "  make clean          - Clean build artifacts and dependencies"
	@echo "  make clean-build    - Clean build artifacts only"
	@echo "  make clean-deps     - Clean dependencies only"
	@echo ""
	@echo "  make setup          - Complete project setup (install + test)"
	@echo "  make verify         - Verify project health (test + build)"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed!"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Build for production
build:
	@echo "🏗️  Building for production..."
	npm run build
	@echo "✅ Build complete!"

# Preview production build
preview: build
	@echo "👀 Previewing production build..."
	npm run preview

# Run tests
test:
	@echo "🧪 Running tests..."
	npm test -- --run
	@echo "✅ Tests complete!"

# Run tests with UI
test-ui:
	@echo "🧪 Running tests with UI..."
	npm run test:ui

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage -- --run
	@echo "📊 Coverage report generated in coverage/"

# Run tests in watch mode
test-watch:
	@echo "🧪 Running tests in watch mode..."
	npm test

# Clean all build artifacts and dependencies
clean: clean-build clean-deps
	@echo "🧹 Cleaned all artifacts and dependencies!"

# Clean build artifacts only
clean-build:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist coverage
	@echo "✅ Build artifacts cleaned!"

# Clean dependencies only
clean-deps:
	@echo "🧹 Cleaning dependencies..."
	rm -rf node_modules package-lock.json
	@echo "✅ Dependencies cleaned!"

# Complete project setup
setup: install test
	@echo ""
	@echo "✅ Project setup complete!"
	@echo "   Run 'make dev' to start development server"

# Verify project health
verify: test build
	@echo ""
	@echo "✅ Project verification complete!"
	@echo "   All tests passed and build successful"

# Quick start for new developers
quickstart:
	@echo "🚀 Quick start for new developers..."
	@echo ""
	@echo "1️⃣  Installing dependencies..."
	@make install
	@echo ""
	@echo "2️⃣  Running tests..."
	@make test
	@echo ""
	@echo "3️⃣  Starting development server..."
	@echo "   Server will start at http://localhost:3000"
	@echo ""
	@make dev

# Reinstall dependencies (clean install)
reinstall: clean-deps install
	@echo "✅ Dependencies reinstalled!"

# Run full CI pipeline locally
ci: clean install test build
	@echo ""
	@echo "✅ CI pipeline complete!"
	@echo "   Ready for deployment"
