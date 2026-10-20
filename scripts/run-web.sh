#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
npm --prefix apps/web run dev -- --hostname 0.0.0.0
