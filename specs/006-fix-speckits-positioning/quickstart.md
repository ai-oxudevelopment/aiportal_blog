# Quickstart Guide: Fix Speckits Page Positioning Error

**Feature**: 006-fix-speckits-positioning
**Date**: 2026-01-09
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing the fix to eliminate layout shift on the speckits page.

**Goal**: Ensure sidebar, search bar, and mobile category filters always render with consistent positioning, regardless of API data state.

**Approach**: Remove conditional rendering and add fallback category data (matching homepage pattern).

---

## Prerequisites

- Branch: `006-fix-speckits-positioning` (already created)
- Files to modify: `frontend/pages/speckits/index.vue`
- No component changes required (use existing shared components)
- No API changes required

---

## Implementation Steps

### Step 1: Add Fallback Categories Constant

**File**: `frontend/pages/speckits/index.vue`
**Location**: Inside `<script setup lang="ts">`, after import statements

**Add**:
```typescript
// Fallback categories when API fails or returns no data
const fallbackCategories: Category[] = [
  { id: 1, name: "Разработка" },        // Development
  { id: 2, name: "Планирование" },      // Planning
  { id: 3, name: "Бизнес" },           // Business
  { id: 4, name: "Образование" },      // Education
  { id: 5, name: "DevOps" }            // DevOps
]
```

**Why**: Provides default category structure when API unavailable, ensuring filters always render.

---

### Step 2: Update Categories Computed Property

**File**: `frontend/pages/speckits/index.vue`
**Current Code** (lines 125-136):
```typescript
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
```

**Replace with**:
```typescript
const categories = computed(() => {
  // Extract categories from API data if available
  if (speckits.value && speckits.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        uniqueCategories.set(cat.id, cat)
      })
    })
    const extracted = Array.from(uniqueCategories.values())
    // Return extracted categories if not empty, otherwise fallback
    return extracted.length > 0 ? extracted : fallbackCategories
  }
  // Return fallback if no data or empty array
  return fallbackCategories
})
```

**Changes**:
1. Added comment to clarify logic
2. Check if `extracted.length > 0` before returning
3. Return `fallbackCategories` instead of empty array

**Why**: Ensures `categories` never returns empty array, preventing filter components from being hidden.

---

### Step 3: Remove Conditional Rendering from Sidebar

**File**: `frontend/pages/speckits/index.vue`
**Current Code** (line 18):
```vue
<aside v-if="categories.length > 0" class="w-full md:w-64 flex-shrink-0 hidden lg:block">
```

**Replace with**:
```vue
<aside class="w-full md:w-64 flex-shrink-0 hidden lg:block">
```

**Change**: Remove `v-if="categories.length > 0"` condition

**Why**: Sidebar now always renders, eliminating layout shift when categories load.

---

### Step 4: Remove Conditional Rendering from Search Bar

**File**: `frontend/pages/speckits/index.vue`
**Current Code** (line 29):
```vue
<div v-if="categories.length > 0" class="mb-6 xs:mb-8">
```

**Replace with**:
```vue
<div class="mb-6 xs:mb-8">
```

**Change**: Remove `v-if="categories.length > 0"` condition

**Why**: Search bar now always renders, maintaining consistent layout.

---

### Step 5: Remove Conditional Rendering from Mobile Categories

**File**: `frontend/pages/speckits/index.vue`
**Current Code** (line 37):
```vue
<div v-if="categories.length > 0" class="lg:hidden mb-4 xs:mb-6">
```

**Replace with**:
```vue
<div class="lg:hidden mb-4 xs:mb-6">
```

**Change**: Remove `v-if="categories.length > 0"` condition

**Why**: Mobile category filter now always renders, preventing layout shift on mobile devices.

---

## Verification

### Manual Testing Steps

1. **Open speckits page**: Navigate to `/speckits`
2. **Observe initial render**: Verify sidebar, search bar, and mobile filters are visible immediately
3. **Wait for data load**: Verify no layout shift occurs when API data loads
4. **Check browser DevTools**: Use Layout Shift API to confirm zero cumulative layout shift

**Expected Results**:
- ✅ All filters visible within 100ms of page load
- ✅ No visible jumping or repositioning of elements
- ✅ Consistent behavior with homepage

### Regression Testing

1. **Test homepage**: Navigate to `/` and verify filters still work correctly
2. **Test speckit detail pages**: Navigate to `/speckits/[slug]` and verify no issues
3. **Test category filtering**: Click category filters and verify they work correctly
4. **Test search functionality**: Type in search box and verify it works

**Expected Results**:
- ✅ Homepage unchanged
- ✅ Detail pages unchanged
- ✅ Category filtering functional
- ✅ Search functional

---

## Comparison with Homepage

Before and after changes, speckits page should match homepage behavior:

| Aspect | Homepage (`/`) | Speckits (`/speckits`) Before | Speckits (`/speckits`) After |
|--------|----------------|-------------------------------|-------------------------------|
| Conditional rendering | No (always renders) | Yes (`v-if="categories.length > 0"`) | No (always renders) |
| Fallback categories | Yes (Education, Assistant, etc.) | No | Yes (Разработка, Планирование, etc.) |
| Layout shift | None | Yes (elements appear on load) | None |

---

## Troubleshooting

### Issue: Filters Still Hidden

**Symptom**: Sidebar or mobile filters don't appear even after changes

**Check**:
1. Verify `v-if` conditions removed from template
2. Verify `categories` computed returns `fallbackCategories` (check browser DevTools console)
3. Verify no CSS `display: none` on components

**Solution**: Review changes against this guide, ensure all `v-if` conditions removed

### Issue: Layout Shift Still Occurs

**Symptom**: Elements still jump when page loads

**Check**:
1. Use Chrome DevTools Layout Shift API to measure CLS
2. Verify API response time (should not matter with fallback data)
3. Check for other dynamic content in page

**Solution**: Ensure `categories` computed returns `fallbackCategories` immediately (not after async operation)

---

## Success Criteria

From [spec.md](spec.md):

- **SC-001**: Zero layout shift from initial render through data loading
- **SC-002**: Components visible in DOM within 100ms of page load
- **SC-003**: Visual consistency between homepage and speckits page
- **SC-004**: Zero user reports of jumping/disappearing elements
- **SC-005**: Consistent positioning across all viewport sizes

---

## Next Steps

After implementation:

1. Run manual testing (see Verification section)
2. Create pull request with changes
3. Reference this feature: `006-fix-speckits-positioning`
4. Include before/after screenshots or videos showing layout stability

---

**Status**: ✅ Implementation steps defined. Ready for Phase 2 (task generation via `/speckit.tasks`).
