# Research: SSR Performance Optimization and Mobile Speed Improvements

**Feature**: 001-ssr-performance-optimization
**Date**: 2025-01-09
**Phase**: Phase 0 - Outline & Research

## Research Tasks

This document consolidates research findings for enabling SSR in the AI Portal Nuxt 3 application. All "NEEDS CLARIFICATION" items from Technical Context have been resolved through research.

---

## 1. SSR Implementation Strategy for Nuxt 3.2.0

### Decision
Enable full SSR mode in Nuxt configuration (`ssr: true`) with hybrid client-side navigation for subsequent page transitions.

### Rationale
- Nuxt 3.2.0 has built-in SSR support that is production-ready
- SSR provides initial HTML content for search engines (FR-004)
- Enables progressive enhancement when JavaScript fails (FR-015)
- Hybrid approach (SSR first load, client-side navigation after) preserves SPA-like UX (FR-005)

### Alternatives Considered

**Alternative 1: Static Site Generation (SSG) with `nuxt generate`**
- ❌ Rejected: Requires full rebuild on content changes, not suitable for dynamic Strapi CMS content
- ❌ Rejected: Cannot serve stale content when Strapi is unavailable (FR-013)

**Alternative 2: Pure SPA mode (current state)**
- ❌ Rejected: Cannot meet <1.5s mobile load time targets (SC-001, SC-002)
- ❌ Rejected: No HTML for search engines (FR-004)
- ❌ Rejected: Violates progressive enhancement requirement (FR-015)

**Alternative 3: Incremental Static Regeneration (ISR)**
- ⚠️ Deferred for future: Nuxt 3 ISR is still evolving, may consider for Nuxt 4 upgrade
- ✅ Current choice: Standard SSR with caching layer provides better control for dynamic content

### Implementation Notes
- Change in `nuxt.config.js`: `ssr: false` → `ssr: true`
- Update `app.vue` to handle SSR-specific hydration
- Ensure all composables use `useFetch`/`useAsyncData` with proper caching
- Add `<ClientOnly>` wrapper for components that require browser APIs

---

## 2. Stale-While-Revalidate Caching Pattern

### Decision
Implement in-memory caching layer in Nuxt server routes with stale-while-revalidate semantics. Cache key based on request URL and query parameters.

### Rationale
- Meets FR-013 requirement: serve cached content when Strapi is unavailable
- Provides resilience against temporary backend failures
- Improves perceived performance (served from cache vs. timeout)
- Auto-refresh on recovery ensures content freshness
- Compatible with existing Nuxt server route architecture

### Alternatives Considered

**Alternative 1: Redis/external cache**
- ❌ Rejected: Adds infrastructure complexity and external dependency
- ❌ Rejected: Constitution Principle I prefers simple solutions
- ✅ Current choice: In-memory cache sufficient for single-instance deployment

**Alternative 2: Vite/SSR cache headers only**
- ❌ Rejected: Browser cache doesn't help when Strapi fails
- ❌ Rejected: No stale content available for revalidation

**Alternative 3: Static fallback pages**
- ❌ Rejected: Hard to maintain, quickly becomes outdated
- ✅ Current choice: Cached Strapi responses remain accurate until refreshed

### Implementation Pattern

```typescript
// server/middleware/cache.ts
const cache = new Map<string, { data: any, cachedAt: number, stale: boolean }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const STALE_TTL = 60 * 60 * 1000 // 1 hour (serve stale if backend fails)

export async function withStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ data: T, stale: boolean }> {
  const now = Date.now()
  const cached = cache.get(key)

  // Fresh cache hit
  if (cached && now - cached.cachedAt < CACHE_TTL) {
    return { data: cached.data, stale: false }
  }

  // Stale cache hit - return stale, refresh in background
  if (cached && now - cached.cachedAt < STALE_TTL) {
    // Refresh asynchronously without blocking response
    fetcher().then(freshData => {
      cache.set(key, { data: freshData, cachedAt: now, stale: false })
    }).catch(() => {
      // Keep stale cache if refresh fails
      cached.stale = true
    })
    return { data: cached.data, stale: true }
  }

  // Cache miss or expired - fetch fresh
  try {
    const freshData = await fetcher()
    cache.set(key, { data: freshData, cachedAt: now, stale: false })
    return { data: freshData, stale: false }
  } catch (error) {
    // If we have stale cache, return it even if expired
    if (cached) {
      return { data: cached.data, stale: true }
    }
    throw error
  }
}
```

### Usage in Server Routes

