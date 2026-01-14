# Baseline Performance Metrics

**Feature**: 007-fix-ssr-clicks (SSR → SPA Migration)
**Date**: 2026-01-14
**Configuration**: SPA Mode (`ssr: false`)

## Before Migration (SSR Mode - Previous State)

**Configuration**: `ssr: true`, routeRules with pre-rendering

| Metric | Value | Status |
|--------|-------|--------|
| First Contentful Paint (FCP) | ~500ms | ✅ Fast |
| Time to Interactive (TTI) | 5000-10000ms | ❌ Too slow |
| Click Response Time | 5000-10000ms | ❌ Broken |
| Hydration Errors | Frequent | ❌ Present |
| Click Capture Rate | < 50% | ❌ Lost clicks |

**Problem**: HTML renders quickly but JavaScript takes 5-10 seconds to hydrate, during which clicks don't work.

## After Migration (SPA Mode - Target)

**Configuration**: `ssr: false`, no routeRules

| Metric | Target | Success Criteria |
|--------|--------|------------------|
| First Contentful Paint (FCP) | < 1500ms | Acceptable trade-off |
| Time to Interactive (TTI) | < 2000ms | SC-003 ✅ |
| Click Response Time | < 1000ms | SC-001 ✅ |
| Hydration Errors | None | SC-004 ✅ |
| Click Capture Rate | 100% | SC-002 ✅ |
| Navigation Start | < 500ms | SC-008 ✅ |

**Solution**: No hydration gap - click handlers work immediately when app mounts.

## Expected Performance Profile

**SPA Mode Timeline**:
```
T=0ms:      Navigation Start
T=500ms:    First Contentful Paint (loading skeleton)
T=1500ms:   DOM Content Loaded
T=1800ms:   App Mounted (Time to Interactive)
T=1900ms:   First Click (successful - handler works)
T=2000ms:   Navigation Complete

Total: 2 seconds ✅
```

## How to Measure

### 1. Console Logging
Open browser DevTools Console on page load. You should see:
```
==================================================
📊 PERFORMANCE METRICS
==================================================
Mode: SPA (Client-side rendering)
Time to Interactive: < 2000 ms
HTML Render Time: N/A ms
DOM Content Loaded: < 2000 ms
==================================================
✅ TTI within target (< 2000ms)
✅ Running in SPA mode (client-side only) - no hydration gap
✅ Click handlers work immediately after app mount
==================================================
```

### 2. Click Logging
Click any card immediately after page load. You should see:
```
🖱️ Card Clicked: [Card Title]
✅ Navigation Started: < 500 ms
```

### 3. Chrome DevTools Performance Tab
1. Open DevTools (F12) → Performance tab
2. Press "Record" (circle icon)
3. Reload page
4. Click a card immediately when visible
5. Stop recording
6. Look for:
   - "First Contentful Paint" marker
   - "Time to Interactive" < 2000ms
   - No "Hydrate" events (SPA mode has none)

## Success Criteria Validation

All 8 success criteria should pass:

- ✅ **SC-001**: Click response within 1 second of page visible
- ✅ **SC-002**: 100% of card click events captured
- ✅ **SC-003**: TTI reduced from 5-10s to under 2s
- ✅ **SC-004**: No hydration mismatch errors in console
- ✅ **SC-005**: 0% users experience delay (no hydration gap)
- ✅ **SC-006**: Bundle size not increased (same JS, different loading)
- ✅ **SC-007**: 95%+ first-click success rate
- ✅ **SC-008**: Navigation starts within 500ms of click

## Verification Steps

1. Start dev server: `cd frontend && yarn dev`
2. Open http://localhost:8080
3. Open DevTools Console
4. **IMMEDIATELY** click the first card you see
5. Check Console for performance metrics and click logs
6. Verify navigation started within 1 second

## Expected Results

**Immediate click test**:
- ✅ Click responds within 1 second
- ✅ Navigation starts immediately
- ✅ No "click lost" errors
- ✅ Console shows TTI < 2000ms

**Previous behavior (SSR)**:
- ❌ Click does nothing for 5-10 seconds
- ❌ Must wait for hydration to complete
- ❌ Poor user experience

## Notes

- SPA mode is the constitutional default
- This migration fixes the configuration drift
- SEO is acceptable for internal tool (not public-facing)
- PWA caching provides instant subsequent loads
- Bundle size unchanged (same JavaScript, different delivery)

---

**Status**: Baseline documented and ready for comparison
**Next**: Proceed to Phase 3 (User Story 1 implementation)
