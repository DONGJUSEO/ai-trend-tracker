"""v4 데이터 보정 실행 스크립트.

Usage:
  python -m app.scripts.backfill_v4_data --limit 5000 --with-summary --summary-limit 10
"""
from __future__ import annotations

import argparse
import asyncio
import json

from app.database import AsyncSessionLocal
from app.services.backfill_service import backfill_missing_summaries, backfill_v4_metadata


async def run(limit: int, with_summary: bool, summary_limit: int) -> None:
    async with AsyncSessionLocal() as db:
        metadata_result = await backfill_v4_metadata(db, limit=limit)
        payload = {
            "metadata_backfill": metadata_result,
        }
        if with_summary:
            summary_result = await backfill_missing_summaries(
                db,
                limit_per_category=summary_limit,
            )
            payload["summary_backfill"] = summary_result

    print(json.dumps(payload, ensure_ascii=False, indent=2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Backfill AI봄 v4 데이터")
    parser.add_argument(
        "--limit",
        type=int,
        default=5000,
        help="metadata backfill 대상 최대 레코드 수 (기본값: 5000)",
    )
    parser.add_argument(
        "--with-summary",
        action="store_true",
        help="summary 백필도 함께 실행",
    )
    parser.add_argument(
        "--summary-limit",
        type=int,
        default=10,
        help="카테고리별 summary 백필 최대 건수 (기본값: 10)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    asyncio.run(
        run(
            limit=max(1, args.limit),
            with_summary=args.with_summary,
            summary_limit=max(1, args.summary_limit),
        )
    )


if __name__ == "__main__":
    main()
