"""
Tests for WebSocket functionality
"""

import pytest
from fastapi.testclient import TestClient


def test_websocket_connection(client, sample_session_data):
    """Test WebSocket connection"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Connect to WebSocket
    with client.websocket_connect(f"/ws/sessions/{session_id}") as websocket:
        # Send message
        test_message = {
            "type": "code_change",
            "data": {"code": "console.log('test');", "userId": "test-user-id"},
        }
        websocket.send_json(test_message)

        # Receive broadcasted message
        data = websocket.receive_json()
        assert data["type"] == "code_change"
        assert data["data"]["code"] == test_message["data"]["code"]
        assert "timestamp" in data


def test_websocket_broadcast(client, sample_session_data):
    """Test WebSocket broadcasting to multiple connections"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Connect two clients
    with client.websocket_connect(f"/ws/sessions/{session_id}") as ws1:
        with client.websocket_connect(f"/ws/sessions/{session_id}") as ws2:
            # Send message from first client
            test_message = {
                "type": "language_change",
                "data": {"language": "python", "userId": "user1"},
            }
            ws1.send_json(test_message)

            # Both clients should receive the message
            data1 = ws1.receive_json()
            data2 = ws2.receive_json()

            assert data1["type"] == "language_change"
            assert data2["type"] == "language_change"
            assert data1["data"]["language"] == "python"
            assert data2["data"]["language"] == "python"


def test_websocket_user_events(client, sample_session_data):
    """Test user join/leave events via WebSocket"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    with client.websocket_connect(f"/ws/sessions/{session_id}") as websocket:
        # Send user join event
        join_message = {
            "type": "user_join",
            "data": {
                "user": {"id": "new-user-id", "name": "New User", "role": "candidate"}
            },
        }
        websocket.send_json(join_message)

        # Receive broadcasted join event
        data = websocket.receive_json()
        assert data["type"] == "user_join"
        assert data["data"]["user"]["name"] == "New User"
