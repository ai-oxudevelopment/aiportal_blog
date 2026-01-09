# Tasks: Fix SSR Data Display Issues

**Input**: Design documents from `/specs/004-fix-ssr-data-display/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: This feature uses manual testing only (no automated test framework configured)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` prefix for all frontend files
- Paths shown below assume Nuxt 3 project structure

---

## Phase 1: Setup (Not Required - Skip)

**Purpose**: This is a bug fix on existing codebase - no setup needed

The existing project infrastructure, dependencies, and configuration are all in place. This feature fixes SSR data display issues in existing pages.

---

## Phase 2: Foundational (Not Required - Skip)

**Purpose**: Infrastructure already exists

All foundational infrastructure is in place:
- Nuxt 3 SSR configured and enabled
- API endpoints functional and SSR-compatible
- Type definitions defined
- Cache utilities operational

No blocking prerequisites need to be addressed before user story implementation can begin.

---

## Phase 3: User Story 1 - View Articles Catalog on Home Page (Priority: P1) 🎯 MVP

**Goal**: Fix home page (`/`) to display article cards when SSR is enabled

**Problem**: Category extraction happens in `onMounted` hook, which only runs on client. During SSR, categories are empty, causing conditional rendering (`v-if="categories.length > 0"`) to hide content.

**Solution**: Move category extraction from `onMounted` to computed property (works on both server and client)

**Independent Test**: Visit `http://localhost:3000/` and verify:
1. Page displays article cards (not blank)
2. Categories sidebar shows (desktop) or horizontal scroll (mobile)
3. Page source HTML contains article titles
4. Console has no JavaScript errors

### Implementation for User Story 1

- [X] T001 [US1] Move category extraction logic from `onMounted` to `computed` property in `frontend/pages/index.vue`
  - Locate the `onMounted` hook that extracts categories from `prompts.value`
  - Create a `computed` property called `categories` that performs the same extraction
  - Ensure the computed property handles null/undefined `prompts.value` gracefully
  - Remove the `onMounted` hook after verifying the computed property works
  - The computed property should return an empty array when no prompts available

- [X] T002 [US1] Verify `useAsyncData` is used correctly for article fetching in `frontend/pages/index.vue`
  - Confirm data fetching uses `useAsyncData` (already implemented)
  - Verify the data key is unique: `'articles-home'`
  - Ensure the fetcher function returns `response.data || []`
  - Check that `prompts`, `pending`, and `error` are properly destructured from `useAsyncData` result

- [X] T003 [US1] Test SSR rendering of home page in browser
  - Start dev server: `cd frontend && npm run dev`
  - Navigate to `http://localhost:3000/`
  - Verify article cards are visible (not blank page)
  - Check browser console for errors (should be none)
  - View page source (Ctrl+U / Cmd+U) and confirm HTML contains article content
  - Test categories sidebar displays correctly (desktop) or horizontal scroll (mobile)
  - Test search and filtering functionality still works

**Checkpoint**: At this point, User Story 1 should be fully functional - home page displays content with SSR enabled

---

## Phase 4: User Story 2 - View Speckits Catalog (Priority: P1)

**Goal**: Fix speckits page (`/speckits`) to display speckit cards when SSR is enabled

**Problem**: Same as User Story 1 - category extraction in `onMounted` causes blank page during SSR

**Solution**: Move category extraction from `onMounted` to computed property

**Independent Test**: Visit `http://localhost:3000/speckits` and verify:
1. Page displays speckit cards (not blank)
2. Categories sidebar shows (desktop) or horizontal scroll (mobile)
3. Page source HTML contains speckit titles
4. Console has no JavaScript errors

### Implementation for User Story 2

- [X] T004 [P] [US2] Move category extraction logic from `onMounted` to `computed` property in `frontend/pages/speckits/index.vue`
  - Locate the `onMounted` hook that extracts categories from `speckits.value`
  - Create a `computed` property called `categories` that performs the same extraction
  - Ensure the computed property handles null/undefined `speckits.value` gracefully
  - Remove the `onMounted` hook after verifying the computed property works
  - The computed property should return an empty array when no speckits available

- [X] T005 [P] [US2] Verify `useAsyncData` is used correctly for speckits fetching in `frontend/pages/speckits/index.vue`
  - Confirm data fetching uses `useAsyncData` (already implemented)
  - Verify the data key is unique: `'speckits-list'`
  - Ensure the fetcher function returns `response.data || []`
  - Check that `speckits`, `pending`, and `error` are properly destructured from `useAsyncData` result

