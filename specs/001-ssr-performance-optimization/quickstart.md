# Quickstart Guide: SSR Performance Optimization

**Feature**: 001-ssr-performance-optimization
**Branch**: `001-ssr-performance-optimization`
**Last Updated**: 2025-01-09

## Overview

This guide helps developers quickly set up and work with the SSR performance optimization feature. It covers local development, testing, and validation of the performance improvements.

---

## Prerequisites

- **Node.js**: v22 or later
- **Yarn**: Latest stable version
- **Docker**: Latest version (for testing deployment)
- **Strapi CMS**: Running instance (usually at `http://localhost:1337`)

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd aiportal_blog

# Switch to the feature branch
git checkout 001-ssr-performance-optimization

# Install dependencies
cd frontend
yarn install
```

### 2. Environment Configuration

Create or update `.env` file in the `frontend/` directory:

```bash
# Strapi CMS URL
STRAPI_URL=http://localhost:1337

# Application port
PORT=8080

# Yandex Metrika ID (optional)
NUXT_PUBLIC_YANDEX_METRIKA_ID=<your-metrika-id>
```

### 3. Run Development Server

```bash
# Start Nuxt development server with SSR enabled
cd frontend
yarn dev
```

The server will start at `http://localhost:8080`

### 4. Verify SSR is Working

1. Open `http://localhost:8080` in your browser
2. View page source (Ctrl/Cmd + U)
3. Check that HTML contains rendered content (not empty `<div id="__nuxt"></div>`)
4. Open browser DevTools → Network tab
5. Refresh page and verify document type is `document` (not `fetch`)

---

## Development Workflow

### Adding Cached Server Routes

New server routes should use the caching middleware:

```typescript
// server/api/my-endpoint.get.ts
import { withStaleWhileRevalidate } from '../middleware/cache'

export default defineEventHandler(async (event) => {
  const cacheKey = `my-endpoint:${getQuery(event).id}`

  const { data, stale } = await withStaleWhileRevalidate(
    cacheKey,
    async () => {
      // Fetch data from Strapi or other source
      return await fetchDataFromSource(event)
    }
  )

  if (stale) {
    setHeader(event, 'X-Content-Stale', 'true')
  }

  return data
})
```

### Using Prefetch Links

Replace standard `<NuxtLink>` with `PrefetchLink` for smart prefetching:

```vue
<script setup lang="ts">
import PrefetchLink from '~/components/shared/PrefetchLink.vue'
</script>

<template>
  <PrefetchLink to="/some-page">
    Link Text
  </PrefetchLink>
</template>
```

### Displaying Status Banners

Show appropriate banners based on content state:

```vue
<script setup lang="ts">
import StaleContentBanner from '~/components/shared/banners/StaleContentBanner.vue'
import SlowConnectionBanner from '~/components/shared/banners/SlowConnectionBanner.vue'
import JavaScriptBanner from '~/components/shared/banners/JavaScriptBanner.vue'

const { data, isStale } = useArticles()
const { isSlowConnection } = useNetworkDetection()
</script>

<template>
  <div>
    <JavaScriptBanner />

    <StaleContentBanner v-if="isStale" />

    <SlowConnectionBanner v-if="isSlowConnection && pending" />

    <!-- Your content here -->
  </div>
</template>
```

---

## Testing Performance

### 1. Measure Baseline (Before Implementation)

```bash
# Install Lighthouse CLI (if not installed)
npm install -g lighthouse

# Run Lighthouse on key pages
lighthouse http://localhost:8080 --view --preset=mobile --quiet --output=json --output-path=baseline-home.json
lighthouse http://localhost:8080/speckits --view --preset=mobile --quiet --output=json --output-path=baseline-speckits.json

# Or use PageSpeed Insights web interface:
# https://pagespeed.web.dev/
# Run tests on:
# - Home page (/)
# - Speckits list (/speckits)
# - Article detail page
# Save results to specs/001-ssr-performance-optimization/baseline/
```

### 2. Run Performance Tests (After Implementation)

```bash
# Same commands as baseline, but save to different files
lighthouse http://localhost:8080 --view --preset=mobile --quiet --output=json --output-path=post-optimization-home.json
lighthouse http://localhost:8080/speckits --view --preset=mobile --quiet --output=json --output-path=post-optimization-speckits.json
```

### 3. Validate Performance Improvement

```bash
# Compare results
# Check that Performance score improved by 20+ points
# Check that all SLO targets are met (see contracts/performance-slo.yaml)
```

### 4. Test Cache Behavior

```bash
# Test stale-while-revalidate
# 1. Load a page (cache miss, fetches from Strapi)
# 2. Reload same page (cache hit, returns fresh)
# 3. Wait 5 minutes (cache expires, becomes stale)
# 4. Stop Strapi CMS
# 5. Reload page (serves stale content with banner)
# 6. Start Strapi CMS
# 7. Reload page (background refresh, stale flag clears)
```

### 5. Test Progressive Enhancement

