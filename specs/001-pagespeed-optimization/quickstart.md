# Developer Quickstart: PageSpeed Performance Optimization

**Feature**: 001-pagespeed-optimization
**Branch**: `001-pagespeed-optimization`
**Last Updated**: 2026-01-09

## Overview

This guide helps developers set up, implement, and verify PageSpeed optimizations for the AI Portal. Follow this guide to optimize mobile performance and achieve Core Web Vitals targets.

---

## Prerequisites

### Required Tools

Install these tools locally:

```bash
# Node.js 22 (already installed via Docker)
node --version  # Should be v22+

# Yarn package manager (already in use)
yarn --version

# Chrome DevTools (for manual testing)
# Open: chrome://inspect
```

### Environment Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Verify Nuxt version
yarn nuxi info
```

---

## Phase 1: Setup Performance Monitoring

### Step 1.1: Install web-vitals Library

```bash
cd frontend
yarn add web-vitals
```

### Step 1.2: Create Web Vitals Plugin

Create file: `frontend/plugins/web-vitals.client.ts`

```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  const sendToAnalytics = (metric: any) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta
      })
    }

    // Send to analytics (optional, implement if needed)
    // $fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   body: {
    //     name: metric.name,
    //     value: metric.value,
    //     url: window.location.href
    //   }
    // })
  }

  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
})
```

### Step 1.3: Verify Monitoring

```bash
# Start dev server
cd frontend
yarn dev

# Open browser console
# Navigate to http://localhost:8080
# Check console for [Web Vitals] logs
```

Expected output:
```
[Web Vitals] { name: 'FCP', value: 1234.5, rating: 'needs-improvement', ... }
[Web Vitals] { name: 'LCP', value: 3456.7, rating: 'poor', ... }
```

---

## Phase 2: Baseline Measurement

### Step 2.1: Run PageSpeed Insights

1. Open https://pagespeed.web.dev/
2. Enter URL: `https://portal.aiworkplace.ru`
3. Select: **Mobile** (not desktop)
4. Click **Analyze**
5. Wait for results (~2 minutes)

### Step 2.2: Record Baseline Metrics

Create file: `specs/001-pagespeed-optimization/baseline.json`

```json
{
  "date": "2026-01-09",
  "url": "https://portal.aiworkplace.ru",
  "device": "mobile",
  "metrics": {
    "FCP": "10.2s",
    "LCP": "18.3s",
    "TBT": "3650ms",
    "CLS": 0.017,
    "SpeedIndex": "18.7s",
    "PerformanceScore": 0
  }
}
```

---

## Phase 3: Implement Optimizations

### Priority 0: Critical Optimizations

#### 3.1: Install @nuxt/image

```bash
cd frontend
yarn add @nuxt/image
```

Update `frontend/nuxt.config.js`:

```javascript
export default {
  modules: [
    '@nuxt/image',
    // ... other modules
  ],

  image: {
    formats: ['webp', 'jpg'],
    domains: ['portal.aiworkplace.ru'],
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
}
```

#### 3.2: Lazy Load Heavy Components

Create file: `frontend/components/MermaidDiagram.vue`

```vue
<template>
  <ClientOnly>
    <div v-if="isLoaded" ref="diagramRef">
      <!-- Mermaid diagram renders here -->
    </div>
    <div v-else class="diagram-placeholder">
      <v-skeleton-loader type="image" height="300" />
      <v-btn @click="loadDiagram" variant="outlined" class="mt-4">
        Load Diagram
      </v-btn>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  diagram: string
}>()

const isLoaded = ref(false)

const loadDiagram = async () => {
  const mermaid = await import('mermaid')
  mermaid.default.initialize({ theme: 'neutral' })
  isLoaded.value = true
}
</script>
```

#### 3.3: Optimize CSS with Critical Extraction

Update `frontend/nuxt.config.js`:

```javascript
export default {
  css: [
    '~/assets/css/main.css'
  ],

  // Defer non-critical CSS
  vite: {
    build: {
      cssCodeSplit: true
    }
  }
}
```

Create `frontend/assets/css/main.css`:

```css
/* Critical CSS - inline this */
.v-app-bar { /* ... */ }
.v-container { /* ... */ }
.loading-skeleton { /* ... */ }

/* Non-critical - load async */
@import './animations.css';
```

---

### Priority 1: High-Impact Optimizations

#### 3.4: Configure Code Splitting

Create file: `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vuetify': ['vuetify'],
          'vue-vendor': ['vue', 'vue-router', '@vueuse/core'],
          'mermaid': ['mermaid']
        }
      }
    }
  }
})
```

#### 3.5: Fix PWA Service Worker

Update `frontend/nuxt.config.js`:

```javascript
export default {
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.aiworkplace\.ru\/api\//i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'strapi-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutes
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
              maxAgeSeconds: 2592000 // 30 days
            }
          }
        }
      ]
    }
  }
}
```

---

### Priority 2: Nice-to-Have Optimizations

#### 3.6: Optimize Fonts

