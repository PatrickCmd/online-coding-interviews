"""
Main FastAPI application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import time

from app.core.config import get_settings
from app.db.database import Base, engine
from app.api import sessions, participants
from app.services.websocket_manager import manager
from app.schemas.schemas import HealthResponse

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="REST API for Online Coding Interview Platform",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix=settings.API_V1_PREFIX)
app.include_router(participants.router, prefix=settings.API_V1_PREFIX)


@app.get(f"{settings.API_V1_PREFIX}/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok", timestamp=int(time.time() * 1000))


@app.websocket("/ws/sessions/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time collaboration"""
    await manager.connect(websocket, session_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            # Broadcast to all connections in this session
            await manager.broadcast(session_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)


@app.on_event("startup")
def startup_event():
    """Create database tables on startup"""
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "CodeInterview API",
        "version": settings.VERSION,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
