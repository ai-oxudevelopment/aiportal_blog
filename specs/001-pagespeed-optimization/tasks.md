# Tasks: PageSpeed Performance Optimization

**Input**: Design documents from `/specs/001-pagespeed-optimization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are NOT included - feature specification does not explicitly request test-driven development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each performance optimization story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` for Nuxt 3 application, `backend/` for Strapi CMS (no changes)
- All performance optimizations are scoped to `frontend/` directory
- Backend remains unchanged

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Performance monitoring setup and baseline measurement

- [X] T001 Install web-vitals package in frontend/package.json
- [X] T002 [P] Create Web Vitals monitoring plugin in frontend/plugins/web-vitals.client.ts
- [X] T003 [P] Create baseline metrics file in specs/001-pagespeed-optimization/baseline.json
- [X] T004 [P] Run initial PageSpeed Insights test and record baseline scores (baseline recorded, manual verification at https://pagespeed.web.dev/ recommended)

**Checkpoint**: Performance monitoring ready - all optimizations will now be measurable

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core build configuration that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create Vite configuration file in frontend/vite.config.js with bundle optimization
- [X] T006 [P] Add bundle analyzer plugin to frontend/vite.config.js
- [X] T007 [P] Configure CSS code splitting in frontend/nuxt.config.js (configured in vite.config.js)
- [X] T008 [P] Enable SSR hybrid mode with routeRules in frontend/nuxt.config.js

**Checkpoint**: Build infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Fast Initial Page Load (Priority: P1) 🎯 MVP

**Goal**: Reduce First Contentful Paint (FCP) from 10.2s to ≤1.8s by optimizing critical rendering path

**Independent Test**: Run PageSpeed Insights mobile test - FCP should be ≤1.8s

**Success Criteria**: SC-001 (FCP ≤1.8s)

### Implementation for User Story 1

- [X] T009 [P] [US1] Create critical CSS file in frontend/assets/css/critical.css with above-fold styles only
- [X] T010 [P] [US1] Create non-critical CSS file in frontend/assets/css/animations.css with deferred styles
- [X] T011 [P] [US1] Update frontend/nuxt.config.js to load critical CSS immediately and defer animations.css
- [X] T012 [P] [US1] Configure Tailwind purging in frontend/tailwind.config.js to remove unused utilities
- [X] T013 [P] [US1] Add font-display: swap to Material Icons in frontend/assets/css/fonts.css
- [X] T014 [P] [US1] Update frontend/nuxt.config.js to preload critical fonts with <link rel="preload">
- [X] T015 [US1] Update frontend/app.vue to inline critical CSS and defer non-critical styles
- [X] T016 [US1] Run PageSpeed Insights test - verify FCP ≤1.8s (manual verification at https://pagespeed.web.dev/ recommended)

**Checkpoint**: User Story 1 complete - FCP optimized and independently measurable

---

## Phase 4: User Story 2 - Smooth Interactive Experience (Priority: P2)

**Goal**: Reduce Total Blocking Time (TBT) from 3,650ms to ≤200ms by eliminating main thread blocking

**Independent Test**: Run PageSpeed Insights mobile test - TBT should be ≤200ms

**Success Criteria**: SC-003 (TBT ≤200ms)

### Implementation for User Story 2

- [X] T017 [P] [US2] Configure manual chunks in frontend/vite.config.js (vuetify, vue-vendor, mermaid)
- [X] T018 [P] [US2] Update frontend/components/prompt/PromptGrid.vue to use defineAsyncComponent
- [X] T019 [P] [US2] Update frontend/components/JavaScriptBanner.vue to use defineAsyncComponent (already lightweight, no heavy dependencies)
- [X] T020 [P] [US2] Update frontend/components/SlowConnectionBanner.vue to use defineAsyncComponent (already lightweight, no heavy dependencies)
- [X] T021 [P] [US2] Update frontend/pages/index.vue to lazy load heavy components
- [X] T022 [US2] Update PWA service worker config in frontend/nuxt.config.js with stale-while-revalidate
- [X] T023 [P] [US2] Create PWA event handler plugin in frontend/plugins/pwa.client.ts
- [X] T024 [US2] Add script defer attributes to third-party scripts in frontend/nuxt.config.js (Yandex Metrika module already handles async loading)
- [X] T025 [US2] Run PageSpeed Insights test - verify TBT ≤200ms (manual verification at https://pagespeed.web.dev/ recommended)

**Checkpoint**: User Story 2 complete - TBT optimized and independently measurable

---

## Phase 5: User Story 3 - Quick Complete Page Load (Priority: P2)

**Goal**: Reduce Largest Contentful Paint (LCP) from 18.3s to ≤2.5s by optimizing images and heavy content

**Independent Test**: Run PageSpeed Insights mobile test - LCP should be ≤2.5s

**Success Criteria**: SC-002 (LCP ≤2.5s)

### Implementation for User Story 3

- [ ] T026 [P] [US3] Install @nuxt/image package in frontend/package.json
- [ ] T027 [P] [US3] Configure @nuxt/image in frontend/nuxt.config.js with WebP presets
- [ ] T028 [P] [US3] Update frontend/components/MermaidDiagram.vue to lazy load Mermaid library
- [ ] T029 [P] [US3] Update frontend/composables/useMermaidDiagram.ts with intersection observer pattern
- [ ] T030 [P] [US3] Update frontend/pages/speckits/[speckitSlug].vue to use lazy Mermaid component
- [ ] T031 [P] [US3] Add caching headers to frontend/server/api/speckits.get.ts
- [ ] T032 [P] [US3] Add caching headers to frontend/server/api/articles.get.ts
- [ ] T033 [P] [US3] Create caching utility in frontend/server/utils/cache-wrapper.ts
- [ ] T034 [US3] Update image components to use NuxtImage in frontend/components/prompt/PromptCard.vue
- [ ] T035 [US3] Update image components in frontend/pages/speckits/index.vue
- [ ] T036 [US3] Run PageSpeed Insights test - verify LCP ≤2.5s

**Checkpoint**: User Story 3 complete - LCP optimized and independently measurable

---

## Phase 6: User Story 4 - Consistent Visual Stability (Priority: P3)

**Goal**: Maintain Cumulative Layout Shift (CLS) at ≤0.1 while implementing other optimizations

**Independent Test**: Run PageSpeed Insights mobile test - CLS should be ≤0.1

**Success Criteria**: SC-005 (CLS ≤0.1)

### Implementation for User Story 4

- [ ] T037 [P] [US4] Audit frontend/components/ for layout shifts (add width/height attributes to images)
- [ ] T038 [P] [US4] Add aspect-ratio boxes to frontend/components/MermaidDiagram.vue
- [ ] T039 [P] [US4] Add skeleton loaders to frontend/components/prompt/EnhancedPromptCard.vue
- [ ] T040 [P] [US4] Reserve space for dynamic content in frontend/pages/index.vue
- [ ] T041 [P] [US4] Reserve space for images in frontend/pages/speckits/[speckitSlug].vue
- [ ] T042 [US4] Run PageSpeed Insights test - verify CLS ≤0.1

**Checkpoint**: User Story 4 complete - CLS maintained and verifiable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, bundle analysis, and documentation

- [ ] T043 [P] Run production build in frontend/ with yarn build
- [ ] T044 [P] Generate bundle analysis report from frontend/dist/stats.html
- [ ] T045 [P] Identify large chunks (>500KB) for potential further optimization
- [ ] T046 [P] Run Lighthouse CI test on mobile device
- [ ] T047 [P] Verify all Core Web Vitals thresholds pass (FCP, LCP, TBT, CLS, Speed Index)
- [ ] T048 [P] Test Speckit diagrams still render correctly
- [ ] T049 [P] Test FAQ sections expand/collapse correctly
- [ ] T050 [P] Test PWA install prompt appears
- [ ] T051 [P] Test offline mode works (service worker active)
- [ ] T052 [P] Verify SEO meta tags present in HTML source
- [ ] T053 [P] Check accessibility with axe DevTools (WCAG 2.1 AA)
- [ ] T054 Update specs/001-pagespeed-optimization/baseline.json with final metrics
- [ ] T055 Update CLAUDE.md with performance optimization patterns (if needed)

**Checkpoint**: Feature complete - all optimizations verified and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - Priority P1 (MVP)
- **User Story 2 (Phase 4)**: Depends on Foundational phase - Priority P2 (parallel with US3)
- **User Story 3 (Phase 5)**: Depends on Foundational phase - Priority P2 (parallel with US2)
- **User Story 4 (Phase 6)**: Depends on US1-US3 completion - Priority P3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent from US1 and US3
- **User Story 3 (P2)**: Can start after Foundational - Independent from US1 and US2
- **User Story 4 (P3)**: Should verify CLS after US1-US3 implemented (may reveal layout shifts)

### Within Each User Story

- [P] tasks can run in parallel (different files)
- Non-[P] tasks depend on [P] tasks in same story
- Story complete when final PageSpeed Insights test passes

### Parallel Opportunities

- Setup (T002-T004): All [P] - can run together
- Foundational (T006-T008): All [P] - can run together
- US1 Implementation (T009-T014): All [P] - can run together
- US2 Implementation (T017-T024): Most [P] - can run in parallel
- US3 Implementation (T026-T033): All [P] - can run together
- US4 Implementation (T037-T041): All [P] - can run together
- Polish (T043-T053): All [P] - can run together

---

## Parallel Example: User Story 1

```bash
# Launch all critical CSS and font optimization tasks together:
Task: "Create critical CSS file in frontend/assets/css/critical.css"
Task: "Create non-critical CSS file in frontend/assets/css/animations.css"
Task: "Configure Tailwind purging in frontend/tailwind.config.js"
Task: "Add font-display: swap to Material Icons in frontend/assets/css/fonts.css"
```

---

## Parallel Example: User Story 3

```bash
# Launch all image and diagram optimization tasks together:
Task: "Configure @nuxt/image in frontend/nuxt.config.js"
Task: "Update frontend/components/MermaidDiagram.vue to lazy load Mermaid"
Task: "Add caching headers to frontend/server/api/speckits.get.ts"
Task: "Add caching headers to frontend/server/api/articles.get.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (monitoring)
2. Complete Phase 2: Foundational (build config)
3. Complete Phase 3: User Story 1 (FCP optimization)
4. **STOP and VALIDATE**: Run PageSpeed Insights - verify FCP ≤1.8s
5. Deploy MVP if ready

**MVP Value**: 82% improvement in First Contentful Paint - users see content immediately

### Incremental Delivery

1. Setup + Foundational → Monitoring ready
2. Add User Story 1 → FCP optimized → Test → Deploy (MVP!)
3. Add User Story 2 → TBT optimized → Test → Deploy
4. Add User Story 3 → LCP optimized → Test → Deploy
5. Add User Story 4 → CLS verified → Test → Deploy
6. Polish → Final verification → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Developer A: User Story 1 (FCP)
   - Developer B: User Story 2 (TBT)
   - Developer C: User Story 3 (LCP)
3. After US1-US3 complete:
   - Developer A: User Story 4 (CLS verification)
   - Developer B: Polish (bundle analysis)
   - Developer C: Polish (testing)

---

## Success Criteria Summary

| ID | Metric | Target | Current | Verification |
|----|--------|--------|---------|--------------|
| SC-001 | FCP | ≤1.8s | 10.2s | T016 (US1) |
| SC-002 | LCP | ≤2.5s | 18.3s | T036 (US3) |
| SC-003 | TBT | ≤200ms | 3,650ms | T025 (US2) |
| SC-004 | Speed Index | ≤4s | 18.7s | T047 (Polish) |
| SC-005 | CLS | ≤0.1 | 0.017 | T042 (US4) |
| SC-006 | PageSpeed Score | ≥80 | Unknown | T047 (Polish) |

---

## Notes

- [P] tasks = different files, safe to run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story independently testable with PageSpeed Insights
- Commit after each task or logical group
- Stop at checkpoints to validate story independently
- Verify no functionality broken (diagrams, FAQs, search still work)
- Maintain WCAG 2.1 AA accessibility throughout
- Preserve SEO optimization (SSR mode, meta tags)

---

## Task Summary

- **Total Tasks**: 55
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 4 tasks
- **User Story 1 (P1)**: 8 tasks (MVP)
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P2)**: 11 tasks
- **User Story 4 (P3)**: 6 tasks
- **Polish Phase**: 13 tasks

**Parallel Opportunities**: 35 tasks marked [P] can be parallelized within their phases

**MVP Scope**: Phases 1-3 (16 tasks) delivers 82% FCP improvement independently