Update `frontend/nuxt.config.js`:

```javascript
export default {
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/material-icons-subset.woff2',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
}
```

---

## Phase 4: Bundle Analysis

### Step 4.1: Install Bundle Analyzer

```bash
cd frontend
yarn add -D @rollup/plugin-visualizer
```

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import { visualizer } from '@rollup/plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: './dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### Step 4.2: Build and Analyze

```bash
cd frontend
yarn build

# Open the generated report
# File: frontend/dist/stats.html
```

**What to look for**:
- Large chunks (>500KB)
- Duplicate dependencies
- Unexpected dependencies

---

## Phase 5: Performance Testing

### Step 5.1: Manual Testing with Lighthouse

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select:
   - **Device**: Mobile
   - **Categories**: Performance, Accessibility, Best Practices, SEO
4. Click **Analyze page load**
5. Wait for results

### Step 5.2: Automated Testing with PageSpeed Insights

```bash
# Use PageSpeed Insights API (optional)
# Requires API key from Google Cloud Console

curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://portal.aiworkplace.ru&strategy=mobile&key=YOUR_API_KEY"
```

### Step 5.3: Check Success Criteria

Compare against [contracts/web-vitals.yaml](./contracts/web-vitals.yaml):

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| FCP | ≤1.8s | ? | ⬜ |
| LCP | ≤2.5s | ? | ⬜ |
| TBT | ≤200ms | ? | ⬜ |
| CLS | ≤0.1 | ? | ⬜ |
| Speed Index | ≤4s | ? | ⬜ |

---

## Phase 6: Verification

### Step 6.1: Verify Functionality

Test critical features still work:

- [ ] Speckit diagrams load correctly
- [ ] FAQ sections expand/collapse
- [ ] Search functionality works
- [ ] PWA install prompt appears
- [ ] Offline mode works (service worker)
- [ ] All pages render without errors

### Step 6.2: Verify Accessibility

```bash
# Use axe DevTools or similar
# Check for WCAG 2.1 AA compliance
```

### Step 6.3: Verify SEO

```bash
# Check source HTML for meta tags
curl https://portal.aiworkplace.ru | grep -i "og:"

# Verify Open Graph tags present
# Verify meta descriptions present
```

---

## Phase 7: Deployment

### Step 7.1: Build for Production

```bash
cd frontend
yarn build

# Verify build output
ls -lh dist/
```

### Step 7.2: Test Production Build Locally

```bash
cd frontend
yarn preview

# Open http://localhost:8080
# Test with Lighthouse
```

### Step 7.3: Deploy

```bash
# Follow existing deployment process
# (Docker, static hosting, etc.)
```

### Step 7.4: Post-Deployment Verification

1. Run PageSpeed Insights on production URL
2. Check web-vitals logs in browser console
3. Monitor for 48 hours
4. Compare with baseline metrics

---

## Rollback Procedures

### If Performance Degrades

```bash
# Revert to previous commit
git revert <commit-hash>

# Or rollback to previous branch
git checkout master
git merge --strategy=ours 001-pagespeed-optimization

# Rebuild and redeploy
yarn build
```

### If Feature Breaks

1. Check browser console for errors
2. Verify service worker isn't caching old assets:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister())
   })
   ```
3. Clear browser cache and reload
4. If broken, rollback immediately

---

## Troubleshooting

### Issue: web-vitals not logging

**Solution**: Ensure plugin is client-only (`.client.ts` suffix)

### Issue: Service worker not registering

**Solution**:
1. Check HTTPS is enabled (PWA requirement)
2. Check `nuxt.config.js` PWA config
3. Clear service worker cache in DevTools

### Issue: Images not converting to WebP

**Solution**:
1. Verify @nuxt/image module is loaded
2. Check Strapi URL is in `domains` whitelist
3. Check browser supports WebP

### Issue: Mermaid diagrams not loading

**Solution**:
1. Check `ClientOnly` component is used
2. Verify dynamic import syntax is correct
3. Check browser console for errors

---

## Resources

### Documentation

- [Nuxt 3 Performance](https://nuxt.com/docs/getting-started/performance)
- [@nuxt/image](https://image.nuxtjs.org/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals](https://web.dev/vitals/)

### Tools

- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- WebPageTest: https://www.webpagetest.org/

### Internal Docs

- [spec.md](./spec.md) - Feature specification
- [plan.md](./plan.md) - Implementation plan
- [research.md](./research.md) - Technical decisions
- [data-model.md](./data-model.md) - Data structures
- [contracts/web-vitals.yaml](./contracts/web-vitals.yaml) - SLA

---

## Next Steps

After completing this quickstart:

1. ✅ All Priority 0 optimizations implemented
2. ✅ All Priority 1 optimizations implemented
3. ✅ Baseline metrics recorded
4. ✅ Performance monitoring in place
5. ✅ Bundle analysis completed

Proceed to **Phase 2: Implementation Tasks** using `/speckit.tasks`

---

**Questions?**

See [research.md](./research.md) for technical decisions and rationale.
