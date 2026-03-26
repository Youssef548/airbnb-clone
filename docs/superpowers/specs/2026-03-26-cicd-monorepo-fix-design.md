# CI/CD Pipeline Fix for Monorepo — Design Spec

## Goal

Update the existing CI/CD pipeline and Docker production configs to work with the new `packages/` monorepo structure, so pushing to `airbnb-v2` auto-deploys to `airbnb.abdulkhalek.dev`.

## Current State

- Server gateway (Traefik v3) is running on `46.225.219.72`
- SSH access works from local machine (user: `deploy`)
- GitHub Actions workflow exists but references old `client/` and `server/` paths
- Dockerfiles exist but need updating for monorepo
- GitHub secrets (`SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER`) need to be added

## Architecture

```
Push to airbnb-v2
       │
       ▼
GitHub Actions (3 jobs)
  ├── build-server → GHCR (ghcr.io/youssef548/airbnb-server:sha + latest)
  ├── build-client → GHCR (ghcr.io/youssef548/airbnb-client:sha + latest)
  └── deploy (after both builds)
         │
         ▼
    SSH to 46.225.219.72
         │
         ▼
    docker compose -f docker-compose.prod.yml up -d
         │
         ▼
    Traefik auto-discovers containers via labels
         │
         ├── airbnb.abdulkhalek.dev → client (nginx, port 80)
         └── airbnb.abdulkhalek.dev/api → server (express, port 3000)
```

## Files to Change

### 1. `packages/server/Dockerfile` — Create/Update

Production Dockerfile for the Express server. Must:

- Use multi-stage build (install deps → build → runtime)
- Copy workspace packages it depends on: `packages/shared`, `packages/database`, `packages/server`
- Copy root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- Install pnpm, run `pnpm install --frozen-lockfile --filter @airbnb/server...`
- Create `uploads/` directory in the container
- Expose port 3000
- Run with `node` or `tsx`

### 2. `packages/client/Dockerfile.prod` — Update

Production Dockerfile for the React client. Must:

- Multi-stage build: install → build → nginx
- Copy `packages/shared` and `packages/client` (client depends on shared types)
- Accept `VITE_BACKEND_URL` as build arg
- Build with Vite
- Serve via nginx on port 80

### 3. `docker-compose.prod.yml` — Update

- Update image names to match GitHub username (`ghcr.io/youssef548/...`)
- Add Traefik labels to client container:
  - `Host(airbnb.abdulkhalek.dev)`
  - Middleware: `secure-default@file`
- Add Traefik labels to server container:
  - `PathPrefix(/api)` on `airbnb.abdulkhalek.dev`
  - Or separate subdomain `api-airbnb.abdulkhalek.dev`
- Add `uploads` volume for persistent image storage on server container
- Connect client and server to `gateway` external network (for Traefik discovery)
- Keep MongoDB on internal-only network
- Remove Cloudinary env var, add local upload config

### 4. `.github/workflows/deploy.yml` — Update

- Fix Dockerfile paths: `./packages/server/Dockerfile`, `./packages/client/Dockerfile.prod`
- Build context: repo root `.` (needed for monorepo workspace files)
- Remove `VITE_APP_CLOUDINARY_CLOUD_NAME` build arg
- Set `VITE_BACKEND_URL` to `https://airbnb.abdulkhalek.dev/api/`
- Update GHCR image paths if GitHub username differs
- Keep trigger on push to `airbnb-v2`

### 5. `packages/client/nginx.conf` — Update/Create

Nginx config for the client container:

- Serve static files from `/usr/share/nginx/html`
- SPA fallback: `try_files $uri $uri/ /index.html`
- Gzip compression for assets

## GitHub Secrets Required

User must manually add these in GitHub repo settings (`Settings → Secrets and variables → Actions`):

| Secret            | Value                                        |
| ----------------- | -------------------------------------------- |
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/id_ed25519` (private key) |
| `SERVER_HOST`     | `46.225.219.72`                              |
| `SERVER_USER`     | `deploy`                                     |

## Domain Routing

- `airbnb.abdulkhalek.dev` → client container (nginx, port 80)
- `airbnb.abdulkhalek.dev/api/*` → server container (express, port 3000)

Both on HTTPS via Traefik auto-SSL.

## Persistent Storage

- MongoDB data: named volume `mongodb_data`
- Uploaded images: named volume `uploads` mounted at `/app/uploads` in server container

## What Does NOT Change

- Traefik gateway config (already running)
- Server application code
- Client application code
- Database schemas
- The deployment flow concept (build → push → SSH → compose up)
