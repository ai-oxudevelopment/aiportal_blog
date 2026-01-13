# Research: Fix Card Click Interaction Delay

**Feature**: 001-fix-card-clicks
**Date**: 2026-01-10
**Status**: Complete

## Root Cause Analysis

### Problem

Interactive elements (cards, navigation links) are unclickable for 30-50 seconds after page load, then suddenly become responsive. This is a critical usability regression introduced by PageSpeed optimization changes.

### Investigation

1. **User Report**: "After page load - elements are unclickable, only 30-50s after page load elements become clickable again and navigation works"

2. **Code Analysis**: Found aggressive multi-level lazy loading introduced in commit `fd101a1` (PageSpeed optimization feature):

   **Chain of Lazy Loading**:
   ```
   Home Page (index.vue)
   ├─> defineAsyncComponent(PromptGrid)        ← Level 1 lazy
   │     └─> defineAsyncComponent(EnhancedPromptCard)  ← Level 2 lazy
   │           └─> @click="goToPrompt"         ← Click handler here!
   │
   ├─> defineAsyncComponent(CategoriesFilter)  ← Level 1 lazy
   ├─> defineAsyncComponent(MobileCategoriesFilter)  ← Level 1 lazy
   └─> defineAsyncComponent(PromptSearch)      ← Level 1 lazy
   ```

3. **Component Details**:
   - **Home page** (`pages/index.vue`, lines 62-73): ALL main components lazy-loaded
   - **PromptGrid** (`components/prompt/PromptGrid.vue`, lines 42-44): Card component lazy-loaded
   - **EnhancedPromptCard** (`components/prompt/EnhancedPromptCard.vue`, line 17): Click handler `@click="goToPrompt"`
   - **PromptCard** (`components/prompt/PromptCard.vue`, line 2): Click handler `@click="goToPrompt"`

4. **Nuxt Configuration** (`nuxt.config.js`):
   - SSR enabled (line 2): Server-side rendering
   - Prerendering for `/` and `/speckits` (lines 7-8)
   - Deferred CSS loading (line 116): `animations.css` deferred with print media trick
   - PWA service worker with `registerType: 'autoUpdate'` (line 191)

5. **Vite Configuration** (`vite.config.js`):
   - Manual chunk splitting (lines 23-40)
   - Mermaid lazy-loaded (line 32)
   - CSS code splitting enabled (line 17)

### Root Cause

**Multi-Level Lazy Loading Cascade**:

The PageSpeed optimization introduced aggressive lazy loading to reduce Total Blocking Time (TBT), but created a waterfall effect where:

1. **Page loads** → User sees empty/skeleton state
2. **PromptGrid chunk loads** → Takes time (network + parse + execute)
3. **EnhancedPromptCard chunk loads** → Takes more time (network + parse + execute)
4. **Click handlers finally work** → After cascade completes

**Why 30-50 seconds?**

Possible factors:
- **Sequential chunk loading**: Each `defineAsyncComponent` creates a separate HTTP request
- **Large chunks**: Components may be bundled with heavy dependencies (Vuetify, Tailwind)
- **Network latency**: Multiple round trips for each chunk
- **No preloading**: Chunks aren't preloaded, so browser waits until component is requested
- **Chunk priority**: Lazy-loaded chunks may be deprioritized by browser
- **Service worker interference**: PWA service worker may delay chunk loading
- **Hydration delay**: SSR hydration may not complete until chunks load

**Why "suddenly becomes clickable"?**

All chunks finish loading → Vue components render → Click handlers attached → Interactivity restored

## Solution Options

### Option A: Remove Multi-Level Lazy Loading (CHOSEN)

**Decision**: Remove `defineAsyncComponent` from PromptGrid and EnhancedPromptCard, keeping them synchronous in the initial bundle.

**Rationale**:
- **Critical interactivity**: Cards are the primary UI element users interact with
- **User expectation**: Users expect to click immediately after page load
- **Multi-level cascade**: Two levels of lazy loading creates unacceptable delay
- **Preserves optimization**: Keep lazy loading for filter/search components (less critical)
- **Minimal bundle increase**: Cards are likely small relative to framework code

