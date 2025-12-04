"""
Business logic for session management
"""

import secrets
import time
from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import Session as SessionModel, Participant as ParticipantModel
from app.schemas.schemas import SessionCreate, UserInfo, RoleEnum
from app.core.config import get_settings

settings = get_settings()
SESSION_EXPIRATION_MS = settings.SESSION_EXPIRATION_HOURS * 60 * 60 * 1000


def generate_session_id() -> str:
    """Generate 8-character hex session ID"""
    return secrets.token_hex(4)


def create_session(db: Session, session_data: SessionCreate) -> SessionModel:
    """Create a new interview session with creator as first participant"""
    session_id = generate_session_id()
    now = int(time.time() * 1000)

    # Create session
    db_session = SessionModel(
        id=session_id,
        created_at=now,
        updated_at=now,
        expires_at=now + SESSION_EXPIRATION_MS,
        code=session_data.code,
        language=session_data.language.value,
        creator_id=session_data.creator.id,
    )
    db.add(db_session)

    # Add creator as participant
    participant = ParticipantModel(
        id=session_data.creator.id,
        session_id=session_id,
        name=session_data.creator.name,
        role=RoleEnum.interviewer.value,
        color=session_data.creator.color,
        joined_at=now,
        is_online=True,
    )
    db.add(participant)

    db.commit()
    db.refresh(db_session)

    return db_session


def get_session(db: Session, session_id: str) -> Optional[SessionModel]:
    """Get session by ID"""
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()


def update_session(db: Session, session_id: str, **kwargs) -> Optional[SessionModel]:
    """Update session fields"""
    session = get_session(db, session_id)
    if not session:
        return None

    for key, value in kwargs.items():
        if value is not None and hasattr(session, key):
            setattr(session, key, value)

    session.updated_at = int(time.time() * 1000)
    db.commit()
    db.refresh(session)

    return session


def delete_session(db: Session, session_id: str) -> bool:
    """Delete a session"""
    session = get_session(db, session_id)
    if not session:
        return False

    db.delete(session)
    db.commit()
    return True


def is_session_expired(session: SessionModel) -> bool:
    """Check if session has expired"""
    return session.expires_at < int(time.time() * 1000)


def add_participant(
    db: Session, session_id: str, user: UserInfo, role: RoleEnum = RoleEnum.candidate
) -> Optional[ParticipantModel]:
    """Add or update participant in session"""
    session = get_session(db, session_id)
    if not session:
        return None

    # Check if participant already exists
    participant = (
        db.query(ParticipantModel)
        .filter(
            ParticipantModel.session_id == session_id, ParticipantModel.id == user.id
        )
        .first()
    )

    if participant:
        # Update existing participant
        participant.name = user.name
        participant.color = user.color
        participant.is_online = True
    else:
        # Create new participant
        participant = ParticipantModel(
            id=user.id,
            session_id=session_id,
            name=user.name,
            role=role.value,
            color=user.color,
            joined_at=int(time.time() * 1000),
            is_online=True,
        )
        db.add(participant)

    db.commit()
    db.refresh(participant)

    return participant


def remove_participant(db: Session, session_id: str, participant_id: str) -> bool:
    """Remove participant from session"""
    participant = (
        db.query(ParticipantModel)
        .filter(
            ParticipantModel.session_id == session_id,
            ParticipantModel.id == participant_id,
        )
        .first()
    )

    if not participant:
        return False

    db.delete(participant)
    db.commit()
    return True


def update_participant(
    db: Session, session_id: str, participant_id: str, **kwargs
) -> Optional[ParticipantModel]:
    """Update participant fields"""
    participant = (
        db.query(ParticipantModel)
        .filter(
            ParticipantModel.session_id == session_id,
            ParticipantModel.id == participant_id,
        )
        .first()
    )

    if not participant:
        return None

    for key, value in kwargs.items():
        if value is not None and hasattr(participant, key):
            setattr(participant, key, value)

    db.commit()
    db.refresh(participant)

    return participant


def get_participants(db: Session, session_id: str) -> list[ParticipantModel]:
    """Get all participants in a session"""
    return (
        db.query(ParticipantModel)
        .filter(ParticipantModel.session_id == session_id)
        .all()
    )
