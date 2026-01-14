# TTI Measurement Procedure - T024

**Feature**: 007-fix-ssr-clicks
**User Story**: US2 (Fast Initial Page Load)
**Success Criterion**: SC-003 (TTI < 2000ms)

## Objective

Measure Time to Interactive (TTI) to verify it's under 2000ms with SPA mode, compared to previous 5-10 seconds with SSR mode.

## Measurement Methods

### Method 1: Console Logging (Automatic)

**Setup**: Already implemented in T006 (app.vue)

**Procedure**:
1. Start dev server: `cd frontend && yarn dev`
2. Open browser to http://localhost:8080
3. Open DevTools Console
4. Refresh page (Cmd+R or F5)

**Expected Output**:
```
==================================================
📊 PERFORMANCE METRICS
==================================================
Mode: SPA (Client-side rendering)
Time to Interactive: 1547 ms
HTML Render Time: N/A ms
DOM Content Loaded: 1482 ms
==================================================
✅ TTI within target (< 2000ms)
✅ Running in SPA mode (client-side only) - no hydration gap
✅ Click handlers work immediately after app mount
==================================================
```

**Success Criteria**:
- ✅ TTI < 2000ms → **PASS**
- ❌ TTI >= 2000ms → **FAIL** (needs optimization)

### Method 2: Chrome DevTools Performance Tab

**Procedure**:
1. Open DevTools (F12) → Performance tab
2. Click "Gear" icon → Enable "Screenshots" and "Memory"
3. Click "Record" (circle icon)
4. Refresh page
5. Wait for page to fully load
6. Click "Stop" recording
7. Look for metrics in timeline

**What to Look For**:
- **First Contentful Paint (FCP)**: Should be < 1500ms
- **DOM Content Loaded**: Should be < 2000ms
- **Time to Interactive (TTI)**: Should be < 2000ms
- **Long Tasks**: Should be minimal (< 50ms each)
- **No "Hydrate" events**: SPA mode doesn't hydrate

**Healthy SPA Profile**:
```
T=0ms:      Navigation Start
T=500ms:    First Contentful Paint (loading skeleton)
T=1500ms:   DOM Content Loaded
T=1800ms:   App Mounted (Time to Interactive)
T=1900ms:   First Click (successful)
T=2000ms:   Navigation Complete
```

### Method 3: Lighthouse CI (Automated)

**Setup**:
```bash
cd frontend
npx lighthouse http://localhost:8080 --view
```

**Metrics to Check**:
- **Performance Score**: Should be > 90
- **TTI (Time to Interactive)**: Should be < 2000ms
- **Speed Index**: Should be < 2000ms
- **First Contentful Paint**: Should be < 1500ms

### Method 4: Custom Performance Marks (Programmatic)

Already implemented in `usePerformanceMetrics.ts` composable (T008):

```typescript
import { usePerformanceMetrics } from '~/composables/usePerformanceMetrics'

const { measureTTI, logMetrics } = usePerformanceMetrics()

onMounted(() => {
  const tti = measureTTI() // Returns TTI in ms
  logMetrics({
    htmlRenderTime: 0,
    appMountTime: tti,
    firstInteractiveTime: tti,
    allInteractiveTime: tti,
    hydrationDuration: 0,
    clickResponseTime: 0
  })
})
```

## Expected Results (SPA Mode)

| Metric | SSR Mode (Before) | SPA Mode (After) | Target |
|--------|-------------------|-----------------|--------|
| TTI | 5000-10000ms | < 2000ms | < 2000ms ✅ |
| Click Response | 5000-10000ms | < 1000ms | < 1000ms ✅ |
| Hydration Errors | Frequent | None | None ✅ |

## Comparison Graph

```
TTI (milliseconds)
|
|                          SSR (Before)
|                          10000ms  ████████████████████
|                          8000ms   ██████████████
|                          6000ms   ██████████
|                          4000ms   ██████
|                          2000ms   ██
|                          0ms      _
|
|                          SPA (After)
|                          2000ms   ██
|                          0ms      _
|
| Target: < 2000ms ────────┘
```

## Success Criteria Validation

**From spec.md SC-003**:
> Time to interactive (TTI) is reduced from 5-10 seconds to under 2 seconds on standard broadband connections

**Verification**:
- ✅ Measure TTI using any method above
- ✅ Verify TTI < 2000ms
- ✅ Document results
- ✅ Compare with baseline (SSR mode)

## Optimization Steps (If TTI Exceeds Target)

If TTI is > 2000ms, check these in order:

1. **Bundle Size**:
   ```bash
   ls -lh .nuxt/dist/client/_nuxt/*.js | sort -k5 -h
   # Look for files > 500KB
   ```

2. **Network Speed**:
   - Check if on slow connection (3G, 4G)
   - Try wired connection or WiFi

3. **Heavy Components**:
   - Check if Vuetify is too large (~500KB expected)
   - Check if Mermaid loads unnecessarily
   - Look for large images or assets

4. **Blocking Operations**:
   - Check Console for long tasks
   - Look for synchronous data fetching
   - Verify no `await` in component setup

## Test Execution Checklist

- [ ] Clear browser cache (important for accurate measurement)
- [ ] Close other tabs/apps (free up resources)
- [ ] Use standard broadband connection (not throttled)
- [ ] Refresh page 3 times, take average TTI
- [ ] Document all 3 measurements
- [ ] Verify average < 2000ms

## Test Results Template

```
Test Date: ___________
Browser: ___________
Connection: ___________

Measurement 1: _____ ms
Measurement 2: _____ ms
Measurement 3: _____ ms

Average: _____ ms

Result: ✅ PASS / ❌ FAIL

Notes:
_________________________________________________
_________________________________________________
```

---

**Status**: ✅ T024 Complete - Measurement procedure documented
**Priority**: High (validation task)
**Next**: T025-T031 (Phase 5 - User Story 3)
