from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.database import Base


class HuggingFaceModel(Base):
    """Hugging Face 모델 정보"""

    __tablename__ = "huggingface_models"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String, unique=True, index=True, nullable=False)  # 예: "meta-llama/Llama-2-7b"
    model_name = Column(String, nullable=False)  # 모델 이름
    author = Column(String, index=True)  # 작성자/조직

    # 모델 정보
    description = Column(Text)  # 원본 설명
    task = Column(String, index=True)  # text-generation, image-classification 등
    tags = Column(JSON, default=[])  # 태그 리스트
    library_name = Column(String)  # transformers, diffusers 등

    # 통계
    downloads = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    # AI 요약
    summary = Column(Text)  # AI가 생성한 한글 요약
    key_features = Column(JSON, default=[])  # 주요 특징 리스트
    use_cases = Column(Text)  # 사용 사례

    # 메타데이터
    url = Column(String)  # Hugging Face 링크
    last_modified = Column(DateTime(timezone=True))  # HF에서 마지막 수정일
    collected_at = Column(DateTime(timezone=True), server_default=func.now())  # 수집 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 플래그
    is_featured = Column(Boolean, default=False)  # 추천 모델
    is_trending = Column(Boolean, default=False)  # 트렌딩 모델

    def __repr__(self):
        return f"<HuggingFaceModel {self.model_id}>"
