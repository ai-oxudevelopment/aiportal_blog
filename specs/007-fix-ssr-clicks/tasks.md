# Tasks: Fix SSR Click Delay in Nuxt 4

**Input**: Design documents from `/specs/007-fix-ssr-clicks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Manual testing scenarios defined in quickstart.md. No automated unit tests requested for this feature.

**Organization**: Tasks are organized by phase with investigation-first approach. User stories can be implemented incrementally after diagnostic investigation identifies root cause.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` (Nuxt 3 application)
- **Configuration**: `frontend/nuxt.config.js` (SSR MUST remain enabled)
- **Components**: `frontend/components/`, `frontend/pages/`, `frontend/app.vue`
- **Composables**: `frontend/composables/`
- **Tests**: Manual testing via quickstart.md scenarios

---

## Phase 1: Setup (Diagnostic Infrastructure)

**Purpose**: Establish performance measurement infrastructure and baseline metrics

**Critical Constraint**: DO NOT disable SSR - SSR must remain enabled throughout

- [ ] T001 Add performance measurement logging to frontend/app.vue (TTI tracking, SSR mode confirmation)
- [ ] T002 [P] Add click timing measurement to frontend/components/prompt/EnhancedPromptCard.vue (log click-to-navigation time)
- [ ] T003 [P] Create performance metrics utility composable in frontend/composables/usePerformanceMetrics.ts (TTI measurement, click timing, metrics logging)
- [ ] T004 Measure and document baseline performance metrics (current TTI, click response time, bundle size) before any optimizations
- [ ] T005 Verify SSR mode is enabled in frontend/nuxt.config.js (confirm ssr: true, document current configuration)

**Checkpoint**: Measurement infrastructure ready - can now establish baseline and measure improvements

---

## Phase 2: Diagnostic Investigation (Root Cause Identification)

**Purpose**: Investigate and identify actual root cause of 5-10 second hydration delay

**Approach**: 2-3 hour timebox, systematic investigation across 6 areas

**⚠️ CRITICAL**: Do NOT implement optimizations until root cause is identified

- [ ] T006 Analyze bundle size in frontend/.nuxt/dist/client/_nuxt/ (measure total size, identify largest chunks, check for Vuetify/Mermaid sizes)
- [ ] T007 [P] Check browser console for hydration errors (load page with DevTools, look for "Hydration node mismatch" warnings, document any errors)
- [ ] T008 [P] Measure server response time TTFB (use DevTools Network tab, check Time to First Byte, document blocking operations)
- [ ] T009 [P] Verify component import patterns in frontend/pages/index.vue (check PromptGrid import, verify synchronous import for critical components)
- [ ] T010 [P] Check for ClientOnly wrappers in frontend/components/prompt/EnhancedPromptCard.vue (look for <ClientOnly> wrapping card components, document usage)
- [ ] T011 [P] Review Nuxt SSR configuration in frontend/nuxt.config.js (check for experimental.asyncEntry, review routeRules, document settings)
- [ ] T012 Document diagnostic findings and identify root cause (compile measurements, determine primary cause, rank contributing factors)

**Checkpoint**: Root cause identified - ready to implement targeted fix

---

## Phase 3: User Story 1 - Instant Click Interactivity (Priority: P1) 🎯 MVP

**Goal**: Eliminate 5-10 second click delay so cards work within 1 second of page load

**Independent Test**: Load page, immediately click any card - navigation should start within 1 second. See quickstart.md Test 1 for detailed verification.

**Implementation**: Tasks will be generated based on root cause findings from Phase 2. Choose ONE path:

### Path A: If Bundle Size Issue Identified

- [ ] T013 [P] Optimize chunk splitting in frontend/nuxt.config.js (separate Vuetify, Mermaid, Vue-vendor into distinct chunks)
- [ ] T014 [P] Lazy-load Mermaid in frontend/components/ (ensure not in critical path, load on-demand when needed)
- [ ] T015 [P] Defer non-critical JavaScript loading in frontend/app.vue (load analytics, non-essential scripts after 2 seconds)
- [ ] T016 [P] Remove unused dependencies from frontend/package.json (reduce bundle size, tree-shake unused code)
- [ ] T017 Verify bundle size reduction (yarn build, check .nuxt/dist/client/_nuxt/, confirm 20%+ reduction or significant improvement)
- [ ] T018 Test immediate click responsiveness (quickstart.md Test 1, measure TTI, verify click < 1000ms)

