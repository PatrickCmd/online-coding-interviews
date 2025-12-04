"""
SQLAlchemy models for sessions and participants
"""

from sqlalchemy import Column, String, BigInteger, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Session(Base):
    """Interview session model"""

    __tablename__ = "sessions"

    id = Column(String(8), primary_key=True, index=True)
    created_at = Column(BigInteger, nullable=False)
    updated_at = Column(BigInteger, nullable=False)
    expires_at = Column(BigInteger, nullable=False, index=True)
    code = Column(Text, nullable=False, default="")
    language = Column(String(20), nullable=False, default="javascript")
    creator_id = Column(String(36), nullable=False)

    # Relationship
    participants = relationship(
        "Participant", back_populates="session", cascade="all, delete-orphan"
    )


class Participant(Base):
    """Session participant model"""

    __tablename__ = "participants"

    id = Column(String(36), primary_key=True)
    session_id = Column(
        String(8),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    joined_at = Column(BigInteger, nullable=False)
    is_online = Column(Boolean, default=True)

    # Relationship
    session = relationship("Session", back_populates="participants")
