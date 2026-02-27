#!/bin/bash
# RMS Database Backup Script
# Creates timestamped pg_dump backups of all microservice databases
# Usage: bash scripts/backup.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$TIMESTAMP"
CONTAINER="rms-db"
DATABASES=("menudb" "orderdb" "inventorydb" "paymentdb" "analyticsdb")

echo "🔒 RMS Backup — $TIMESTAMP"
echo "========================================="

mkdir -p "$BACKUP_DIR"

for DB in "${DATABASES[@]}"; do
    echo "  📦 Backing up $DB..."
    docker exec "$CONTAINER" pg_dump -U postgres -Fc "$DB" > "$BACKUP_DIR/${DB}.dump" 2>/dev/null
    SIZE=$(du -sh "$BACKUP_DIR/${DB}.dump" | cut -f1)
    echo "     ✅ $DB -> ${DB}.dump ($SIZE)"
done

echo "========================================="
echo "✅ Backup complete: $BACKUP_DIR"
echo "   Total: $(du -sh "$BACKUP_DIR" | cut -f1)"
