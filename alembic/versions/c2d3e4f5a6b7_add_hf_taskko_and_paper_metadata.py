"""add huggingface task_ko and paper metadata fields

Revision ID: c2d3e4f5a6b7
Revises: 9e449828dbcf
Create Date: 2026-02-08 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c2d3e4f5a6b7"
down_revision: Union[str, None] = "9e449828dbcf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "huggingface_models",
        sa.Column("task_ko", sa.String(), nullable=True),
    )
    op.create_index(
        "ix_huggingface_models_task_ko",
        "huggingface_models",
        ["task_ko"],
        unique=False,
    )

    op.add_column(
        "ai_papers",
        sa.Column("topic", sa.String(), nullable=True),
    )
    op.add_column(
        "ai_papers",
        sa.Column("conference_name", sa.String(), nullable=True),
    )
    op.add_column(
        "ai_papers",
        sa.Column("conference_year", sa.Integer(), nullable=True),
    )
    op.create_index("ix_ai_papers_topic", "ai_papers", ["topic"], unique=False)
    op.create_index(
        "ix_ai_papers_conference_name",
        "ai_papers",
        ["conference_name"],
        unique=False,
    )
    op.create_index(
        "ix_ai_papers_conference_year",
        "ai_papers",
        ["conference_year"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_ai_papers_conference_year", table_name="ai_papers")
    op.drop_index("ix_ai_papers_conference_name", table_name="ai_papers")
    op.drop_index("ix_ai_papers_topic", table_name="ai_papers")
    op.drop_column("ai_papers", "conference_year")
    op.drop_column("ai_papers", "conference_name")
    op.drop_column("ai_papers", "topic")

    op.drop_index("ix_huggingface_models_task_ko", table_name="huggingface_models")
    op.drop_column("huggingface_models", "task_ko")
