#!/usr/bin/env bash
# ============================================================
# init-git.sh — Siapkan & push monorepo e-SOP Sawit ke GitHub
#
# Pemakaian:
#   1. Buat repo kosong "sop-sawit" di https://github.com/new
#      (Private, TANPA README / .gitignore / license).
#   2. Jalankan dari root repo:
#        ./scripts/init-git.sh <username-github>
#      Contoh:
#        ./scripts/init-git.sh budi-santoso
#   3. Ikuti permintaan git (login browser/Personal Access Token).
# ============================================================
set -euo pipefail

USER_GITHUB="${1:-}"
REPO_NAME="${2:-sop-sawit}"
BRANCH="main"

# Warna output
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔${NC} $1"; }
info() { echo -e "${YELLOW}➜${NC} $1"; }
fail() { echo -e "${RED}✘ $1${NC}"; exit 1; }

[ -n "$USER_GITHUB" ] || fail "Pemakaian: ./scripts/init-git.sh <username-github> [nama-repo]"
[ -f README.md ]      || fail "Jalankan skrip ini dari FOLDER ROOT monorepo (yang berisi README.md)."

info "1/6  Cek git terpasang..."
command -v git >/dev/null 2>&1 || fail "Git belum terpasang. Instal dulu: https://git-scm.com"

info "2/6  Inisialisasi repositori git (branch: ${BRANCH})..."
if [ -d .git ]; then
  ok "Repo git sudah ada — lewati init."
else
  git init -b "$BRANCH"
fi

# Identitas git (hanya jika belum diset)
git config user.name  >/dev/null 2>&1 || { read -rp "Nama Anda (untuk git): " NAMA; git config user.name "$NAMA"; }
git config user.email >/dev/null 2>&1 || { read -rp "Email GitHub Anda: " EMAIL; git config user.email "$EMAIL"; }

info "3/6  Stage semua file..."
git add .
# Pastikan tidak ada .env asli yang bocor
if git ls-files --cached | grep -E '(^|/)\.env$' >/dev/null; then
  fail "Terdeteksi file .env asli ter-stage! Hapus/ubah nama jadi .env.example dulu."
fi
ok "Tidak ada file .env asli yang ter-stage."

info "4/6  Commit awal..."
if git diff --cached --quiet 2>/dev/null; then
  ok "Tidak ada perubahan baru untuk di-commit."
else
  git commit -m "feat: struktur awal monorepo e-SOP Sawit (backend, web admin, android)"
fi

info "5/6  Hubungkan remote origin..."
REMOTE_URL="https://github.com/${USER_GITHUB}/${REPO_NAME}.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
  ok "Remote origin diperbarui → ${REMOTE_URL}"
else
  git remote add origin "$REMOTE_URL"
  ok "Remote origin ditambahkan → ${REMOTE_URL}"
fi

info "6/6  Push ke GitHub..."
git push -u origin "$BRANCH" || fail "Push gagal. Pastikan: (1) repo '${REPO_NAME}' sudah dibuat di github.com/new, (2) Anda login GitHub (PAT/SSH)."

echo ""
ok "SELESAI! Repo aktif di: https://github.com/${USER_GITHUB}/${REPO_NAME}"
echo "   Selanjutnya:"
echo "   - Aktifkan proteksi branch: Settings → Branches → protect '${BRANCH}'"
echo "   - CI otomatis berjalan di tab 'Actions'"
echo "   - Panduan lanjutan: docs/panduan-setup.md"
