# ── Dockerfile HightCV (alternative au PM2 sur VPS Hostinger) ────────────────
# Build :  docker build -t hightcv .
# Run  :  docker run -d -p 3000:3000 -v hightcv_db:/app/db --name hightcv hightcv
# Le volume hightcv_db préserve la base SQLite entre les redémarrages.

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile || bun install

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Prisma client + schéma pour exécuter db:push au démarrage si besoin
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
RUN mkdir -p db
EXPOSE 3000
CMD ["node", "server.js"]
