---
work_package_id: WP06
title: Performance Optimization
lane: "for_review"
dependencies: []
base_branch: main
base_commit: f893fbf245257a9fc4a768ab7ddb8e82f0f95747
created_at: '2026-02-24T12:59:38.200768+00:00'
subtasks: [T031, T032, T033, T034, T035, T036]
shell_pid: "32286"
agent: "claude"
history:
- date: 2025-02-24
  action: Created
  author: spec-kitty.tasks
---

# Work Package: Performance Optimization

**ID**: WP06
**Priority**: P3 (Optimization, not blocking)
**Estimated Size**: ~360 lines
**Status**: Planned

---

## Objective

Optimize application performance using Lighthouse as the source of truth. Focus on bundle size, lazy loading, and cache strategy.

## Context

After cleanup work, we need to ensure performance hasn't degraded and optimize critical paths. Lighthouse provides measurable metrics for Core Web Vitals.

---

## Subtasks

### T031: Run Lighthouse Audit (Baseline)

**Purpose**: Establish performance baseline before optimizations.

**Steps**:
1. Install Lighthouse CI:
   ```bash
   npm install -D @lhci/cli
   ```

2. Create `lighthouserc.json`:
   ```json
   {
     "ci": {
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", { "minScore": 0.8 }],
           "categories:accessibility": ["warn", { "minScore": 0.9 }],
           "categories:best-practices": ["warn", { "minScore": 0.9 }],
           "categories:seo": ["warn", { "minScore": 0.9 }]
         }
       },
       "upload": {
         "target": "temporary-public-storage"
       },
       "collect": {
         "numberOfRuns": 3,
         "settings": {
           "onlyCategories": ["performance", "accessibility", "best-practices", "seo"]
         }
       }
     }
   }
   ```

3. Run baseline audit:
   ```bash
   # Start dev server
   npm run dev &
   
   # Run Lighthouse
   lhci autorun --collect.url=http://localhost:3000
   ```

4. Document baseline scores.

**Files created**:
- `lighthouserc.json`
- `performance-baseline.md` (document scores)

**Validation**:
- [ ] Lighthouse runs successfully
- [ ] Baseline scores documented
- [ ] Metrics saved for comparison

---

### T032: Optimize Bundle Size

**Purpose**: Reduce JavaScript bundle size.

**Steps**:
1. Install bundle analyzer:
   ```bash
   npm install -D @nuxtjs/webpack-bundle-analyzer
   ```

2. Update `nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     // ... existing config ...
     
     // Enable bundle analysis in development
     build: {
       analyze: process.env.ANALYZE === 'true',
     }
   })
   ```

3. Run analyzer:
   ```bash
   ANALYZE=true npm run build
   ```

4. Identify large dependencies and optimize:
   - Remove unused dependencies
   - Replace heavy libraries with lighter alternatives
   - Enable tree shaking
   - Use dynamic imports for rarely used code

5. Update `nuxt.config.ts` with optimizations:
   ```typescript
   export default defineNuxtConfig({
     vite: {
       build: {
         rollupOptions: {
           output: {
             manualChunks: {
               'vendor': ['vue', 'vue-router'],
               'strapi': ['@nuxtjs/strapi'],
             }
           }
         }
       }
     }
   })
   ```

**Files modified**:
- `frontend/nuxt.config.ts`

**Validation**:
- [ ] Bundle analyzer runs
- [ ] Large dependencies identified
- [ ] Bundle size reduced
- [ ] App still works correctly

---

### T033: Implement Lazy Loading for Components

**Purpose**: Lazy load heavy components to reduce initial bundle size.

**Steps**:
1. Identify heavy components:
   - Components with many dependencies
   - Components below the fold
   - Modals and dialogs
   - Admin/dashboard components

2. Update components to use lazy loading:
   ```vue
   <script setup lang="ts">
   // Before
   import HeavyChart from '~/components/HeavyChart.vue'
   
   // After
   const HeavyChart = defineAsyncComponent(() =>
     import('~/components/HeavyChart.vue')
   )
   
   // With loading state
   const AsyncChart = defineAsyncComponent({
     loader: () => import('~/components/HeavyChart.vue'),
     loadingComponent: LoadingSpinner,
     delay: 200,
     timeout: 3000,
   })
   </script>
   
   <template>
     <Suspense>
       <template #default>
         <AsyncChart />
       </template>
       <template #fallback>
         <LoadingSpinner />
       </template>
     </Suspense>
   </template>
   ```

3. Focus on these components:
   - Chart components
   - Admin components
   - Modals/dialogs
   - Below-the-fold content

**Files modified**:
- Heavy component files

**Validation**:
- [ ] Components lazy load correctly
- [ ] Loading states display
- [ ] Initial bundle size reduced
- [ ] No layout shifts