### Path B: If Server Blocking Issue Identified

- [ ] T019 [P] Move data fetching to client-side in frontend/composables/useFetchArticles.ts (change from setup to onMounted, prevent server blocking)
- [ ] T020 [P] Implement progressive data loading in frontend/pages/index.vue (show loading state during fetch, render cards as data arrives)
- [ ] T021 [P] Add loading skeleton in frontend/components/prompt/PromptGrid.vue (shimmer effect during data fetch, improve perceived performance)
- [ ] T022 [P] Defer non-critical API calls in frontend/composables/ (move secondary data fetching to after hydration)
- [ ] T023 Verify server response time < 500ms (measure TTFB in DevTools, confirm HTML not blocked)
- [ ] T024 Test immediate click responsiveness (quickstart.md Test 1, verify click < 1000ms)

### Path C: If Component Loading Issue Identified

- [ ] T025 [P] Convert critical components to sync imports in frontend/components/prompt/PromptGrid.vue (ensure EnhancedPromptCard imported synchronously)
- [ ] T026 [P] Convert critical components to sync imports in frontend/pages/index.vue (ensure PromptGrid imported synchronously)
- [ ] T027 [P] Remove unnecessary ClientOnly wrappers in frontend/components/prompt/EnhancedPromptCard.vue (if present, remove to enable immediate hydration)
- [ ] T028 [P] Verify no defineAsyncComponent for critical components in frontend/ (search codebase, document sync imports for interactive elements)
- [ ] T029 Test immediate click responsiveness (quickstart.md Test 1, verify components load immediately)

### Path D: If Configuration Issue Identified

- [ ] T030 Adjust Nuxt SSR settings in frontend/nuxt.config.js (remove experimental.asyncEntry if enabled, optimize routeRules)
- [ ] T031 [P] Review and optimize PWA configuration in frontend/nuxt.config.js (ensure navigateFallback works with SSR, check caching strategy)
- [ ] T032 [P] Test configuration changes individually (yarn build after each change, measure impact on TTI)
- [ ] T033 Test immediate click responsiveness (quickstart.md Test 1, verify configuration resolved delay)

### Path E: If Hydration Errors Identified

- [ ] T034 [P] Fix SSR/client mismatches in frontend/components/prompt/EnhancedPromptCard.vue (ensure consistent rendering between server and client)
- [ ] T035 [P] Use v-if instead of v-show for conditional hydration in frontend/ (avoid hydration mismatches with v-show)
- [ ] T036 [P] Verify no innerHTML usage in frontend/components/ (innerHTML strips event handlers, use Vue templates instead)
- [ ] T037 Test immediate click responsiveness (quickstart.md Test 1, verify no hydration errors in console)

### Universal Tasks (Complete After Any Path)

- [ ] T038 Verify all success criteria for US1 (SC-001 through SC-008 from spec.md)
- [ ] T039 Test click responsiveness on slow network (Chrome DevTools 3G throttling, verify < 1000ms)
- [ ] T040 Document root cause and fix applied in frontend/docs/adr/007-ssr-optimization.md (record findings, document resolution strategy)

**Checkpoint**: User Story 1 complete - cards clickable within 1 second of page load

---

## Phase 4: User Story 2 - Fast Initial Page Load (Priority: P2)

**Goal**: Optimize initial page load time under 2 seconds on standard connections

**Independent Test**: Measure Time to Interactive with Chrome DevTools - should be under 2 seconds. See quickstart.md SC-003 verification.

**Dependencies**: Can proceed in parallel with US1 if root cause identified, but better to complete US1 first to avoid conflicting optimizations.