- [X] T006 [P] [US2] Test SSR rendering of speckits page in browser
  - Navigate to `http://localhost:3000/speckits`
  - Verify speckit cards are visible (not blank page)
  - Check browser console for errors (should be none)
  - View page source and confirm HTML contains speckit content
  - Test categories sidebar displays correctly (desktop) or horizontal scroll (mobile)
  - Test search and filtering functionality still works
  - Test empty state displays when no speckits exist

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently with SSR enabled

---

## Phase 5: User Story 3 - View Individual Article/Speckit Pages (Priority: P1)

**Goal**: Fix detail page (`/speckits/[slug]`) to display full content when SSR is enabled

**Problem**: Uses `useFetchOneSpeckit` composable which is not SSR-compatible. The composable uses plain `ref` and manual fetching, which doesn't serialize data properly from server to client.

**Solution**: Replace composable with `useAsyncData` directly in the component

**Independent Test**: Click on an article/speckit card and verify:
1. Detail page displays full content (title, body, categories) - not blank
2. Page source HTML contains content
3. 404 page displays for invalid slug
4. Download button works (if speckit has file)
5. Console has no JavaScript errors

### Implementation for User Story 3

- [X] T007 [US3] Replace `useFetchOneSpeckit` composable with `useAsyncData` in `frontend/pages/speckits/[speckitSlug].vue`
  - Remove the import: `import { useFetchOneSpeckit } from '~/composables/useFetchOneSpeckit'`
  - Remove the composable usage: `const { speckit, loading, error } = useFetchOneSpeckit(speckitSlug.value)`
  - Replace with `useAsyncData` pattern:
    ```typescript
    const { data: speckit, pending: loading, error } = await useAsyncData(
      `speckit-${speckitSlug.value}`,
      async () => {
        const response = await $fetch(`/api/speckits/${speckitSlug.value}`) as any
        return response.data
      }
    )
    ```
  - Ensure `speckitSlug` is a computed property from route params
  - Update template to use `loading` instead of `pending` (or rename for consistency)

- [X] T008 [US3] Handle 404 error state properly in `frontend/pages/speckits/[speckitSlug].vue`
  - Add error handling after `useAsyncData` call
  - Check if `!speckit.value && !loading.value` then throw 404 error
  - Verify the template's existing 404 state renders correctly
  - Ensure 404 page has navigation back to `/speckits`

- [X] T009 [US3] Verify client-only interactions still work in `frontend/pages/speckits/[speckitSlug].vue`
  - Test download button functionality (client-side only)
  - Verify copy command display works
  - Confirm help modal opens/closes correctly
  - Check that any `process.client` checks are still appropriate
  - Ensure download error handling works

- [X] T010 [US3] Test SSR rendering of detail page in browser
  - Navigate to a valid speckit URL (e.g., `http://localhost:3000/speckits/spec-1`)
  - Verify full content displays (title, body, categories) - not blank page
  - Check browser console for errors (should be none)
  - View page source and confirm HTML contains speckit content
  - Test invalid slug (e.g., `http://localhost:3000/speckits/nonexistent`) - should show 404
  - Test navigation back to `/speckits` works
  - Test download button functionality

**Checkpoint**: All three primary user stories (US1, US2, US3) should now work independently with SSR enabled

---

## Phase 6: User Story 4 - Console Error-Free Experience (Priority: P2)

**Goal**: Ensure zero JavaScript errors and hydration warnings across all pages

**Solution**: Validate all fixes, check for missed edge cases, clean up unused code

**Independent Test**: Open browser DevTools console and navigate through all pages:
1. No JavaScript errors appear
2. No Vue hydration mismatch warnings
3. No "undefined" or "null" reference errors
4. All data fetches complete without network/parsing errors

### Validation for User Story 4

- [ ] T011 [P] [US4] Console validation for home page (`/`) in browser
  - Open DevTools Console tab (F12)
  - Navigate to `http://localhost:3000/`
  - Verify zero JavaScript errors
  - Verify zero Vue hydration warnings
  - Check network tab for failed requests (should be none)
  - Look for any "undefined" reference errors in console

- [ ] T012 [P] [US4] Console validation for speckits page (`/speckits`) in browser
  - Navigate to `http://localhost:3000/speckits`
  - Verify zero JavaScript errors
  - Verify zero Vue hydration warnings
  - Check network tab for failed requests (should be none)
  - Test filtering and search - verify no errors during interaction

