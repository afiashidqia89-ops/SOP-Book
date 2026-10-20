#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
fi

mkdir -p "$HOME/tools"
if [ ! -d "$HOME/tools/flutter" ]; then
  git clone --depth 1 --branch stable https://github.com/flutter/flutter.git "$HOME/tools/flutter"
fi

grep -qxF 'export PATH="$HOME/tools/flutter/bin:$PATH"' "$HOME/.bashrc" || echo 'export PATH="$HOME/tools/flutter/bin:$PATH"' >> "$HOME/.bashrc"
export PATH="$HOME/tools/flutter/bin:$PATH"

npm --prefix apps/api install
npm --prefix apps/web install
flutter config --no-analytics
flutter pub get --directory apps/mobile

echo "Codespaces setup selesai. Jalankan: bash scripts/cloud-up.sh"
