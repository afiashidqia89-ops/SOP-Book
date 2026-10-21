# Panduan Setup & Deployment — e-SOP Sawit

> 🌐 **Tidak punya Node.js / Android Studio di PC?** Gunakan
> **[Panduan 100% Online](panduan-100-online.md)** — upload kode lewat browser,
> APK dibangun GitHub Actions, backend di Render, database di Neon, web admin di Vercel.
> Panduan ini (di bawah) untuk yang ingin deploy mandiri di VPS/Docker.

## A. Persiapan GitHub

> ⚠️ **PERHATIAN — Baca dulu!**
> Bagian A di bawah ini memakai **perintah terminal di PC** (butuh aplikasi `git` terpasang).
> **Jika PC Anda tidak punya git / Node.js / Android Studio → JANGAN ikuti bagian ini.**
> Gunakan Langkah 1 di **[Panduan 100% Online](panduan-100-online.md)**:
> upload kode lewat browser (GitHub Codespaces), tanpa install apa pun.

### Cara 1 — Otomatis (untuk pengguna PC yang sudah punya git)

1. Buat repo kosong di https://github.com/new
   - Nama repo: `sop-sawit`
   - Visibilitas: **Private** (berisi SOP internal perusahaan!)
   - **Jangan** centang "Add a README", "Add .gitignore", atau "Choose a license" (sudah tersedia di repo lokal).
2. Dari folder root monorepo, jalankan:

```bash
chmod +x scripts/*.sh
./scripts/init-git.sh <username-github>
```

Skrip ini otomatis: `git init` → cek tidak ada `.env` bocor → commit awal → tambah remote → push ke `main`.

### Cara 2 — Manual

```bash
cd sop-sawit
git init -b main
git add .
git commit -m "feat: struktur awal monorepo e-SOP Sawit (backend, web, android)"
git remote add origin git@github.com:<username>/sop-sawit.git
git push -u origin main
```

3. (Opsional) Proteksi branch `main`: Settings → Branches → Require pull request before merging. Aturan kontribusi lengkap ada di [CONTRIBUTING.md](../CONTRIBUTING.md).

### Strategi Branch (Git Flow Sederhana)

```
main      ── kode produksi, diproteksi, sumber release APK & deploy
  └── dev ── integrasi harian
       └── feature/<nama>   ── satu fitur satu branch
```

## B. CI/CD GitHub Actions

Empat workflow otomatis sudah tersedia di `.github/workflows/`:

| Workflow | Pemicu | Isi |
|----------|--------|-----|
| `backend-ci.yml` | push/PR yang mengubah `backend/**` | `npm ci` → `prisma validate` → syntax check |
| `web-ci.yml` | push/PR yang mengubah `apps/web/**` | `npm ci` → `next build` |
| `android-ci.yml` | push/PR yang mengubah `apps/android/**` + tombol Run manual | Gradle `assembleDebug` + unggah APK sebagai artifact |
| `android-release.yml` | push tag `v*` (atau publish Release di web) | Build APK + **lampirkan ke GitHub Releases** |

**Release APK otomatis**: buat tag `v1.0.0` → GitHub Actions membangun APK debug & melampirkannya ke GitHub Release (ubah `assembleDebug` → `assembleRelease` + signing config untuk produksi).

## C. Deployment Backend

### Opsi 1 — VPS (Ubuntu 22.04)

```bash
# 1. Instal Node 20 + PostgreSQL 15
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql
sudo -u postgres psql -c "CREATE DATABASE sopsawit;"
sudo -u postgres psql -c "CREATE USER sopsawit WITH PASSWORD '<password>';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sopsawit TO sopsawit;"

# 2. Deploy aplikasi
git clone https://github.com/<username>/sop-sawit.git && cd sop-sawit/backend
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET
npm ci
npx prisma db push          # sinkronkan schema tanpa folder migrations
npx prisma db seed
npm i -g pm2 && pm2 start src/index.js --name sop-api && pm2 save
```

3. Nginx reverse proxy `http://localhost:3001` + **wajib HTTPS** (Let's Encrypt) karena token JWT dikirim berulang.

### Opsi 2 — Docker (skeleton tersedia)

```bash
cd backend && docker compose up -d --build
```

## D. Distribusi Aplikasi Android

| Cara | Cocok untuk | Catatan |
|------|-------------|---------|
| GitHub Release | Uji coba internal | Unduh APK dari halaman Release, instal manual |
| Play Store (Private App) | Produksi | Daftar organisasi Google Workspace, distribusi terbatas ke email karyawan |
| MDM Perusahaan | Skala besar | Push APK + update terpusat |

> ⚠️ Ubah `BASE_URL` di `apps/android/.../ApiService.kt` ke domain produksi (HTTPS) sebelum build release, dan gunakan `network_security_config.xml` hanya untuk mode debug.

## E. Checklist Go-Live

- [ ] Ganti password admin default (`admin/admin123`)
- [ ] `JWT_SECRET` dihasilkan acak ≥ 32 karakter (`openssl rand -hex 32`)
- [ ] HTTPS aktif di backend & web admin
- [ ] Backup PostgreSQL harian terpasang (`scripts/backup-db.sh` via cron)
- [ ] Repo GitHub **private** + proteksi branch main
- [ ] Uji mode offline: matikan sinyal → SOP tetap terbuka di aplikasi

## F. File Penting di Repo

| File | Fungsi |
|------|--------|
| `LICENSE` | Lisensi penggunaan internal perusahaan |
| `CONTRIBUTING.md` | Alur branch, gaya commit, aturan Pull Request |
| `SECURITY.md` | Kebijakan pelaporan celah keamanan + checklist keamanan deploy |
| `.github/PULL_REQUEST_TEMPLATE.md` | Template PR (muncul otomatis saat buka PR) |
| `.github/ISSUE_TEMPLATE/` | Template laporan bug & usulan fitur |
| `.github/CODEOWNERS` | Penentuan reviewer otomatis per area — **ganti `<username>` dengan username GitHub Anda** |
| `.editorconfig` | Konsistensi indentasi/format lintas editor |