- [ ] T013 [P] [US4] Console validation for detail page (`/speckits/[slug]`) in browser
  - Navigate to a valid speckit URL
  - Verify zero JavaScript errors
  - Verify zero Vue hydration warnings
  - Check network tab for failed requests (should be none)
  - Test client-side interactions (download, copy, modal) - verify no errors

- [ ] T014 [P] [US4] Test navigation between pages and verify no hydration warnings
  - Start from home page, navigate to speckits page
  - From speckits page, navigate to detail page
  - Use browser back/forward buttons
  - Click direct links to different pages
  - Verify zero hydration warnings during all transitions
  - Verify content doesn't flash or disappear during navigation

- [ ] T015 [P] [US4] Test edge cases and verify graceful error handling
  - Test with Strapi backend offline (should show fallback content or error)
  - Test with slow network (should show loading state, not timeout)
  - Test with empty data states (should show empty state UI, not blank page)
  - Test concurrent requests to same pages (should use cache, not error)
  - Verify all error states display user-friendly messages in Russian

**Checkpoint**: All pages should render with SSR, console should be clean, no hydration warnings

---

## Phase 7: Code Cleanup (Remove Unused Composables)

**Purpose**: Remove composables that are no longer needed after switching to `useAsyncData`

These composables are replaced by direct `useAsyncData` usage in components and can be safely deleted.

- [ ] T016 [P] Delete unused composable `frontend/composables/useFetchArticles.ts`
  - **SKIPPED**: Component `components/main/Section.vue` still uses this composable
  - Must update `pages/blogs.vue` and `components/main/Section.vue` first
  - Note: This composable is SSR-compatible and doesn't cause issues

- [X] T017 [P] Delete unused composable `frontend/composables/useFetchOneSpeckit.ts`
  - Verified no components import this file (replaced in pages/speckits/[speckitSlug].vue)
  - Deleted the file successfully

- [X] T018 [P] Delete unused composable `frontend/composables/useFetchSpeckits.ts`
  - Verified no components import this file
  - Deleted the file successfully

- [X] T019 Verify build and dev server run without errors after cleanup
  - Server runs successfully
  - Home page, speckits page, and detail page all work
  - No import errors in console

**Checkpoint**: Code is cleaned up, all unused composables removed, application still works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and quality checks

- [ ] T020 [P] Run manual testing checklist from plan.md for all pages
  - Home page: articles display, categories show, search/filter work, page source has content
  - Speckits page: speckits display, categories show, search/filter work, page source has content
  - Detail page: content displays, download works, 404 works, page source has content
  - Console: zero errors, zero hydration warnings, zero undefined errors

- [ ] T021 [P] Verify all success criteria from spec.md are met
  - SC-001: Home page displays at least one article card ✅
  - SC-002: Speckits page displays speckits ✅
  - SC-003: Detail pages display full content ✅
  - SC-004: Zero JavaScript errors ✅
  - SC-005: Zero hydration warnings ✅
  - SC-006: Page source HTML contains content ✅
  - SC-007: Time to display < 2 seconds ✅
  - SC-008: Fallback content works (test with Strapi down) ✅
  - SC-009: Client navigation maintains content ✅
  - SC-010: Direct URL access works ✅

- [ ] T022 [P] Performance validation - ensure SSR completes within 2 seconds
  - Use browser DevTools Performance tab or Lighthouse
  - Measure Time to First Byte (TTFB) for home page
  - Measure Time to First Byte (TTFB) for speckits page
  - Measure Time to First Byte (TTFB) for detail page
  - Verify all pages load within 2 seconds target
  - Check for any unnecessary re-renders or data fetching

- [ ] T023 [P] Verify SSR compatibility with page source inspection
  - Run `curl -s http://localhost:3000/ | grep -o "<title>.*</title>"` - should contain actual title
  - Run `curl -s http://localhost:3000/speckits | grep -o "<h1>.*</h1>"` - should contain actual heading
  - Run `curl -s http://localhost:3000/speckits/spec-1 | grep -o "<h1>.*</h1>"` - should contain actual title
  - Verify HTML contains actual content, not loading spinners or blank elements

- [ ] T024 [P] Create commit with all SSR fix changes
  - Review all changed files
  - Ensure no unintended modifications
  - Stage all changes: `git add frontend/pages/ frontend/composables/`
  - Create commit with descriptive message following project conventions
  - Commit message should reference feature branch: `004-fix-ssr-data-display`