**Implementation**:
1. Remove `defineAsyncComponent` wrapper from `PromptGrid` in `pages/index.vue`
2. Remove `defineAsyncComponent` wrapper from `EnhancedPromptCard` in `PromptGrid.vue`
3. Keep `defineAsyncComponent` for `CategoriesFilter`, `MobileCategoriesFilter`, `PromptSearch` (less critical for initial interactivity)
4. Verify bundle size increase is acceptable
5. Test that click handlers work immediately after page load

**Risks**:
- **Bundle size increase**: Initial bundle will be larger
- **Longer TBT**: May increase Total Blocking Time (but users prefer functional UI)
- **Need to measure**: Must verify PageSpeed metrics don't degrade significantly

**Impact**:
- Cards render immediately after page load
- Click handlers attached immediately
- Users can interact within 1 second of page load
- Preserves some optimization benefits (lazy filters, search)

**Preserved Optimizations**:
- Lazy-loaded filters and search (less critical)
- SSR/hybrid rendering (SEO, fast FCP)
- Prerendering for static pages
- Image optimization
- Font preloading
- Critical CSS inlining
- PWA caching

### Option B: Add Chunk Preloading (REJECTED)

**Decision**: REJECTED

**Rationale**:
- **Complexity**: Requires calculating chunk names and adding preload links
- **Brittle**: Chunk names change with build configuration
- **Partial fix**: Preloading helps but doesn't eliminate cascade delay
- **Still async**: Components still load asynchronously, just faster
- **Implementation overhead**: Need to generate chunk names dynamically

**Why Not**:
- Preload hints would need to be added to `nuxt.config.js` head section
- Chunk names are hash-based and change with each build
- Would need build-time script to generate correct chunk URLs
- Adds complexity without guaranteeing immediate interactivity

### Option C: Add Loading States with Immediate Fallback (REJECTED)

**Decision**: REJECTED

**Rationale**:
- **UX band-aid**: Doesn't fix root cause, just hides it
- **Still slow**: Users still wait 30-50 seconds, just see a loading indicator
- **Frustrating**: Loading spinners for nearly a minute is terrible UX
- **Doesn't restore interactivity**: Cards still don't work until chunks load

**Why Not**:
- Adding `<Suspense>` boundaries or loading states doesn't make cards clickable faster
- Users want to click immediately, not watch a spinner
- Doesn't address the core issue of excessive lazy loading

### Option D: Reduce to Single-Level Lazy Loading (REJECTED)

**Decision**: REJECTED

**Rationale**:
- **Still async**: Single-level lazy loading still has delay
- **Uncertain timing**: Can't guarantee cards load within 1 second
- **Better but not good enough**: Users need immediate interactivity
- **No clear benefit**: If we need cards immediately, don't lazy load them

**Why Not**:
- If we keep `PromptGrid` lazy but make `EnhancedPromptCard` synchronous, cards still wait for PromptGrid chunk
- If we make `PromptGrid` synchronous but keep `EnhancedPromptCard` lazy, cards still wait for card chunk
- Only removing lazy loading completely guarantees immediate interactivity

## Technical Details

### Vue defineAsyncComponent Behavior

