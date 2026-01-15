
#!/bin/sh
# Database Backup Script
# Usage: ./backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="medusa_db_$TIMESTAMP.sql.gz"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

echo "[$TIMESTAMP] Starting Backup..."

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Dump and Compress
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
  echo "[$TIMESTAMP] ✅ Backup Created: $FILENAME"
else
  echo "[$TIMESTAMP] ❌ Backup Failed"
  exit 1
fi

# Cleanup backups older than 7 days
find $BACKUP_DIR -name "medusa_db_*.sql.gz" -mtime +7 -exec rm {} \;
echo "[$TIMESTAMP] Cleanup complete."
