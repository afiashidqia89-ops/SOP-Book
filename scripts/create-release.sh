#!/usr/bin/env bash
# ============================================================
# create-release.sh — Buat tag rilis & picu build APK di GitHub Actions
# Pemakaian:
#   ./scripts/create-release.sh v1.0.0 "Rilis pertama"
# ============================================================
set -euo pipefail

VERSION="${1:-}"
PESAN="${2:-Rilis ${VERSION} e-SOP Sawit}"

[ -n "$VERSION" ] || { echo "Pemakaian: $0 <versi> [pesan]  — contoh: $0 v1.0.0"; exit 1; }
echo "$VERSION" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' || {
  echo "Format versi salah. Gunakan semver berawalan v, contoh: v1.0.0"; exit 1; }

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "main" ] || { echo "⚠️  Anda di branch '${BRANCH}'. Rilis sebaiknya dibuat dari 'main'."; exit 1; }

echo "➜ Pastikan main mutakhir..."
git pull origin main

if git rev-parse -q --verify "refs/tags/${VERSION}" >/dev/null; then
  echo "✘ Tag ${VERSION} sudah ada. Gunakan nomor versi lain." && exit 1
fi

echo "➜ Buat tag ${VERSION}..."
git tag -a "$VERSION" -m "$PESAN"
git push origin "$VERSION"

echo ""
echo "✔ Tag terkirim. GitHub Actions (android-ci) akan membangun APK otomatis."
echo "  Pantau: Actions → Android CI → jalankan dari tag ${VERSION}"
echo "  APK muncul di tab 'Releases' repo setelah build selesai."
