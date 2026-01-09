# Quickstart: Fix Nuxt Docker Build Error

**Feature**: 005-fix-nuxt-build
**Date**: 2026-01-09

## Overview

This guide explains how to build and deploy the Nuxt 3 application using Docker after fixing the `#internal/nuxt/paths` import error.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose (optional, for multi-container setups)
- Access to Strapi CMS backend URL
- Git repository access

## Quick Start

### 1. Build the Docker Image

```bash
# From repository root
docker build \
  --build-arg STRAPI_URL=http://localhost:1337 \
  --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=12345678 \
  -t aiportal-frontend:latest \
  .
```

**Build Arguments**:
- `STRAPI_URL` (required): URL of your Strapi CMS backend
- `NUXT_PUBLIC_YANDEX_METRIKA_ID` (optional): Yandex Metrika tracking ID

### 2. Run the Container

```bash
# Basic run
docker run -d \
  --name aiportal-frontend \
  -p 8080:8080 \
  -e STRAPI_URL=http://localhost:1337 \
  aiportal-frontend:latest

# Or with PORT override
docker run -d \
  --name aiportal-frontend \
  -p 3000:3000 \
  -e STRAPI_URL=http://strapi:1337 \
  -e PORT=3000 \
  aiportal-frontend:latest
```

### 3. Verify Deployment

```bash
# Check container logs
docker logs aiportal-frontend

# Check container health
curl http://localhost:8080

# Or open in browser
open http://localhost:8080
```

## Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        STRAPI_URL: http://strapi:1337
        NUXT_PUBLIC_YANDEX_METRIKA_ID: ${YANDEX_METRIKA_ID:-}
    ports:
      - "8080:8080"
    environment:
      - STRAPI_URL=http://strapi:1337
      - PORT=8080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  strapi:
    image: strapi/strapi:latest
    ports:
      - "1337:1337"
    environment:
      - DATABASE_CLIENT=postgres
      # ... other Strapi config
    volumes:
      - strapi-data:/app/public/uploads

volumes:
  strapi-data:
```

Then run:

```bash
docker compose up -d
```

## Troubleshooting

### Error: "Package import specifier #internal/nuxt/paths is not defined"

**Root Cause**: Incorrect Dockerfile copying `node_modules` to production stage.

**Solution**:
1. Ensure Dockerfile only copies `.output` folder to runner stage
2. Add `.nuxt` cleanup before build: `RUN rm -rf .nuxt && yarn build`
3. Verify no `.dockerignore` is excluding critical files

### Build Fails with "Module not found"

**Check**:
1. Are all dependencies in `package.json`?
2. Did `yarn install` complete successfully?
3. Is `yarn.lock` committed to git?

### Container Starts But Returns 500 Errors

**Check**:
1. Are environment variables set? (`STRAPI_URL`, etc.)
2. Is Strapi backend accessible from container?
3. Check container logs: `docker logs <container-name>`
4. Verify `.output/server/index.mjs` exists and is executable

### Build Takes Too Long

**Optimizations**:
1. Use Docker build cache by copying `package.json` before source code
2. Use `.dockerignore` to exclude unnecessary files
3. Consider using Yarn's zero-install cache

## File Structure

After implementation, the key files should be:

```
.
├── Dockerfile              # Multi-stage build (FIXED)
├── .dockerignore           # Exclude node_modules, .git, etc.
└── frontend/
    ├── nuxt.config.js      # Nuxt configuration (unchanged)
    ├── package.json        # Dependencies (unchanged)
    ├── server/             # API routes (unchanged)
    └── ...
```

## Key Changes from Original Dockerfile

### Before (Broken):
```dockerfile
# Production Stage
FROM node:22-slim AS runner
COPY --from=build /frontend/.output ./.output
COPY --from=build /frontend/node_modules ./node_modules  # ❌ WRONG
COPY --from=build /frontend/package.json ./package.json
```

### After (Fixed):
```dockerfile
# Production Stage
FROM node:22-slim AS runner
COPY --from=build /frontend/.output ./.output  # ✅ Only .output needed
```

## Deployment Checklist

- [ ] Dockerfile updated to remove `node_modules` copy
- [ ] `.nuxt` cleanup added before build step
- [ ] Build arguments properly defined
- [ ] Environment variables set at runtime
- [ ] Container logs show no errors
- [ ] HTTP endpoint responds with 200 status
- [ ] Static assets load correctly
- [ ] Server routes (API proxy) work
- [ ] No `#internal/nuxt/paths` errors in logs

## Success Criteria

After deployment, verify:

1. **Build succeeds**: `docker build` completes without errors
2. **Container starts**: No startup errors in logs
3. **HTTP works**: `curl http://localhost:8080` returns HTML
4. **No import errors**: No `#internal/nuxt/*` errors in logs
5. **Pages render**: Dynamic content loads from Strapi
6. **Build time**: Under 5 minutes on standard hardware
7. **Image size**: Not increased by >20% from previous working version

## Next Steps

After successful deployment:

1. Monitor container logs for any runtime issues
2. Test all user-facing features (navigation, forms, API calls)
3. Verify PWA features work (offline mode, install prompt)
4. Check Yandex Metrika analytics are tracking
5. Update CI/CD pipeline with fixed Dockerfile

## Additional Resources

- [Nuxt 3 Deployment Docs](https://nuxt.com/docs/deployment)
- [Nuxt Docker Guide](https://content.nuxt.com/docs/deploy/docker)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- Project constitution: `.specify/memory/constitution.md`
