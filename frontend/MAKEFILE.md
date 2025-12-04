# Makefile Quick Reference

## Common Commands

### Development Workflow
```bash
# First time setup
make setup          # Install dependencies and run tests

# Daily development
make dev            # Start dev server (http://localhost:3000)

# Before committing
make verify         # Run tests and build
```

### Testing
```bash
make test           # Run all tests (quick)
make test-coverage  # Run with coverage report
make test-ui        # Interactive test UI
make test-watch     # Watch mode for TDD
```

### Building
```bash
make build          # Production build
make preview        # Preview production build
```

### Maintenance
```bash
make clean          # Clean everything
make clean-build    # Clean build artifacts only
make reinstall      # Fresh dependency install
```

### CI/CD
```bash
make ci             # Full CI pipeline (clean, install, test, build)
```

## All Available Targets

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install npm dependencies |
| `make dev` | Start development server |
| `make build` | Build for production |
| `make preview` | Preview production build |
| `make test` | Run all tests |
| `make test-ui` | Run tests with interactive UI |
| `make test-coverage` | Run tests with coverage report |
| `make test-watch` | Run tests in watch mode |
| `make clean` | Clean all artifacts and dependencies |
| `make clean-build` | Clean build artifacts only |
| `make clean-deps` | Clean dependencies only |
| `make setup` | Complete project setup |
| `make verify` | Verify project health |
| `make quickstart` | Quick start for new developers |
| `make reinstall` | Clean reinstall dependencies |
| `make ci` | Run full CI pipeline |

## Tips

- Run `make help` anytime to see available commands
- Use `make setup` when first cloning the repository
- Use `make verify` before pushing code
- Use `make ci` to simulate CI/CD pipeline locally
- Use `make clean` if you encounter dependency issues

## Examples

### New Developer Onboarding
```bash
git clone <repository>
cd online-coding-interviews
make setup
make dev
```

### Pre-commit Checklist
```bash
make test           # Ensure tests pass
make build          # Ensure build works
# or simply:
make verify
```

### Troubleshooting
```bash
make clean          # Clean everything
make install        # Reinstall dependencies
make test           # Verify it works
```

### CI/CD Simulation
```bash
make ci             # Run full pipeline locally
```
