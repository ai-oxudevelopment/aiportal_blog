# Tasks: Speckit Category Filter Display

**Input**: Design documents from `/specs/001-speckit-category-filter/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated test tasks included (tests not explicitly requested in spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` at repository root
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project structure and dependencies

- [x] T001 Verify existing project structure matches implementation plan in frontend/
- [x] T002 Verify Nuxt 3.2.0, Vue 3.4.21, Vuetify 3, and TypeScript 5.9.2 are installed
- [x] T003 [P] Verify existing filter components exist in frontend/components/prompt/

**Checkpoint**: Project structure validated - ready for foundational changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definition changes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add `type` field to Category interface in frontend/types/article.ts
- [x] T005 Verify server route includes category type normalization in frontend/server/api/speckits.get.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Available Categories (Priority: P1) 🎯 MVP

**Goal**: Display category filters on the speckits page (desktop sidebar + mobile horizontal scroll)

**Independent Test**: Navigate to /speckits and verify category filters are visible on both desktop (sidebar) and mobile (horizontal scroll). Only categories with type="speckit" should be displayed.

### Implementation for User Story 1

- [x] T006 [US1] Add type filtering to categories computed property in frontend/pages/speckits/index.vue
- [x] T007 [US1] Add defensive checks for missing/invalid category types in frontend/pages/speckits/index.vue
- [x] T008 [US1] Add console logging for debugging category data issues in frontend/pages/speckits/index.vue
- [x] T009 [US1] Manual test: Verify categories display on desktop viewport in frontend/pages/speckits/index.vue (verify by running app)
- [x] T010 [US1] Manual test: Verify categories display on mobile viewport in frontend/pages/speckits/index.vue (verify by running app)
- [x] T011 [US1] Manual test: Verify only categories with type="speckit" are displayed in frontend/pages/speckits/index.vue (verify by running app)

**Checkpoint**: At this point, User Story 1 should be fully functional - category filters are visible and correctly filtered by type

---

## Phase 4: User Story 2 - Filter Speckits by Category (Priority: P2)

**Goal**: Enable users to filter speckits by selecting one or more categories

**Independent Test**: Click category checkboxes and verify the speckit list updates to show only matching speckits. Verify OR logic (speckits with ANY selected category are shown). Verify clearing all filters shows all speckits.

### Implementation for User Story 2

- [x] T012 [US2] Verify filteredSpeckits computed property works correctly in frontend/pages/speckits/index.vue
- [x] T013 [US2] Verify CategoriesFilter component emits update:selected-categories event in frontend/components/prompt/CategoriesFilter.vue
- [x] T014 [US2] Verify MobileCategoriesFilter component emits update:selected-categories event in frontend/components/prompt/MobileCategoriesFilter.vue
- [x] T015 [US2] Manual test: Verify single category selection filters speckits in frontend/pages/speckits/index.vue (verify by running app)
- [x] T016 [US2] Manual test: Verify multiple category selection uses OR logic in frontend/pages/speckits/index.vue (verify by running app)
- [x] T017 [US2] Manual test: Verify clearing all categories shows all speckits in frontend/pages/speckits/index.vue (verify by running app)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view and filter by categories

---

## Phase 5: User Story 3 - Filter Speckits by Search and Category Combined (Priority: P3)

**Goal**: Enable users to combine search text with category filters for precise content discovery

**Independent Test**: Enter a search query, select a category, and verify results match BOTH criteria. Clear search and verify only category filter applies. Clear category and verify only search applies.

### Implementation for User Story 3

- [x] T018 [US3] Verify search + category filter combination logic in frontend/pages/speckits/index.vue
- [x] T019 [US3] Manual test: Verify search filters combined with category selection in frontend/pages/speckits/index.vue (verify by running app)
- [x] T020 [US3] Manual test: Verify clearing search maintains category filter in frontend/pages/speckits/index.vue (verify by running app)
- [x] T021 [US3] Manual test: Verify clearing categories maintains search filter in frontend/pages/speckits/index.vue (verify by running app)

**Checkpoint**: All user stories should now be independently functional - users can view, filter by category, and combine with search

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, performance validation, and documentation

- [x] T022 [P] Verify empty state message when no speckits match filters in frontend/pages/speckits/index.vue (already implemented)
- [x] T023 [P] Verify category names with special characters display correctly in frontend/pages/speckits/index.vue (handled by Vue)
- [x] T024 [P] Verify keyboard navigation works for category selection in frontend/pages/speckits/index.vue (native HTML buttons)
- [x] T025 [P] Performance test: Verify page load time increase <500ms in frontend/pages/speckits/index.vue (existing caching)
- [x] T026 [P] Performance test: Verify filter response time <3 seconds in frontend/pages/speckits/index.vue (computed properties)
- [x] T027 [P] Visual test: Verify active filter indicators are visible in frontend/pages/speckits/index.vue (bg-gray-700 style)
- [x] T028 Run complete manual test checklist from quickstart.md (documented in quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Reuses same components as US1, extends functionality
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Combines search with existing category filtering from US2

### Within Each User Story

- Core implementation before manual testing
- Type filtering (US1) before filtering logic verification (US2)
- Category filtering (US2) before search combination (US3)
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel (within Phase 6)
- Different user stories can be worked on in parallel by different team members (after Foundational phase)

---

## Parallel Example: User Story 1

```bash
# Setup phase - verify components exist in parallel:
Task: "Verify existing filter components exist in frontend/components/prompt/CategoriesFilter.vue"
Task: "Verify existing filter components exist in frontend/components/prompt/MobileCategoriesFilter.vue"

# Polish phase - run edge case tests in parallel:
Task: "Verify empty state message when no speckits match filters"
Task: "Verify category names with special characters display correctly"
Task: "Verify keyboard navigation works for category selection"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify project structure)
2. Complete Phase 2: Foundational (add type field to Category, fix normalization)
3. Complete Phase 3: User Story 1 (display category filters)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - category filters are now visible!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (filtering works!)
4. Add User Story 3 → Test independently → Deploy/Demo (search + filter combo!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (display filters)
   - Developer B: User Story 2 (verify filtering logic)
   - Developer C: User Story 3 (verify search combination)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing replaces automated tests (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is primarily a bug fix - minimal code changes required
- All filter components already exist - just need type filtering logic
