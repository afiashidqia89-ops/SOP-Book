#!/usr/bin/env bash
# ============================================================
# backup-db.sh — Backup harian PostgreSQL (gzip)
# Pasang di cron (jam 02:00 setiap hari):
#   0 2 * * * DATABASE_URL="postgresql://sopsawit:***@localhost:5432/sopsawit" /opt/sop-sawit/scripts/backup-db.sh >> /var/log/sopsawit-backup.log 2>&1
# ============================================================
set -euo pipefail

PG_URL="${DATABASE_URL:-postgresql://sopsawit:sopsawit@localhost:5432/sopsawit}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/sopsawit}"
RETAIN_DAYS="${RETAIN_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%F_%H%M)"
OUT="${BACKUP_DIR}/sopsawit-${STAMP}.sql.gz"

echo "[$(date '+%F %T')] Backup dimulai → ${OUT}"
pg_dump "$PG_URL" | gzip > "$OUT"

# Hapus backup lebih tua dari RETAIN_DAYS hari
find "$BACKUP_DIR" -name "sopsawit-*.sql.gz" -type f -mtime "+${RETAIN_DAYS}" -delete

UKURAN="$(du -h "$OUT" | cut -f1)"
echo "[$(date '+%F %T')] Backup selesai (${UKURAN}). Backup lama >${RETAIN_DAYS} hari dihapus."
