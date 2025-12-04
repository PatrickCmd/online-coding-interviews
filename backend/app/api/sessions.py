"""
Session API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import (
    SessionCreate,
    SessionData,
    SessionUpdate,
    SessionResponse,
    JoinSessionRequest,
    CodeSnapshotRequest,
    ErrorResponse,
)
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/", response_model=SessionData, status_code=status.HTTP_201_CREATED)
def create_session(session_data: SessionCreate, db: Session = Depends(get_db)):
    """Create a new interview session"""
    try:
        session = session_service.create_session(db, session_data)

        return SessionData(success=True, data=SessionResponse.model_validate(session))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "error": str(e)},
        )


@router.get("/{session_id}", response_model=SessionData)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get session details"""
    session = session_service.get_session(db, session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": "Session not found",
                "code": "SESSION_NOT_FOUND",
            },
        )

    if session_service.is_session_expired(session):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={
                "success": False,
                "error": "Session has expired",
                "code": "SESSION_EXPIRED",
            },
        )

    return SessionData(success=True, data=SessionResponse.model_validate(session))


@router.patch("/{session_id}", response_model=SessionData)
def update_session(
    session_id: str, updates: SessionUpdate, db: Session = Depends(get_db)
):
    """Update session properties"""
    # Check if session exists
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"},
        )

    # Update session
    update_data = updates.model_dump(exclude_unset=True)
    if "language" in update_data:
        update_data["language"] = update_data["language"].value

    updated_session = session_service.update_session(db, session_id, **update_data)

    return SessionData(
        success=True, data=SessionResponse.model_validate(updated_session)
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a session"""
    success = session_service.delete_session(db, session_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"},
        )

    return None


@router.post("/{session_id}/join", response_model=SessionData)
def join_session(
    session_id: str, request: JoinSessionRequest, db: Session = Depends(get_db)
):
    """Join an existing session"""
    # Check if session exists
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"},
        )

    # Check if session is expired
    if session_service.is_session_expired(session):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"success": False, "error": "Session has expired"},
        )

    # Add participant
    session_service.add_participant(db, session_id, request.user)

    # Refresh session to get updated participants
    db.refresh(session)

    return SessionData(success=True, data=SessionResponse.model_validate(session))


@router.put("/{session_id}/code", response_model=SessionData)
def save_code(
    session_id: str, request: CodeSnapshotRequest, db: Session = Depends(get_db)
):
    """Save code snapshot for a session"""
    # Check if session exists
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "Session not found"},
        )

    # Update code and language
    updated_session = session_service.update_session(
        db, session_id, code=request.code, language=request.language.value
    )

    return SessionData(
        success=True, data=SessionResponse.model_validate(updated_session)
    )
