# Makefile for Online Coding Interview Platform
# Root-level Makefile that delegates to frontend

.PHONY: help install dev build preview test test-ui test-coverage clean setup verify

# Default target - show help
help:
	@echo "📋 Available commands (delegates to frontend/):"
	@echo ""
	@echo "  make install        - Install frontend dependencies"
	@echo "  make dev            - Start frontend development server"
	@echo "  make build          - Build frontend for production"
	@echo "  make preview        - Preview frontend production build"
	@echo ""
	@echo "  make test           - Run frontend tests"
	@echo "  make test-ui        - Run frontend tests with UI"
	@echo "  make test-coverage  - Run frontend tests with coverage"
	@echo ""
	@echo "  make clean          - Clean all artifacts"
	@echo "  make setup          - Complete project setup"
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

# Run tests with coverage
test-coverage:
	@echo "🧪 Running frontend tests with coverage..."
	cd frontend && $(MAKE) test-coverage

# Clean all
clean:
	@echo "🧹 Cleaning all artifacts..."
	cd frontend && $(MAKE) clean

# Setup project
setup:
	@echo "🔧 Setting up project..."
	cd frontend && $(MAKE) setup

# Verify project
verify:
	@echo "✅ Verifying project..."
	cd frontend && $(MAKE) verify

# CI pipeline
ci:
	@echo "🔄 Running CI pipeline..."
	cd frontend && $(MAKE) ci
