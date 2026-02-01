"""AI Startup 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class AIStartup(Base):
    __tablename__ = "ai_startups"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    funding_amount = Column(Integer)
    funding_series = Column(String)
    funding_date = Column(DateTime)
    founders = Column(JSON, default=[])
    investors = Column(JSON, default=[])
    website = Column(String, unique=True, index=True)
    industry_tags = Column(JSON, default=[])
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    is_trending = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return f"<AIStartup(company_name={self.company_name})>"
