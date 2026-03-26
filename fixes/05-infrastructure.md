# Infrastructure & Configuration Fixes

## 1. Fix Dockerfile

**File:** `server/Dockerfile`

**Replace with:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
```

**Add a health endpoint on the server:**

```typescript
// server/src/routes/health.route.ts
import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
```

---

## 2. Create .dockerignore

**File:** `server/.dockerignore`

```
node_modules
npm-debug.log
.env
.env.*
!.env.example
dist
.git
.gitignore
*.md
tests
coverage
.vscode
.idea
docker-compose.yml
Dockerfile
```

---

## 3. Fix docker-compose.yml

**File:** `server/docker-compose.yml`

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:7.0  # Pin specific version
    restart: always
    env_file:
      - .env  # Move credentials to .env
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"  # Bind to localhost only
    volumes:
      - mongo-data:/data/db
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"

volumes:
  mongo-data:
```

**Add to `server/.env`:**

```
MONGO_USERNAME=admin
MONGO_PASSWORD=<generate-strong-password>
DATABASE_URL=mongodb://admin:<password>@mongodb:27017/airbnb?authSource=admin
```

---

## 4. Add Environment Variable Validation

**File:** `server/src/config/env.ts` (new file)

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => JSON.parse(val))
    .pipe(z.array(z.string().url())),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // OAuth (optional in development)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Environment validation failed:");
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const env = validateEnv();
```

**File:** `server/src/server.ts`

```typescript
import { env } from "./config/env";
// Use env.PORT, env.DATABASE_URL, etc. instead of process.env directly
```

---

## 5. Add Structured Logging

**Install:**

```bash
cd server
pnpm add morgan
pnpm add -D @types/morgan
```

**File:** `server/src/app.ts`

```typescript
import morgan from "morgan";

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
```

For production-grade logging, consider `pino` or `winston`:

```bash
pnpm add pino pino-http
```

```typescript
import pino from "pino";
import pinoHttp from "pino-http";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
});

app.use(pinoHttp({ logger }));

export { logger };
```

---

## 6. Add NoSQL Injection Prevention

**Install:**

```bash
cd server
pnpm add express-mongo-sanitize
```

**File:** `server/src/app.ts`

```typescript
import mongoSanitize from "express-mongo-sanitize";

app.use(mongoSanitize()); // Strips $ and . from req.body, req.query, req.params
```

---

## 7. Add Request Size Limiting

**File:** `server/src/app.ts`

```typescript
app.use(express.json({ limit: "10kb" })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
```

---

## 8. Add Compression

**Install:**

```bash
cd server
pnpm add compression
pnpm add -D @types/compression
```

**File:** `server/src/app.ts`

```typescript
import compression from "compression";

app.use(compression());
```

---

## 9. Enhance .gitignore

**File:** `.gitignore` (root)

Add these entries:

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.development
.env.production

# Credentials
*.pem
*.key
credentials.json
service-account.json

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Fix guides (optional - remove if you want these tracked)
fixes/
```

---

## 10. Update Husky Pre-commit Hook

**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**File:** `package.json` (root) - update lint-staged config:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write"],
    "client/**/*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix --max-warnings 0"
    ],
    "server/**/*.{js,ts}": ["prettier --write"],
    "**/*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

---

## 11. Vite Production Security Configuration

**File:** `client/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    sourcemap: mode === "development", // No sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          maps: ["leaflet", "react-leaflet"],
          dates: ["react-date-range", "date-fns"],
        },
      },
    },
  },
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  },
}));
```
