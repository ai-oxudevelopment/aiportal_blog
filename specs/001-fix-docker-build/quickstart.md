# Quickstart: Fix Docker Build Failure

**Feature**: 001-fix-docker-build
**Last Updated**: 2026-01-03

## Overview

This quickstart guide provides step-by-step instructions for testing and deploying the Docker build fix. The fix addresses the PWA Workbox configuration error that was causing build failures.

## Prerequisites

### Required Tools

- **Node.js**: v20.x (matching Docker base image)
- **Yarn**: 3.x (Berry)
- **Docker**: Latest version with BuildKit support
- **Git**: For cloning the repository

### Environment Variables

Prepare the following environment variables before building:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRAPI_URL` | Strapi CMS backend URL | `https://strapi.example.com` | Yes |
| `NUXT_PUBLIC_YANDEX_METRIKA_ID` | Yandex Metrika analytics ID | `12345678` | Yes |
| `PORT` | Application port (optional) | `8080` | No (defaults to 8080) |

## Local Development Testing

### Step 1: Set Up Environment

```bash
# From project root
cd frontend

# Copy environment example
cp .env.example .env

# Edit .env and add your variables
nano .env
```

Add to `.env`:
```bash
STRAPI_URL=https://your-strapi-url.com
NUXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id
PORT=8080
```

### Step 2: Install Dependencies

```bash
# Ensure Yarn is enabled
corepack enable

# Install dependencies
yarn install
```

### Step 3: Test Build Locally

```bash
# Run production build
yarn build

# Expected output:
# ✔ Client built in 13979ms
# ✔ Server built in 21ms
# [nitro] ✔ Generated public .output/public
# (Should NOT see PWA error)
```

### Step 4: Verify Output

```bash
# Check that build artifacts were created
ls -la .output/

# Expected directories:
# .output/server/index.mjs
# .output/public/
```

### Step 5: Test Local Server

```bash
# Preview the production build
yarn preview

# Or directly with Node
node .output/server/index.mjs

# Visit http://localhost:8080
# Verify the application loads correctly
```

## Docker Build Testing

### Step 1: Build Docker Image

```bash
# From project root (parent of frontend/)
docker build \
  --build-arg STRAPI_URL=https://your-strapi-url.com \
  --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id \
  -t aiportal-frontend:latest \
  .
```

**Expected Output**:
```
=> [build 1/8] WORKDIR /frontend
=> [build 2/8] RUN corepack enable
=> [build 3/8] COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./
=> [build 4/8] RUN yarn install --immutable
=> [build 5/8] COPY frontend/ .
=> [build 6/8] RUN yarn build
✔ Client built in 13979ms
✔ Server built in 21ms
=> [build 7/8] COPY --from=build /frontend/.output ./.output
=> [build 8/8] COPY --from=build /frontend/node_modules ./node_modules
=> exporting to image
=> => naming to docker.io/library/aiportal-frontend:latest
```

**Exit Code**: Should be `0` (success)

### Step 2: Verify Docker Image

```bash
# Check that image was created
docker images | grep aiportal-frontend

# Expected output:
# aiportal-frontend   latest   <image-id>   <time>   <size>
```

### Step 3: Run Docker Container

```bash
# Run the container
docker run -d \
  --name aiportal-test \
  -p 8080:8080 \
  -e STRAPI_URL=https://your-strapi-url.com \
  -e NUXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id \
  aiportal-frontend:latest

# Check logs
docker logs aiportal-test

# Expected output:
# Listening on http://[::]:8080
```

### Step 4: Verify Application

```bash
# Test the application
curl http://localhost:8080

# Or open in browser:
# open http://localhost:8080
```

### Step 5: Clean Up

```bash
# Stop and remove container
docker stop aiportal-test
docker rm aiportal-test

# Optionally remove image
# docker rmi aiportal-frontend:latest
```

## Verification Checklist

Use this checklist to verify the fix is working correctly:

### Build Verification

