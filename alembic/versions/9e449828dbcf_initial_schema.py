"""initial schema

Revision ID: 9e449828dbcf
Revises:
Create Date: 2026-02-07 05:09:34.163695

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9e449828dbcf'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # huggingface_models
    op.create_table(
        'huggingface_models',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('model_id', sa.String(), nullable=False),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('author', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('task', sa.String()),
        sa.Column('tags', sa.JSON(), server_default='[]'),
        sa.Column('library_name', sa.String()),
        sa.Column('downloads', sa.Integer(), server_default='0'),
        sa.Column('likes', sa.Integer(), server_default='0'),
        sa.Column('summary', sa.Text()),
        sa.Column('key_features', sa.JSON(), server_default='[]'),
        sa.Column('use_cases', sa.Text()),
        sa.Column('url', sa.String()),
        sa.Column('last_modified', sa.DateTime(timezone=True)),
        sa.Column('collected_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
    )
    op.create_index('ix_huggingface_models_id', 'huggingface_models', ['id'])
    op.create_index('ix_huggingface_models_model_id', 'huggingface_models', ['model_id'], unique=True)
    op.create_index('ix_huggingface_models_author', 'huggingface_models', ['author'])
    op.create_index('ix_huggingface_models_task', 'huggingface_models', ['task'])

    # youtube_videos
    op.create_table(
        'youtube_videos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('video_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('channel_title', sa.String()),
        sa.Column('channel_id', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('published_at', sa.DateTime(timezone=True)),
        sa.Column('thumbnail_url', sa.String()),
        sa.Column('view_count', sa.Integer(), server_default='0'),
        sa.Column('like_count', sa.Integer(), server_default='0'),
        sa.Column('comment_count', sa.Integer(), server_default='0'),
        sa.Column('duration', sa.String()),
        sa.Column('tags', sa.JSON(), server_default='[]'),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('key_points', sa.JSON(), server_default='[]'),
        sa.Column('category', sa.String(), server_default="'AI/Tech'"),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_youtube_videos_id', 'youtube_videos', ['id'])
    op.create_index('ix_youtube_videos_video_id', 'youtube_videos', ['video_id'], unique=True)

    # youtube_channels
    op.create_table(
        'youtube_channels',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('channel_id', sa.String(), nullable=False),
        sa.Column('channel_name', sa.String(), nullable=False),
        sa.Column('channel_handle', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String(), server_default="'AI/ML'"),
        sa.Column('subscriber_count', sa.Integer(), server_default='0'),
        sa.Column('video_count', sa.Integer(), server_default='0'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('priority', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.Column('last_collected_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_youtube_channels_id', 'youtube_channels', ['id'])
    op.create_index('ix_youtube_channels_channel_id', 'youtube_channels', ['channel_id'], unique=True)

    # ai_papers
    op.create_table(
        'ai_papers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('arxiv_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('authors', sa.JSON(), server_default='[]'),
        sa.Column('abstract', sa.Text()),
        sa.Column('categories', sa.JSON(), server_default='[]'),
        sa.Column('published_date', sa.DateTime(timezone=True)),
        sa.Column('updated_date', sa.DateTime(timezone=True)),
        sa.Column('pdf_url', sa.String()),
        sa.Column('arxiv_url', sa.String()),
        sa.Column('comment', sa.Text()),
        sa.Column('journal_ref', sa.String()),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('key_contributions', sa.JSON(), server_default='[]'),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_ai_papers_id', 'ai_papers', ['id'])
    op.create_index('ix_ai_papers_arxiv_id', 'ai_papers', ['arxiv_id'], unique=True)

    # ai_news
    op.create_table(
        'ai_news',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('author', sa.String()),
        sa.Column('source', sa.String()),
        sa.Column('source_url', sa.String()),
        sa.Column('published_date', sa.DateTime(timezone=True)),
        sa.Column('content', sa.Text()),
        sa.Column('excerpt', sa.Text()),
        sa.Column('image_url', sa.String()),
        sa.Column('tags', sa.JSON(), server_default='[]'),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('key_points', sa.JSON(), server_default='[]'),
        sa.Column('category', sa.String(), server_default="'AI News'"),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_ai_news_id', 'ai_news', ['id'])
    op.create_index('ix_ai_news_url', 'ai_news', ['url'], unique=True)

    # github_projects
    op.create_table(
        'github_projects',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('repo_name', sa.String(), nullable=False),
        sa.Column('owner', sa.String()),
        sa.Column('name', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('url', sa.String()),
        sa.Column('homepage', sa.String()),
        sa.Column('language', sa.String()),
        sa.Column('stars', sa.Integer(), server_default='0'),
        sa.Column('forks', sa.Integer(), server_default='0'),
        sa.Column('watchers', sa.Integer(), server_default='0'),
        sa.Column('open_issues', sa.Integer(), server_default='0'),
        sa.Column('topics', sa.JSON(), server_default='[]'),
        sa.Column('license', sa.String()),
        sa.Column('created_at_github', sa.DateTime()),
        sa.Column('updated_at_github', sa.DateTime()),
        sa.Column('pushed_at', sa.DateTime()),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('use_cases', sa.JSON(), server_default='[]'),
        sa.Column('category', sa.String(), server_default="'AI/ML'"),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_github_projects_id', 'github_projects', ['id'])
    op.create_index('ix_github_projects_repo_name', 'github_projects', ['repo_name'], unique=True)

    # ai_conferences
    op.create_table(
        'ai_conferences',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('conference_name', sa.String(), nullable=False),
        sa.Column('conference_acronym', sa.String()),
        sa.Column('year', sa.Integer()),
        sa.Column('start_date', sa.DateTime()),
        sa.Column('end_date', sa.DateTime()),
        sa.Column('submission_deadline', sa.DateTime()),
        sa.Column('notification_date', sa.DateTime()),
        sa.Column('location', sa.String()),
        sa.Column('venue_type', sa.String()),
        sa.Column('website_url', sa.String()),
        sa.Column('topics', sa.JSON(), server_default='[]'),
        sa.Column('num_submissions', sa.Integer()),
        sa.Column('num_acceptances', sa.Integer()),
        sa.Column('acceptance_rate', sa.Float()),
        sa.Column('keynote_speakers', sa.JSON(), server_default='[]'),
        sa.Column('organizing_committee', sa.JSON(), server_default='[]'),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('highlights', sa.JSON(), server_default='[]'),
        sa.Column('tier', sa.String()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_upcoming', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_ai_conferences_id', 'ai_conferences', ['id'])
    op.create_index('ix_ai_conferences_conference_name', 'ai_conferences', ['conference_name'])
    op.create_index('ix_ai_conferences_website_url', 'ai_conferences', ['website_url'], unique=True)

    # ai_tools
    op.create_table(
        'ai_tools',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tool_name', sa.String(), nullable=False),
        sa.Column('tagline', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String()),
        sa.Column('subcategory', sa.String()),
        sa.Column('use_cases', sa.JSON(), server_default='[]'),
        sa.Column('pricing_model', sa.String()),
        sa.Column('price_range', sa.String()),
        sa.Column('free_tier_available', sa.Boolean(), server_default=sa.false()),
        sa.Column('rating', sa.Float()),
        sa.Column('num_reviews', sa.Integer()),
        sa.Column('upvotes', sa.Integer()),
        sa.Column('website', sa.String()),
        sa.Column('product_hunt_url', sa.String()),
        sa.Column('github_url', sa.String()),
        sa.Column('key_features', sa.JSON(), server_default='[]'),
        sa.Column('supported_platforms', sa.JSON(), server_default='[]'),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('best_for', sa.JSON(), server_default='[]'),
        sa.Column('launch_date', sa.DateTime()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_ai_tools_id', 'ai_tools', ['id'])
    op.create_index('ix_ai_tools_tool_name', 'ai_tools', ['tool_name'], unique=True)
    op.create_index('ix_ai_tools_website', 'ai_tools', ['website'], unique=True)

    # ai_job_trends
    op.create_table(
        'ai_job_trends',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_title', sa.String(), nullable=False),
        sa.Column('company_name', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('location', sa.String()),
        sa.Column('is_remote', sa.Boolean(), server_default=sa.false()),
        sa.Column('salary_min', sa.Integer()),
        sa.Column('salary_max', sa.Integer()),
        sa.Column('required_skills', sa.JSON(), server_default='[]'),
        sa.Column('job_url', sa.String()),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('posted_date', sa.DateTime()),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_ai_job_trends_id', 'ai_job_trends', ['id'])
    op.create_index('ix_ai_job_trends_job_title', 'ai_job_trends', ['job_title'])
    op.create_index('ix_ai_job_trends_job_url', 'ai_job_trends', ['job_url'], unique=True)

    # ai_policies
    op.create_table(
        'ai_policies',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('policy_type', sa.String()),
        sa.Column('country', sa.String()),
        sa.Column('status', sa.String()),
        sa.Column('effective_date', sa.DateTime()),
        sa.Column('description', sa.Text()),
        sa.Column('source_url', sa.String()),
        sa.Column('impact_areas', sa.JSON(), server_default='[]'),
        sa.Column('summary', sa.Text()),
        sa.Column('keywords', sa.JSON(), server_default='[]'),
        sa.Column('is_trending', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_ai_policies_id', 'ai_policies', ['id'])
    op.create_index('ix_ai_policies_source_url', 'ai_policies', ['source_url'], unique=True)


def downgrade() -> None:
    op.drop_table('ai_policies')
    op.drop_table('ai_job_trends')
    op.drop_table('ai_tools')
    op.drop_table('ai_conferences')
    op.drop_table('github_projects')
    op.drop_table('ai_news')
    op.drop_table('ai_papers')
    op.drop_table('youtube_channels')
    op.drop_table('youtube_videos')
    op.drop_table('huggingface_models')
