"""create ingestion pipeline tables

Revision ID: 002_ingestion_pipeline
Revises: 001_document_center
Create Date: 2026-06-25
"""
from alembic import op


revision = "002_ingestion_pipeline"
down_revision = "001_document_center"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS knowledge")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.ingestion_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID NOT NULL REFERENCES knowledge.documents(id),
            status VARCHAR(50) DEFAULT 'queued',
            stage VARCHAR(100) DEFAULT 'queue',
            progress INTEGER DEFAULT 0,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            error_message TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,
            started_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.chunk_metadata (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            chunk_id UUID NOT NULL REFERENCES knowledge.document_chunks(id),
            language VARCHAR(50),
            keywords JSONB DEFAULT '[]'::jsonb,
            entities JSONB DEFAULT '[]'::jsonb,
            summary TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.embedding_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID NOT NULL REFERENCES knowledge.documents(id),
            chunk_id UUID NULL REFERENCES knowledge.document_chunks(id),
            status VARCHAR(50) DEFAULT 'queued',
            provider VARCHAR(100),
            model VARCHAR(150),
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_document_id ON knowledge.ingestion_jobs(document_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON knowledge.ingestion_jobs(status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_chunk_metadata_chunk_id ON knowledge.chunk_metadata(chunk_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_embedding_jobs_document_id ON knowledge.embedding_jobs(document_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_embedding_jobs_chunk_id ON knowledge.embedding_jobs(chunk_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS knowledge.embedding_jobs")
    op.execute("DROP TABLE IF EXISTS knowledge.chunk_metadata")
    op.execute("DROP TABLE IF EXISTS knowledge.ingestion_jobs")
