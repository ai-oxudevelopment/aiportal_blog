# Research: PageSpeed Performance Optimization

**Feature**: 001-pagespeed-optimization
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document consolidates technical research and decision-making for the PageSpeed optimization feature. Each research task from the implementation plan has been investigated with alternatives analyzed and recommendations made.

---

## Decision 1: Image Optimization Strategy

### Problem
Current images are unoptimized JPEG/PNG formats causing slow LCP (18.3s). Need to reduce image payload while maintaining quality and providing fallbacks for older browsers.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. @nuxt/image module | Official Nuxt image optimization module with built-in WebP support, lazy loading, and responsive srcset | Auto-optimizes, minimal code, works with Nuxt 3, supports remote images | Adds ~15KB to bundle, requires build-time configuration | ✅ **RECOMMENDED** |
| B. Manual optimization (convert images offline) | Pre-convert all images to WebP using CLI tools, maintain manual fallbacks | No runtime overhead, full control | Labor-intensive, doesn't handle dynamic Strapi images, maintenance burden | ❌ Rejected |
| C. Build-time conversion (Vite plugin) | Use vite-plugin-imagemin to convert images during build | Automated, no runtime cost | Doesn't work with remote Strapi images, no runtime responsiveness | ❌ Rejected |

### Decision

**Use @nuxt/image module** with the following configuration:

```javascript
// nuxt.config.js
modules: ['@nuxt/image'],

image: {
  formats: ['webp', 'jpg'],
  domains: ['portal.aiworkplace.ru'], // Allow Strapi images
  presets: {
    thumbnail: {
      modifiers: {
        width: 300,
        quality: 75,
        format: 'webp'
      }
    },
    hero: {
      modifiers: {
        width: 1200,
        quality: 80,
        format: 'webp'
      }
    }
  }
}
```

### Rationale

- Automatic WebP conversion with JPEG fallback for older browsers
- Built-in lazy loading reduces initial page weight
- Responsive srcset generation for mobile/desktop
- Works seamlessly with Strapi-hosted images
- Minimal code changes required

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Bundle size increase (+15KB) | Lazy load the module itself, negligible compared to image savings |
| Strapi image CORS issues | Configure `domains` whitelist, test cross-origin images |
| Older browser compatibility | @nuxt/image provides automatic JPEG fallback |

---

## Decision 2: Code Splitting Strategy

### Problem
Large initial bundle size causes main thread blocking (3,650ms TBT). Need to split code into optimal chunks without breaking caching.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Route-based splitting (Nuxt default) | Each page becomes its own chunk | Automatic, works with Nuxt routing | Heavy components shared across routes still duplicated | ⚠️ Partial |
| B. Component-based splitting | Dynamic import heavy components (Mermaid, PromptGrid) | Reduces initial bundle significantly | Requires manual `defineAsyncComponent` | ✅ **RECOMMENDED** |
| C. Vendor chunk splitting | Separate Vuetify, Mermaid, Tailwind into vendor chunks | Better caching, smaller main bundle | Complex configuration, can delay initial paint if not careful | ⚠️ Use with A+B |

### Decision

**Combined approach**: Use Nuxt's route-based splitting + manual component-based splitting for heavy components.

**Implementation**:

```javascript
// Route-based: automatic with Nuxt
// Component-based: dynamic imports for:

// 1. Mermaid diagram component (only on speckit pages)
const MermaidDiagram = defineAsyncComponent(() =>
  import('~/components/MermaidDiagram.vue')
)

// 2. Enhanced prompt grid (only on homepage)
const PromptGrid = defineAsyncComponent(() =>
  import('~/components/prompt/PromptGrid.vue')
)

// 3. Research chat interface (only on research page)
const ResearchChat = defineAsyncComponent(() =>
  import('~/components/research/ResearchChat.vue')
)
```

