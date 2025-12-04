"""
Tests for session API endpoints
"""

import pytest
from fastapi import status


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data


def test_create_session(client, sample_session_data):
    """Test creating a new session"""
    response = client.post("/api/v1/sessions", json=sample_session_data)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "id" in data["data"]
    assert len(data["data"]["id"]) == 8
    assert data["data"]["code"] == sample_session_data["code"]
    assert data["data"]["language"] == sample_session_data["language"]
    assert len(data["data"]["participants"]) == 1
    assert (
        data["data"]["participants"][0]["name"]
        == sample_session_data["creator"]["name"]
    )
    assert data["data"]["participants"][0]["role"] == "interviewer"


def test_get_session(client, sample_session_data):
    """Test getting a session"""
    # Create session first
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Get session
    response = client.get(f"/api/v1/sessions/{session_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == session_id


def test_get_nonexistent_session(client):
    """Test getting a session that doesn't exist"""
    response = client.get("/api/v1/sessions/nonexist")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert "error" in data["detail"]


def test_update_session(client, sample_session_data):
    """Test updating a session"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Update session
    update_data = {"code": "print('Updated code')", "language": "python"}
    response = client.patch(f"/api/v1/sessions/{session_id}", json=update_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["data"]["code"] == update_data["code"]
    assert data["data"]["language"] == update_data["language"]


def test_delete_session(client, sample_session_data):
    """Test deleting a session"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Delete session
    response = client.delete(f"/api/v1/sessions/{session_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify session is deleted
    get_response = client.get(f"/api/v1/sessions/{session_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_join_session(client, sample_session_data):
    """Test joining a session"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Join session
    join_data = {
        "user": {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Jane Smith",
            "color": "hsl(120, 70%, 50%)",
        }
    }
    response = client.post(f"/api/v1/sessions/{session_id}/join", json=join_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["participants"]) == 2
    assert data["data"]["participants"][1]["name"] == join_data["user"]["name"]
    assert data["data"]["participants"][1]["role"] == "candidate"


def test_join_nonexistent_session(client):
    """Test joining a session that doesn't exist"""
    join_data = {
        "user": {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Jane Smith",
            "color": "hsl(120, 70%, 50%)",
        }
    }
    response = client.post("/api/v1/sessions/nonexist/join", json=join_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_save_code_snapshot(client, sample_session_data):
    """Test saving code snapshot"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Save code
    code_data = {"code": "def hello():\n    print('Hello')", "language": "python"}
    response = client.put(f"/api/v1/sessions/{session_id}/code", json=code_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["data"]["code"] == code_data["code"]
    assert data["data"]["language"] == code_data["language"]


def test_multiple_sessions(client, sample_session_data):
    """Test creating multiple sessions"""
    # Create first session
    response1 = client.post("/api/v1/sessions", json=sample_session_data)
    session_id1 = response1.json()["data"]["id"]

    # Create second session with different user ID to avoid conflicts
    session_data2 = {
        **sample_session_data,
        "creator": {
            **sample_session_data["creator"],
            "id": "660e8400-e29b-41d4-a716-446655440001",
        },
    }
    response2 = client.post("/api/v1/sessions", json=session_data2)
    session_id2 = response2.json()["data"]["id"]

    # Verify they have different IDs
    assert session_id1 != session_id2

    # Verify both can be retrieved
    get1 = client.get(f"/api/v1/sessions/{session_id1}")
    get2 = client.get(f"/api/v1/sessions/{session_id2}")
    assert get1.status_code == status.HTTP_200_OK
    assert get2.status_code == status.HTTP_200_OK
