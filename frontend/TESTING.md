# Unit Testing Documentation

## Overview

Comprehensive unit testing suite implemented using **Vitest** and **React Testing Library** to ensure code quality and facilitate debugging.

## Test Statistics

- **Total Test Files**: 8
- **Total Tests**: 80
- **Pass Rate**: 100% ✅
- **Test Duration**: ~6.2 seconds

## Test Coverage

```
File                       | % Stmts | % Branch | % Funcs | % Lines
---------------------------|---------|----------|---------|--------
All files                  |   51.16 |    80.88 |   63.75 |   51.16
Services                   |   82.51 |    85.41 |   76.74 |   82.51
Utils                      |   95.34 |    94.73 |   86.66 |   95.34
Components                 |   26.65 |    58.82 |   27.77 |   26.65
```

### High Coverage Areas ✅
- **Utils**: 95.34% statement coverage
- **Services**: 82.51% statement coverage
- **collaboration.service.js**: 97.81% coverage
- **session.service.js**: 93.1% coverage
- **LanguageSelector**: 100% coverage

## Test Suites

### 1. Service Tests

#### API Service (11 tests)
- ✅ Session CRUD operations
- ✅ Participant management
- ✅ Code snapshot saving
- ✅ localStorage operations
- ✅ Error handling for non-existent sessions

#### Session Service (10 tests)
- ✅ Session creation with creator info
- ✅ Joining existing sessions
- ✅ Session expiration validation
- ✅ Session ID format validation
- ✅ Cleanup of expired sessions

#### Collaboration Service (15 tests)
- ✅ BroadcastChannel initialization
- ✅ Message subscription/unsubscription
- ✅ Broadcasting code changes
- ✅ Broadcasting language changes
- ✅ User join/leave events
- ✅ Error handling in listeners

#### Execution Service (15 tests)
- ✅ JavaScript code execution
- ✅ Console output capture (log, warn, info, error)
- ✅ Return value handling
- ✅ Error and syntax error handling
- ✅ Object formatting in output
- ✅ HTML code rendering
- ✅ Language routing

### 2. Utility Tests (16 tests)

#### Helper Functions
- ✅ UUID generation
- ✅ Short ID generation (8-char hex)
- ✅ Session link generation
- ✅ Debounce functionality
- ✅ Throttle functionality
- ✅ Random color generation
- ✅ Anonymous name generation
- ✅ Session ID validation
- ✅ Output formatting

### 3. Component Tests (13 tests)

#### HomePage (5 tests)
- ✅ Page rendering
- ✅ Create interview button
- ✅ Feature cards display
- ✅ Join interview option
- ✅ Join input toggle

#### LanguageSelector (4 tests)
- ✅ Selector rendering
- ✅ Language options display
- ✅ Selected language display
- ✅ onChange callback

#### ParticipantList (4 tests)
- ✅ Participant count display
- ✅ Empty list handling
- ✅ Online/offline filtering
- ✅ Undefined participants handling

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports are generated in:
- **Text**: Console output
- **HTML**: `coverage/index.html`
- **JSON**: `coverage/coverage-final.json`

## Test Configuration

### Vitest Setup
- **Environment**: jsdom (for DOM testing)
- **Globals**: Enabled for describe, it, expect
- **Setup File**: `src/test/setup.js`
- **Coverage Provider**: v8

### Mocks
- **BroadcastChannel**: Mocked in setup.js
- **Pyodide**: Mocked for Python execution tests
- **React Hooks**: Mocked in component tests

## Test File Structure

```
src/test/
├── setup.js                           # Test configuration
├── services/
│   ├── api.service.test.js           # API service tests
│   ├── session.service.test.js       # Session service tests
│   ├── collaboration.service.test.js # Collaboration tests
│   └── execution.service.test.js     # Execution tests
├── utils/
│   └── helpers.test.js               # Utility function tests
└── components/
    ├── HomePage.test.jsx             # HomePage tests
    ├── LanguageSelector.test.jsx     # Language selector tests
    └── ParticipantList.test.jsx      # Participant list tests
```

## Key Testing Patterns

### 1. Service Testing
```javascript
describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create a session successfully', async () => {
    const result = await apiService.createSession(sessionData);
    expect(result.success).toBe(true);
  });
});
```

### 2. Component Testing
```javascript
describe('HomePage', () => {
  it('should render the home page', () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    expect(screen.getByText(/CodeInterview/i)).toBeInTheDocument();
  });
});
```

### 3. Async Testing
```javascript
it('should execute JavaScript code', async () => {
  const result = await executionService.executeJavaScript(code);
  expect(result.status).toBe(EXECUTION_STATUS.SUCCESS);
});
```

## Benefits

1. **Early Bug Detection**: Catch issues before they reach production
2. **Refactoring Confidence**: Safely modify code with test safety net
3. **Documentation**: Tests serve as usage examples
4. **Debugging Aid**: Isolated tests help identify problem areas
5. **Code Quality**: Encourages better code structure

## Future Improvements

- [ ] Add tests for custom hooks (useSession, useCollaboration, useCodeExecution)
- [ ] Increase component test coverage (CodeEditor, ExecutionPanel, InterviewRoom)
- [ ] Add integration tests for full user flows
- [ ] Add E2E tests using Playwright
- [ ] Set up CI/CD pipeline with automated testing
- [ ] Add performance benchmarks

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test -- --run

- name: Generate Coverage
  run: npm run test:coverage -- --run

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

**All tests passing! ✅ Ready for development and debugging.**
