#!/usr/bin/env bash
# Jalankan lewat PuTTY di folder proyek: bash deploy/hostinger-setup.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "File .env belum ada. Jalankan: cp deploy/.env.production.example .env, lalu isi nilainya." >&2
  exit 1
fi

set -a
. ./.env
set +a

echo "[1/3] Memasang dependensi"
npm install --no-audit --no-fund

echo "[2/3] Build client"
npm run build

echo "[3/3] Menjalankan aplikasi"
echo "Pastikan tabel MySQL sudah dibuat manual melalui phpMyAdmin atau MySQL Workbench."
if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload deploy/ecosystem.config.cjs --update-env
  pm2 save
else
  echo "pm2 tidak ditemukan. Jalankan lewat menu Node.js di hPanel, atau manual: NODE_ENV=production npm start"
fi
