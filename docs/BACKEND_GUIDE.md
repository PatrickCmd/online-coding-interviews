# Backend Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the backend API for the CodeInterview platform based on the OpenAPI specifications.

## 📋 Table of Contents

1. [Technology Choices](#technology-choices)
2. [Project Setup](#project-setup)
3. [Database Design](#database-design)
4. [API Implementation](#api-implementation)
5. [WebSocket Implementation](#websocket-implementation)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Technology Choices

### Recommended Stack

#### Option 1: Python (FastAPI)
- **Framework**: FastAPI f0.123.7
- **Database**: PostgreSQL 17 with SQLAlchemy
- **WebSocket**: FastAPI WebSocket support
- **Cache**: Redis (optional, for session management)
- **Testing**: pytest
- **Deployment**: Docker + Uvicorn

**Pros**: Fast, modern, automatic OpenAPI docs, excellent WebSocket support

#### Option 2: Node.js (Express)
- **Framework**: Express express 5.0.0
- **Database**: MongoDB with Mongoose
- **WebSocket**: Socket.IO
- **Cache**: Redis (optional)
- **Testing**: Jest
- **Deployment**: Docker + Node

**Pros**: JavaScript ecosystem, great for real-time apps

---

## Project Setup

### Option 1: FastAPI (Python)

#### 1. Create Project Structure

```bash
mkdir backend
cd backend

# Create directory structure
mkdir -p app/{api,models,schemas,services,db,websocket}
touch app/__init__.py
touch app/main.py
```

#### 2. Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── sessions.py      # Session endpoints
│   │   ├── participants.py  # Participant endpoints
│   │   └── code.py          # Code snapshot endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── session.py       # Session model
│   │   └── participant.py   # Participant model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── session.py       # Pydantic schemas
│   │   └── participant.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── session_service.py
│   │   └── websocket_manager.py
│   └── db/
│       ├── __init__.py
│       └── database.py      # Database connection
├── tests/
│   ├── test_sessions.py
│   ├── test_participants.py
│   └── test_websocket.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

#### 3. Dependencies (requirements.txt)

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0
redis==5.0.1
pytest==7.4.3
httpx==0.25.2
```

#### 4. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Database Design

### PostgreSQL Schema

#### 1. Create Database

```sql
CREATE DATABASE codeinterview;
```

#### 2. Sessions Table

```sql
CREATE TABLE sessions (
    id VARCHAR(8) PRIMARY KEY,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    code TEXT NOT NULL DEFAULT '',
    language VARCHAR(20) NOT NULL DEFAULT 'javascript',
    creator_id UUID NOT NULL,
    CONSTRAINT chk_language CHECK (language IN ('javascript', 'python', 'html'))
);

-- Index for expiration cleanup
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

#### 3. Participants Table

```sql
CREATE TABLE participants (
    id UUID PRIMARY KEY,
    session_id VARCHAR(8) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    joined_at BIGINT NOT NULL,
    is_online BOOLEAN DEFAULT true,
    CONSTRAINT fk_session FOREIGN KEY (session_id) 
        REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT chk_role CHECK (role IN ('interviewer', 'candidate'))
);

-- Index for session lookups
CREATE INDEX idx_participants_session_id ON participants(session_id);
```

---

## API Implementation

### 1. Database Connection (app/db/database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost/codeinterview"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 2. Models (app/models/session.py)

```python
from sqlalchemy import Column, String, BigInteger, Text
from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(8), primary_key=True, index=True)
    created_at = Column(BigInteger, nullable=False)
    updated_at = Column(BigInteger, nullable=False)
    expires_at = Column(BigInteger, nullable=False, index=True)
    code = Column(Text, nullable=False, default="")
    language = Column(String(20), nullable=False, default="javascript")
    creator_id = Column(String(36), nullable=False)
```

### 3. Schemas (app/schemas/session.py)

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class LanguageEnum(str, Enum):
    javascript = "javascript"
    python = "python"
    html = "html"

class RoleEnum(str, Enum):
    interviewer = "interviewer"
    candidate = "candidate"

class UserInfo(BaseModel):
    id: str = Field(..., description="UUID")
    name: str
    color: str

class Participant(BaseModel):
    id: str
    name: str
    role: RoleEnum
    color: str
    joined_at: int
    is_online: bool

class SessionBase(BaseModel):
    code: str = ""
    language: LanguageEnum = LanguageEnum.javascript

class SessionCreate(SessionBase):
    creator: UserInfo

class SessionResponse(BaseModel):
    id: str
    created_at: int
    updated_at: int
    expires_at: int
    code: str
    language: str
    participants: List[Participant]
    creator_id: str

    class Config:
        from_attributes = True
```

### 4. Session Service (app/services/session_service.py)

```python
import secrets
import time
from sqlalchemy.orm import Session
from app.models.session import Session as SessionModel
from app.models.participant import Participant as ParticipantModel
from app.schemas.session import SessionCreate, UserInfo

SESSION_EXPIRATION = 24 * 60 * 60 * 1000  # 24 hours in ms

def generate_session_id() -> str:
    """Generate 8-character hex session ID"""
    return secrets.token_hex(4)

def create_session(db: Session, session_data: SessionCreate) -> SessionModel:
    """Create a new interview session"""
    session_id = generate_session_id()
    now = int(time.time() * 1000)
    
    # Create session
    db_session = SessionModel(
        id=session_id,
        created_at=now,
        updated_at=now,
        expires_at=now + SESSION_EXPIRATION,
        code=session_data.code,
        language=session_data.language,
        creator_id=session_data.creator.id
    )
    db.add(db_session)
    
    # Add creator as participant
    participant = ParticipantModel(
        id=session_data.creator.id,
        session_id=session_id,
        name=session_data.creator.name,
        role="interviewer",
        color=session_data.creator.color,
        joined_at=now,
        is_online=True
    )
    db.add(participant)
    
    db.commit()
    db.refresh(db_session)
    
    return db_session

def get_session(db: Session, session_id: str) -> Optional[SessionModel]:
    """Get session by ID"""
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()

def is_session_expired(session: SessionModel) -> bool:
    """Check if session has expired"""
    return session.expires_at < int(time.time() * 1000)
```

### 5. API Endpoints (app/api/sessions.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.session import SessionCreate, SessionResponse
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db)
):
    """Create a new interview session"""
    session = session_service.create_session(db, session_data)
    
    # Get participants
    participants = db.query(ParticipantModel).filter(
        ParticipantModel.session_id == session.id
    ).all()
    
    return {
        "success": True,
        "data": {
            **session.__dict__,
            "participants": participants
        }
    }

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get session details"""
    session = session_service.get_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"}
        )
    
    if session_service.is_session_expired(session):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"success": False, "error": "Session has expired"}
        )
    
    # Get participants
    participants = db.query(ParticipantModel).filter(
        ParticipantModel.session_id == session_id
    ).all()
    
    return {
        "success": True,
        "data": {
            **session.__dict__,
            "participants": participants
        }
    }
```

### 6. Main Application (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import sessions, participants, code
from app.db.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CodeInterview API",
    description="REST API for Online Coding Interview Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(participants.router, prefix="/api/v1")
app.include_router(code.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "timestamp": int(time.time() * 1000)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## WebSocket Implementation

### WebSocket Manager (app/services/websocket_manager.py)

```python
from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            
            # Remove disconnected clients
            for conn in disconnected:
                self.disconnect(conn, session_id)

manager = ConnectionManager()
```

### WebSocket Endpoint (app/main.py)

```python
from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager
import time

@app.websocket("/ws/sessions/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Add timestamp and broadcast
            message = {
                "type": data["type"],
                "data": {
                    **data["data"],
                    "timestamp": int(time.time() * 1000)
                }
            }
            
            await manager.broadcast(session_id, message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
```

---

## Testing

### Test Setup (tests/conftest.py)

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### Test Sessions (tests/test_sessions.py)

```python
def test_create_session(client):
    response = client.post("/api/v1/sessions", json={
        "creator": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "color": "hsl(250, 84%, 54%)"
        }
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    assert "id" in data["data"]
    assert len(data["data"]["participants"]) == 1

def test_get_session(client):
    # Create session first
    create_response = client.post("/api/v1/sessions", json={
        "creator": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "color": "hsl(250, 84%, 54%)"
        }
    })
    session_id = create_response.json()["data"]["id"]
    
    # Get session
    response = client.get(f"/api/v1/sessions/{session_id}")
    assert response.status_code == 200
    assert response.json()["data"]["id"] == session_id
```

---

## Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: codeinterview
      POSTGRES_PASSWORD: password
      POSTGRES_DB: codeinterview
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://codeinterview:password@db/codeinterview
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

### Running with Docker

```bash
# Build and start
docker-compose up --build

# Run migrations (if using Alembic)
docker-compose exec api alembic upgrade head

# Run tests
docker-compose exec api pytest
```

---

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost/codeinterview
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-here
```

---

## Next Steps

1. ✅ Set up project structure
2. ✅ Implement database models
3. ✅ Create API endpoints
4. ✅ Add WebSocket support
5. ⬜ Add authentication (JWT)
6. ⬜ Implement rate limiting
7. ⬜ Add logging and monitoring
8. ⬜ Deploy to production

---

**See Also:**
- [OpenAPI Specification](./openapi.yaml)
- [API Documentation](./API.md)