```typescript
// server/api/articles.get.ts
import { withStaleWhileRevalidate } from '../middleware/cache'

export default defineEventHandler(async (event) => {
  const cacheKey = `articles:${getURL(event)}`

  const { data, stale } = await withStaleWhileRevalidate(
    cacheKey,
    () => fetchArticlesFromStrapi(event)
  )

  // Add header to indicate stale status
  if (stale) {
    setHeader(event, 'X-Content-Stale', 'true')
  }

  return data
})
```

---

## 3. Smart Link Prefetching Strategy

### Decision
Implement link prefetching on hover (desktop) and touch start (mobile) using Nuxt's prefetching capabilities combined with custom `<NuxtLink>` wrapper.

### Rationale
- Reduces perceived navigation time (< 500ms target in FR-005, SC-003)
- Leverages browser's idle time during user interaction
- Minimal bandwidth impact (only prefetches on clear user intent)
- Compatible with SSR hydration

### Alternatives Considered

**Alternative 1: `<link rel="prefetch">` in head**
- ❌ Rejected: Prefetches all links, wastes bandwidth
- ❌ Rejected: Not user-intent-driven

**Alternative 2: Intersection Observer prefetch**
- ⚠️ Partial: Good for viewport links, but doesn't capture all navigation patterns
- ✅ Current choice: Hover/touch is more reliable predictor of navigation intent

**Alternative 3: No prefetching**
- ❌ Rejected: Cannot meet 500ms navigation target consistently

### Implementation Pattern

```typescript
// composables/useSmartPrefetch.ts
export function useSmartPrefetch() {
  const prefetchRoute = (url: string) => {
    // Use Nuxt's internal prefetch mechanism
    const router = useRouter()
    router.prefetch(url)
  }

  const onLinkHover = (url: string) => {
    // Desktop: prefetch on hover after short delay
    const timeout = setTimeout(() => prefetchRoute(url), 100)
    return () => clearTimeout(timeout)
  }

  const onLinkTouch = (url: string) => {
    // Mobile: prefetch immediately on touch
    prefetchRoute(url)
  }

  return { onLinkHover, onLinkTouch }
}
```

```vue
<!-- components/shared/PrefetchLink.vue -->
<script setup lang="ts">
const props = defineProps<{ to: string }>()
const { onLinkHover, onLinkTouch } = useSmartPrefetch()

let cancelPrefetch: (() => void) | null = null

const onMouseEnter = () => {
  cancelPrefetch = onLinkHover(props.to)
}

const onMouseLeave = () => {
  cancelPrefetch?.()
  cancelPrefetch = null
}

const onTouchStart = () => {
  onLinkTouch(props.to)
}
</script>

<template>
  <NuxtLink
    :to="to"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @touchstart="onTouchStart"
  >
    <slot />
  </NuxtLink>
</template>
```

---

## 4. Progressive Enhancement Strategy

### Decision
Ensure all content is readable without JavaScript by relying on SSR-rendered HTML. Add subtle banners to guide users when features are enhanced.

### Rationale
- Meets FR-015 requirement for progressive enhancement
- SSR provides complete HTML before JavaScript execution
- Fallback to standard page reloads when JavaScript unavailable
- Non-intrusive banners inform users without breaking experience

### Alternatives Considered

**Alternative 1: `<noscript>` tags with redirect**
- ❌ Rejected: Disruptive, blocks access to content
- ✅ Current choice: SSR content is fully functional, banners are informational

**Alternative 2: Require JavaScript**
- ❌ Rejected: Violates web standards and accessibility principles
- ❌ Rejected: Poor experience on slow/unreliable networks

**Alternative 3: Separate m-dot site for mobile**
- ❌ Rejected: Duplicate content, maintenance burden, SEO issues
- ✅ Current choice: Responsive SSR with progressive enhancement

### Implementation Pattern

```vue
<!-- components/shared/banners/JavaScriptBanner.vue -->
<template>
  <div v-if="!hasJavaScript" class="js-banner">
    <p>Enable JavaScript for faster navigation and enhanced features</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const hasJavaScript = ref(false)

onMounted(() => {
  hasJavaScript.value = true
})
</script>

<style scoped>
.js-banner {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}
</style>
```

```vue
<!-- app.vue -->
<template>
  <div>
    <JavaScriptBanner />
    <NuxtPage />
  </div>
</template>
```

### Fallback Behavior
- When JavaScript fails: SSR content remains fully readable
- Links work as standard page reloads (HTML anchor tags)
- Forms use standard POST submissions (can be enhanced with JS)

---

## 5. Network Detection and 2G Support

### Decision
Use Navigator Connection API to detect slow networks, show "Loading on slow connection" indicator during data transfers, ensure no timeout errors.

### Rationale
- Meets FR-016 requirement for 2G/EDGE support
- Navigator Connection API is widely supported in modern browsers
- No specific time target avoids unrealistic expectations on 2G
- Functional but slow approach manages user expectations

