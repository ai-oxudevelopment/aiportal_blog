# Tasks: Fix Speckits Page Positioning Error

**Input**: Design documents from `/specs/006-fix-speckits-positioning/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual testing only (no automated tests in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `frontend/` at repository root
- Modified file: `frontend/pages/speckits/index.vue`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify development environment and understand current implementation

- [ ] T001 Verify development environment is ready (Node.js 22, Yarn, Nuxt 3.2.0 installed)
- [ ] T002 Read current implementation in frontend/pages/speckits/index.vue to understand existing structure
- [ ] T003 Compare speckits/index.vue with index.vue to understand conditional rendering differences

**Checkpoint**: Environment verified and current implementation understood

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify shared components and types are in place

- [ ] T004 Verify Category type exists in frontend/types/article.ts
- [ ] T005 Verify CategoriesFilter.vue component exists in frontend/components/prompt/
- [ ] T006 Verify MobileCategoriesFilter.vue component exists in frontend/components/prompt/
- [ ] T007 Verify PromptSearch.vue component exists in frontend/components/prompt/

**Checkpoint**: All shared components and types confirmed in place - ready for implementation

---

## Phase 3: User Story 1 - Eliminate Layout Shift (Priority: P1) 🎯 MVP

**Goal**: Eliminate layout shift by ensuring page layout remains stable during and after data loading

**Independent Test**: Load the speckits page and observe that sidebar, search bar, and category filters maintain consistent positioning throughout the loading state and after data loads. Use Chrome DevTools Layout Shift API to confirm zero cumulative layout shift.

### Implementation for User Story 1

- [ ] T008 [US1] Add fallbackCategories constant in frontend/pages/speckits/index.vue (after imports, inside `<script setup>`)
- [ ] T009 [US1] Update categories computed property to return fallbackCategories when array is empty in frontend/pages/speckits/index.vue
- [ ] T010 [US1] Remove v-if="categories.length > 0" condition from sidebar in frontend/pages/speckits/index.vue (line 18)
- [ ] T011 [US1] Remove v-if="categories.length > 0" condition from search bar in frontend/pages/speckits/index.vue (line 29)
- [ ] T012 [US1] Remove v-if="categories.length > 0" condition from mobile categories in frontend/pages/speckits/index.vue (line 37)
- [ ] T013 [US1] Manually verify no layout shift occurs during page load in browser (test on desktop viewport)
- [ ] T014 [US1] Manually verify no layout shift occurs on mobile viewport (test on mobile or responsive mode)

**Checkpoint**: At this point, User Story 1 should be fully functional - zero layout shift from initial render through data loading

---

## Phase 4: User Story 2 - Consistent Component Visibility (Priority: P2)

**Goal**: Ensure all navigation and filtering components are always visible regardless of data state

**Independent Test**: Check that sidebar, search, and mobile categories are always present in the DOM regardless of whether categories data has loaded, is empty, or contains data (use browser DevTools to inspect DOM).

### Implementation for User Story 2

- [ ] T015 [US2] Manually verify components render with empty categories array in frontend/pages/speckits/index.vue (browser DevTools inspection)
- [ ] T016 [US2] Manually verify components render when categories array contains data in frontend/pages/speckits/index.vue (browser DevTools inspection)
- [ ] T017 [US2] Manually verify components render during network error state in frontend/pages/speckits/index.vue (simulate API failure, check DOM)
- [ ] T018 [US2] Manually verify components render across all viewport sizes (mobile, tablet, desktop) in frontend/pages/speckits/index.vue

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - components always visible with no layout shift

---

## Phase 5: User Story 3 - Fallback Data Support (Priority: P3)

**Goal**: Display fallback content when API is unavailable while maintaining stable layout

**Independent Test**: Simulate API failure and verify that fallback categories and UI elements are displayed without layout shifts.

### Implementation for User Story 3

- [ ] T019 [US3] Verify fallbackCategories constant contains appropriate speckit categories in frontend/pages/speckits/index.vue (Разработка, Планирование, Бизнес, Образование, DevOps)
- [ ] T020 [US3] Manually verify fallback categories display when API call fails or times out in frontend/pages/speckits/index.vue (simulate network error)
- [ ] T021 [US3] Manually verify fallback categories display when API returns empty data in frontend/pages/speckits/index.vue (mock empty response)
- [ ] T022 [US3] Manually verify filters use fallback categories immediately on page load (not waiting for API) in frontend/pages/speckits/index.vue

**Checkpoint**: All user stories should now be independently functional - stable layout, consistent visibility, and fallback data support

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cross-story consistency checks

- [ ] T023 Compare speckits page behavior with homepage behavior (verify both use same rendering strategy)
- [ ] T024 Test category filtering functionality in frontend/pages/speckits/index.vue (verify filters work correctly)
- [ ] T025 Test search functionality in frontend/pages/speckits/index.vue (verify search works correctly)
- [ ] T026 Verify homepage still works correctly after changes (regression test for /)
- [ ] T027 Verify speckit detail pages still work correctly (regression test for /speckits/[slug])
- [ ] T028 Run quickstart.md validation checklist (follow verification steps in quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (shares same implementation)
- **User Story 3 (Phase 5)**: Depends on User Story 1 completion (shares same implementation)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. **Primary implementation phase.**
- **User Story 2 (P2)**: Depends on User Story 1 - Shares the same implementation (removing v-if conditions), validated through different testing scenarios
- **User Story 3 (P3)**: Depends on User Story 1 - Shares the same implementation (fallback categories enable the fix), validated through different testing scenarios

**Note**: US2 and US3 are validation/testing phases built on US1's implementation. The actual code changes for all three stories happen in US1 (tasks T008-T012).

### Within Each User Story

- **User Story 1**: Tasks T008-T012 must be sequential (same file). Tasks T013-T014 (testing) can run in parallel after implementation.
- **User Story 2**: Tasks T015-T018 (all manual testing) can run in parallel.
- **User Story 3**: Tasks T019-T022 (all manual testing) can run in parallel.

### Parallel Opportunities

- **Phase 1**: All tasks (T001-T003) can run in parallel
- **Phase 2**: All tasks (T004-T007) can run in parallel
- **Phase 3**: T013-T014 can run in parallel after implementation (T008-T012) is complete
- **Phase 4**: All tasks (T015-T018) can run in parallel after US1 is complete
- **Phase 5**: All tasks (T019-T022) can run in parallel after US1 is complete
- **Phase 6**: All tasks (T023-T028) can run in parallel after all user stories are complete

---

## Parallel Example: User Story 1 Implementation

```bash
# Tasks T008-T012 must be sequential (same file):
# T008: Add fallbackCategories constant
# T009: Update categories computed property
# T010: Remove v-if from sidebar
# T011: Remove v-if from search bar
# T012: Remove v-if from mobile categories

