#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="tungtthien_db"
DB_USER="postgres"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Dump db
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Giữ lại backup 7 ngày gần nhất
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

echo "Backup successful: $BACKUP_FILE"
