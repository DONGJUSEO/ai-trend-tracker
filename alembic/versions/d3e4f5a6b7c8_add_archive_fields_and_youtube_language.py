"""add archive fields and youtube channel language

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-02-08 09:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d3e4f5a6b7c8"
down_revision: Union[str, None] = "c2d3e4f5a6b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ARCHIVE_TABLES = [
    "huggingface_models",
    "youtube_videos",
    "ai_papers",
    "ai_news",
    "github_projects",
    "ai_conferences",
    "ai_tools",
    "ai_job_trends",
    "ai_policies",
]


def upgrade() -> None:
    # youtube language field
    op.add_column(
        "youtube_videos",
        sa.Column("channel_language", sa.String(), nullable=True),
    )
    op.create_index(
        "ix_youtube_videos_channel_language",
        "youtube_videos",
        ["channel_language"],
        unique=False,
    )

    # soft-archive fields
    for table_name in ARCHIVE_TABLES:
        op.add_column(
            table_name,
            sa.Column(
                "is_archived",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )
        op.add_column(
            table_name,
            sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index(
            f"ix_{table_name}_is_archived",
            table_name,
            ["is_archived"],
            unique=False,
        )


def downgrade() -> None:
    for table_name in ARCHIVE_TABLES:
        op.drop_index(f"ix_{table_name}_is_archived", table_name=table_name)
        op.drop_column(table_name, "archived_at")
        op.drop_column(table_name, "is_archived")

    op.drop_index(
        "ix_youtube_videos_channel_language",
        table_name="youtube_videos",
    )
    op.drop_column("youtube_videos", "channel_language")