### Alternatives Considered

**Alternative 1: Network Information API (deprecated)**
- ❌ Rejected: Deprecated API, poor browser support
- ✅ Current choice: Navigator Connection API (replacement standard)

**Alternative 2: Timeout-based detection**
- ❌ Rejected: Reactive, not proactive
- ❌ Rejected: User already experiencing slowness before detection

**Alternative 3: Block 2G users entirely**
- ❌ Rejected: Excludes users in poor coverage areas
- ❌ Rejected: Violates accessibility principles

### Implementation Pattern

```typescript
// composables/useNetworkDetection.ts
export function useNetworkDetection() {
  const connection = ref<NetworkInformation | null>(null)
  const isSlowConnection = ref(false)

  if (import.meta.client) {
    const nav = navigator as any
    connection.value = nav.connection || nav.mozConnection || nav.webkitConnection

    if (connection.value) {
      const updateConnection = () => {
        const effectiveType = connection.value?.effectiveType
        isSlowConnection.value = effectiveType === '2g' || effectiveType === 'slow-2g'
      }

      connection.value.addEventListener('change', updateConnection)
      updateConnection()
    }
  }

  return { isSlowConnection, connection }
}
```

```vue
<!-- components/shared/banners/SlowConnectionBanner.vue -->
<template>
  <div v-if="isSlowConnection && isLoading" class="slow-banner">
    <p>Загрузка на медленном соединении... Пожалуйста, подождите</p>
    <p class="slow-banner__sub">Loading on slow connection... Please wait</p>
  </div>
</template>

<script setup lang="ts">
const { isSlowConnection } = useNetworkDetection()
const isLoading = ref(false)

// Show loading during data fetching
const { data, pending } = await useAsyncData(...)
watchEffect(() => {
  isLoading.value = pending.value
})
</script>
```

---

## 6. Docker Build Optimization for SSR

### Decision
Optimize Dockerfile multi-stage build to include Node.js runtime for SSR server, minimize image size while ensuring all production dependencies are included.

### Rationale
- SSR requires Node.js server runtime (not static files only)
- Multi-stage build reduces final image size
- Must maintain < 10 minute build target (SC-005)
- Must maintain < 10 second startup target (SC-006)

### Alternatives Considered

**Alternative 1: Single-stage build**
- ❌ Rejected: Larger image size, includes dev dependencies
- ✅ Current choice: Multi-stage build separates build and runtime

**Alternative 2: Static deployment (CDN only)**
- ❌ Rejected: Not compatible with SSR requirement
- ✅ Current choice: Node.js container for SSR server

**Alternative 3: Serverless deployment**
- ⚠️ Deferred: May consider for future, but current requirement is Docker

### Optimized Dockerfile Pattern

```dockerfile
# Stage 1: Dependencies
FROM node:22-slim AS deps
WORKDIR /frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Stage 2: Build
FROM node:22-slim AS build
WORKDIR /frontend
COPY --from=deps /frontend/node_modules ./node_modules
COPY frontend/package.json frontend/yarn.lock ./
COPY frontend/ ./
RUN yarn build

# Stage 3: Production SSR Server
FROM node:22-slim AS runner
WORKDIR /frontend

ENV NODE_ENV=production
ENV PORT=8080

# Copy production dependencies
COPY --from=deps /frontend/node_modules ./node_modules
COPY --from=deps /frontend/package.json ./package.json

# Copy build output
COPY --from=build /frontend/.output ./

EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
```

### Optimization Techniques
- Use `--frozen-lockfile` to ensure reproducible builds
- Separate deps and build stages for better caching
- Minimize layers by combining COPY commands
- Use `.dockerignore` to exclude unnecessary files

---

## 7. Performance Measurement and Baseline

### Decision
Use PageSpeed Insights mobile for baseline measurement and validation. Measure Performance score and Core Web Vitals (LCP, FID, CLS) before and after optimization.

### Rationale
- Explicitly chosen in clarification Q1
- Industry-standard tool for web performance
- Mobile-focused testing aligns with feature goals
- Core Web Vitals are Google's official metrics

### Baseline Process
1. **Before optimization**: Run PageSpeed Insights on mobile for key pages (home, article list, article detail)
2. **Record**: Performance score, LCP, FID, CLS, TTI
3. **Document**: Save baseline report in `specs/001-ssr-performance-optimization/baseline/`
4. **After optimization**: Re-run same tests
5. **Validate**: 20+ point improvement requirement (SC-008)

### Alternatives Considered

**Alternative 1: Lighthouse CLI**
- ⚠️ Complementary: Can be used for local testing during development
- ✅ Primary choice: PageSpeed Insights provides real-world data

