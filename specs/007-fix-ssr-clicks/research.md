# Research: SSR Hydration Delay Root Cause Analysis

**Feature**: 007-fix-ssr-clicks
**Date**: 2026-01-14
**Status**: Investigation Phase

## Executive Summary

**Problem**: Users experience 5-10 second delay before card click handlers become active after page load in SSR mode. HTML renders immediately, but JavaScript hydration lags behind.

**User Requirement**: **SSR MUST remain enabled** for SEO benefits and fast First Contentful Paint (explicitly clarified).

**Root Cause**: **UNKNOWN** - requires diagnostic investigation. Possible causes include:
1. Large bundle size delaying hydration (1.2MB+ JavaScript)
2. Server-side blocking operations delaying HTML response
3. ClientOnly wrappers delaying hydration
4. Improper component import patterns
5. Configuration issues with Nuxt SSR settings

**Approach**: Investigation-first → identify actual cause → implement targeted fix (not blanket changes).

---

## Constitutional Context

**Principle V** states: "Основной режим: `ssr: false` (SPA)"

**Current Reality**: `nuxt.config.js` has `ssr: true` (SSR enabled)

**User Clarification**: "Keep SSR enabled for SEO and fast First Contentful Paint"

**Resolution**: **Justified exception** to Principle V based on explicit business requirements:
- SEO benefits critical for public-facing content
- Fast First Contentful Paint improves perceived performance
- Content must be indexed by search engines

**Constitutional Action**: Document this exception in ADR, optimize SSR hydration instead of disabling.

---

## Research Questions

### Question 1: What is the current bundle size and composition?

**Investigation Steps**:
1. Check `.nuxt/dist/client/_nuxt/` for bundle sizes
2. Identify largest chunks (Vuetify, Mermaid, custom code)
3. Measure download time on standard broadband
4. Compare with Nuxt 3 SSR best practices

**Expected Finding**: If bundle > 2MB → optimize bundle size to reduce hydration delay

**Alternative**: If bundle < 1MB → investigate other areas (server blocking, configuration)

**Status**: NEEDS MEASUREMENT

---

### Question 2: Are server-side operations blocking HTML response?

**Investigation Steps**:
1. Check `nuxt.config.js` SSR configuration
2. Review data fetching patterns in composables
3. Measure server response time (TTFB - Time to First Byte)
4. Check if async operations block HTML generation

**Expected Finding**: If server response > 2 seconds → move data fetching to client-side (onMounted)

**Alternative**: If server response < 500ms → investigate client-side hydration issues

**Status**: NEEDS MEASUREMENT

---

### Question 3: How long does hydration actually take?

**Investigation Steps**:
1. Add performance markers to `app.vue`:
   ```javascript
   onMounted(() => {
     performance.mark('app-mounted')
     const navStart = performance.getEntriesByType('navigation')[0]
     const tti = performance.now() - navStart.startTime
     console.log('Time to Interactive:', tti, 'ms')
   })
   ```
2. Use Chrome DevTools Performance tab to measure hydration
3. Look for "Hydrate" events in flame chart
4. Measure gap between First Contentful Paint and TTI

**Expected Finding**: Identify if hydration takes 5-10 seconds (confirm problem) or less (investigate other issues)

**Status**: NEEDS MEASUREMENT

---

### Question 4: Are there hydration errors in console?

**Investigation Steps**:
1. Load page in browser with DevTools open
2. Check Console tab for hydration mismatch warnings
3. Look for Vue hydration errors (e.g., "Hydration node mismatch")
4. Verify all event handlers are properly bound

**Expected Finding**: If hydration errors present → fix mismatches, ensure proper SSR/client consistency

**Alternative**: If no errors → investigate performance issues (bundle size, server blocking)

**Status**: NEEDS INSPECTION

---

### Question 5: Are critical components loaded synchronously?

**Investigation Steps**:
1. Check `PromptGrid.vue` import pattern for `EnhancedPromptCard`
2. Check `index.vue` import pattern for `PromptGrid`
3. Verify no `defineAsyncComponent` for critical interactive elements
4. Check for `<ClientOnly>` wrappers on card components

**Expected Finding**: If critical components async → convert to sync imports for immediate hydration

**Alternative**: If components sync → investigate other areas

**Status**: NEEDS CODE REVIEW

---

### Question 6: Are there configuration issues?

**Investigation Steps**:
1. Check `nuxt.config.js` for experimental SSR features
2. Review `routeRules` for pre-rendering settings
3. Check for custom server middleware
4. Verify PWA configuration doesn't conflict with SSR

**Expected Finding**: If experimental features enabled → test with standard configuration

**Alternative**: If standard config → investigate performance issues

**Status**: NEEDS REVIEW

---

## Diagnostic Tools

### 1. Chrome DevTools Performance Tab
- Record page load
- Look for "Hydrate" markers
- Measure TTI (Time to Interactive)
- Identify blocking JavaScript

