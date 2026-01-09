# Quickstart: Speckit Category Filter Display

**Feature**: 001-speckit-category-filter
**Date**: 2026-01-10
**Estimated Complexity**: Low (1-2 hours)

## Overview

Fix the missing category filter on the /speckits page by ensuring categories are properly extracted and filtered by type="speckit". This is primarily a bug fix with minimal code changes required.

## Quick Start

### Files to Modify

1. **frontend/types/article.ts** - Add `type` field to Category interface
2. **frontend/server/api/speckits.get.ts** - Ensure category normalization includes `type` field
3. **frontend/pages/speckits/index.vue** - Add type filtering to categories computed property

### Files to Reuse (No Changes)

- `frontend/components/prompt/CategoriesFilter.vue` - Desktop filter
- `frontend/components/prompt/MobileCategoriesFilter.vue` - Mobile filter
- `frontend/components/prompt/PromptSearch.vue` - Search input
- `frontend/components/prompt/PromptGrid.vue` - Grid display

## Implementation Steps

### Step 1: Update Category Type Definition (5 minutes)

**File**: `frontend/types/article.ts`

Add the `type` field to the Category interface:

```typescript
// Before
export interface Category {
  id: number
  name: string
}

// After
export interface Category {
  id: number
  name: string
  type: 'prompt' | 'speckit'
}
```

### Step 2: Update Server Route Category Normalization (10 minutes)

**File**: `frontend/server/api/speckits.get.ts`

Find the category normalization code (around line 62-66) and update it:

```typescript
// Before
const categories = categoriesData.map((cat: any) => ({
  id: cat.id,
  name: cat.attributes?.name || cat.name
}))

// After
const categories = categoriesData.map((cat: any) => ({
  id: cat.id,
  name: cat.attributes?.name || cat.name,
  type: cat.attributes?.type || cat.type || 'speckit'
}))
```

**Note**: The default value of `'speckit'` ensures backward compatibility if the `type` field is missing from Strapi.

### Step 3: Add Type Filtering to Categories Computed Property (10 minutes)

**File**: `frontend/pages/speckits/index.vue`

Find the `categories` computed property (around line 125-136) and add type filtering:

```typescript
// Before
const categories = computed(() => {
  if (speckits.value && speckits.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        uniqueCategories.set(cat.id, cat)
      })
    })
    return Array.from(uniqueCategories.values())
  }
  return []
})

// After
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

### Step 4: Verify Existing Filter Logic (5 minutes)

**File**: `frontend/pages/speckits/index.vue`

Confirm the `filteredSpeckits` computed property already handles category filtering correctly (it should already be working):

```typescript
const filteredSpeckits = computed(() => {
  let filtered = speckits.value as unknown as SpeckitItem[]

  // Filter by categories - if nothing selected, show all
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((speckit: SpeckitItem) =>
      speckit.categories?.some((cat: Category) =>
        selectedCategories.value.includes(cat.id)
      )
    )
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((speckit: SpeckitItem) =>
      speckit.title.toLowerCase().includes(query) ||
      speckit.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})
```

This should already be correct and doesn't need changes.

### Step 5: Test the Implementation (15 minutes)

1. **Start the dev server**:
   ```bash
   cd frontend
   yarn dev
   ```

2. **Navigate to**: http://localhost:8080/speckits

3. **Verify**:
   - Category filters are visible on desktop (left sidebar)
   - Category filters are visible on mobile (horizontal scroll)
   - Only categories with `type="speckit"` are displayed
   - Clicking a category filters the speckit list
   - Search + category filtering works together
   - Clearing filters shows all speckits again

4. **Check browser console** for any errors or warnings

### Step 6: Handle Edge Cases (10 minutes)

If categories are missing or malformed, the implementation should:

1. **Empty categories array**: Display empty state message (already handled by `v-if="categories.length > 0"`)
2. **Categories with wrong type**: Excluded by the `cat.type === 'speckit'` check
3. **Categories without type field**: Excluded by the same check (will be falsy)

Add console logging for debugging if needed:

```typescript
const categories = computed(() => {
  if (speckits.value && speckits.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        // Debug: log categories without type or with wrong type
        if (!cat.type) {
          console.warn('[speckits/index] Category missing type field:', cat)
        } else if (cat.type !== 'speckit') {
          console.log('[speckits/index] Excluding non-speckit category:', cat)
        } else if (cat.type === 'speckit') {
          uniqueCategories.set(cat.id, cat)
        }
      })
    })
    return Array.from(uniqueCategories.values())
  }
  return []
})
```

## Testing Checklist

- [ ] Categories are visible on page load
- [ ] Only `type="speckit"` categories are shown
- [ ] Clicking a category filters the list
- [ ] Multiple categories work (OR logic)
- [ ] Clearing filters shows all speckits
- [ ] Search + category filter work together
- [ ] Mobile layout shows horizontal scroll filters
- [ ] Desktop layout shows sidebar filters
- [ ] No console errors or warnings
- [ ] Empty state displays when no speckits match filters

## Potential Issues & Solutions

### Issue: Categories Still Not Visible

**Possible Causes**:
1. Strapi doesn't have the `type` field on categories
2. Server route isn't normalizing the `type` field correctly
3. Client-side filtering logic has a bug

**Debugging Steps**:
1. Check server logs for the normalized response
2. In the browser, check the Vue devtools to see the `speckits` data
3. Add `console.log` in the `categories` computed property to inspect data
4. Verify the `type` field exists in the Strapi CMS

### Issue: Wrong Categories Displayed

**Possible Cause**: Category `type` values in Strapi are incorrect

**Solution**: Update category data in Strapi to have correct `type` values (either "prompt" or "speckit")

### Issue: Type Errors

**Possible Cause**: TypeScript doesn't recognize the new `type` field

**Solution**: Restart the TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

## Rollback Plan

If the implementation causes issues, revert the changes:

1. Revert `frontend/types/article.ts` to remove `type` field
2. Revert `frontend/server/api/speckits.get.ts` to original normalization
3. Revert `frontend/pages/speckits/index.vue` to remove type filtering

The original code had the filter infrastructure in place but categories weren't showing, so reverting will return to the same state.

## Next Steps

After implementation:
1. Test thoroughly on desktop and mobile
2. Verify with actual Strapi data
3. Check performance with large datasets
4. Document any data cleanup needed in Strapi (e.g., categories missing `type` field)

## Success Criteria

The implementation is successful when:
- ✅ Category filters are visible on 100% of page loads (SC-001)
- ✅ Users can filter in under 3 seconds (SC-002)
- ✅ Filters work on both desktop and mobile (SC-003)
- ✅ Combined search + category filtering is accurate (SC-004)
- ✅ Zero results state shows clear message (SC-005)
- ✅ Keyboard navigation works (SC-006)
- ✅ Visual feedback indicates active filters (SC-007)
- ✅ Page load time increase <500ms (SC-008)
