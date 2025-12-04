"""
WebSocket connection manager for real-time collaboration
"""

from fastapi import WebSocket
from typing import Dict, List
import json
import time


class ConnectionManager:
    """Manages WebSocket connections for sessions"""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, session_id: str, message: dict):
        """Broadcast message to all connections in a session"""
        if session_id not in self.active_connections:
            return

        # Add timestamp
        message_with_timestamp = {**message, "timestamp": int(time.time() * 1000)}

        disconnected = []
        for connection in self.active_connections[session_id]:
            try:
                await connection.send_json(message_with_timestamp)
            except Exception:
                disconnected.append(connection)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn, session_id)


# Global connection manager instance
manager = ConnectionManager()
