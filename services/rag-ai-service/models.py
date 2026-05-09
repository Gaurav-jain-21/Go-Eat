from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    question:   str
    user_id:    Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer:     str
    sources:    List[str] = []
    session_id: Optional[str] = None


class IngestRequest(BaseModel):
    force_reingest: bool = False