# PostgreSQL Init

The compose file mounts:

- `../database/schema_v1.sql` as `/docker-entrypoint-initdb.d/01_schema_v1.sql`
- `../database/seed_v1.sql` as `/docker-entrypoint-initdb.d/02_seed_v1.sql`

PostgreSQL initialization scripts only run when the `kts_postgres_data` volume is empty.

To rebuild the database from scratch:

```bash
docker compose --env-file ../.env -f docker-compose.yml down -v
docker compose --env-file ../.env -f docker-compose.yml up -d postgres
```