**Vite configuration for vendor chunks**:

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vuetify': ['vuetify'],
          'mermaid': ['mermaid'],
          'vue-vendor': ['vue', 'vue-router', '@vueuse/core']
        }
      }
    }
  }
}
```

### Rationale

- Reduces initial bundle by ~40% (lazy loading heavy components)
- Maintains optimal caching (vendor chunks change less frequently)
- Nuxt's automatic route splitting already handles most cases
- Progressive loading: critical content loads first, enhancements load after

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Waterfall effect (chunks load sequentially) | Use `<link rel="modulepreload">` hints for critical chunks |
| FOUC (Flash of Unstyled Content) | Add skeleton/loading states for async components |
| Duplicate code in chunks | Configure manual chunks to extract shared vendors |

---

## Decision 3: Mermaid Diagram Lazy Loading

### Problem
Mermaid 11.0.0 is a large library (~500KB gzipped) that blocks main thread on speckit pages.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Client-only component | Wrap Mermaid in `<ClientOnly>` component | Zero SSR overhead, no hydration mismatch | Doesn't reduce bundle size, still loads on client | ❌ Insufficient |
| B. Dynamic import on interaction | Load Mermaid only when user scrolls to diagram | True lazy loading, optimal for below-fold | Delayed rendering, complex intersection observer | ✅ **RECOMMENDED** |
| C. Web Worker | Run Mermaid rendering in worker thread | Non-blocking main thread | Complex message passing, SSR issues | ❌ Overkill |

### Decision

**Dynamic import with intersection observer** - Load Mermaid only when diagram enters viewport.

```javascript
// ~/composables/useMermaidDiagram.ts
import { defineAsyncComponent } from 'vue'

export const useMermaidDiagram = () => {
  const isLoaded = ref(false)
  const elementRef = ref<HTMLElement>()

  // Load when element enters viewport
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoaded.value) {
      import('mermaid').then((module) => {
        module.default.initialize({ theme: 'neutral' })
        isLoaded.value = true
      })
      observer.disconnect()
    }
  }, { rootMargin: '200px' }) // Start loading 200px before visible

  onMounted(() => {
    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  })

  return { isLoaded, elementRef }
}
```

**Alternative simpler approach** (if intersection observer too complex):

```vue
<template>
  <ClientOnly>
    <div v-if="isVisible">
      <MermaidRenderer :diagram="diagram" />
    </div>
    <div v-else class="diagram-placeholder">
      <SkeletonLoader />
      <button @click="isVisible = true">Load Diagram</button>
    </div>
  </ClientOnly>
</template>

<script setup>
const MermaidRenderer = defineAsyncComponent(() =>
  import('~/components/MermaidRenderer.vue')
)
const isVisible = ref(false)
</script>
```

### Rationale

- Mermaid only loads when needed (user interaction or scroll)
- Reduces initial bundle by ~500KB
- Better UX: users not viewing diagrams don't pay the cost
- Progressive enhancement: diagram is a "nice to have" not critical for FCP/LCP

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Delayed diagram rendering | Show placeholder/skeleton while loading |
| User frustration if takes too long | Add loading spinner, timeout fallback to text |
| Complexity of intersection observer | Start with click-to-load, optimize later if needed |

---

## Decision 4: CSS Optimization

### Problem
Heavy CSS payload (~35KB) with complex gradient animations causes 10+ second FCP. Need to extract critical CSS for above-the-fold content.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Inline critical CSS | Extract and inline above-fold CSS in `<head>` | Fastest FCP, no render-blocking | Bloats HTML, can't cache inline styles | ✅ **RECOMMENDED** |
| B. Preload critical CSS | `<link rel="preload">` for critical CSS file | Cacheable, simpler than inline | Still render-blocking until loaded | ⚠️ Secondary |
| C. Progressive enhancement | Load minimal CSS first, enhance after | Works without JS | Complex to maintain, FOUC risk | ❌ Rejected |

### Decision

**Critical CSS extraction + defer non-critical CSS**:

```javascript
// nuxt.config.js
export default {
  css: [
    // Critical: Load immediately, inline
    '~/assets/css/critical.css',

    // Non-critical: Load async
    { src: '~/assets/css/animations.css', media: 'print', onload: "this.media='all'" }
  ],

  // Use critical CSS extractor
  vite: {
    plugins: [
      critical({
        criticalUrl: 'http://localhost:8080',
        criticalBase: 'frontend/',
        criticalPages: [{ uri: 'index', template: 'index' }],
        criticalConfig: {
          include: [/^\.v-/, /^body/, /^header/], // Selectors to include
          dimensions: [{
            width: 375,
            height: 667 // Mobile viewport
          }]
        }
      })
    ]
  }
}
```

**Simplified approach** (if critical CSS plugin too complex):

```vue
<!-- app.vue -->
<template>
  <div>
    <!-- Critical CSS inlined via style tag -->
    <style scoped>
      /* Only above-fold styles: header, hero, loader */
      .v-app-bar { /* ... */ }
      .hero-section { /* ... */ }
      .loading-skeleton { /* ... */ }
    </style>

    <!-- Rest of app -->
    <NuxtPage />
  </div>
