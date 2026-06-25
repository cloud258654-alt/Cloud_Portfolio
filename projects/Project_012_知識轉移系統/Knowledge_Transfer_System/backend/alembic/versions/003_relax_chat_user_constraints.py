"""relax chat user constraints for sprint 05

Revision ID: 003_chat_nullable_users
Revises: 002_ingestion_pipeline
Create Date: 2026-06-25
"""
from alembic import op


revision = "003_chat_nullable_users"
down_revision = "002_ingestion_pipeline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE IF EXISTS ai.conversations ALTER COLUMN user_id DROP NOT NULL")
    op.execute("ALTER TABLE IF EXISTS ai.feedbacks ALTER COLUMN user_id DROP NOT NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE IF EXISTS ai.conversations ALTER COLUMN user_id SET NOT NULL")
    op.execute("ALTER TABLE IF EXISTS ai.feedbacks ALTER COLUMN user_id SET NOT NULL")
