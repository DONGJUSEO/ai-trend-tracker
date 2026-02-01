"""AI Leaderboard 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class AILeaderboard(Base):
    """AI 모델 리더보드"""

    __tablename__ = "ai_leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False, index=True)
    leaderboard_source = Column(String, nullable=False)  # "Open LLM", "Chatbot Arena", etc.
    rank = Column(Integer)  # Current ranking position

    # Benchmark scores (JSON for flexibility)
    scores = Column(JSON, default={})  # {"MMLU": 85.2, "GSM8K": 72.1, ...}

    # Model metadata
    organization = Column(String)  # Creator/organization
    model_size = Column(String)  # "7B", "70B", "175B", etc.
    license = Column(String)  # MIT, Apache 2.0, etc.
    model_type = Column(String)  # "Open Source", "Closed", "Fine-tuned"

    # Additional info
    huggingface_url = Column(String, unique=True, index=True)
    paper_url = Column(String)

    # AI summary
    summary = Column(Text)
    keywords = Column(JSON, default=[])
    strengths = Column(JSON, default=[])  # What this model excels at

    # Metadata
    benchmark_date = Column(DateTime)  # When benchmark was run
    is_trending = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AILeaderboard(model_name={self.model_name}, rank={self.rank})>"
