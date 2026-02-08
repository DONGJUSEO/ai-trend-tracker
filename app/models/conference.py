"""AI Conference 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON, Float
from sqlalchemy.sql import func
from app.database import Base


class AIConference(Base):
    """AI 컨퍼런스 및 학회"""

    __tablename__ = "ai_conferences"

    id = Column(Integer, primary_key=True, index=True)
    conference_name = Column(String, nullable=False, index=True)
    conference_acronym = Column(String)  # "NeurIPS", "ICML", "CVPR", etc.
    year = Column(Integer)

    # Dates
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    submission_deadline = Column(DateTime)
    notification_date = Column(DateTime)

    # Location
    location = Column(String)  # "Vancouver, Canada"
    venue_type = Column(String)  # "Hybrid", "In-person", "Virtual"

    # Conference info
    website_url = Column(String, unique=True, index=True)
    topics = Column(JSON, default=[])  # ["NLP", "Computer Vision", etc.]

    # Statistics
    num_submissions = Column(Integer)
    num_acceptances = Column(Integer)
    acceptance_rate = Column(Float)  # Calculated percentage

    # Notable info
    keynote_speakers = Column(JSON, default=[])
    organizing_committee = Column(JSON, default=[])

    # AI summary
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    highlights = Column(JSON, default=[])  # Key themes/topics

    # Metadata
    tier = Column(String)  # "A*", "A", "B" for ranking
    is_trending = Column(Boolean, default=False)
    is_upcoming = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AIConference(conference_name={self.conference_name}, year={self.year})>"
