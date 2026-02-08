"""키워드 추출 서비스 (KeyBERT + spaCy + KoNLPy + 폴백)."""
from __future__ import annotations

from collections import Counter
from functools import lru_cache
import logging
import os
import re
from typing import Iterable, List, Optional, Tuple

logger = logging.getLogger(__name__)


class KeywordExtractionService:
    """텍스트에서 핵심 키워드를 추출한다.

    우선순위:
    1) KeyBERT keyphrase (1~2gram)
    2) spaCy NER (ko_core_news_sm)
    3) KoNLPy Mecab 명사
    4) 정규식 기반 폴백
    """

    _KOREAN_STOPWORDS = {
        "관련",
        "기반",
        "통해",
        "대한",
        "위한",
        "에서",
        "으로",
        "입니다",
        "있습니다",
        "합니다",
        "했다",
        "the",
        "and",
        "for",
        "with",
        "from",
        "this",
        "that",
    }

    def __init__(self) -> None:
        self._initialized = False
        self._keybert = None
        self._spacy_nlp = None
        self._mecab = None

    def _lazy_init(self) -> None:
        if self._initialized:
            return

        self._initialized = True

        try:
            from keybert import KeyBERT  # type: ignore

            model_name = os.getenv("KEYBERT_MODEL", "all-MiniLM-L6-v2")
            self._keybert = KeyBERT(model=model_name)
            logger.info("KeywordExtractor: KeyBERT enabled (%s)", model_name)
        except Exception as e:
            logger.info("KeywordExtractor: KeyBERT unavailable (%s)", e)

        try:
            import spacy  # type: ignore

            spacy_model = os.getenv("SPACY_MODEL", "ko_core_news_sm")
            self._spacy_nlp = spacy.load(spacy_model)
            logger.info("KeywordExtractor: spaCy enabled (%s)", spacy_model)
        except Exception as e:
            logger.info("KeywordExtractor: spaCy unavailable (%s)", e)

        try:
            from konlpy.tag import Mecab  # type: ignore

            self._mecab = Mecab()
            logger.info("KeywordExtractor: KoNLPy Mecab enabled")
        except Exception as e:
            logger.info("KeywordExtractor: KoNLPy Mecab unavailable (%s)", e)

    @staticmethod
    def _normalize_keyword(keyword: str) -> str:
        cleaned = re.sub(r"\s+", " ", (keyword or "").strip())
        cleaned = cleaned.strip(".,:;!?'\"()[]{}")
        return cleaned

    def _is_valid(self, keyword: str) -> bool:
        if not keyword:
            return False
        lower = keyword.lower()
        if lower in self._KOREAN_STOPWORDS:
            return False
        if len(keyword) < 2:
            return False
        return True

    def _regex_keywords(self, text: str) -> List[str]:
        if not text:
            return []

        ko_tokens = re.findall(r"[가-힣]{2,}", text)
        en_tokens = re.findall(r"[A-Za-z][A-Za-z0-9+#._-]{1,}", text)

        return [*ko_tokens, *en_tokens]

    def _rank_keywords(self, candidates: Iterable[str], top_k: int) -> List[str]:
        counter: Counter[str] = Counter()
        for raw in candidates:
            keyword = self._normalize_keyword(raw)
            if not self._is_valid(keyword):
                continue
            counter[keyword] += 1

        if not counter:
            return []

        return [kw for kw, _ in counter.most_common(max(1, top_k))]

    def extract_keywords(self, text: Optional[str], top_k: int = 10) -> List[str]:
        """단일 텍스트에서 핵심 키워드 추출."""
        if not text:
            return []

        self._lazy_init()
        candidates: List[str] = []

        if self._keybert is not None:
            try:
                keyphrases = self._keybert.extract_keywords(
                    text,
                    keyphrase_ngram_range=(1, 2),
                    use_mmr=True,
                    diversity=0.5,
                    top_n=max(8, top_k * 2),
                )
                candidates.extend([phrase for phrase, _score in keyphrases])
            except Exception as e:
                logger.debug("KeyBERT extraction failed: %s", e)

        if self._spacy_nlp is not None:
            try:
                doc = self._spacy_nlp(text)
                candidates.extend([ent.text for ent in doc.ents])
            except Exception as e:
                logger.debug("spaCy extraction failed: %s", e)

        if self._mecab is not None:
            try:
                candidates.extend(self._mecab.nouns(text))
            except Exception as e:
                logger.debug("Mecab extraction failed: %s", e)

        candidates.extend(self._regex_keywords(text))
        return self._rank_keywords(candidates, top_k=top_k)

    def extract_trending_keywords(
        self,
        texts: Iterable[str],
        top_k: int = 10,
        per_text_limit: int = 6,
    ) -> List[Tuple[str, int]]:
        """복수 텍스트에서 트렌딩 키워드 집계."""
        counter: Counter[str] = Counter()
        for text in texts:
            keywords = self.extract_keywords(text, top_k=per_text_limit)
            for keyword in keywords:
                counter[keyword] += 1
        return counter.most_common(max(1, top_k))


@lru_cache(maxsize=1)
def get_keyword_extractor() -> KeywordExtractionService:
    return KeywordExtractionService()

