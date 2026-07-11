from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class AppLanguage(str, Enum):
    kn = "kn"
    en = "en"
    hi = "hi"


class UserRole(str, Enum):
    producer = "producer"
    consumer = "consumer"


class ProfileSyncRequest(BaseModel):
    supabase_uuid: str = Field(..., min_length=1)
    full_name: Optional[str] = None
    phone: Optional[str] = None
    language: AppLanguage
    role: UserRole


class ProfileSyncResponse(BaseModel):
    success: bool
    profile_id: str
    message: str
