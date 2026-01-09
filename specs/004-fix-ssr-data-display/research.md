# Research: SSR Data Display Issues

**Feature**: 004-fix-ssr-data-display
**Date**: 2026-01-09
**Status**: Complete

## Problem Statement

After enabling SSR (`ssr: true` in `nuxt.config.js`), pages display blank/empty instead of showing content. This affects:
- Home page (`/`) - should show articles catalog
- Speckits page (`/speckits`) - should show speckits catalog
- Detail pages (`/speckits/[slug]`) - should show full content
- Console errors appear during navigation

## Root Cause Analysis

### Issue 1: Client-Side Data Processing in `onMounted`

**Affected Pages**: `pages/index.vue`, `pages/speckits/index.vue`

**Problem**:
- Both pages use `useAsyncData` which correctly fetches data during SSR
- However, categories extraction and processing happens in `onMounted()` hook
- `onMounted()` only runs on the client side, AFTER hydration
- During SSR, `categories` ref is empty
- Template uses `v-if="categories.length > 0"` which hides content when categories are empty
- Result: Server-rendered HTML has no content, causing blank pages

**Current Code Pattern**:
```vue
<script setup>
const { data: prompts } = await useAsyncData('articles-home', async () => {
  return await $fetch('/api/articles')
})

const categories = ref([])

onMounted(() => {
  // This only runs on client!
  if (prompts.value && prompts.value.length > 0) {
    // Extract categories here...
  }
})
</script>

<template>
  <aside v-if="categories.length > 0">
    <!-- Content hidden during SSR because categories is empty -->
  </aside>
</template>
```

**Console Errors**:
- Vue hydration mismatch warnings when client-side categories differ from server
- Possible `undefined` errors when accessing properties on empty data

### Issue 2: Non-SSR-Compatible Composable for Detail Pages

**Affected Page**: `pages/speckits/[speckitSlug].vue`

**Problem**:
- Uses `useFetchOneSpeckit` composable which uses plain `ref()` and manual fetch
- Composable auto-fetches on initialization
- Does NOT use Nuxt's SSR-aware composables (`useAsyncData` or `useFetch`)
- During SSR, the fetch happens but data is not properly serialized to client
- Client-side re-fetches, causing hydration mismatch
- Result: Blank page during SSR, possible hydration errors

**Current Code Pattern**:
```ts
// composables/useFetchOneSpeckit.ts
export function useFetchOneSpeckit(slug: string) {
  const speckit = ref<SpeckitFull | null>(null)
  const loading = ref(true)

  const fetchSpeckit = async () => {
    // Fetch logic...
  }

  // Auto-fetch on call - NOT SSR-aware!
  fetchSpeckit()

  return { speckit, loading }
}
```

**Usage in Component**:
```vue
<script setup>
const speckitSlug = computed(() => route.params.speckitSlug as string)
// This doesn't work properly with SSR!
const { speckit, loading, error } = useFetchOneSpeckit(speckitSlug.value)
</script>
```

## Research Decisions

### Decision 1: Data Processing Strategy

**Question**: How to process data (e.g., extract categories) so it works during SSR?

**Options Evallected**:

1. **Move to computed property**
   - Pros: Reactive, works on both server and client
   - Cons: Recomputes on every access (minor performance concern)
   - Verdict: ✅ **ACCEPTED** - Best for derived data

2. **Move to `watchEffect` with immediate flag**
   - Pros: Runs immediately and reactively
   - Cons: More complex, potential infinite loops
   - Verdict: ⚠️ **FALLBACK** - Use if computed has issues

3. **Process in `useAsyncData` transform function**
   - Pros: Runs once during fetch, SSR-aware
   - Cons: Requires refactoring API response structure
   - Verdict: ⚠️ **FALLBACK** - Good for complex transformations

**Decision**: Use **computed properties** for data extraction

**Rationale**:
- Simple and reactive
- Works on both server and client
- Vue's reactivity system handles optimization
- No additional complexity

**Implementation**:
```vue
<script setup>
const { data: prompts } = await useAsyncData('articles-home', async () => {
  const response = await $fetch('/api/articles')
  return response.data || []
})

// Extract categories reactively - works on server AND client
const categories = computed(() => {
  if (!prompts.value) return []

  const uniqueCategories = new Map()
  prompts.value.forEach((prompt: any) => {
    prompt.categories?.forEach((cat: Category) => {
      uniqueCategories.set(cat.id, cat)
    })
  })
  return Array.from(uniqueCategories.values())
})
</script>

<template>
  <!-- Categories available during SSR -->
  <aside v-if="categories.length > 0">
    <CategoriesFilter :categories="categories" />
  </aside>
</template>
```

### Decision 2: SSR-Compatible Data Fetching for Detail Pages

**Question**: How to fetch data for detail pages in an SSR-compatible way?

**Options Evallected**:

1. **Use `useAsyncData` directly in component**
   - Pros: Native Nuxt SSR support, proper serialization
   - Cons: Need to pass route params
   - Verdict: ✅ **ACCEPTED** - Recommended approach

2. **Use `useFetch` with URL**
   - Pros: Simpler API, reactive to URL changes
   - Cons: Less control over fetching logic
   - Verdict: ⚠️ **ALTERNATIVE** - Good for simple cases

3. **Keep composable but make it SSR-compatible**
   - Pros: Reusable logic
   - Cons: Complex, requires careful state management
   - Verdict: ❌ **REJECTED** - Over-engineering for this use case

