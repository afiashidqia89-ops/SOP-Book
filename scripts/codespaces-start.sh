#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/tools/flutter/bin:$PATH"
docker info >/dev/null 2>&1 || true
echo "Codespace siap. Untuk mulai: bash scripts/cloud-up.sh"
