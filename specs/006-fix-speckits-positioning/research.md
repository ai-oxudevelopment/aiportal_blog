# Research: Fix Speckits Page Positioning Error

**Feature**: 006-fix-speckits-positioning
**Date**: 2026-01-09
**Phase**: Phase 0 - Research & Decisions

## Research Questions

### Q1: Fallback Categories - Homepage vs. Speckit-Specific?

**Question**: Should we use exact same categories as homepage or create speckit-specific ones?

**Analysis**:

Homepage (`frontend/pages/index.vue`, lines 101-107) uses these fallback categories:
- Education (id: 1)
- Assistant (id: 2)
- Business (id: 3)
- Marketing (id: 4)
- SEO (id: 5)

Speckits are similar to prompts (both are "Article" types with categories). Current speckit data includes categories like "Разработка" (Development).

**Decision**: Use **speckit-appropriate fallback categories** that align with actual speckit content.

**Rationale**:
1. Speckits are development/configuration tools, not general AI prompts
2. Categories should match real speckit use cases (development workflows, planning, best practices)
3. Prevents user confusion from seeing irrelevant categories (e.g., "SEO" for dev tools)

**Selected Fallback Categories**:
```typescript
const fallbackCategories: Category[] = [
  { id: 1, name: "Разработка" },        // Development
  { id: 2, name: "Планирование" },      // Planning
  { id: 3, name: "Бизнес" },           // Business
  { id: 4, name: "Образование" },      // Education
  { id: 5, name: "DevOps" }            // DevOps
]
```

**Alternatives Considered**:
- **Reuse homepage categories**: Rejected because categories like "SEO" and "Marketing" don't align with speckit content (development tools)
- **No fallback, show empty**: Rejected because violates FR-002 (must provide fallback data when API fails)

---

### Q2: Loading State - Loading Indicator or Skeleton?

**Question**: Should filters show loading indicator or skeleton while data fetches?

**Analysis**:

Current `CategoriesFilter.vue` and `MobileCategoriesFilter.vue` don't have built-in loading states. They simply render whatever categories are passed.

Options:
1. **Loading indicator**: Show spinner or "Loading..." text in filter components
2. **Skeleton UI**: Show placeholder boxes matching category button size
3. **Render with fallback immediately**: Show fallback categories immediately, replace with real data when loaded

**Decision**: **Render with fallback immediately** (option 3).

**Rationale**:
1. **Aligns with homepage pattern**: Homepage renders immediately with fallback data, no loading state in filters
2. **Best perceived performance**: Users see functional UI immediately (within 100ms per SC-002)
3. **No layout shift**: Fallback categories maintain same component structure as real data
4. **Simpler implementation**: No need to modify shared `CategoriesFilter` or `MobileCategoriesFilter` components

**Alternatives Considered**:
- **Loading indicator**: Rejected because requires component modifications (violates "no component changes" approach) and delays perceived functionality
- **Skeleton UI**: Rejected because requires component modifications and adds complexity without clear UX benefit for this use case

---

### Q3: Empty Categories Handling

**Question**: How should filter components behave when categories array is truly empty (not loading)?

**Analysis**:

"Truly empty" means:
- API call succeeded
- Returned zero categories
- Not a loading state, not an error

Options:
1. **Hide filters**: Use `v-if="categories.length > 0"` (current problematic behavior)
2. **Show empty state**: Display "No categories available" message in filters
3. **Show fallback**: Always render filters with fallback data if array is empty

**Decision**: **Show fallback categories** if API returns empty array.

**Rationale**:
1. **Consistent user experience**: Filters always present, users don't see them appear/disappear
2. **Graceful degradation**: If API has no categories, users can still see what categories *should* be available
3. **Matches homepage pattern**: Homepage always shows filters, never hides them
4. **Addresses FR-006**: Handle undefined, empty, and populated arrays without conditional rendering

**Implementation Detail**:
```typescript
const categories = computed(() => {
  if (speckits.value && speckits.value.length > 0) {
    // Extract real categories from API data
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        uniqueCategories.set(cat.id, cat)
      })
    })
    return Array.from(uniqueCategories.values())
  }
  // Return fallback if no data or empty array
  return fallbackCategories
})
```

**Alternatives Considered**:
- **Hide filters (v-if)**: Rejected because this is the root cause of layout shift (violates FR-001)
- **Show empty state message**: Rejected because breaks visual consistency and reduces perceived functionality

---

## Component Behavior Analysis

### CategoriesFilter.vue Behavior

**Current Behavior**:
- Accepts `categories` array as prop
- Renders button for each category
- If empty array, renders no buttons (shows empty container)
- No built-in loading or empty states

**Test with Empty Array**: Component renders container with no category buttons. No layout shift (container height stable).

**Conclusion**: No component modifications needed. Empty array renders gracefully with stable layout.

---

### MobileCategoriesFilter.vue Behavior

**Current Behavior**:
- Accepts `categories` array as prop
- Renders horizontal scrollable button list
- If empty array, renders no buttons (empty horizontal container)

**Test with Empty Array**: Component renders empty scrollable container. Minimal height (determined by padding).

**Conclusion**: No component modifications needed. Empty array renders gracefully with stable layout.

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Fallback Categories | Use speckit-appropriate categories (Разработка, Планирование, etc.) | Aligns with speckit content domain |
| Loading State | Render with fallback immediately | Best perceived performance, matches homepage |
| Empty Categories | Show fallback categories | Consistent UX, no layout shift |

---

## Next Steps

Phase 1 will use these decisions to:
1. Define data model with fallback category structure
2. Document implementation approach in quickstart guide
3. Update agent context with technology patterns (none new for this feature)

**Status**: ✅ All unknowns resolved. Ready for Phase 1 design.
