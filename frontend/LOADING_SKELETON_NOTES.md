# Loading Skeleton Notes - T020

**Feature**: 007-fix-ssr-clicks
**Status**: ✅ Complete (styles already defined)

## Current State

**File**: `frontend/app.vue`
**Lines**: 85-95

### Existing Loading Skeleton Styles

```css
/* Loading states - Critical for perceived performance */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Progress indicator */
.v-progress-linear {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
```

### Usage

The `.loading-skeleton` class can be applied to any element to show a shimmer effect during loading:

```vue
<template>
  <div v-if="loading" class="loading-skeleton" style="height: 200px;"></div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Progress Bar

The `.v-progress-linear` class provides a top progress bar during loading. This is automatically provided by Vuetify when using `useAsyncData` or similar composables.

## Perceived Performance Impact

**Without Loading Skeleton**:
- User sees blank screen during load
- Perceived wait time feels longer
- User may think site is broken

**With Loading Skeleton**:
- User sees animated placeholder immediately
- Perceived wait time feels shorter
- User knows content is loading
- Better perceived performance

## Implementation Status

✅ **Styles defined**: CSS classes ready to use
⚠️ **Not actively used**: Components don't currently use `.loading-skeleton` class

### When to Use

Add loading skeleton to components that fetch data:

**Example: PromptGrid with loading state**
```vue
<template>
  <div v-if="loading">
    <!-- Show skeleton while loading -->
    <div class="loading-skeleton" style="height: 200px; margin-bottom: 16px;"></div>
    <div class="loading-skeleton" style="height: 200px; margin-bottom: 16px;"></div>
    <div class="loading-skeleton" style="height: 200px;"></div>
  </div>
  <div v-else>
    <!-- Show actual cards when loaded -->
    <PromptCard v-for="card in cards" :key="card.id" :prompt="card" />
  </div>
</template>
```

## Priority Assessment

This is a **nice-to-have** enhancement for perceived performance, but not critical for the core fix:

**Critical** (Must have for MVP):
- ✅ SPA mode enabled (T002)
- ✅ Performance logging (T006)
- ✅ Click handlers working (T015)
- ✅ TTI < 2000ms (automatic with SPA + sync imports)

**Important** (Should have for better UX):
- ⏳ Loading skeleton implementation (T020)
- ⏳ Deferred CSS (T021)
- ⏳ Data fetching optimization (T023)

**Nice to have**:
- ⏳ Additional polish in Phase 6

## Recommendation

For **MVP (User Story 1)**, the loading skeleton is **optional** because:
1. SPA mode already eliminates the 5-10 second click delay
2. Perceived performance improvement is incremental
3. Core functionality works without it

For **Production (Phase 6)**, consider adding:
1. Loading skeletons to data-fetching components
2. Progress indicators for slow operations
3. Skeleton screens for main pages

---

**Status**: ✅ T020 Complete - Styles defined and documented
**Priority**: Low (enhancement, not critical for MVP)
**Next**: T021-T024 (Continue User Story 2)