- [ ] `yarn build` completes with exit code 0
- [ ] No PWA Workbox errors in build output
- [ ] `.output/server/index.mjs` exists
- [ ] `.output/public/` directory contains static assets
- [ ] Service worker file generated (if PWA enabled)

### Docker Verification

- [ ] `docker build` completes with exit code 0
- [ ] Docker image created successfully
- [ ] Image size is reasonable (< 1GB)
- [ ] Container starts without errors
- [ ] Application serves on port 8080

### Application Verification

- [ ] Homepage loads correctly
- [ ] PWA service worker registers (check browser DevTools)
- [ ] Strapi API calls work (if backend is available)
- [ ] Yandex Metrika initialized (if configured)
- [ ] No console errors in browser

## Troubleshooting

### Build Fails with PWA Error

**Symptom**: Build still shows Workbox error about `networkTimeoutSeconds`

**Solution**: Verify that [nuxt.config.js:128](../frontend/nuxt.config.js#L128) has the `networkTimeoutSeconds` line removed or commented out.

### Docker Build: Command Not Found

**Symptom**: `yarn: command not found`

**Solution**: Ensure `corepack enable` is run in Dockerfile before `yarn install`

### Docker Build: Permission Denied

**Symptom**: `EACCES: permission denied` when creating files

**Solution**: Check Docker file permissions and ensure build context has correct permissions

### Container Starts But App Not Accessible

**Symptom**: Container runs but `curl localhost:8080` fails

**Solutions**:
1. Check container logs: `docker logs <container-id>`
2. Verify PORT environment variable is set to 8080
3. Check if port is already in use: `lsof -i :8080`

### Service Worker Not Registering

**Symptom**: PWA features not working, service worker not registered

**Solutions**:
1. Check browser console for errors
2. Verify service worker file exists: `.output/public/sw.js`
3. Clear browser cache and reload
4. Check PWA configuration in nuxt.config.js

## CI/CD Integration

### GitLab CI Example

```yaml
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build
      --build-arg STRAPI_URL=$STRAPI_URL
      --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=$YANDEX_METRIKA_ID
      -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
      .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - master
    - 001-fix-docker-build
```

### GitHub Actions Example

```yaml
name: Build Docker Image

on:
  push:
    branches: [master, 001-fix-docker-build]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build
            --build-arg STRAPI_URL=${{ secrets.STRAPI_URL }}
            --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=${{ secrets.YANDEX_METRIKA_ID }}
            -t aiportal-frontend:${{ github.sha }}
            .
      
      - name: Verify build
        run: docker images | grep aiportal-frontend
```

## Performance Benchmarks

### Expected Build Times

| Environment | Client Build | Server Build | Total |
|-------------|--------------|--------------|-------|
| Local (Mac M1) | ~14s | ~20ms | ~15s |
| Docker (first build) | ~14s | ~20ms | ~3-5 min* |
| Docker (cached) | ~14s | ~20ms | ~30s |

*Includes dependency installation

### Expected Image Size

| Layer | Size |
|-------|------|
| Base image (node:20-slim) | ~200MB |
| Dependencies (node_modules) | ~400MB |
| Build artifacts (.output) | ~50MB |
| **Total** | **~650MB** |

## Next Steps

After verifying the fix:

1. **Merge the fix**: Create PR from `001-fix-docker-build` to `master`
2. **Deploy to staging**: Test in staging environment
3. **Monitor**: Check for any build failures in CI/CD
4. **Production deployment**: Deploy to production after staging verification

## Additional Resources

- [Research Document](./research.md) - Detailed root cause analysis
- [Data Model](./data-model.md) - Build process entities and states
- [Feature Spec](./spec.md) - Requirements and user stories
- [Nuxt Documentation](https://nuxt.com)
- [Vite PWA Documentation](https://vite-plugin-pwa.netlify.app/)

## Support

If you encounter issues not covered in this guide:

1. Check the [research.md](./research.md) for known issues
2. Review Docker logs: `docker logs <container-id>`
3. Review build logs: `yarn build` (local) or `docker build` output
4. Open an issue with full error logs and environment details
