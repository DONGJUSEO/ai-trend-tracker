"""로깅 설정"""
import json
import logging
import logging.handlers
import os
from pathlib import Path

# 로그 디렉토리 생성
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# 로그 파일 경로
LOG_FILE = LOG_DIR / "app.log"
ERROR_LOG_FILE = LOG_DIR / "error.log"
COLLECTION_LOG_FILE = LOG_DIR / "collection.log"


class JsonFormatter(logging.Formatter):
    """JSON 구조화 로그 포맷터."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def setup_logging():
    """로깅 설정 초기화"""

    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    # 중복 핸들러 방지
    root_logger.handlers.clear()

    # 포맷터 설정
    use_json = os.getenv("LOG_JSON", "true").lower() not in {"0", "false", "no"}
    formatter = (
        JsonFormatter()
        if use_json
        else logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )

    # 콘솔 핸들러 (INFO 이상)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # 파일 핸들러 - 전체 로그 (회전: 10MB, 최대 5개 파일)
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    # 에러 로그 파일 핸들러 (ERROR 이상만)
    error_handler = logging.handlers.RotatingFileHandler(
        ERROR_LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=3,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    # 루트 로거에 핸들러 추가
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)

    # 데이터 수집 전용 로거 설정
    collection_logger = logging.getLogger('collection')
    collection_logger.setLevel(logging.INFO)
    collection_logger.handlers.clear()
    collection_logger.propagate = False

    collection_handler = logging.handlers.RotatingFileHandler(
        COLLECTION_LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    collection_handler.setFormatter(formatter)
    collection_logger.addHandler(collection_handler)

    # 외부 라이브러리 로그 레벨 조정
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('httpcore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)

    logging.info(f"✅ 로깅 시스템 초기화 완료")
    logging.info(f"📁 로그 디렉토리: {LOG_DIR.absolute()}")


def get_logger(name: str) -> logging.Logger:
    """특정 이름의 로거 가져오기"""
    return logging.getLogger(name)


# 데이터 수집 전용 로거
collection_logger = logging.getLogger('collection')
