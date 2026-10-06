#!/usr/bin/env bash
# ── Déploiement / mise à jour HightCV sur VPS Hostinger ──────────────────────
# Premier déploiement ou mise à jour :  bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ 1/5  Dépendances…"
if command -v bun >/dev/null 2>&1; then
  bun install --frozen-lockfile || bun install
  PM="bun run"
else
  npm ci || npm install
  PM="npm run"
fi

echo "▶ 2/5  Schéma base de données…"
$PM db:push

echo "▶ 3/5  Build production (standalone)…"
$PM build

echo "▶ 4/5  Fichier .env…"
[ -f .env ] || cp deploy/env.production .env

echo "▶ 5/5  Redémarrage PM2…"
if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload deploy/ecosystem.config.js
  pm2 save
else
  echo "⚠ PM2 non installé : npm i -g pm2 puis relancer."
  echo "  En attendant : NODE_ENV=production PORT=3000 node .next/standalone/server.js"
fi

echo "✅ Déployé. Vérifiez : curl -s http://127.0.0.1:3000/api | head -c 200"
