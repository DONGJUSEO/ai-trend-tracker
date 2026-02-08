"""AI Tool 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON, Float
from sqlalchemy.sql import func
from app.database import Base


class AITool(Base):
    """AI 도구 및 서비스"""

    __tablename__ = "ai_tools"

    id = Column(Integer, primary_key=True, index=True)
    tool_name = Column(String, unique=True, index=True, nullable=False)
    tagline = Column(String)  # Short one-liner
    description = Column(Text)

    # Category
    category = Column(String)  # "Image Generation", "Text", "Code", "Video", etc.
    subcategory = Column(String)  # More specific
    use_cases = Column(JSON, default=[])  # ["Marketing", "Design", etc.]

    # Pricing
    pricing_model = Column(String)  # "Free", "Freemium", "Paid", "Open Source"
    price_range = Column(String)  # "$0-10/mo", "$50+/mo", etc.
    free_tier_available = Column(Boolean, default=False)

    # Ratings & popularity
    rating = Column(Float)  # 0-5 stars
    num_reviews = Column(Integer)
    upvotes = Column(Integer)  # Product Hunt upvotes

    # Links
    website = Column(String, unique=True, index=True)
    product_hunt_url = Column(String)
    github_url = Column(String)

    # Features
    key_features = Column(JSON, default=[])
    supported_platforms = Column(JSON, default=[])  # ["Web", "iOS", "API"]

    # AI summary
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    best_for = Column(JSON, default=[])  # Use case recommendations

    # Metadata
    launch_date = Column(DateTime)
    is_trending = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AITool(tool_name={self.tool_name}, category={self.category})>"
