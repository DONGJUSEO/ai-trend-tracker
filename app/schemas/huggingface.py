from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class HuggingFaceModelBase(BaseModel):
    """Hugging Face 모델 기본 스키마"""

    model_id: str
    model_name: str
    author: Optional[str] = None
    description: Optional[str] = None
    task: Optional[str] = None
    task_ko: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    library_name: Optional[str] = None
    downloads: int = 0
    likes: int = 0
    url: Optional[str] = None


class HuggingFaceModelCreate(HuggingFaceModelBase):
    """Hugging Face 모델 생성 스키마"""

    last_modified: Optional[datetime] = None


class HuggingFaceModelUpdate(BaseModel):
    """Hugging Face 모델 업데이트 스키마"""

    model_name: Optional[str] = None
    description: Optional[str] = None
    task: Optional[str] = None
    task_ko: Optional[str] = None
    tags: Optional[List[str]] = None
    downloads: Optional[int] = None
    likes: Optional[int] = None
    summary: Optional[str] = None
    key_features: Optional[List[str]] = None
    use_cases: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None


class HuggingFaceModelResponse(HuggingFaceModelBase):
    """Hugging Face 모델 응답 스키마"""

    id: int
    summary: Optional[str] = None
    key_features: List[str] = Field(default_factory=list)
    use_cases: Optional[str] = None
    last_modified: Optional[datetime] = None
    collected_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_featured: bool = False
    is_trending: bool = False

    class Config:
        from_attributes = True


class HuggingFaceModelList(BaseModel):
    """Hugging Face 모델 리스트 응답"""

    total: int
    items: List[HuggingFaceModelResponse]
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
