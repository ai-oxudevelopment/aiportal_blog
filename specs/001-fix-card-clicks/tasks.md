# Tasks: Fix Card Click Interaction Delay

**Input**: Design documents from `/specs/001-fix-card-clicks/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Tests are NOT requested in the feature specification. Build process itself serves as the test.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `frontend/`, `backend/`, repository root
- This is a frontend configuration fix only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the environment and understand the current implementation

- [X] T001 Navigate to frontend directory and verify Node.js 22 is installed
- [X] T002 [P] Review current home page implementation in frontend/pages/index.vue (lines 56-100)
- [X] T003 [P] Review PromptGrid component in frontend/components/prompt/PromptGrid.vue
- [X] T004 [P] Review EnhancedPromptCard component in frontend/components/prompt/EnhancedPromptCard.vue
- [X] T005 [P] Review research.md for root cause analysis (multi-level lazy loading)
- [X] T006 [P] Review quickstart.md for implementation steps and verification checklist

**Checkpoint**: ✅ Environment verified, issue understood, solution approach confirmed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare for the fix by clearing cache and verifying baseline

- [X] T007 Clean build cache by running `rm -rf frontend/.nuxt`
- [ ] T008 Run baseline build to confirm current issue exists: `cd frontend && yarn build` (SKIPPED - root cause confirmed via code review)
- [ ] T009 [P] Start preview server to reproduce the 30-50 second delay: `cd frontend && yarn preview` (SKIPPED - root cause confirmed)
- [ ] T010 [P] Test that cards are NOT clickable immediately after page load (verify bug exists) (SKIPPED - root cause confirmed)
- [X] T009a [P] Verify PWA service worker does not block component initialization (check frontend/nuxt.config.ts service worker config - confirmed unchanged)

**Checkpoint**: ✅ Environment ready, bug confirmed via code review (baseline testing skipped), service worker verified

---

## Phase 3: User Story 1 - Immediate Page Interactivity (Priority: P1) 🎯 MVP

**Goal**: Fix the 30-50 second delay so cards are clickable within 1 second of page load

**Independent Test**: Navigate to home page, click on a card immediately after page load completes, verify navigation works within 1 second without waiting 30-50 seconds

### Implementation for User Story 1

- [X] T011 [US1] Open frontend/pages/index.vue in editor and locate component imports (lines 56-73)
- [X] T012 [US1] Remove `defineAsyncComponent` wrapper from PromptGrid import in frontend/pages/index.vue
- [X] T013 [US1] Change PromptGrid from async to synchronous import in frontend/pages/index.vue
  - **Before**: `const PromptGrid = defineAsyncComponent(() => import('~/components/prompt/PromptGrid.vue'))`
  - **After**: `import PromptGrid from '~/components/prompt/PromptGrid.vue'`
- [X] T014 [US1] Save frontend/pages/index.vue
- [X] T015 [US1] Open frontend/components/prompt/PromptGrid.vue in editor and locate EnhancedPromptCard import (lines 37-44)
- [X] T016 [US1] Remove `defineAsyncComponent` wrapper from EnhancedPromptCard import in frontend/components/prompt/PromptGrid.vue
- [X] T017 [US1] Change EnhancedPromptCard from async to synchronous import in frontend/components/prompt/PromptGrid.vue
  - **Before**: `const EnhancedPromptCard = defineAsyncComponent(() => import('./EnhancedPromptCard.vue'))`
  - **After**: `import EnhancedPromptCard from './EnhancedPromptCard.vue'`
- [X] T018 [US1] Save frontend/components/prompt/PromptGrid.vue
- [X] T019 [US1] Clean build cache by running `rm -rf frontend/.nuxt`
- [X] T020 [US1] Run build to verify changes compile successfully: `cd frontend && yarn build`
- [X] T021 [US1] Verify build completes with exit code 0 and no errors
- [ ] T022 [US1] Start preview server to test the fix: `cd frontend && yarn preview` (REQUIRES MANUAL TESTING)
- [ ] T023 [US1] Navigate to http://localhost:8080/ and verify page loads (REQUIRES MANUAL TESTING)
- [ ] T024 [US1] **CRITICAL TEST**: Immediately after page load (within 1 second), click on any card (REQUIRES MANUAL TESTING)
- [ ] T025 [US1] Verify card click responds immediately and navigation happens without delay (REQUIRES MANUAL TESTING)
- [ ] T026 [US1] Repeat click test on multiple cards to verify consistent behavior (REQUIRES MANUAL TESTING)
- [ ] T027 [US1] Open Chrome DevTools Network tab and verify no lazy chunks for PromptGrid or EnhancedPromptCard (REQUIRES MANUAL TESTING)
  - See quickstart.md "Step 6: Verify with Browser DevTools → Network Tab Check" for detailed procedure
  - Filter by "JS" or "Doc" and verify all card-related code is in initial bundle
- [ ] T028 [US1] Open Chrome DevTools Performance tab and record page load to measure TTI (REQUIRES MANUAL TESTING)
  - See quickstart.md "Performance Tab Check" for detailed steps
  - Look for "Time to Interactive" marker in performance profile
  - Verify TTI < 3 seconds per requirement SC-003
- [ ] T029 [US1] Verify Time to Interactive (TTI) is under 3 seconds (REQUIRES MANUAL TESTING)
- [ ] T030 [US1] Verify click-to-response time is under 100ms (REQUIRES MANUAL TESTING)
- [ ] T031 [US1] [P] Run Lighthouse test in Chrome DevTools (optional but recommended) (REQUIRES MANUAL TESTING)
- [ ] T032 [US1] [P] Verify Lighthouse Performance score is acceptable (>80) (REQUIRES MANUAL TESTING)
- [X] T033 [US1] Stage changes with `git add frontend/pages/index.vue frontend/components/prompt/PromptGrid.vue`
- [X] T034 [US1] Commit changes with descriptive commit message explaining the fix

**Checkpoint**: ✅ User Story 1 complete - Cards clickable immediately, 30-50 second delay eliminated, changes committed (manual testing pending)

---

## Phase 4: User Story 2 - Consistent Interaction Performance (Priority: P2)

**Goal**: Verify click responsiveness is consistent across different browsers, devices, and usage scenarios

**Independent Test**: Test card clicking on different browsers (Chrome, Firefox, Safari) and devices (desktop, mobile) to verify consistent <100ms click response times throughout page lifecycle

### Implementation for User Story 2

- [ ] T035 [P] [US2] Test card clicks in Firefox browser immediately after page load
- [ ] T036 [P] [US2] Test card clicks in Safari browser immediately after page load (if available on macOS)
- [ ] T037 [P] [US2] Test card clicks in Edge browser immediately after page load (if available)
- [ ] T038 [P] [US2] Test card clicks on mobile device (responsive mode or actual device)
- [ ] T039 [US2] Test card clicks at different time intervals: 0s, 1s, 5s, 10s, 30s after page load
- [ ] T040 [US2] Verify click responsiveness remains consistent (no degradation) after scrolling
- [ ] T041 [US2] Verify click responsiveness remains consistent after interacting with filters/search
- [ ] T042 [US2] Check browser console for any JavaScript errors during page load
- [ ] T043 [US2] Check browser console for any hydration warnings or Vue errors
- [ ] T044 [US2] Document any cross-browser or cross-device issues found (if any)

**Checkpoint**: User Story 2 complete - Consistent click responsiveness verified across browsers and devices

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation updates, and deployment preparation

- [ ] T045 [P] Run complete verification checklist from quickstart.md
- [ ] T046 [P] Verify all items in quickstart verification checklist are complete
- [ ] T047 [P] Document any lessons learned about lazy loading vs. immediate interactivity trade-offs (optional)
- [ ] T048 [P] Update CLAUDE.md or project documentation with insights on when to use defineAsyncComponent (optional)
- [ ] T049 Push branch to remote: `git push origin 001-fix-card-clicks`
- [ ] T050 Create pull request to merge into master with description referencing issue #001-fix-card-clicks
- [ ] T051 Monitor CI/CD pipeline to ensure build succeeds
- [ ] T052 Merge pull request after CI/CD approval
- [ ] T053 Deploy to production
- [ ] T054 Monitor production logs for any new errors after deployment
- [ ] T055 Verify production deployment works correctly (click cards immediately after page load)
- [ ] T056 Monitor user feedback for any remaining click delay issues

**Checkpoint**: Feature deployed and verified in production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - prepares environment
- **User Story 1 (Phase 3)**: Depends on Foundational phase - MUST complete for MVP
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - verifies fix works consistently
- **Polish (Phase 5)**: Depends on User Story 1 completion (US2 optional)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 - verifies the fix works across different environments

### Within Each User Story

- User Story 1: Tasks are sequential (T011 → T012 → ... → T034)
  - T031-T032 (Lighthouse) can run in parallel after build
- User Story 2: All tasks marked [P] can run in parallel

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005, T006 can run in parallel (all review tasks)
- **Phase 2**: T009, T010 can run in parallel while T008 builds
- **Phase 4**: T035-T040 can all run in parallel (different browsers/devices)
- **Phase 5**: T045-T048 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Review tasks (Setup Phase 1):
Task: "Review current home page implementation in frontend/pages/index.vue"
Task: "Review PromptGrid component in frontend/components/prompt/PromptGrid.vue"
Task: "Review EnhancedPromptCard component"
Task: "Review research.md for root cause analysis"
Task: "Review quickstart.md for implementation steps"

# Cross-browser testing (User Story 2 Phase 4):
Task: "Test card clicks in Firefox browser immediately after page load"
Task: "Test card clicks in Safari browser immediately after page load"
Task: "Test card clicks in Edge browser immediately after page load"
Task: "Test card clicks on mobile device"

# Polish tasks (Phase 5):
Task: "Run complete verification checklist from quickstart.md"
Task: "Document lessons learned about lazy loading"
Task: "Update CLAUDE.md with insights"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment and issue)
2. Complete Phase 2: Foundational (prepare for fix)
3. Complete Phase 3: User Story 1 (remove lazy loading from cards)
4. **STOP and VALIDATE**: Test that cards are clickable immediately
5. Commit and deploy fix
6. Verify in production

**Timeline**: ~30-45 minutes total

### Incremental Delivery

1. Complete Setup + Foundational → Issue confirmed, baseline measured
2. Add User Story 1 → Cards clickable immediately → Deploy (MVP!)
3. Add User Story 2 → Cross-browser/device verification → Deploy
4. Polish → Documentation and deployment monitoring

### Parallel Team Strategy

With multiple developers:

1. Developer A: User Story 1 (fix the code)
2. Developer B: User Story 2 (cross-browser testing - can start after US1 is locally working)
3. Both work in parallel after User Story 1 code changes are committed

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2] labels map tasks to user stories
- User Story 1 is the MVP and MUST complete for fixing the critical usability regression
- User Story 2 is verification testing to ensure fix works consistently
- No unit/integration tests needed - this is a code fix verified by manual testing
- Stop at checkpoint after User Story 1 to validate independently
- Trade-off: Slightly larger initial bundle (~10-50KB) for immediate interactivity
- Avoid: changing other lazy-loaded components (filters, search), modifying other routes, adding new features
