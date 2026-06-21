# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production deps first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy installed modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 5000

# Healthcheck mapped to the liveness probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health/liveness || exit 1

CMD ["node", "server.js"]
