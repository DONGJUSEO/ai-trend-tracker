"""AI Tool 스키마"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class AIToolBase(BaseModel):
    """AI Tool 기본 스키마"""

    tool_name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    use_cases: List[str] = Field(default_factory=list)
    pricing_model: Optional[str] = None
    price_range: Optional[str] = None
    free_tier_available: bool = False
    website: Optional[str] = None


class AIToolCreate(AIToolBase):
    """AI Tool 생성 스키마"""

    pass


class AIToolResponse(AIToolBase):
    """AI Tool 응답 스키마"""

    id: int
    rating: Optional[float] = None
    num_reviews: Optional[int] = None
    upvotes: Optional[int] = None
    product_hunt_url: Optional[str] = None
    github_url: Optional[str] = None
    key_features: List[str] = Field(default_factory=list)
    supported_platforms: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    best_for: List[str] = Field(default_factory=list)
    launch_date: Optional[datetime] = None
    is_trending: bool = False
    is_featured: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIToolList(BaseModel):
    """AI Tool 목록 응답"""

    total: int
    items: List[AIToolResponse]
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