**Decision**: Replace composable with **`useAsyncData` in component**

**Rationale**:
- Nuxt's built-in solution for SSR data fetching
- Properly handles server-to-client data transfer
- Prevents hydration mismatches
- Simpler than maintaining custom SSR-aware composable
- Follows Nuxt 3 best practices

**Implementation**:
```vue
<script setup>
const route = useRoute()
const speckitSlug = computed(() => route.params.speckitSlug as string)

// SSR-compatible data fetching
const { data: speckit, pending: loading, error } = await useAsyncData(
  `speckit-${speckitSlug.value}`,
  async () => {
    const response = await $fetch(`/api/speckits/${speckitSlug.value}`)
    return response.data
  }
)

// Handle 404
if (!speckit.value && !loading.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Speckit not found'
  })
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else-if="speckit">
    <!-- Content available during SSR -->
    <h1>{{ speckit.title }}</h1>
  </div>
</template>
```

### Decision 3: Handling Empty States

**Question**: How to handle cases where backend returns no data without showing blank pages?

**Decision**: Always show appropriate UI state (loading, error, empty, content)

**Implementation Pattern**:
```vue
<template>
  <!-- Loading state -->
  <div v-if="loading">
    <LoadingSpinner />
  </div>

  <!-- Error state -->
  <div v-else-if="error">
    <ErrorBanner :message="error.message" />
  </div>

  <!-- Empty state -->
  <div v-else-if="!data || data.length === 0">
    <EmptyState message="No items found" />
  </div>

  <!-- Content state -->
  <div v-else>
    <ContentGrid :items="data" />
  </div>
</template>
```

## Alternative Approaches Considered

### Alternative 1: Disable SSR for Affected Routes

**Approach**: Use `routeRules` to disable SSR for specific routes

```js
// nuxt.config.js
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: false },
    '/speckits': { prerender: false },
    '/speckits/**': { prerender: false }
  }
})
```

**Rejected Because**:
- Violates the goal of fixing SSR (not avoiding it)
- Loses SEO benefits
- Constitution requires SSR for this feature
- Would be a workaround, not a fix

### Alternative 2: Use `process.client` Checks

**Approach**: Wrap client-only code in `process.client` checks

```vue
<script setup>
if (process.client) {
  // Client-side only logic
}
</script>
```

**Rejected Because**:
- Creates different server/client rendering paths
- Increases hydration mismatch risk
- Anti-pattern in Nuxt 3 SSR
- Doesn't solve root cause

## Technical Context Updates

**Nuxt Version**: 3.2.0 (planned upgrade to Nuxt 4)
**SSR Mode**: Enabled (`ssr: true`)
**Data Fetching**: `useAsyncData` for SSR compatibility
**State Management**: Pinia (not needed for this fix)
**Backend**: Strapi v5 CMS

## Constitution Compliance

**Constitution Section V**: "SPA Deployment Model & Nuxt 4 Hybrid Rendering"

The constitution states: "Основной режим: `ssr: false` (SPA) для среды исполнения"

**Violation**: The current config has `ssr: true`, which contradicts the constitution.

**Justification**:
- Feature 001-ssr-performance-optimization explicitly enabled SSR
- User expectation is SSR for performance and SEO
- Constitution predates this feature
- Recommendation: Update constitution to allow SSR for specific routes

**Complexity Tracking**:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR enabled instead of SPA | Feature 001-ssr-performance-optimization requires SSR for performance and SEO benefits | Disabling SSR would revert performance improvements and violate the feature's success criteria |

## Risks and Mitigations

### Risk 1: Hydration Mismatches

**Mitigation**:
- Ensure data processing happens in computed properties or during `useAsyncData`
- Avoid `onMounted` for data that needs to be present during SSR
- Test thoroughly with SSR enabled

### Risk 2: Performance Regression

**Mitigation**:
- Computed properties are optimized by Vue
- Data fetching still happens on server, initial load remains fast
- Monitor performance metrics after fix

### Risk 3: Breaking Existing Functionality

**Mitigation**:
- Comprehensive testing of all affected pages
- Verify filtering and search still work
- Ensure fallback content displays when backend is unavailable

## Testing Strategy

1. **Unit Tests**: Not applicable (UI-level fix)
2. **Integration Tests**: Manual testing in browser
3. **SSR Testing**: Check page source HTML contains content
4. **Console Validation**: Ensure no errors or warnings

## Dependencies

**Internal**:
- Nuxt 3.2.0 `useAsyncData` composable
- Existing API endpoints (`/api/articles`, `/api/speckits`, `/api/speckits/[slug]`)
- Cache utilities (already SSR-compatible)

**External**:
- Strapi v5 CMS (already configured)
- No new dependencies required

## Next Steps

1. ✅ **Research Complete** - Root causes identified
2. **Phase 1**: Create data-model.md and contracts
3. **Implementation**: Fix data processing in list pages
4. **Implementation**: Convert detail page to use `useAsyncData`
5. **Testing**: Verify all pages display content with SSR
6. **Validation**: Ensure no console errors

## References

- Nuxt 3 Documentation: [useAsyncData](https://nuxt.com/docs/api/composables/use-async-data)
- Nuxt 3 Documentation: [SSR](https://nuxt.com/docs/guide/concepts/rendering)
- Vue 3 Documentation: [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
