#!/bin/bash
# MinIO bucket backup script for KTS
# Usage: ./backup_minio.sh [backup_dir]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MINIO_ENDPOINT="${MINIO_ENDPOINT:-localhost:9000}"
MINIO_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_PASS="${MINIO_ROOT_PASSWORD:-minioadmin}"

BUCKETS=(
    "${MINIO_BUCKET_DOCUMENTS:-documents}"
    "${MINIO_BUCKET_MEDIA:-media}"
    "${MINIO_BUCKET_EXPORTS:-exports}"
)

MC_ALIAS="kts-backup"

export MC_HOST_${MC_ALIAS}="http://${MINIO_USER}:${MINIO_PASS}@${MINIO_ENDPOINT}"

for BUCKET in "${BUCKETS[@]}"; do
    DEST="$BACKUP_DIR/minio_${BUCKET}_${TIMESTAMP}"
    echo "Mirroring bucket $BUCKET to $DEST ..."
    mc mirror --overwrite "${MC_ALIAS}/${BUCKET}" "$DEST"
    echo "Done: $BUCKET"
done

echo "MinIO backup complete."

# Keep only the last 3 backups
for BUCKET in "${BUCKETS[@]}"; do
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "minio_${BUCKET}_*" | sort -r | tail -n +4 | xargs rm -rf
done
echo "Cleaned up old MinIO backups."
