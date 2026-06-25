# Task070101 Alembic Migration

Epic: Epic07_SOP_Generator

Story: Story0701 Database Foundation

Task: Task070101 Alembic Migration

Status: Done

Last Update: 2026-06-25

## Goal

Create one Alembic migration for SOP-related database tables.

## Scope

Only create:

```text
backend/alembic/versions/xxx_create_sop_tables.py
```

The migration must create:

```text
knowledge.sops
knowledge.sop_versions
knowledge.sop_steps
knowledge.sop_reviews
knowledge.sop_attachments
knowledge.sop_templates
```

The migration must support:

```text
upgrade
downgrade
```

## Explicit Non-Scope

Do not create or modify:

```text
Models
Repository
API
Frontend
AI
Tests
Seed data
Documentation beyond this task file
```

## Acceptance Criteria

```text
Alembic migration file exists
upgrade creates all six SOP tables
downgrade drops all six SOP tables
knowledge schema is created if missing
No models are added
No API files are added
No frontend files are added
No tests are added
```

## Execution Notes

This task is intentionally small. Execute only this task and stop.

This migration was revised to stay compatible with existing tables by using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, which is the correct approach for the current database state.
