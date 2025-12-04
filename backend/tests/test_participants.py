"""
Tests for participant API endpoints
"""

import pytest
from fastapi import status


def test_get_participants(client, sample_session_data):
    """Test getting participants in a session"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Get participants
    response = client.get(f"/api/v1/sessions/{session_id}/participants")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "participants" in data
    assert len(data["participants"]) == 1
    assert data["participants"][0]["name"] == sample_session_data["creator"]["name"]


def test_remove_participant(client, sample_session_data):
    """Test removing a participant"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Add second participant
    join_data = {
        "user": {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Jane Smith",
            "color": "hsl(120, 70%, 50%)",
        }
    }
    client.post(f"/api/v1/sessions/{session_id}/join", json=join_data)

    # Remove participant
    participant_id = join_data["user"]["id"]
    response = client.delete(
        f"/api/v1/sessions/{session_id}/participants/{participant_id}"
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify participant was removed
    get_response = client.get(f"/api/v1/sessions/{session_id}/participants")
    assert len(get_response.json()["participants"]) == 1


def test_update_participant(client, sample_session_data):
    """Test updating participant status"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]
    participant_id = sample_session_data["creator"]["id"]

    # Update participant
    update_data = {"is_online": False}
    response = client.patch(
        f"/api/v1/sessions/{session_id}/participants/{participant_id}", json=update_data
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_online"] is False


def test_remove_nonexistent_participant(client, sample_session_data):
    """Test removing a participant that doesn't exist"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Try to remove nonexistent participant
    response = client.delete(f"/api/v1/sessions/{session_id}/participants/nonexistent")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_cascade_delete_participants(client, sample_session_data):
    """Test that participants are deleted when session is deleted"""
    # Create session
    create_response = client.post("/api/v1/sessions", json=sample_session_data)
    session_id = create_response.json()["data"]["id"]

    # Add participant
    join_data = {
        "user": {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Jane Smith",
            "color": "hsl(120, 70%, 50%)",
        }
    }
    client.post(f"/api/v1/sessions/{session_id}/join", json=join_data)

    # Delete session
    client.delete(f"/api/v1/sessions/{session_id}")

    # Verify participants endpoint returns 404
    response = client.get(f"/api/v1/sessions/{session_id}/participants")
    assert response.status_code == status.HTTP_404_NOT_FOUND