</template>

<script setup>
// Defer heavy animations
onMounted(() => {
  setTimeout(() => {
    import('~/assets/css/animations.css')
  }, 2000) // Load after 2s or user interaction
})
</script>
```

**Optimize Tailwind** (remove unused):

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './pages/**/*.vue',
    './app.vue',
    './layouts/**/*.vue'
  ],
  purge: {
    options: {
      safelist: [
        'gradient-chaos',
        'gradient-pulse',
        'iridescent-glow'
      ] // Keep iridescent theme classes
    }
  }
}
```

### Rationale

- Critical CSS reduces render-blocking payload by ~80%
- Mobile-first: extract CSS for 375x667 viewport (above-fold content)
- Defer animations (non-critical for FCP)
- Tailwind purging removes unused utility classes

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking iridescent theme | Safelist animation classes in Tailwind config |
| Critical CSS extraction complex | Start with manual inline approach, automate later |
| FOUC on navigation | Ensure critical CSS covers all route skeletons |

---

## Decision 5: Service Worker Strategy

### Problem
PWA service worker not registering correctly, causing offline support issues and potentially harming performance.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Fix @vite-pwa/nuxt config | Debug and fix current PWA configuration | Maintains existing investment, proper PWA | Time-consuming to debug | ✅ **RECOMMENDED** |
| B. Custom service worker | Write custom SW with workbox | Full control, simpler config | Lose PWA plugin benefits, more maintenance | ⚠️ Backup plan |
| C. Remove PWA entirely | Disable service worker, focus on HTTP caching | Removes complexity, simpler | Lose offline capability | ❌ Rejected (requirement) |

### Decision

**Fix @vite-pwa/nuxt configuration** with improved caching strategy:

```javascript
// nuxt.config.js
export default {
  modules: ['@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'AI Portal',
      short_name: 'AIPortal',
      description: 'AI Workplace Portal',
      theme_color: '#000000'
    },
    workbox: {
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/strapi\./i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'strapi-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        },
        {
          urlPattern: /\.(?:js|css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-cache'
          }
        }
      ],
      cleanupOutdatedCaches: true
    },
    devOptions: {
      enabled: true, // Enable in dev for testing
      type: 'module'
    }
  }
}
```

**Add service worker registration check**:

```javascript
// ~/plugins/pwa.client.ts
export default defineNuxtPlugin(() => {
  window.addEventListener('swInstalled', (event) => {
    console.log('Service Worker installed:', event.detail)
  })

  window.addEventListener('swUpdated', (event) => {
    // Prompt user to refresh for new content
    if (confirm('New version available. Refresh?')) {
      window.location.reload()
    }
  })
})
```

