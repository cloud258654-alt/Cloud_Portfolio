"""create sop tables

Revision ID: 005_create_sop_tables
Revises: 004_experience_transfer
Create Date: 2026-06-25
"""
from alembic import op


revision = "005_create_sop_tables"
down_revision = "004_experience_transfer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute("CREATE SCHEMA IF NOT EXISTS knowledge")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sop_templates (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            template_type VARCHAR(100) DEFAULT 'standard',
            structure JSONB DEFAULT '{}'::jsonb,
            is_active BOOLEAN DEFAULT true,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            deleted_at TIMESTAMP NULL
        )
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sops (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            template_id UUID NULL REFERENCES knowledge.sop_templates(id),
            department_id UUID NULL REFERENCES org.departments(id),
            title VARCHAR(255) NOT NULL,
            sop_type VARCHAR(100),
            purpose TEXT,
            scope TEXT,
            responsible_role VARCHAR(150),
            required_materials JSONB DEFAULT '[]'::jsonb,
            prerequisites JSONB DEFAULT '[]'::jsonb,
            content JSONB DEFAULT '{}'::jsonb,
            mermaid_flowchart TEXT,
            version_no VARCHAR(50) DEFAULT 'v1.0',
            permission_scope VARCHAR(50) DEFAULT 'department',
            classification VARCHAR(50) DEFAULT 'internal',
            status VARCHAR(50) DEFAULT 'draft',
            source_metadata JSONB DEFAULT '{}'::jsonb,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_by UUID NULL REFERENCES auth.users(id),
            approved_by UUID NULL REFERENCES auth.users(id),
            approved_at TIMESTAMP NULL,
            published_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            deleted_at TIMESTAMP NULL
        )
        """
    )
    op.execute(
        """
        ALTER TABLE knowledge.sops
            ADD COLUMN IF NOT EXISTS template_id UUID NULL REFERENCES knowledge.sop_templates(id),
            ADD COLUMN IF NOT EXISTS responsible_role VARCHAR(150),
            ADD COLUMN IF NOT EXISTS required_materials JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}'::jsonb,
            ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sop_versions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sop_id UUID NOT NULL REFERENCES knowledge.sops(id),
            version_no VARCHAR(50) NOT NULL,
            content JSONB DEFAULT '{}'::jsonb,
            mermaid_flowchart TEXT,
            change_note TEXT,
            created_by UUID NULL REFERENCES auth.users(id),
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(sop_id, version_no)
        )
        """
    )
    op.execute(
        """
        ALTER TABLE knowledge.sop_versions
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sop_steps (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sop_id UUID NOT NULL REFERENCES knowledge.sops(id),
            sop_version_id UUID NULL REFERENCES knowledge.sop_versions(id),
            step_no INTEGER NOT NULL,
            title VARCHAR(255),
            action TEXT NOT NULL,
            description TEXT,
            expected_result TEXT,
            screenshot_path TEXT,
            warning TEXT,
            estimated_minutes INTEGER DEFAULT 0,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(sop_id, step_no)
        )
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sop_reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sop_id UUID NOT NULL REFERENCES knowledge.sops(id),
            sop_version_id UUID NULL REFERENCES knowledge.sop_versions(id),
            reviewer_id UUID NULL REFERENCES auth.users(id),
            review_status VARCHAR(50) DEFAULT 'pending',
            review_comment TEXT,
            reviewed_at TIMESTAMP NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge.sop_attachments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sop_id UUID NOT NULL REFERENCES knowledge.sops(id),
            sop_version_id UUID NULL REFERENCES knowledge.sop_versions(id),
            attachment_type VARCHAR(100) NOT NULL,
            title VARCHAR(255),
            storage_path TEXT NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )

    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_templates_active ON knowledge.sop_templates(is_active)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sops_template_id ON knowledge.sops(template_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sops_department_id ON knowledge.sops(department_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sops_status ON knowledge.sops(status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sops_created_by ON knowledge.sops(created_by)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_versions_sop_id ON knowledge.sop_versions(sop_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_steps_sop_id ON knowledge.sop_steps(sop_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_steps_version_id ON knowledge.sop_steps(sop_version_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_reviews_sop_id ON knowledge.sop_reviews(sop_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_reviews_reviewer_id ON knowledge.sop_reviews(reviewer_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sop_attachments_sop_id ON knowledge.sop_attachments(sop_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS knowledge.sop_attachments")
    op.execute("DROP TABLE IF EXISTS knowledge.sop_reviews")
    op.execute("DROP TABLE IF EXISTS knowledge.sop_steps")
    op.execute("DROP TABLE IF EXISTS knowledge.sop_versions")
    op.execute("DROP TABLE IF EXISTS knowledge.sops")
    op.execute("DROP TABLE IF EXISTS knowledge.sop_templates")
