# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for workspace resolution
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/server/package.json ./packages/server/

RUN pnpm install --frozen-lockfile

# Stage 2: Production image
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules

# Copy workspace root files
COPY package.json pnpm-workspace.yaml ./

# Copy source code for all packages the server depends on
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY packages/server/ ./packages/server/

# Create uploads directory
RUN mkdir -p /app/packages/server/uploads && chown -R nodejs:nodejs /app/packages/server/uploads

USER nodejs
WORKDIR /app/packages/server

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "-r", "tsx/esm", "src/server.ts"]
