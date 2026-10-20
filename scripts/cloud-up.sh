#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || cp .env.example .env

docker compose up -d postgres redis minio

set -a
source .env
set +a
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"

npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:push
npm --prefix apps/api run prisma:seed

echo
printf '%s\n' "Infrastruktur aktif." "Terminal 1: bash scripts/run-api.sh" "Terminal 2: bash scripts/run-web.sh"
