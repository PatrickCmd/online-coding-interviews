"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class LanguageEnum(str, Enum):
    """Supported programming languages"""

    javascript = "javascript"
    python = "python"
    html = "html"


class RoleEnum(str, Enum):
    """User roles in interview"""

    interviewer = "interviewer"
    candidate = "candidate"


class UserInfo(BaseModel):
    """User information for creating/joining sessions"""

    id: str = Field(..., description="UUID")
    name: str = Field(..., min_length=1, max_length=255)
    color: str = Field(..., description="HSL color string")


class ParticipantBase(BaseModel):
    """Base participant schema"""

    id: str
    name: str
    role: RoleEnum
    color: str
    joined_at: int
    is_online: bool


class ParticipantResponse(ParticipantBase):
    """Participant response schema"""

    class Config:
        from_attributes = True


class SessionBase(BaseModel):
    """Base session schema"""

    code: str = ""
    language: LanguageEnum = LanguageEnum.javascript


class SessionCreate(SessionBase):
    """Schema for creating a session"""

    creator: UserInfo


class SessionUpdate(BaseModel):
    """Schema for updating a session"""

    code: Optional[str] = None
    language: Optional[LanguageEnum] = None


class SessionResponse(BaseModel):
    """Session response schema"""

    id: str
    created_at: int
    updated_at: int
    expires_at: int
    code: str
    language: str
    participants: List[ParticipantResponse]
    creator_id: str

    class Config:
        from_attributes = True


class SessionData(BaseModel):
    """Wrapper for session response"""

    success: bool = True
    data: SessionResponse


class JoinSessionRequest(BaseModel):
    """Schema for joining a session"""

    user: UserInfo


class CodeSnapshotRequest(BaseModel):
    """Schema for saving code snapshot"""

    code: str
    language: LanguageEnum


class UpdateParticipantRequest(BaseModel):
    """Schema for updating participant"""

    is_online: Optional[bool] = None


class ErrorResponse(BaseModel):
    """Error response schema"""

    success: bool = False
    error: str
    code: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    timestamp: int
