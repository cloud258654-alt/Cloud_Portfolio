# Database

This folder contains the executable database contract for the Enterprise AI Platform.

## Files

- `schema_v1.sql`: PostgreSQL 16+ schema for KTS v1, implemented from `spec/DB/Database_Schema_v1.md`.
- `seed_v1.sql`: Default roles, permissions, agents, and AI model routing configs.

## Apply Locally

```bash
psql "$DATABASE_URL" -f schema_v1.sql
psql "$DATABASE_URL" -f seed_v1.sql
```

Required extensions:

- `uuid-ossp`
- `vector`
- `pg_trgm`

Core schemas:

- `auth`
- `org`
- `knowledge`
- `ai`
- `training`
- `agent`
- `governance`
- `analytics`
- `audit`
