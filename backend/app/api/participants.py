"""
Participant API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import ParticipantResponse, UpdateParticipantRequest
from app.services import session_service

router = APIRouter(prefix="/sessions/{session_id}/participants", tags=["Participants"])


@router.get("/", response_model=dict)
def get_participants(session_id: str, db: Session = Depends(get_db)):
    """Get all participants in a session"""
    # Check if session exists
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"},
        )

    participants = session_service.get_participants(db, session_id)

    return {
        "participants": [ParticipantResponse.model_validate(p) for p in participants]
    }


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_participant(
    session_id: str, participant_id: str, db: Session = Depends(get_db)
):
    """Remove a participant from the session"""
    success = session_service.remove_participant(db, session_id, participant_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Participant not found"},
        )

    return None


@router.patch("/{participant_id}", response_model=ParticipantResponse)
def update_participant(
    session_id: str,
    participant_id: str,
    updates: UpdateParticipantRequest,
    db: Session = Depends(get_db),
):
    """Update participant information"""
    update_data = updates.model_dump(exclude_unset=True)

    participant = session_service.update_participant(
        db, session_id, participant_id, **update_data
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Participant not found"},
        )

    return ParticipantResponse.model_validate(participant)
