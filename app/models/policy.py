"""AI Policy 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class AIPolicy(Base):
    __tablename__ = "ai_policies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    policy_type = Column(String)
    country = Column(String)
    status = Column(String)
    effective_date = Column(DateTime)
    description = Column(Text)
    source_url = Column(String, unique=True, index=True)
    impact_areas = Column(JSON, default=[])
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    is_trending = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return f"<AIPolicy(title={self.title})>"
