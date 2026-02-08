"""AI Job Trend 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class AIJobTrend(Base):
    __tablename__ = "ai_job_trends"
    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, index=True, nullable=False)
    company_name = Column(String)
    description = Column(Text)
    location = Column(String)
    is_remote = Column(Boolean, default=False)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    required_skills = Column(JSON, default=[])
    job_url = Column(String, unique=True, index=True)
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    posted_date = Column(DateTime)
    is_trending = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return f"<AIJobTrend(job_title={self.job_title})>"
