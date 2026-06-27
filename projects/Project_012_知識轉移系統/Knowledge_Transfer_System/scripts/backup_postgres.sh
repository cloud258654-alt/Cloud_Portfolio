#!/bin/bash
# PostgreSQL backup script for KTS
# Usage: ./backup_postgres.sh [backup_dir]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-kts_db}"
DB_USER="${POSTGRES_USER:-kts_user}"
DB_PASS="${POSTGRES_PASSWORD:-kts_password}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/kts_backup_${TIMESTAMP}.sql.gz"

echo "Backing up $DB_NAME to $BACKUP_FILE ..."
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_FILE"

echo "Backup complete: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Keep only the last 7 daily backups
find "$BACKUP_DIR" -name "kts_backup_*.sql.gz" -mtime +7 -delete
echo "Cleaned up backups older than 7 days."
