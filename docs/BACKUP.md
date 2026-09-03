# Backup & Recovery

## Database Backups

### Automated Daily Backup (Cron)

```bash
# /opt/scripts/backup-db.sh
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETAIN_DAYS=30

mkdir -p "$BACKUP_DIR"

# Dump database
docker exec majivastu-db-1 pg_dump -U postgres majhi_vastu | gzip > "$BACKUP_DIR/majhi_vastu_${DATE}.sql.gz"

# Remove old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETAIN_DAYS} -delete

echo "Backup completed: majhi_vastu_${DATE}.sql.gz"
```

Add to crontab:
```bash
crontab -e
# Daily at 3 AM
0 3 * * * /opt/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### Manual Backup

```bash
# Full database dump
docker exec majivastu-db-1 pg_dump -U postgres majhi_vastu > backup.sql

# Compressed
docker exec majivastu-db-1 pg_dump -U postgres majhi_vastu | gzip > backup.sql.gz
```

### Restore

```bash
# From compressed dump
gunzip -c backup.sql.gz | docker exec -i majivastu-db-1 psql -U postgres majhi_vastu

# From plain SQL
docker exec -i majivastu-db-1 psql -U postgres majhi_vastu < backup.sql
```

## Media Backups

Media is stored in Cloudinary. Cloudinary provides:
- Automatic redundancy across data centers
- 30-day deletion recovery (configurable)
- Built-in backup API for enterprise plans

For self-managed media backup:
```bash
# Export Cloudinary resources list
curl -s "https://api.cloudinary.com/v1_1/YOUR_CLOUD/resources/image?max_results=500" \
  -u "API_KEY:API_SECRET" > media-inventory.json
```

## Migration Rollback

```bash
# Undo last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Reset database (DESTROYS DATA)
npx prisma migrate reset
```

## Disaster Recovery Checklist

1. ☐ Restore PostgreSQL from latest backup
2. ☐ Verify Cloudinary media is accessible
3. ☐ Redeploy application with correct `.env`
4. ☐ Run `npx prisma migrate deploy`
5. ☐ Verify health check: `GET /api/health`
6. ☐ Verify admin login
7. ☐ Verify public property listing

## Monitoring

- Health: `GET /api/health` (returns 503 if DB is down)
- Logs: `docker compose logs -f app`
- DB size: `docker exec majivastu-db-1 psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('majhi_vastu'));"`
