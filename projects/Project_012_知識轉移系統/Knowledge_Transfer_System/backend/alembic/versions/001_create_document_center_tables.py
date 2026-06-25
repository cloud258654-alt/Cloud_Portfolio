"""create document center tables

Revision ID: 001_document_center
Revises:
Create Date: 2026-06-25
"""
from alembic import op


revision = "001_document_center"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS knowledge")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.tags (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) UNIQUE NOT NULL,
            color VARCHAR(30),
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.document_tags (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID NOT NULL REFERENCES knowledge.documents(id),
            tag_id UUID NOT NULL REFERENCES knowledge.tags(id),
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(document_id, tag_id)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.document_favorites (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID NOT NULL REFERENCES knowledge.documents(id),
            user_id UUID NULL REFERENCES auth.users(id),
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(document_id, user_id)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.document_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID NOT NULL REFERENCES knowledge.documents(id),
            user_id UUID NULL REFERENCES auth.users(id),
            action VARCHAR(100) NOT NULL,
            result VARCHAR(50) DEFAULT 'success',
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON knowledge.document_tags(document_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_favorites_user_id ON knowledge.document_favorites(user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_activities_document_id ON knowledge.document_activities(document_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS knowledge.document_activities")
    op.execute("DROP TABLE IF EXISTS knowledge.document_favorites")
    op.execute("DROP TABLE IF EXISTS knowledge.document_tags")
    op.execute("DROP TABLE IF EXISTS knowledge.tags")
