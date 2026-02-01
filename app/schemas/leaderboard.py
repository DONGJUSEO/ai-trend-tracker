"""AI Leaderboard 스키마"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class AILeaderboardBase(BaseModel):
    model_name: str
    leaderboard_source: str
    rank: Optional[int] = None
    scores: Dict[str, Any] = Field(default_factory=dict)
    organization: Optional[str] = None
    model_size: Optional[str] = None


class AILeaderboardResponse(AILeaderboardBase):
    id: int
    license: Optional[str] = None
    model_type: Optional[str] = None
    huggingface_url: Optional[str] = None
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    is_trending: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class AILeaderboardList(BaseModel):
    total: int
    items: List[AILeaderboardResponse]