### Rationale

- Fixing existing PWA is better than removing (requirement: maintain PWA)
- Stale-while-revalidate ensures fast loads with fresh content
- Cache-first for images (don't change often)
- Proper cleanup prevents storage quota issues

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Service worker not updating users | Implement update prompt, auto-refresh after navigation |
| Storage quota exceeded | Limit cache entries, implement cleanup strategy |
| Debugging difficulty | Enable dev SW, use Chrome DevTools Application tab |

---

## Decision 6: Performance Monitoring

### Problem
Need to measure Core Web Vitals to verify success criteria (SC-001 through SC-008) and track improvements.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. web-vitals library | Google's official RUM library for CWV | Lightweight (~1KB), accurate, no external dependencies | Requires BE endpoint for aggregation | ✅ **RECOMMENDED** |
| B. Google Analytics 4 | Built-in CWV reports in GA | No additional code, free, existing integration | Delayed data (24-48h), sampling | ⚠️ Use as backup |
| C. Custom solution | Build own metrics collection | Full control, custom events | Reinventing wheel, maintenance burden | ❌ Rejected |

### Decision

**Use web-vitals library** with analytics integration:

```bash
yarn add web-vitals
```

```javascript
// ~/plugins/web-vitals.client.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const sendToAnalytics = (metric) => {
    // Send to analytics endpoint
    $fetch('/api/analytics/performance', {
      method: 'POST',
      body: {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        navigationType: metric.navigationType,
        url: window.location.href
      }
    })

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric.name, metric.value, metric.rating)
    }
  }

  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
})
```

**Optional: Add to existing Google Analytics**:

```javascript
const sendToAnalytics = (metric) => {
  // Assume gtag is already initialized
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    non_interaction: true // Don't affect bounce rate
  })
}
```

### Rationale

- Lightweight addition (< 1KB)
- Real-user measurement (field data) vs lab data
- Can verify all success criteria (FCP, LCP, TBT→FID, CLS)
- Works with existing analytics or standalone

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Adds tracking overhead | Minimal (< 1KB), non-blocking async |
| Privacy concerns | No PII collected, can be opt-out |
| Requires analytics backend | Use GA as fallback, or log to console in dev |

---

## Decision 7: Font Loading Strategy

### Problem
Material Design Icons (7.1.96) and any custom fonts are blocking render, contributing to slow FCP.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Subset fonts | Create subset with only used icons | Reduces font file by ~90% | Requires build step, need to track usage | ✅ **RECOMMENDED** |
| B. Preload fonts | `<link rel="preload">` in head | Fonts available earlier | Still blocks render, can delay other resources | ⚠️ Secondary |
| C. font-display: swap | Load fonts asynchronously, show system font immediately | No render blocking | FOUT (Flash of Unstyled Text), layout shift | ⚠️ Combine with A |

### Decision

**Font subsetting + font-display: swap**:

```javascript
// nuxt.config.js
export default {
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          href: '/fonts/material-icons-subset.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
}
```

```css
/* assets/css/fonts.css */
@font-face {
  font-family: 'Material Icons';
  src: url('/fonts/material-icons-subset.woff2') format('woff2');
  font-display: swap; /* Show system font immediately */
}

/* Only load used icons */
.material-icons-used {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}
```

**Subset Material Icons** (build-time script):

```javascript
// scripts/subset-icons.js
const fontkit = require('fontkit')
const fs = require('fs')

// Icons used in the app
const usedIcons = [
  'menu',
  'close',
  'search',
  'home',
  'arrow_forward',
  'add',
  'delete',
  'edit',
  // ... add all used icons
]

// Create subset (requires icon font analysis)
// Use fontello or similar service for subsetting
```

**Alternative**: Use Material Symbols Outlined with Google Fonts:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap">
```

Then `font-display: swap` in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap');

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-display: swap;
}
```

### Rationale

- Font subsetting reduces font payload by ~90% (from ~200KB to ~20KB)
- `font-display: swap` prevents render-blocking
- Preload critical fonts ensures they're available
- Progressive enhancement: system icons → custom icons

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Missing icons in subset | Audit codebase thoroughly, add buffer for future icons |
| Subsetting complexity | Use Google Fonts with display: swap as simpler alternative |
| FOUT impact | Design with fallback in mind, minimal layout shift |

---

## Decision 8: SSR vs SPA Decision

### Problem
Current app runs in SSR mode (`ssr: true`), which may be contributing to slow TTFB and complexity. Need to decide whether to switch to SPA.

### Alternatives Considered

| Option | Description | Pros | Cons | Recommendation |
|--------|-------------|------|------|----------------|
| A. Keep SSR (current) | Maintain server-side rendering | SEO-friendly, faster initial HTML | TTFB dependency, server load | ⚠️ **RECOMMENDED** |
| B. Switch to SPA | Set `ssr: false` in config | Faster TTFB (no server), simpler deployment | Poor SEO, no social sharing | ❌ Rejected |
| C. Hybrid (routeRules) | Pre-render public pages, SPA for others | Best of both worlds | Complex configuration | ⚠️ Future enhancement |

### Decision

**Keep SSR mode** but optimize TTFB:

```javascript
// nuxt.config.js
export default {
  ssr: true, // Keep SSR for SEO

  routeRules: {
    // Pre-render static pages (no dynamic data)
    '/': { prerender: true },
    '/speckits': { prerender: true },
    '/about': { prerender: true },

    // SPA mode for non-critical routes
    '/research/**': { ssr: false },
    '/admin/**': { ssr: false }
  }
}
```

**Optimize server-side data fetching**:

```javascript
// server/api/speckits.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Add caching headers
  setHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

  // Use cached data if available
  const cached = await cache.get('speckits')
  if (cached) return cached

  // Otherwise fetch from Strapi
  const data = await $fetch(`${config.strapiUrl}/api/speckits`)
  await cache.set('speckits', data, 300) // 5min

  return data
})
```

### Rationale

- SSR is critical for SEO (spec requirement: "Must preserve SEO optimization")
- Public content (speckits, articles) benefits from pre-rendering
- Hybrid approach: pre-render static content, dynamic routes use SSR
- SPA-only would break social sharing (Open Graph tags)

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Slow TTFB from server | Implement caching, use CDN, optimize Strapi queries |
| Server load | Static pre-generation for public pages |
| Complexity | Start with full SSR, add routeRules incrementally |

---

## Summary of Decisions

| # | Decision | Impact | Priority |
|---|----------|--------|----------|
| 1 | Use @nuxt/image for WebP optimization | -50% image weight, better LCP | P0 |
| 2 | Route + component code splitting | -40% initial bundle, better TBT | P0 |
| 3 | Dynamic import Mermaid diagrams | -500KB bundle, faster FCP | P0 |
| 4 | Critical CSS extraction | -80% render-blocking CSS, faster FCP | P0 |
| 5 | Fix PWA service worker | Better caching, offline support | P1 |
| 6 | Use web-vitals library | Measure success criteria | P1 |
| 7 | Subset fonts + font-display: swap | -90% font weight, faster FCP | P1 |
| 8 | Keep SSR with routeRules | Maintain SEO, optimize TTFB | P2 |

## Next Steps

1. **Phase 1**: Create data model and contracts (see [data-model.md](./data-model.md))
2. **Phase 2**: Generate implementation tasks (use `/speckit.tasks`)
3. **Phase 3**: Execute optimizations in priority order
4. **Phase 4**: Verify with PageSpeed Insights and web-vitals RUM

## References

- [web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Nuxt 3 Performance](https://nuxt.com/docs/getting-started/performance)
- [@nuxt/image documentation](https://image.nuxtjs.org/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)
