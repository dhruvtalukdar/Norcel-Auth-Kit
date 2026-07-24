# Norcel — multi-stage Dockerfile.
#
# Usage:
#   docker build -t norcel .
#   docker run --env-file .env -p 3000:3000 norcel
#
# The image runs as a non-root user, listens on port 3000, and
# expects DATABASE_URL / DIRECT_URL / AUTH_SECRET etc. via env.

# ─── 1. Dependencies ────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Generate the Prisma client (needed at install time so the
# `prisma generate` postinstall hook can populate node_modules).
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm ci --no-audit --no-fund

# ─── 2. Build ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── 3. Production runtime ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl dumb-init
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what we need at runtime.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000

# dumb-init ensures SIGTERM is forwarded to the node process so
# containers shut down cleanly.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
