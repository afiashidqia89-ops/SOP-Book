#!/usr/bin/env bash
# ============================================================
# restore-db.sh — Pulihkan database dari file backup .sql.gz
# Pemakaian:
#   DATABASE_URL="postgresql://sopsawit:***@localhost:5432/sopsawit" ./scripts/restore-db.sh /var/backups/sopsawit/sopsawit-2025-01-15_0200.sql.gz
# ============================================================
set -euo pipefail

FILE="${1:-}"
[ -n "$FILE" ] || { echo "Pemakaian: $0 <file-backup.sql.gz>"; exit 1; }
[ -f "$FILE" ] || { echo "File tidak ditemukan: $FILE"; exit 1; }

PG_URL="${DATABASE_URL:-postgresql://sopsawit:sopsawit@localhost:5432/sopsawit}"

echo "⚠️  PERINGATAN: isi database saat ini akan DITIMPA dengan isi backup:"
echo "   ${FILE}"
read -rp "Ketik 'YA' untuk lanjut: " KONFIRMASI
[ "$KONFIRMASI" = "YA" ] || { echo "Dibatalkan."; exit 1; }

echo "[$(date '+%F %T')] Restore dimulai..."
gunzip -c "$FILE" | psql "$PG_URL"
echo "[$(date '+%F %T')] Restore selesai. Jalankan 'npx prisma migrate deploy' di backend/ bila perlu."