- [ ] T041 [P] Optimize code splitting configuration in frontend/nuxt.config.js (verify manualChunks for Vuetify, Mermaid separation)
- [ ] T042 [P] Verify lazy-loading for non-critical components in frontend/pages/index.vue (CategoriesFilter, PromptSearch should be async-loaded)
- [ ] T043 [P] Add loading skeleton styles to frontend/app.vue (.loading-skeleton class, shimmer animation)
- [ ] T044 [P] Defer non-critical CSS loading in frontend/app.vue (animations.css loads after 2 seconds via media print hack)
- [ ] T045 [P] Optimize data fetching timing in frontend/composables/useFetchArticles.ts (ensure fetching doesn't block hydration)
- [ ] T046 Measure and verify TTI < 2000ms (use DevTools Performance tab, document measurements in quickstart.md)
- [ ] T047 Test on mobile device if available (iOS Safari, Android Chrome, verify < 2s TTI)

**Checkpoint**: User Story 2 complete - page loads in under 2 seconds

---

## Phase 5: User Story 3 - Consistent Navigation Behavior (Priority: P3)

**Goal**: Ensure all navigation methods work consistently without delays

**Independent Test**: Navigate using cards, menu links, and browser back/forward - all should respond promptly. See quickstart.md Test 2 for rapid multi-click verification.

**Dependencies**: Can proceed after US1 complete (US1 fixes click delays, US3 ensures consistency across navigation methods)

- [ ] T048 [P] Test navigation consistency across all card types in frontend/components/prompt/, frontend/components/speckit/ (verify PromptCard, SpeckitCard, EnhancedPromptCard all work)
- [ ] T049 [P] Add navigation timing measurement to all card click handlers (log router.push() timing, verify < 500ms)
- [ ] T050 [P] Verify router.push() calls complete within 500ms in frontend/components/ (check all navigation handlers, measure timing)
- [ ] T051 [P] Test browser back/forward button behavior (navigate away, click back, verify interactivity preserved, no hydration gap)
- [ ] T052 [P] Add error handling for navigation failures in frontend/components/prompt/EnhancedPromptCard.vue (try/catch around router.push, log errors)
- [ ] T053 [P] Run rapid multi-click test (click 3 cards rapidly, verify first navigation wins, no crashes)
- [ ] T054 Test cross-browser navigation consistency (Chrome, Firefox, Safari if available)

**Checkpoint**: User Story 3 complete - all navigation methods work consistently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and quality assurance

**Dependencies**: All desired user stories complete

- [ ] T055 [P] Run all quickstart.md test scenarios (Tests 1-4, document results)
- [ ] T056 [P] Verify all 8 success criteria from spec.md (SC-001 through SC-008, document passing criteria)
- [ ] T057 [P] Measure bundle size before and after (compare baseline from T004 with final build, check for 20% reduction or no regression)
- [ ] T058 [P] Create ADR document for SSR optimization in frontend/docs/adr/007-ssr-optimization.md (document root cause, fix applied, constitutional exception justification)
- [ ] T059 [P] Update CLAUDE.md with SSR optimization notes and performance patterns (add findings to project documentation)
- [ ] T060 [P] Clean up console logging (keep critical metrics, remove debug logs, preserve performance measurement in production)
- [ ] T061 [P] Verify PWA service worker works with SSR mode (test offline capability, caching strategy)
- [ ] T062 [P] Run slow network simulation (Chrome DevTools Fast 3G throttling, verify acceptable performance)
- [ ] T063 [P] Final cross-browser verification (test on Chrome, Firefox, Safari, document any browser-specific issues)

**Checkpoint**: Feature complete - all success criteria met, documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Diagnostic Investigation (Phase 2)**: Depends on Setup completion - measurement infrastructure required
- **User Story 1 (Phase 3)**: Depends on Investigation completion - must identify root cause before implementing fix
- **User Story 2 (Phase 4)**: Can proceed after US1 OR in parallel if root cause known (independent but builds on US1)
- **User Story 3 (Phase 5)**: Should proceed after US1 (depends on click delays being fixed)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Critical Path

1. Setup (T001-T005) → Required for all measurements
2. Diagnostic Investigation (T006-T012) → Required before implementing any fix
3. Root Cause Decision (after T012) → Determines which path in US1 to take
4. US1 Implementation (T013-T040, one path only) → Fixes critical click delay
5. US2 & US3 (T041-T054) → Can proceed after US1
6. Polish (T055-T063) → Final verification

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Depends on Phase 2 Investigation - Must know root cause before fixing
- **User Story 2 (P2)**: Independent of US1, but better to complete US1 first (avoid conflicting changes)
- **User Story 3 (P3)**: Depends on US1 - requires click delays to be fixed before testing consistency

### Within User Story 1 (Phase 3)

**IMPORTANT**: Only execute ONE path (A, B, C, D, or E) based on root cause findings from T012

- **Path Selection**: Choose based on diagnostic investigation
- **Parallel Within Path**: Tasks marked [P] within chosen path can run in parallel
- **Universal Tasks**: T038-T040 complete the story regardless of path

### Within User Story 2 (Phase 4)

- T041-T045 can run in parallel (different files/areas)
- T046-T047 sequential (measurement and verification)

### Within User Story 3 (Phase 5)

- T048-T052 can run in parallel (different components/tests)
- T053-T054 sequential (integration and cross-browser testing)

### Within Polish Phase (Phase 6)

- All tasks T055-T063 can run in parallel (different verification activities)

---

## Implementation Strategy

### Investigation-First (Recommended)

1. Complete Setup (Phase 1) → Measurement infrastructure ready
2. Complete Diagnostic Investigation (Phase 2) → Identify root cause
3. **DECISION GATE**: Choose path in US1 based on findings
4. Execute User Story 1 (Phase 3, one path only) → Fix click delay
5. **STOP and VALIDATE**: Test US1 independently (quickstart.md Test 1)
6. Add US2 and US3 if desired → Additional optimizations
7. Polish → Deploy production

**MVP Delivers**: Cards clickable within 1 second - solves the primary user complaint

### Incremental Delivery

1. Setup → Foundation ready (T001-T005)
2. Investigation → Root cause identified (T006-T012)
3. User Story 1 → Test independently → Deploy/Demo (T013-T040) - **MVP!**
4. User Story 2 → Test independently → Deploy/Demo (T041-T047)
5. User Story 3 → Test independently → Deploy/Demo (T048-T054)
6. Polish → Deploy production (T055-T063)

Each story adds value without breaking previous stories:
- US1: Fixes click delay (critical)
- US2: Improves load performance (important)
- US3: Ensures consistency (nice to have)

### Parallel Execution Strategy

**After Investigation** (with multiple developers):

1. Team completes Setup + Investigation together (T001-T012)
2. Execute User Story 1 together (T013-T040, one path) - **MVP**
3. Work in parallel:
   - Developer A: User Story 2 (T041-T047)
   - Developer B: User Story 3 (T048-T054)
4. Team completes Polish together (T055-T063)

---

## Task Summary

**Total Tasks**: 63

**Breakdown by Phase**:
- Setup (Phase 1): 5 tasks
- Investigation (Phase 2): 7 tasks
- User Story 1 (Phase 3): 28 tasks (but only ONE path executed: 8-10 tasks)
- User Story 2 (Phase 4): 7 tasks
- User Story 3 (Phase 5): 7 tasks
- Polish (Phase 6): 9 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel

**Actual Execution**: 5 + 7 + (8-10) + 7 + 7 + 9 = 43-45 tasks (depending on US1 path chosen)

**MVP Tasks**: 20-22 tasks (Setup + Investigation + US1 single path + minimal polish)

**Estimated Time**:
- Investigation: 2-3 hours (timeboxed)
- US1 Implementation: 2-4 hours (depends on root cause)
- US2 + US3: 2-3 hours each (if needed)
- Polish: 1-2 hours

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description`
✅ All tasks include exact file paths
✅ User Story tasks have [US1], [US2], [US3] labels
✅ Setup/Investigation/Polish tasks have no story label
✅ Parallel tasks marked with [P]
✅ 63 total tasks organized in 6 phases
✅ MVP scope clearly defined (Phases 1-3)
✅ Critical constraint documented: SSR MUST remain enabled
✅ Investigation-first approach enforced (Phase 2 before fixes)

---

## Notes

- [P] tasks = different files, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- Phase 3 tasks are organized by path (A-E) - execute ONLY ONE path based on investigation findings
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing via quickstart.md scenarios (no automated tests requested)
- **CRITICAL**: SSR mode must remain enabled throughout implementation
- Root cause MUST be identified before implementing fixes (no premature optimization)
- Risk level: MEDIUM (investigation needed, then targeted fix based on findings)

---

**Next**: Execute Setup phase (T001-T005) to establish measurement infrastructure.