# After implementation complete, run testing tasks in parallel:
Task: "Manually verify no layout shift occurs during page load in browser (test on desktop viewport)"
Task: "Manually verify no layout shift occurs on mobile viewport (test on mobile or responsive mode)"
```

---

## Parallel Example: User Story 2 Testing

```bash
# All testing tasks can run in parallel after US1 is complete:
Task: "Manually verify components render with empty categories array"
Task: "Manually verify components render when categories array contains data"
Task: "Manually verify components render during network error state"
Task: "Manually verify components render across all viewport sizes"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - **CRITICAL**
3. Complete Phase 3: User Story 1 (T008-T014)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open speckits page, observe zero layout shift
   - Use Chrome DevTools Layout Shift API to confirm
   - Test on mobile and desktop viewports
5. Deploy/demo if ready

**MVP Delivers**: Eliminated layout shift on speckits page (P1 priority)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - **Value**: Layout no longer shifts, users can navigate without elements jumping
3. Add User Story 2 → Test independently → Deploy/Demo
   - **Value**: Confirmed components always visible, better UX understanding
4. Add User Story 3 → Test independently → Deploy/Demo
   - **Value**: Graceful degradation when API fails, improved resilience
5. Add Polish → Final validation → Deploy
   - **Value**: Confidence in no regressions, comprehensive validation

### Single Developer Sequential Approach

Since this is a small feature (single file change):

1. Complete all phases sequentially: T001 → T002 → ... → T028
2. Each task is quick (5-15 minutes)
3. Total implementation time: ~2-3 hours
4. **Recommended approach**: Complete in one sitting for maximum focus

---

## Task Breakdown Summary

| Phase | Task Range | Task Count | Purpose |
|-------|-----------|------------|---------|
| Setup | T001-T003 | 3 tasks | Environment verification and code understanding |
| Foundational | T004-T007 | 4 tasks | Verify shared components and types |
| User Story 1 | T008-T014 | 7 tasks | **CORE**: Eliminate layout shift (implementation + testing) |
| User Story 2 | T015-T018 | 4 tasks | Validate consistent component visibility |
| User Story 3 | T019-T022 | 4 tasks | Validate fallback data support |
| Polish | T023-T028 | 6 tasks | Cross-cutting validation and regression testing |
| **TOTAL** | **T001-T028** | **28 tasks** | |

### Tasks by Type

| Type | Count | Examples |
|------|-------|----------|
| Implementation | 5 tasks | T008-T012 (all code changes) |
| Manual Testing | 19 tasks | T013-T022, T023-T028 (validation) |
| Verification | 4 tasks | T001-T004 (environment/component checks) |

---

## Notes

- **All changes in one file**: `frontend/pages/speckits/index.vue`
- **No component modifications**: CategoriesFilter, MobileCategoriesFilter, PromptSearch remain unchanged
- **No API changes**: Uses existing `/api/speckits` endpoint
- **Testing approach**: Manual visual testing only (Chrome DevTools, browser inspection)
- **Quick implementation**: Core fix is 5 tasks (T008-T012), ~30-60 minutes
- **US2 and US3 are validation phases**: They don't add new code, they validate US1's implementation through different test scenarios
- **MVP = US1 only**: Tasks T001-T014 deliver the core value (eliminate layout shift)
- **Commit after each task**: Or after logical groups (e.g., T008-T012 together as "implement layout shift fix")
- **Stop at any checkpoint**: Validate story independently before proceeding
