# Research: Speckit Category Filter Display

**Feature**: 001-speckit-category-filter
**Date**: 2026-01-10
**Status**: Complete

## Overview

This document consolidates research findings for implementing category filter display on the /speckits page. All technical unknowns have been resolved.

## Research Questions & Findings

### 1. How are categories structured in the Strapi CMS?

**Decision**: Categories have a flat structure with `id`, `name`, and `type` attributes. The `type` field distinguishes between "prompt" categories (for articles page) and "speckit" categories (for speckits page).

**Rationale**:
- User clarification confirmed that categories have a `type` attribute
- Existing code in `speckits.get.ts` shows category normalization logic
- Categories are populated via Strapi's `populate` parameter in API queries

**Alternatives Considered**:
- Separate category collections per content type: Rejected because adds complexity and data duplication
- Category groups/subcategories: Rejected because not supported by current data structure

### 2. What is the correct data flow for category filtering?

**Decision**: Category filtering should happen on the client side after data fetching, with category type filtering on the server side.

**Rationale**:
- Server route (`/api/speckits`) fetches all speckits with their categories
- Server normalizes Strapi response to domain model, extracting categories
- Client component computes unique categories and filters by `type="speckit"`
- Client-side filtering by selected categories happens reactively via Vue computed properties

**Data Flow**:
```
Strapi API → /api/speckits (server route) → normalized response → client component → category extraction (filter type="speckit") → display filter UI
```

**Alternatives Considered**:
- Server-side category filtering: Rejected because would require multiple API calls or complex query logic
- Separate categories endpoint: Rejected because adds unnecessary API surface

### 3. Should we create new filter components or reuse existing ones?

**Decision**: Reuse existing `CategoriesFilter.vue` and `MobileCategoriesFilter.vue` from `~/components/prompt/`.

**Rationale**:
- Components are generic and work with any category list
- Already styled with Vuetify 3 + Tailwind CSS
- Supports multi-select with checkbox interface
- Already handles desktop sidebar and mobile horizontal scroll layouts

**Code Location**: `frontend/components/prompt/CategoriesFilter.vue`, `frontend/components/prompt/MobileCategoriesFilter.vue`

**Alternatives Considered**:
- Create speckit-specific filter components: Rejected because unnecessary duplication
- Use a single unified filter component: Rejected because desktop and mobile have different UI patterns

### 4. How do we handle the category type filtering?

**Decision**: Filter categories by `type="speckit"` in the computed property that extracts unique categories from speckits data.

**Rationale**:
- The `categories` computed property in `speckits/index.vue` already extracts unique categories
- Add a filter step to only include categories where `category.type === 'speckit'`
- Gracefully handle missing `type` attribute by excluding those categories

**Implementation Approach**:
```typescript
const categories = computed(() => {
  if (speckits.value && speckits.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        // Only include categories with type="speckit"
        if (cat.type === 'speckit') {
          uniqueCategories.set(cat.id, cat)
        }
      })
    })
    return Array.from(uniqueCategories.values())
  }
  return []
})
```

**Alternatives Considered**:
- Server-side type filtering: Rejected because the server route returns raw Strapi data; filtering should happen in domain model layer
- Filter in template: Rejected because adds logic to presentation layer

### 5. What happens if categories are missing or malformed?

**Decision**: Implement graceful degradation with defensive coding.

**Rationale**:
- Edge cases identified in spec (missing categories, missing type attribute, wrong type)
- Should display empty state message when no categories available
- Should exclude malformed categories without breaking the UI

**Implementation Strategy**:
- Use optional chaining (`?.`) when accessing category properties
- Filter out categories without valid `type` attribute
- Display "No categories available" message when `categories.length === 0`
- Log warnings for malformed category data to aid debugging

**Alternatives Considered**:
- Throw errors for malformed data: Rejected because degrades user experience
- Display all categories regardless of type: Rejected because violates FR-003 (must filter by type)

### 6. Performance optimization approach

**Decision**: Leverage existing caching and lazy-loading patterns.

**Rationale**:
- Server route already has stale-while-revalidate caching (5 min fresh, 1 hour stale)
- Filter components are already lazy-loaded with `defineAsyncComponent`
- Category extraction uses computed properties (cached by Vue)
- Meets performance goals: <3s to filter, <500ms additional load time

**Existing Optimizations**:
- HTTP cache headers: `Cache-Control: public, max-age=300, stale-while-revalidate=3600`
- Lazy-loaded components reduce initial bundle size
- Computed properties avoid recalculation on every render

**Alternatives Considered**:
- Memoization for category extraction: Rejected because Vue computed properties already optimize this
- Web Worker for filtering: Rejected because overkill for small datasets

## Technical Decisions Summary

| Decision | Choice | Justification |
|----------|--------|---------------|
| Category structure | Flat with id, name, type | User clarification, existing data model |
| Filtering location | Client-side for selected categories, server-side for type normalization | Separation of concerns, performance |
| Filter components | Reuse existing from ~/components/prompt/ | Avoid duplication, already tested |
| Type filtering | Computed property filtering type="speckit" | Simple, efficient, Vue-idiomatic |
| Error handling | Graceful degradation with defensive coding | Better UX, easier debugging |
| Performance | Existing caching + lazy-loading | Already meets goals |

## Dependencies & Integration Points

### Internal Dependencies
- `~/components/prompt/CategoriesFilter.vue` - Desktop filter component
- `~/components/prompt/MobileCategoriesFilter.vue` - Mobile filter component
- `~/components/prompt/PromptSearch.vue` - Search input
- `~/components/prompt/PromptGrid.vue` - Grid display
- `~/types/article.ts` - Domain types (Category, SpeckitPreview)

### External Dependencies
- Strapi v5 CMS - Backend data source
- Nuxt 3.2.0 - Application framework
- Vue 3.4.21 - UI framework
- Vuetify 3 - UI components
- Pinia - State management (if needed)

### API Endpoints
- `GET /api/speckits` - Fetch all speckits with categories (existing, may need modification)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strapi category data structure differs from assumption | High | Validate with actual Strapi instance, add logging |
| Category type field not populated in Strapi | High | Add defensive checks, log warnings for missing types |
| Existing filter components not compatible with speckit data | Medium | Review component contracts, test early |
| Performance regression with category extraction | Low | Profile with realistic data, optimize if needed |

## Open Questions

None - all research questions resolved.

## Next Steps

1. ✅ Research complete - proceed to Phase 1 (Design & Contracts)
2. Create data-model.md with domain entities
3. Create API contracts (if needed)
4. Create quickstart.md with implementation approach