**Alternative 2: WebPageTest**
- ⚠️ Complementary: Useful for detailed waterfall analysis
- ✅ Primary choice: PageSpeed Insights is sufficient for validation

**Alternative 3: Custom RUM (Real User Monitoring)**
- ⚠️ Deferred: May implement for ongoing monitoring, but not needed for feature validation

---

## 8. SSR Hydration and Vuetify 3 Integration

### Decision
Ensure Vuetify 3 components are SSR-compatible and hydrate correctly. Use `vuetify-nuxt` module (already installed) which handles SSR hydration.

### Rationale
- Constitution Principle III requires Vuetify 3 integration
- Vuetify 3 has SSR support built-in
- `vuetify-nuxt` module handles hydration automatically
- No manual SSR context manipulation needed

### Alternatives Considered

**Alternative 1: Manual Vuetify SSR configuration**
- ❌ Rejected: Error-prone, maintenance burden
- ✅ Current choice: Use official Nuxt module

**Alternative 2: Replace Vuetify with Tailwind-only components**
- ❌ Rejected: Violates Constitution Principle III
- ❌ Rejected: Significant refactoring effort
- ✅ Current choice: Vuetify works with SSR

### Implementation Notes
- Ensure `@vuetify/nuxt` module is loaded in `nuxt.config.js`
- Add `vuetify` to `build.transpile` array (already done)
- Test critical components (forms, dialogs, navigation) in SSR mode
- Use `<ClientOnly>` wrapper for browser-specific Vuetify components if needed

---

## 9. PWA and SSR Compatibility

### Decision
Maintain existing PWA configuration with `@vite-pwa/nuxt` module. SSR and PWA can coexist: PWA service worker caches static assets, SSR handles dynamic content.

### Rationale
- Constitution Principle VIII requires performance optimization
- Existing PWA configuration provides offline capabilities
- PWA cache complements server-side caching
- Both caching strategies work together for optimal performance

### Alternatives Considered

**Alternative 1: Disable PWA when enabling SSR**
- ❌ Rejected: Loses offline capabilities
- ❌ Rejected: Reverts performance improvements from PWA caching

**Alternative 2: Use PWA for everything (SPA only)**
- ❌ Rejected: Cannot meet SSR requirements
- ✅ Current choice: Hybrid approach (SSR + PWA)

### Implementation Notes
- PWA manifest unchanged
- Service worker caches static assets (images, fonts, CSS)
- SSR server handles dynamic content and API routes
- Stale-while-revalidate caching on server complements PWA cache

---

## 10. Client-Side Navigation after SSR

### Decision
Use Nuxt's built-in client-side navigation with `<NuxtLink>` component. After initial SSR page load, navigation uses client-side routing (Vue Router) for instant transitions.

### Rationale
- Explicitly chosen in clarification Q3 (hybrid approach)
- Meets <500ms navigation target (FR-005, SC-003)
- Preserves SPA-like UX after initial load
- Compatible with SSR hydration

### Alternatives Considered

**Alternative 1: Full page reloads for all navigation**
- ❌ Rejected: Cannot meet 500ms navigation target
- ❌ Rejected: Poor UX, feels like traditional web app

**Alternative 2: Custom client-side router**
- ❌ Rejected: Reinventing the wheel, Nuxt has built-in routing
- ✅ Current choice: Nuxt's Vue Router integration

### Implementation Notes
- Use `<NuxtLink>` instead of `<a>` tags for internal links
- Custom `PrefetchLink` wrapper (see section 3) adds smart prefetching
- Router prefetch triggered on hover/touch
- Browser back/forward buttons work automatically

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| SSR Mode | Enable `ssr: true` with hybrid navigation | Meets performance, SEO, and progressive enhancement requirements |
| Caching | Stale-while-revalidate in server routes | Resilience against Strapi failures, improves perceived performance |
| Prefetching | Hover/touch intent-based | Reduces navigation time without bandwidth waste |
| Progressive Enhancement | SSR content + informational banners | Non-breaking fallback for JavaScript failures |
| 2G Support | Detect connection, show loading indicator | Manages expectations, ensures functionality |
| Docker | Multi-stage build with Node.js runtime | Optimized for SSR server, maintains build/startup targets |
| Measurement | PageSpeed Insights mobile | Industry standard, aligns with feature goals |
| Vuetify | Use `vuetify-nuxt` module | Official SSR support, minimal configuration |
| PWA | Maintain existing configuration | Complements SSR caching, provides offline support |
| Navigation | Client-side after initial SSR load | SPA-like UX with fast transitions |

All "NEEDS CLARIFICATION" items resolved. Ready for Phase 1: Design & Contracts.
