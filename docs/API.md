# API Specification Documentation

## Overview

This document provides comprehensive documentation for the CodeInterview API, designed to support the frontend application with backend services.

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
- [WebSocket](#websocket)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Implementation Guide](#implementation-guide)

---

## API Overview

The CodeInterview API provides RESTful endpoints for managing interview sessions, participants, and code collaboration, along with WebSocket support for real-time updates.

### Key Features

- **Session Management**: Create, read, update, and delete interview sessions
- **Participant Management**: Add, remove, and update participant information
- **Code Collaboration**: Save code snapshots and track language changes
- **Real-time Updates**: WebSocket support for live collaboration
- **Session Expiration**: Automatic cleanup of expired sessions (24 hours)

### Technology Stack (Recommended)

- **Language**: Python 3.12+ or Node.js 22+
- **Framework**: FastAPI (Python) or Express (Node.js)
- **Database**: PostgreSQL or MongoDB
- **WebSocket**: Socket.IO or native WebSocket
- **Cache**: Redis (for session management)

---

## Authentication

**Status**: Not implemented in MVP

For production, implement JWT-based authentication:

```http
Authorization: Bearer <jwt_token>
```

### Future Implementation

```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

---

## Base URL

### Development
```
http://localhost:8000/api/v1
```

### Production
```
https://api.codeinterview.com/v1
```

---

## Endpoints

### Health Check

#### `GET /health`

Check if the API is running and healthy.

**Response**
```json
{
  "status": "ok",
  "timestamp": 1701705600000
}
```

---

### Sessions

#### `POST /sessions`

Create a new interview session.

**Request Body**
```json
{
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "color": "hsl(250, 84%, 54%)"
  },
  "code": "console.log('Hello, World!');",
  "language": "javascript"
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "abc12345",
    "createdAt": 1701705600000,
    "updatedAt": 1701705600000,
    "expiresAt": 1701792000000,
    "code": "console.log('Hello, World!');",
    "language": "javascript",
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "role": "interviewer",
        "color": "hsl(250, 84%, 54%)",
        "joinedAt": 1701705600000,
        "isOnline": true
      }
    ],
    "creatorId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### `GET /sessions/{sessionId}`

Get session details.

**Parameters**
- `sessionId` (path): 8-character hex string (e.g., `abc12345`)

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "abc12345",
    "createdAt": 1701705600000,
    "updatedAt": 1701705600000,
    "expiresAt": 1701792000000,
    "code": "console.log('Hello, World!');",
    "language": "javascript",
    "participants": [...],
    "creatorId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses**
- `404`: Session not found
- `410`: Session has expired

#### `PATCH /sessions/{sessionId}`

Update session properties.

**Request Body**
```json
{
  "code": "console.log('Updated code');",
  "language": "python"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "abc12345",
    "updatedAt": 1701705700000,
    ...
  }
}
```

#### `DELETE /sessions/{sessionId}`

Delete a session.

**Response** (204 No Content)

---

### Joining Sessions

#### `POST /sessions/{sessionId}/join`

Join an existing session.

**Request Body**
```json
{
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "color": "hsl(120, 70%, 50%)"
  }
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "abc12345",
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "role": "interviewer",
        ...
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Smith",
        "role": "candidate",
        "joinedAt": 1701705700000,
        "isOnline": true
      }
    ],
    ...
  }
}
```

---

### Participants

#### `GET /sessions/{sessionId}/participants`

Get all participants in a session.

**Response** (200 OK)
```json
{
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "role": "interviewer",
      "color": "hsl(250, 84%, 54%)",
      "joinedAt": 1701705600000,
      "isOnline": true
    }
  ]
}
```

#### `DELETE /sessions/{sessionId}/participants/{participantId}`

Remove a participant from the session.

**Response** (204 No Content)

#### `PATCH /sessions/{sessionId}/participants/{participantId}`

Update participant information.

**Request Body**
```json
{
  "isOnline": false
}
```

**Response** (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "role": "interviewer",
  "isOnline": false,
  ...
}
```

---

### Code Snapshots

#### `PUT /sessions/{sessionId}/code`

Save code snapshot for a session.

**Request Body**
```json
{
  "code": "def hello():\n    print('Hello, World!')",
  "language": "python"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "abc12345",
    "code": "def hello():\n    print('Hello, World!')",
    "language": "python",
    "updatedAt": 1701705800000,
    ...
  }
}
```

---

## WebSocket

### Connection

**Endpoint**: `ws://localhost:8000/ws/sessions/{sessionId}`

### Client → Server Events

