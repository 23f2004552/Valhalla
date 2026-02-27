#!/bin/bash
# RMS Database Restore Script
# Restores databases from a backup directory created by backup.sh
# Usage: bash scripts/restore.sh <backup_dir>
# Example: bash scripts/restore.sh ./backups/20260216_203000

set -e

BACKUP_DIR="${1:?Usage: restore.sh <backup_dir>}"
CONTAINER="rms-db"
DATABASES=("menudb" "orderdb" "inventorydb" "paymentdb" "analyticsdb")

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "⚠️  RMS Restore from: $BACKUP_DIR"
echo "   This will DROP and re-create all databases!"
read -p "   Continue? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo "========================================="

for DB in "${DATABASES[@]}"; do
    DUMP_FILE="$BACKUP_DIR/${DB}.dump"
    if [ ! -f "$DUMP_FILE" ]; then
        echo "  ⚠️  Skipping $DB (no dump file found)"
        continue
    fi

    echo "  🔄 Restoring $DB..."
    
    # Drop and recreate the database
    docker exec "$CONTAINER" psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB' AND pid <> pg_backend_pid();" 2>/dev/null || true
    docker exec "$CONTAINER" psql -U postgres -c "DROP DATABASE IF EXISTS $DB;" 2>/dev/null
    docker exec "$CONTAINER" psql -U postgres -c "CREATE DATABASE $DB;" 2>/dev/null
    
    # Restore from dump
    cat "$DUMP_FILE" | docker exec -i "$CONTAINER" pg_restore -U postgres -d "$DB" --no-owner 2>/dev/null
    echo "     ✅ $DB restored"
done

echo "========================================="
echo "✅ Restore complete. Restart services: docker compose restart"