### 2. Console Logging
```javascript
// Add to app.vue
onMounted(() => {
  console.log('='.repeat(50))
  console.log('📊 PERFORMANCE METRICS')
  console.log('='.repeat(50))
  const navStart = performance.getEntriesByType('navigation')[0]
  console.log('DOM Content Loaded:', navStart.domContentLoadedEventEnd, 'ms')
  console.log('Time to Interactive:', performance.now(), 'ms')
  console.log('SSR Mode:', import.meta.env.SSR ? 'enabled' : 'disabled')
  console.log('='.repeat(50))
})
```

### 3. Bundle Analysis
```bash
cd frontend
yarn build
ls -lh .nuxt/dist/client/_nuxt/*.js | sort -k5 -h
```

### 4. Server Timing Logs
- Check server response time in Network tab
- Look for blocking operations
- Measure TTFB (Time to First Byte)

---

## Expected Root Causes (Probability Ranking)

Based on problem description and Nuxt 3 SSR patterns:

1. **Bundle Size (40%)**: 1.2MB+ JavaScript takes 5-10 seconds to parse and execute
2. **Server Blocking (25%)**: Async data fetching blocks HTML response
3. **Component Loading (15%)**: Async imports delay critical component hydration
4. **Configuration Issues (10%)**: Experimental features or incorrect settings
5. **Hydration Errors (10%)**: Mismatches between server and client rendering

---

## Decision Framework

After diagnostic investigation, root cause will determine fix strategy:

### If Bundle Size Issue:
- Optimize bundle (code splitting, tree shaking)
- Lazy-load non-critical libraries (Mermaid)
- Defer non-critical JavaScript
- **Keep SSR enabled**

### If Server Blocking Issue:
- Move data fetching from server to client (onMounted)
- Implement progressive data loading
- Add loading states during fetch
- **Keep SSR enabled**

### If Component Loading Issue:
- Convert critical components to sync imports
- Remove unnecessary `<ClientOnly>` wrappers
- Ensure card components load immediately
- **Keep SSR enabled**

### If Configuration Issue:
- Adjust Nuxt SSR settings
- Remove experimental features if problematic
- Optimize route rules
- **Keep SSR enabled**

### If Hydration Errors:
- Fix SSR/client mismatches
- Ensure consistent rendering
- Use `v-if` instead of `v-show` for conditional hydration
- **Keep SSR enabled**

---

## Measurement Targets

**Current State** (Needs Verification):
- First Contentful Paint: ~500ms (estimated)
- Time to Interactive: 5000-10000ms ❌
- Click Response Time: 5000-10000ms ❌
- Bundle Size: ~1.2MB (estimated)

**Target State** (With SSR Optimization):
- First Contentful Paint: < 1000ms ✅
- Time to Interactive: < 2000ms ✅
- Click Response Time: < 1000ms ✅
- Bundle Size: < 1MB (optimized)

---

## Unknowns Requiring Investigation

1. **Root cause** of 5-10 second delay (currently unknown)
2. **Actual bundle size** and composition (needs measurement)
3. **Server response time** characteristics (needs profiling)
4. **Hydration error presence** (needs console inspection)
5. **Component import patterns** (needs code review)
6. **Nuxt configuration** impact (needs review)

---

## Next Steps

1. **Diagnostic Investigation** (2-3 hours timebox):
   - Measure bundle size
   - Profile hydration timing
   - Check console for errors
   - Review component imports
   - Test configuration changes

2. **Document Findings**:
   - Identify actual root cause
   - Measure baseline performance
   - Recommend targeted fix

3. **Implement Fix**:
   - Apply specific optimization based on findings
   - NOT blanket changes
   - Keep SSR enabled

4. **Verify**:
   - Measure TTI < 2000ms
   - Test click response < 1000ms
   - Confirm SSR still enabled

---

## Risk Assessment

**Low Risk**: ✅
- Diagnostic investigation is non-destructive
- Measurements don't break existing functionality
- Can iterate on fixes based on findings

**Medium Risk**: ⚠️
- Root cause may be difficult to identify
- Multiple factors may contribute
- May require trial-and-error testing

**High Risk**: ❌
- None - investigation is safe and reversible

---

## Alternative Approaches (If Investigation Fails)

If root cause cannot be identified within timebox (2-3 hours):

1. **Apply Safest Optimizations**:
   - Optimize bundle size (code splitting)
   - Move non-critical data fetching to client
   - Remove unnecessary ClientOnly wrappers
   - Defer non-critical JavaScript

2. **Accept Partial Fix**:
   - Reduce delay from 5-10s to 2-3s
   - Continue investigation in parallel
   - Iterate on optimizations

3. **Last Resort** (Only if user approves):
   - Document tradeoffs of SSR vs SPA
   - Present ADR for constitutional exception
   - Get explicit approval to disable SSR

**User Decision**: "Continue investigating until found" - prioritize thorough diagnosis over quick fixes.

---

## Conclusion

**Status**: Ready to begin diagnostic investigation.

**Key Principle**: SSR MUST remain enabled per user requirement. We optimize SSR hydration, not disable SSR.

**Approach**: Investigate first → identify cause → implement targeted fix → verify.

**Success Criteria**: TTI < 2000ms, click response < 1000ms, SSR still enabled.

---

**Next**: Proceed to data-model.md and quickstart.md to complete planning phase.
