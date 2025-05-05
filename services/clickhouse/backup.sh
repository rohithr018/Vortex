#!/bin/bash

# Define the backup directory
BACKUP_DIR="/backups"

# Define the file name for the backup
BACKUP_FILE="$BACKUP_DIR/logs_$(date +%Y-%m-%d_%H-%M-%S).csv"

# Run the ClickHouse query to export data
docker exec -i clickhouse clickhouse-client --query="SELECT * FROM logs FORMAT CSV" > $BACKUP_FILE

echo "Backup completed and saved to $BACKUP_FILE"