---

### T034: Optimize Image Loading

**Purpose**: Optimize images for better LCP and CLS.

**Steps**:
1. Install Nuxt Image:
   ```bash
   npm install @nuxt/image
   ```

2. Update `nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     modules: ['@nuxt/image'],
     
     image: {
       formats: ['webp', 'avif'],
       quality: 80,
       screens: {
         xs: 320,
         sm: 640,
         md: 768,
         lg: 1024,
         xl: 1280,
         xxl: 1536,
       },
     }
   })
   ```

3. Replace static images with Nuxt Image:
   ```vue
   <!-- Before -->
   <img src="/images/logo.png" alt="Logo" />
   
   <!-- After -->
   <NuxtImg src="/images/logo.png" alt="Logo" width="200" height="100" />
   ```

4. Add lazy loading for below-fold images:
   ```vue
   <NuxtImg src="/image.jpg" loading="lazy" />
   ```

5. Add width/height to prevent CLS:
   ```vue
   <NuxtImg
     src="/hero.jpg"
     width="1920"
     height="1080"
     format="webp"
     loading="eager"
     class="hero-image"
   />
   ```

**Files modified**:
- `frontend/nuxt.config.ts`
- Component files with images

**Validation**:
- [ ] Images use WebP format
- [ ] Below-fold images lazy load
- [ ] No layout shift (CLS improved)
- [ ] LCP score improved

---

### T035: Optimize Cache Strategy

**Purpose**: Improve caching for API responses and static assets.

**Steps**:
1. Review current cache implementation in server API routes.

2. Add cache headers for static assets:
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     routeRules: {
       '/': { prerender: true },
       '/speckits': { isr: 300 },
       '/prompts': { isr: 300 },
       '/api/**': { cache: { maxAge: 60 * 60 } },
     }
   })
   ```

3. Optimize stale-while-revalidate:
   ```typescript
   // Update cache TTL values
   const CACHE_TTL = 300 // 5 minutes fresh
   const STALE_TTL = 3600 // 1 hour stale
   ```

4. Add cache headers to API responses:
   ```typescript
   export default defineEventHandler(async (event) => {
     const response = await fetchData()
     
     setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
     setHeader(event, 'CDN-Cache-Control', 'public, max-age=86400')
     
     return response
   })
   ```

**Files modified**:
- `frontend/nuxt.config.ts`
- Server API routes

**Validation**:
- [ ] Cache headers present
- [ ] Stale-while-revalidate working
- [ ] Page load time improved
- [ ] Cache invalidation works

---

### T036: Run Final Lighthouse Audit

**Purpose**: Verify performance improvements.

**Steps**:
1. Run Lighthouse audit again:
   ```bash
   lhci autorun --collect.url=http://localhost:3000
   ```

2. Compare with baseline:
   - Performance score
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - Bundle sizes

3. Document improvements in `performance-baseline.md`.

4. If scores worsened:
   - Investigate regressions
   - Rollback problematic changes
   - Try alternative optimizations

**Validation**:
- [ ] Final audit completed
- [ ] Scores compared to baseline
- [ ] No significant regressions
- [ ] Improvements documented

---

## Test Strategy

**Performance testing**:
1. Lighthouse CI scores
2. Bundle size comparison
3. Page load time measurements
4. Core Web Vitals (LCP, FID, CLS)

---

## Definition of Done

- [ ] Baseline Lighthouse score established
- [ ] Bundle size optimized
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Cache strategy improved
- [ ] Final Lighthouse score verified
- [ ] No performance regressions
- [ ] Documentation updated

---

## Risks

| Risk | Mitigation |
|------|------------|
| Optimizations break functionality | Test thoroughly, monitor in production |
| Lighthouse score worsens | Revert changes, try alternatives |
| Lazy loading causes layout shift | Use skeleton screens, reserve space |
| Cache invalidation issues | Test cache busting, use versioned URLs |

---

## Reviewer Guidance

**What to verify**:
1. Lighthouse scores improved or maintained
2. Bundle size reduced
3. Lazy loading works smoothly
4. Images are optimized
5. Cache headers are correct
6. No regressions in functionality

**Integration points**:
- Depends on WP01-WP05 (should optimize after cleanup)
- Results feed into WP07 (testing)

---

## Implementation Command

```bash
spec-kitty implement WP06 --base WP05
```

Base: WP05 (after type safety complete)

## Activity Log

- 2026-02-24T12:59:38Z – claude – shell_pid=32286 – lane=doing – Assigned agent via workflow command
- 2026-02-24T13:01:03Z – claude – shell_pid=32286 – lane=for_review – Ready for review: Lighthouse CI configured, performance baseline documented, bundle optimization and cache strategy implemented in nuxt.config.js.