```bash
# Disable JavaScript in browser
# 1. Open DevTools → Settings → Disable JavaScript
# 2. Reload page
# 3. Verify content is readable
# 4. Verify "Enable JavaScript" banner shows
# 5. Click links (should work as page reloads)
```

### 6. Test 2G Network Simulation

```bash
# Chrome DevTools → Network Tab
# 1. Click "Network throttling" dropdown
# 2. Select "Fast 3G" or "Slow 3G"
# 3. Reload page
# 4. Verify "Loading on slow connection" banner shows
# 5. Verify no timeout errors
# 6. Verify content eventually loads
```

---

## Docker Deployment Testing

### Build Docker Image

```bash
# From repository root
docker build -t aiportal-frontend:ssr-optimization -f Dockerfile .

# Time the build (should be < 10 minutes)
time docker build -t aiportal-frontend:ssr-optimization -f Dockerfile .
```

### Run Docker Container

```bash
# Run container
docker run -p 8080:8080 \
  -e STRAPI_URL=http://your-strapi-url:1337 \
  -e NUXT_PUBLIC_YANDEX_METRIKA_ID=your-id \
  aiportal-frontend:ssr-optimization

# Time startup (should be < 10 seconds)
time docker run -p 8080:8080 \
  -e STRAPI_URL=http://your-strapi-url:1337 \
  aiportal-frontend:ssr-optimization
```

### Verify Container

```bash
# Check container is responding
curl http://localhost:8080

# Check HTML contains content (not empty)
curl http://localhost:8080 | grep -o "<title>.*</title>"

# Run Lighthouse against containerized version
lighthouse http://localhost:8080 --view --preset=mobile
```

---

## Debugging

### Check SSR Hydration

```javascript
// Add to app.vue or page component
onMounted(() => {
  console.log('Client-side hydrated')
  // Check if data matches SSR-rendered data
})
```

### Monitor Cache State

```typescript
// Add logging to cache middleware
console.log('Cache stats:', {
  size: cache.size,
  keys: Array.from(cache.keys()),
  entries: Array.from(cache.entries()).map(([k, v]) => ({
    key: k,
    age: Date.now() - v.cachedAt,
    stale: v.stale
  }))
})
```

### Inspect Response Headers

```bash
# Check for cache headers
curl -I http://localhost:8080/api/articles

# Should see:
# X-Content-Stale: true (if stale)
# Cache-Control: ... (from PWA or server config)
```

### Common Issues

**Issue**: Hydration mismatch errors
- **Cause**: Server-rendered HTML differs from client-rendered HTML
- **Fix**: Ensure deterministic rendering, avoid `Math.random()` or `Date.now()` in templates

**Issue**: Cache not working
- **Cause**: Cache keys not consistent
- **Fix**: Ensure cache key generation includes all relevant parameters

**Issue**: Stale content not refreshing
- **Cause**: Background refresh failing silently
- **Fix**: Add error logging to cache refresh logic

**Issue**: Docker build too slow
- **Cause**: Dependencies reinstalling every time
- **Fix**: Ensure `yarn.lock` is copied before `yarn install` in Dockerfile

---

## Performance Validation Checklist

Before marking the feature complete, verify:

- [ ] Baseline performance measured and saved
- [ ] SSR enabled and verified (page source contains HTML)
- [ ] Client-side navigation working (< 500ms transitions)
- [ ] Cache working (fresh → stale → refresh cycle)
- [ ] Stale-while-revalidate working (Strapi failure handled)
- [ ] Progressive enhancement working (content readable without JS)
- [ ] 2G network support working (no timeouts, loading indicator shows)
- [ ] Smart prefetching working (links prefetch on hover/touch)
- [ ] Docker build < 10 minutes
- [ ] Container startup < 10 seconds
- [ ] Performance score improved by 20+ points
- [ ] All SLO targets met (see `contracts/performance-slo.yaml`)
- [ ] No regressions in existing functionality
- [ ] PWA capabilities maintained (service worker, offline support)
- [ ] Vuetify 3 components hydrating correctly
- [ ] Russian-language UI preserved

---

## Next Steps

After setup:

1. **Read the full implementation plan**: `plan.md`
2. **Review data model**: `data-model.md`
3. **Check performance contracts**: `contracts/performance-slo.yaml`
4. **Generate tasks**: Run `/speckit.tasks` to create actionable implementation tasks

---

## Additional Resources

- **Nuxt 3 SSR Documentation**: https://nuxt.com/docs/guide/concepts/rendering
- **Vuetify 3 SSR Guide**: https://vuetifyjs.com/en/features/server-side-rendering/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Web Vitals**: https://web.dev/vitals/

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
PORT=3000 yarn dev
```

### Strapi Connection Errors

```bash
# Verify Strapi is running
curl http://localhost:1337/api/articles

# Check STRAPI_URL in .env
echo $STRAPI_URL
```

### Docker Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t aiportal-frontend:ssr-optimization -f Dockerfile .
```

---

**Status**: Ready for implementation
**Next Command**: `/speckit.tasks` to generate implementation tasks
