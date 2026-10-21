# scripts/ — Skrip Bantu

Seluruh skrip sudah executable. Jalankan dari root repo kecuali disebutkan lain.

| Skrip | Fungsi | Pemakaian |
|-------|--------|-----------|
| `init-git.sh` | Inisialisasi git + commit awal + push pertama ke GitHub | `./scripts/init-git.sh <username-github> [nama-repo]` |
| `backup-db.sh` | Backup harian PostgreSQL (gzip) + rotasi otomatis — pasang via cron | Set `DATABASE_URL`, lalu jalankan via cron |
| `restore-db.sh` | Pulihkan database dari file backup `.sql.gz` | `./scripts/restore-db.sh <file.sql.gz>` |
| `create-release.sh` | Tag versi semver + picu build APK via GitHub Actions | `./scripts/create-release.sh v1.0.0` |

## Prasyarat

- `git` terpasang & login GitHub (HTTPS + Personal Access Token, atau SSH)
- `pg_dump` / `psql` terpasang (paket `postgresql-client`) untuk backup/restore
- Akses push ke repo GitHub untuk create-release

## Contoh Cron Backup Harian (jam 02:00)

```cron
0 2 * * * DATABASE_URL="postgresql://sopsawit:PASSWORD@localhost:5432/sopsawit" /opt/sop-sawit/scripts/backup-db.sh >> /var/log/sopsawit-backup.log 2>&1
```

## Alur Rilis APK Singkat

```bash
# setelah fitur stabil di main:
./scripts/create-release.sh v1.0.0 "Rilis perdana"
# → GitHub Actions android-ci membangun APK dan melampirkannya ke GitHub Releases
```
