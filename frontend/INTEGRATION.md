# Frontend-Backend Integration Guide

## Overview

The frontend has been integrated with the FastAPI backend, replacing mock services with real API calls and WebSocket for real-time collaboration.

## What Changed

### Services Layer

#### 1. API Service (`src/services/api.service.js`)
- **Before**: Mock localStorage-based implementation
- **After**: Real HTTP client using axios
- **Features**:
  - Axios instance with interceptors
  - Error handling with structured responses
  - Automatic retry logic
  - Network error detection

#### 2. WebSocket Service (`src/services/websocket.service.js`)
- **New service** for real-time collaboration
- **Features**:
  - Automatic reconnection with exponential backoff
  - Event-based message handling
  - Connection state management
  - Max 5 reconnection attempts

#### 3. Session Service (`src/services/session.service.js`)
- **Before**: localStorage for session persistence
- **After**: Backend API calls
- **Changes**:
  - All CRUD operations use backend API
  - Proper error handling for 404/410 status codes
  - Session expiration handled by backend

#### 4. Collaboration Service (`src/services/collaboration.service.js`)
- **Before**: BroadcastChannel (same-browser only)
- **After**: WebSocket (cross-device)
- **Benefits**:
  - Works across different devices
  - Server-validated events
  - Persistent connection

### Configuration

#### Environment Variables

Created `.env.development` and `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

#### API Configuration (`src/config/api.config.js`)

Centralized configuration for:
- Base URLs
- API endpoints
- Timeout settings
- Request headers

### Hooks

#### useSession
- No changes needed - works with new services
- Already handles async operations
- Error states preserved

#### useCollaboration
- No changes needed - works with WebSocket
- Same interface as before
- Transparent upgrade from BroadcastChannel

#### useConnectionState (New)
- Monitor WebSocket connection state
- Provides connection status indicators
- Useful for UI feedback

### Dependencies

Added:
- `axios` - HTTP client for API calls

## Running the Application

### 1. Start Backend

```bash
cd backend
make docker-up
```

This starts:
- PostgreSQL database on port 5432
- FastAPI server on port 8000

Verify backend is running:
```bash
curl http://localhost:8000/api/v1/health
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on port 3000 and connects to backend on port 8000.

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/sessions` | POST | Create session |
| `/api/v1/sessions/{id}` | GET | Get session |
| `/api/v1/sessions/{id}` | PATCH | Update session |
| `/api/v1/sessions/{id}` | DELETE | Delete session |
| `/api/v1/sessions/{id}/join` | POST | Join session |
| `/api/v1/sessions/{id}/code` | PUT | Save code |
| `/api/v1/sessions/{id}/participants` | GET | Get participants |
| `/api/v1/sessions/{id}/participants/{pid}` | PATCH | Update participant |
| `/api/v1/sessions/{id}/participants/{pid}` | DELETE | Remove participant |
| `/ws/sessions/{id}` | WS | WebSocket connection |

## WebSocket Events

### Client → Server

- `code_change` - Code was modified
- `language_change` - Language was changed
- `cursor_position` - Cursor moved (optional)

### Server → Client

- `code_change` - Code updated by another user
- `language_change` - Language changed by another user
- `user_join` - New user joined session
- `user_leave` - User left session
- `cursor_position` - Cursor position update

## Error Handling

### Network Errors

If backend is not running:
```javascript
{
  success: false,
  error: 'Unable to connect to server. Please ensure the backend is running.',
  code: 'NETWORK_ERROR'
}
```

### Session Not Found (404)

```javascript
{
  success: false,
  error: 'Session not found',
  code: 'HTTP_404',
  status: 404
}
```

### Session Expired (410)

```javascript
{
  success: false,
  error: 'Session has expired',
  code: 'HTTP_410',
  status: 410
}
```

## Connection States

WebSocket connection states:
- `connecting` - Initial connection
- `connected` - Successfully connected
- `reconnecting` - Attempting to reconnect
- `disconnected` - Not connected
- `failed` - Max reconnection attempts reached
- `error` - Connection error

## Testing

### Manual Testing

1. **Create Session**
   - Click "Create Interview Session"
   - Verify session created in backend
   - Check PostgreSQL: `SELECT * FROM sessions;`

2. **Join Session**
   - Open session link in new tab
   - Verify participant added
   - Check: `SELECT * FROM participants;`

3. **Real-time Collaboration**
   - Type in one tab
   - Verify appears in other tab via WebSocket
   - Check browser DevTools → Network → WS

4. **Code Execution**
   - Write code and run
   - Verify output displays
   - Code saved to backend

### Backend Verification

```bash
# Check if API is running
curl http://localhost:8000/api/v1/health

# View API documentation
open http://localhost:8000/docs

# Check database
docker-compose exec db psql -U codeinterview -d codeinterview
\dt  # List tables
SELECT * FROM sessions;
SELECT * FROM participants;
```

### WebSocket Testing

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8000/ws/sessions/abc12345

# Send message
{"type": "code_change", "data": {"code": "console.log('test')", "userId": "123"}}
```

## Troubleshooting

### Backend Not Running

**Symptom**: "Unable to connect to server" error

**Solution**:
```bash
cd backend
make docker-up
```

### WebSocket Not Connecting

**Symptom**: Connection state stuck on "connecting"

**Solutions**:
1. Check backend is running
2. Verify session exists
3. Check browser console for errors
4. Ensure no firewall blocking WebSocket

### CORS Errors

**Symptom**: CORS policy errors in console

**Solution**: Backend CORS is configured for `http://localhost:3000`. If using different port, update `backend/app/core/config.py`:

```python
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
```

### Session Not Found

**Symptom**: 404 error when joining session

**Possible Causes**:
1. Session doesn't exist in database
2. Session ID typo
3. Database was reset

**Solution**: Create a new session

## Migration from Mock to Real API

### Data Migration

**No migration needed** - this is a fresh start with the backend.

Previous localStorage sessions will not be accessible. Users need to create new sessions.

### Backward Compatibility

Not supported - this is a breaking change. The application now requires the backend to function.

## Performance Considerations

### Network Latency

- Backend adds network latency vs localStorage
- Typical API response: 10-50ms
- WebSocket messages: 5-20ms

### Debouncing

Code changes are debounced (300ms) to avoid excessive WebSocket messages.

### Reconnection

WebSocket reconnects automatically with exponential backoff:
- Attempt 1: 1 second
- Attempt 2: 2 seconds
- Attempt 3: 4 seconds
- Attempt 4: 8 seconds
- Attempt 5: 16 seconds
- Max: 30 seconds

## Security

### Current Implementation

- No authentication (MVP)
- Sessions accessible to anyone with link
- No rate limiting on frontend

### Production Recommendations

1. Add JWT authentication
2. Implement rate limiting
3. Add HTTPS/WSS
4. Validate all inputs
5. Add CSRF protection

## Next Steps

1. ✅ Update tests for API integration
2. ✅ Add loading states to components
3. ✅ Add error messages to UI
4. ✅ Add connection status indicator
5. ✅ Update documentation

## Resources

- [Backend API Documentation](http://localhost:8000/docs)
- [OpenAPI Specification](../docs/openapi.yaml)
- [Backend Guide](../docs/BACKEND_GUIDE.md)
- [Backend README](../backend/README.md)