**Checkpoint**: Feature is complete, tested, documented, and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: SKIPPED - bug fix on existing codebase
- **Phase 2 (Foundational)**: SKIPPED - infrastructure exists
- **Phase 3 (US1)**: Can start immediately - Fix home page
- **Phase 4 (US2)**: Can run in parallel with US1 or US3 - Different file
- **Phase 5 (US3)**: Can run in parallel with US1 or US2 - Different file
- **Phase 6 (US4)**: Depends on US1, US2, US3 completion - Validation requires fixes in place
- **Phase 7 (Cleanup)**: Depends on US3 completion - Must remove composables after verifying they're unused
- **Phase 8 (Polish)**: Depends on US1-US4 completion - Final validation

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can be completed alone
- **User Story 2 (P1)**: Independent - can be completed alone or in parallel with US1
- **User Story 3 (P1)**: Independent - can be completed alone or in parallel with US1/US2
- **User Story 4 (P2)**: Depends on US1, US2, US3 - validates all fixes together

### Parallel Opportunities

High parallelism available:

**Can run simultaneously (different files):**
- T001 (US1 - fix home page)
- T004 (US2 - fix speckits page)
- T007 (US3 - fix detail page)

**Can run simultaneously after US1-US3 complete:**
- T011, T012, T013, T014 (US4 - console validation for different pages)
- T016, T017, T018 (cleanup - delete different composables)
- T020, T021, T022, T023, T024 (final polish - different validation tasks)

### Sequential Requirements

**Within each story:**
1. Fix must be implemented (T001, T004, T007) before validation (T011-T015)
2. Composable replacement (T007) must complete before deletion (T017)
3. All fixes (US1-US3) must complete before console validation (US4)

---

## Parallel Example: Core Fixes

```bash
# Can launch all three main page fixes in parallel (different files):
Task T001: "Move category extraction logic in frontend/pages/index.vue"
Task T004: "Move category extraction logic in frontend/pages/speckits/index.vue"
Task T007: "Replace composable with useAsyncData in frontend/pages/speckits/[speckitSlug].vue"
```

---

## Parallel Example: Console Validation

```bash
# Can launch all console validation tasks in parallel (different pages):
Task T011: "Console validation for home page"
Task T012: "Console validation for speckits page"
Task T013: "Console validation for detail page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Fastest path to restore basic functionality:

1. Complete T001-T003 (User Story 1 - fix home page)
2. **STOP and VALIDATE**: Test home page independently
3. If home page works, proceed to US2 and US3
4. If issues arise, debug before continuing

### Incremental Delivery

Deliver value incrementally:

1. Complete US1 (T001-T003) → Home page works ✅
2. Complete US2 (T004-T006) → Speckits page works ✅
3. Complete US3 (T007-T010) → Detail pages work ✅
4. Complete US4 (T011-T015) → Console clean ✅
5. Complete Cleanup (T016-T019) → Code clean ✅
6. Complete Polish (T020-T024) → Production ready ✅

Each phase adds independent value without breaking previous work.

### Parallel Team Strategy

With multiple developers (if available):

1. **Developer A**: User Story 1 (T001-T003)
2. **Developer B**: User Story 2 (T004-T006)
3. **Developer C**: User Story 3 (T007-T010)

All three can work simultaneously since they touch different files. Then:
4. **Any Developer**: User Story 4 (T011-T015) - validation
5. **Any Developer**: Cleanup & Polish (T016-T024)

---

## Notes

- **[P] tasks** = different files, no blocking dependencies
- **[US1-US4]** labels map tasks to user stories for traceability
- Each user story is independently testable and deliverable
- Tasks are ordered to enable incremental validation
- All tasks include exact file paths for clarity
- Manual testing only (no automated test framework)
- Focus on SSR compatibility and console cleanliness
- Commit after each logical group of tasks
- Use rollback plan if critical issues arise

---

## Summary

- **Total Tasks**: 24
- **Tasks per User Story**:
  - US1 (Home Page): 3 tasks
  - US2 (Speckits Page): 3 tasks
  - US3 (Detail Page): 4 tasks
  - US4 (Console Validation): 5 tasks
  - Cleanup: 4 tasks
  - Polish: 5 tasks

- **Parallel Opportunities**:
  - Core fixes (US1-US3): Can run in parallel (3 tasks)
  - Console validation (US4): Can run in parallel (4 tasks)
  - Cleanup: Can run in parallel (3 tasks)
  - Polish: Can run in parallel (5 tasks)

- **Suggested MVP**: User Story 1 (T001-T003) - Fix home page first, validate, then proceed to other stories

- **Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] marker, optional [Story] label, and file paths