#### Code Change
```json
{
  "type": "code_change",
  "data": {
    "code": "console.log('Updated');",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Language Change
```json
{
  "type": "language_change",
  "data": {
    "language": "python",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Cursor Position
```json
{
  "type": "cursor_position",
  "data": {
    "position": { "lineNumber": 5, "column": 10 },
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Server → Client Events

#### Code Change
```json
{
  "type": "code_change",
  "data": {
    "code": "console.log('Updated');",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": 1701705900000
  }
}
```

#### User Join
```json
{
  "type": "user_join",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "role": "candidate",
      "color": "hsl(120, 70%, 50%)"
    },
    "timestamp": 1701705900000
  }
}
```

#### User Leave
```json
{
  "type": "user_leave",
  "data": {
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "timestamp": 1701706000000
  }
}
```

---

## Data Models

### Session
```typescript
interface Session {
  id: string;                    // 8-char hex (e.g., "abc12345")
  createdAt: number;             // Unix timestamp (ms)
  updatedAt: number;             // Unix timestamp (ms)
  expiresAt: number;             // Unix timestamp (ms), 24h from creation
  code: string;                  // Current code content
  language: 'javascript' | 'python' | 'html';
  participants: Participant[];
  creatorId: string;             // UUID of creator
}
```

### Participant
```typescript
interface Participant {
  id: string;                    // UUID
  name: string;                  // Display name
  role: 'interviewer' | 'candidate';
  color: string;                 // HSL color string
  joinedAt: number;              // Unix timestamp (ms)
  isOnline: boolean;
}
```

### UserInfo
```typescript
interface UserInfo {
  id: string;                    // UUID
  name: string;                  // Display name
  color: string;                 // HSL color string
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Invalid request parameters |
| 404 | SESSION_NOT_FOUND | Session does not exist |
| 404 | PARTICIPANT_NOT_FOUND | Participant does not exist |
| 410 | SESSION_EXPIRED | Session has expired (>24h old) |
| 500 | INTERNAL_ERROR | Internal server error |

---

## Implementation Guide

### 1. Database Schema

#### PostgreSQL Example

```sql
CREATE TABLE sessions (
    id VARCHAR(8) PRIMARY KEY,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    creator_id UUID NOT NULL
);

CREATE TABLE participants (
    id UUID PRIMARY KEY,
    session_id VARCHAR(8) REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    joined_at BIGINT NOT NULL,
    is_online BOOLEAN DEFAULT true
);

CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_participants_session_id ON participants(session_id);
```

#### MongoDB Example

```javascript
// sessions collection
{
  _id: "abc12345",
  createdAt: 1701705600000,
  updatedAt: 1701705600000,
  expiresAt: 1701792000000,
  code: "console.log('Hello');",
  language: "javascript",
  participants: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Doe",
      role: "interviewer",
      color: "hsl(250, 84%, 54%)",
      joinedAt: 1701705600000,
      isOnline: true
    }
  ],
  creatorId: "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Session ID Generation

```python
import secrets

def generate_session_id():
    """Generate 8-character hex session ID"""
    return secrets.token_hex(4)  # 4 bytes = 8 hex chars
```

```javascript
const crypto = require('crypto');

function generateSessionId() {
  return crypto.randomBytes(4).toString('hex');
}
```

### 3. Session Expiration

Implement a background job to clean up expired sessions:

```python
# Cleanup job (run every hour)
def cleanup_expired_sessions():
    now = int(time.time() * 1000)
    db.sessions.delete_many({"expiresAt": {"$lt": now}})
```

### 4. WebSocket Implementation

#### FastAPI Example

```python
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)
    
    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/sessions/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast to all connections in this session
            await manager.broadcast(session_id, {
                "type": data["type"],
                "data": {**data["data"], "timestamp": int(time.time() * 1000)}
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
```

### 5. CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing the API

### Using cURL

```bash
# Create session
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "color": "hsl(250, 84%, 54%)"
    }
  }'

# Get session
curl http://localhost:8000/api/v1/sessions/abc12345

# Join session
curl -X POST http://localhost:8000/api/v1/sessions/abc12345/join \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "color": "hsl(120, 70%, 50%)"
    }
  }'
```

---

## Next Steps

1. **Choose Backend Framework**: FastAPI (Python) or Express (Node.js)
2. **Set Up Database**: PostgreSQL or MongoDB
3. **Implement REST Endpoints**: Follow OpenAPI spec
4. **Add WebSocket Support**: For real-time collaboration
5. **Deploy**: Docker + Cloud platform (AWS, GCP, Heroku)

---

**OpenAPI Specification**: See [`openapi.yaml`](./openapi.yaml) for the complete API specification.
