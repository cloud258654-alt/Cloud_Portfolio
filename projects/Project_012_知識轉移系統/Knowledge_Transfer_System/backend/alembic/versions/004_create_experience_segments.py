"""create experience transfer tables

Revision ID: 004_experience_transfer
Revises: 003_chat_nullable_users
Create Date: 2026-06-25
"""
from alembic import op


revision = "004_experience_transfer"
down_revision = "003_chat_nullable_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS knowledge")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.experience_segments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            experience_id UUID NOT NULL REFERENCES knowledge.experience_records(id),
            segment_index INTEGER NOT NULL,
            speaker VARCHAR(100),
            start_time DOUBLE PRECISION,
            end_time DOUBLE PRECISION,
            text TEXT NOT NULL,
            confidence DOUBLE PRECISION,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_experience_segments_experience_id ON knowledge.experience_segments(experience_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_experience_segments_text_trgm ON knowledge.experience_segments USING gin (text gin_trgm_ops)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS knowledge.experience_segments")