From [Vue 3 documentation](https://vuejs.org/guide/components/async.html):

> Async components are useful when you want to defer the loading of a component until it is actually needed.

**How it works**:
1. Component wrapper created with `defineAsyncComponent()`
2. When component is rendered in template, Vue triggers chunk load
3. Browser fetches chunk from network
4. Chunk is parsed and executed
5. Component is instantiated and rendered
6. Child components can then load their async chunks

**Problem**: Multi-level async creates a waterfall where parent chunk loads before child chunk can start loading.

### SSR + Async Components

In SSR mode:
1. Server renders HTML with placeholders for async components
2. Client receives HTML
3. Client hydration begins
4. Async chunks load
5. Hydration completes for each chunk as it loads
6. Event handlers attached after hydration

**Issue**: If async chunks take 30-50 seconds to load, hydration is incomplete and event handlers aren't attached.

### Chunk Loading Performance

**Factors affecting chunk load time**:
- Network latency (RTT)
- Chunk size
- Server response time
- Concurrent connection limits (browser typically 6 per domain)
- TLS negotiation time
- Service worker interception (if enabled)

**Multi-level lazy loading amplifies these factors**:
- Each level adds at least one RTT
- Sequential loading prevents parallelization
- No opportunity for browser to prioritize critical chunks

### Measurement Approach

After fix implementation:
1. **Chrome DevTools Performance tab**: Record page load, measure Time to Interactive (TTI)
2. **Network tab**: Verify chunks load in parallel, not waterfall
3. **Manual testing**: Click cards at 0s, 1s, 2s, 5s after page load
4. **Lighthouse**: Measure TBT, FID, TTI metrics
5. **Bundle analysis**: Compare bundle size before/after

**Success criteria**:
- Clickable within 1 second of page load
- TTI < 3 seconds
- TBT < 300ms (mobile), < 200ms (desktop)
- FID < 100ms for 95% of loads

## Implementation Notes

### Files to Modify

1. **frontend/pages/index.vue** (lines 62-73)
   - Remove `defineAsyncComponent` wrapper from `PromptGrid` only
   - Keep `defineAsyncComponent` for `CategoriesFilter`, `MobileCategoriesFilter`, `PromptSearch`

2. **frontend/components/prompt/PromptGrid.vue** (lines 42-44)
   - Remove `defineAsyncComponent` wrapper from `EnhancedPromptCard`
   - Import component synchronously

### Code Changes

**Before** (`pages/index.vue`):
```typescript
const PromptGrid = defineAsyncComponent(() =>
  import('~/components/prompt/PromptGrid.vue')
)
```

**After** (`pages/index.vue`):
```typescript
import PromptGrid from '~/components/prompt/PromptGrid.vue'
```

**Before** (`PromptGrid.vue`):
```typescript
const EnhancedPromptCard = defineAsyncComponent(() =>
  import('./EnhancedPromptCard.vue')
)
```

**After** (`PromptGrid.vue`):
```typescript
import EnhancedPromptCard from './EnhancedPromptCard.vue'
```

### Testing Strategy

1. **Local build**: `cd frontend && yarn build && yarn preview`
2. **Click test**: Immediately after page load, try clicking on cards
3. **Network profiling**: Chrome DevTools → Network tab → record page load
4. **Performance profiling**: Chrome DevTools → Performance tab → record interaction
5. **Lighthouse**: Run Lighthouse test in Chrome DevTools
6. **Cross-browser**: Test in Chrome, Firefox, Safari

## Alternatives Considered

### Alternative 1: Inline All Components

**Decision**: REJECTED

Could inline all components into the home page, eliminating async loading entirely.

**Why Not**:
- Defeats purpose of component modularity
- Makes code harder to maintain
- Doesn't allow code splitting at all
- Overly aggressive for the problem at hand

### Alternative 2: Use Suspense with Timeout

**Decision**: REJECTED

Could use Vue's `<Suspense>` component with a timeout to show a loading state.

**Why Not**:
- Doesn't make chunks load faster
- Just shows a timeout error after N seconds
- Doesn't restore interactivity
- Poor UX to show error state for slow loading

### Alternative 3: Server-Side Only Rendering

**Decision**: NOT APPLICABLE

Could disable client-side hydration entirely, making all navigation server-side.

**Why Not**:
- Breaks SPA model
- Every click would trigger full page reload
- Terrible UX despite being "functional"
- Violates architecture principles

## Conclusion

The 30-50 second delay is caused by multi-level lazy loading introduced by PageSpeed optimizations. The solution is to remove lazy loading from critical interactive components (cards) while preserving it for less critical components (filters, search).

**Root cause**: `defineAsyncComponent` wrapper on PromptGrid and EnhancedPromptCard creates a loading cascade
**Solution**: Remove `defineAsyncComponent` from card components, import synchronously
**Trade-off**: Slightly larger initial bundle vs. immediate interactivity
**Recommendation**: User experience (clickable UI) takes priority over bundle optimization

**Next Steps**:
1. Update `pages/index.vue` to import PromptGrid synchronously
2. Update `PromptGrid.vue` to import EnhancedPromptCard synchronously
3. Test that cards are clickable within 1 second of page load
4. Verify PageSpeed metrics don't degrade significantly
5. Commit and deploy fix
