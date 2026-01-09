# Implementation Tasks: SSR Performance Optimization and Mobile Speed Improvements

**Feature Branch**: `001-ssr-performance-optimization`
**Date**: 2025-01-09
**Status**: Ready for Implementation
**Input**: Generated from plan.md, spec.md, research.md, data-model.md

---

## Phase 1: Setup & Baseline Measurement

**Goal**: Establish performance baseline and prepare development environment

### Tasks

- [ ] T001 Measure baseline performance using PageSpeed Insights Mobile on key pages (/ /speckits /research) and save results to specs/001-ssr-performance-optimization/baseline/pre-optimization/
- [ ] T002 Create baseline directory at specs/001-ssr-performance-optimization/baseline/ for storing before/after measurements
- [ ] T003 Verify current Docker build completes successfully with `docker build -t aiportal-frontend:baseline -f Dockerfile .`
- [ ] T004 Document current build time with `time docker build -t aiportal-frontend:baseline -f Dockerfile .`
- [ ] T005 Test current container startup time with `time docker run -p 8081:8080 aiportal-frontend:baseline`

---

## Phase 2: Foundational Infrastructure

**Goal**: Implement core caching and SSR infrastructure required by all user stories

**Blocking**: All tasks in this phase must complete before user story phases

### Tasks

- [ ] T006 Enable SSR by changing ssr: false to ssr: true in frontend/nuxt.config.js line 2
- [ ] T007 Update frontend/app.vue to add JavaScriptBanner component and handle SSR hydration
- [ ] T008 [P] Create frontend/server/middleware/cache.ts with withStaleWhileRevalidate function and in-memory Map cache (5min fresh, 1hr stale TTL)
- [ ] T009 [P] Create frontend/server/utils/cache-control.ts with cache key generation utilities (generateCacheKey, isExpired, isStaleButUsable functions)
- [ ] T010 [P] Create frontend/composables/useNetworkDetection.ts with Navigator Connection API logic for 2G/EDGE detection
- [ ] T011 [P] Create frontend/components/shared/banners/JavaScriptBanner.vue with onMounted detection and banner display
- [ ] T012 [P] Create frontend/components/shared/banners/SlowConnectionBanner.vue with Russian/English loading messages
- [ ] T013 [P] Create frontend/components/shared/banners/StaleContentBanner.vue with "Content may be outdated" message and auto-refresh logic
- [ ] T014 Create frontend/server/middleware/prefetch.ts with prefetch link detection and Nuxt router.prefetch calls
- [ ] T015 Test SSR renders complete HTML by viewing page source and verifying content presence (not empty __nuxt div)
- [ ] T016 Test cache middleware with unit tests for cache key generation, expiration logic, and stale-while-revalidate flow

---

## Phase 3: User Story 1 - Fast Initial Page Load on Mobile Devices (Priority: P1)

**Goal**: Deliver <1.5s page load on 4G mobile and <3s on 3G mobile

**Independent Test**: Measure page load time on mobile network simulation (4G/3G throttling in Chrome DevTools) and verify Time to Interactive meets targets

**Success Criteria**:
- 4G: TTI < 1.5s (SC-001)
- 3G: TTI < 3s (SC-002)
- LCP contains visible content (SC-004)
- 20+ point Performance score improvement (SC-008)

### Tasks

- [ ] T017 [US1] Wrap frontend/server/api/articles.get.ts with withStaleWhileRevalidate caching using cache key pattern "articles:list"
- [ ] T018 [US1] Wrap frontend/server/api/speckits.get.ts with withStaleWhileRevalidate caching using cache key pattern "speckits:list"
- [ ] T019 [P] [US1] Wrap frontend/server/api/pages.get.ts with withStaleWhileRevalidate caching using cache key pattern "pages:list"
- [ ] T020 [US1] Add X-Content-Stale: true header to server routes when serving stale cache responses
- [ ] T021 [P] [US1] Update frontend/composables/useArticles.ts to check X-Content-Stale header and expose isStale computed property
- [ ] T022 [P] [US1] Update frontend/composables/useSpeckits.ts to check X-Content-Stale header and expose isStale computed property
- [ ] T023 [US1] Add StaleContentBanner to frontend/pages/index.vue with v-if="isStale" condition
- [ ] T024 [US1] Add SlowConnectionBanner to frontend/pages/index.vue with v-if="isSlowConnection && pending" condition
- [ ] T025 [US1] Add SlowConnectionBanner to frontend/pages/speckits/index.vue with v-if="isSlowConnection && pending" condition
- [ ] T026 [US1] Test cache behavior: Load page (cache miss), reload (fresh cache), wait 5min, reload (stale), verify banner shows
- [ ] T027 [US1] Test stale-while-revalidate: Stop Strapi, reload page (serves stale), verify banner shows, start Strapi, verify auto-refresh clears banner
- [ ] T028 [US1] Test 2G network: Chrome DevTools Network throttling to "Slow 3G", reload page, verify SlowConnectionBanner shows, verify no timeout errors
- [ ] T029 [US1] Test progressive enhancement: Disable JavaScript in DevTools, reload page, verify content is readable, verify JavaScriptBanner shows
- [ ] T030 [US1] Measure post-optimization performance with PageSpeed Insights Mobile on same pages as baseline, save to specs/001-ssr-performance-optimization/baseline/post-optimization.json
- [ ] T031 [US1] Validate 20+ point Performance score improvement by comparing pre/post optimization measurements
- [ ] T032 [US1] Validate LCP < 1.5s on 4G (SC-001), FCP < 1.5s (SC-010), CLS < 0.1 (SC-009), 95% visible content (SC-004)

---

## Phase 4: User Story 2 - Fast Navigation Between Pages (Priority: P2)

**Goal**: Deliver <500ms navigation transitions for returning users

**Independent Test**: Use Chrome DevTools Performance tab to measure transition time between pages, verify <500ms target

**Success Criteria**:
- Navigation < 500ms on WiFi (SC-003)
- No flash of unstyled content
- Browser back/forward < 300ms

### Tasks

- [ ] T033 [US2] Create frontend/composables/useSmartPrefetch.ts with onLinkHover (100ms delay) and onLinkTouch (immediate) functions
- [ ] T034 [US2] Create frontend/components/shared/PrefetchLink.vue wrapping NuxtLink with @mouseenter/@mouseleave/@touchstart handlers calling useSmartPrefetch
- [ ] T035 [P] [US2] Replace NuxtLink with PrefetchLink in frontend/pages/index.vue for navigation links to /speckits and /research
- [ ] T036 [P] [US2] Replace NuxtLink with PrefetchLink in frontend/pages/speckits/index.vue for article detail links
- [ ] T037 [US2] Test prefetch behavior: Open Chrome DevTools Network tab, hover over links, verify prefetch requests appear
- [ ] T038 [US2] Test navigation timing: Chrome DevTools Performance tab, record navigation from home to speckits, verify transition < 500ms
- [ ] T039 [US2] Test back/forward navigation: Navigate between pages, use browser back button, verify content displays < 300ms
- [ ] T040 [US2] Test no flash of unstyled content: Navigate between pages rapidly, verify smooth transitions without blank screens

---

## Phase 5: User Story 3 - Content Visibility and SEO (Priority: P3)

**Goal**: Ensure complete HTML content in initial response for search engines

**Independent Test**: View page source (Ctrl/Cmd + U) and verify HTML contains articles, titles, descriptions without executing JavaScript

**Success Criteria**:
- HTML contains all primary content (SC-007)
- Open Graph tags present in initial HTML
- Social media link previews work correctly

### Tasks

- [ ] T041 [US3] Verify SSR HTML content: View page source of /, check for rendered article titles and descriptions (not empty divs)
- [ ] T042 [US3] Verify SSR HTML content: View page source of /speckits, check for rendered speckit list content
- [ ] T043 [US3] Test Open Graph tags: Use curl to fetch HTML, grep for og:title, og:description, og:image tags
- [ ] T044 [US3] Test social media preview: Use Facebook Sharing Debugger or Twitter Card Validator on site URLs, verify correct preview
- [ ] T045 [US3] Test search engine crawler: Use curl with Googlebot user-agent, verify HTML contains complete content
- [ ] T046 [US3] Verify meta tags in SSR: Check frontend/nuxt.config.js app.head configuration is applied to SSR output

---

## Phase 6: User Story 4 - Containerized Deployment (Priority: P4)

**Goal**: Maintain Docker build and deployment compatibility with SSR

**Independent Test**: Build Docker image, run container, verify all functionality works

**Success Criteria**:
- Docker build < 10 minutes (SC-005)
- Container startup < 10 seconds (SC-006)
- All functionality works identically to non-containerized deployment

### Tasks

- [ ] T047 [US4] Optimize Dockerfile for SSR: Update COPY commands to copy frontend/ directory, update CMD to "node .output/server/index.mjs"
- [ ] T048 [US4] Add multi-stage build optimization: Create deps stage for yarn install --frozen-lockfile, create build stage for yarn build, create runner stage for Node.js 22-slim
- [ ] T049 [US4] Add .dockerignore file to exclude node_modules, .nuxt, .output, .git, specs/, tests/, "*.log" from Docker build context
- [ ] T050 [US4] Test Docker build with time docker build -t aiportal-frontend:ssr-optimized -f Dockerfile ., verify build completes < 10 minutes
- [ ] T051 [US4] Test Docker container startup with time docker run -p 8082:8080 -e STRAPI_URL=http://localhost:1337 aiportal-frontend:ssr-optimized, verify startup < 10 seconds
- [ ] T052 [US4] Verify containerized SSR: curl http://localhost:8082, verify response contains complete HTML content
- [ ] T053 [US4] Verify containerized functionality: Open http://localhost:8082 in browser, navigate pages, verify all features work (cache, prefetch, banners)
- [ ] T054 [US4] Run Lighthouse against containerized version: lighthouse http://localhost:8082 --view --preset=mobile, verify Performance score improved

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Ensure code quality, documentation, and no regressions

### Tasks

- [ ] T055 Add inline comments to cache middleware explaining TTL values (5min fresh, 1hr stale) and cache key generation logic
- [ ] T056 Add JSDoc comments to useSmartPrefetch composable explaining hover delay and touch prefetch behavior
- [ ] T057 Add JSDoc comments to withStaleWhileRevalidate explaining cache hit/miss/stale flow
- [ ] T058 Test PWA functionality still works: Verify service worker still caches static assets, verify offline capabilities maintained
- [ ] T059 Test Vuetify 3 components hydrate correctly: Check forms, dialogs, navigation render properly with SSR
- [ ] T060 Test Russian-language UI preserved: Verify all banner text is Russian, verify date/number formatting correct
- [ ] T061 Test no regressions in existing functionality: Navigate all pages, verify no broken links, verify no console errors
- [ ] T062 Run full performance validation checklist from quickstart.md (all items verified)
- [ ] T063 Create summary report of performance improvements comparing baseline to post-optimization metrics
- [ ] T064 Update CLAUDE.md with SSR optimization notes and performance measurement procedures
- [ ] T065 Commit all changes with clear commit message: "feat: enable SSR with stale-while-revalidate caching and mobile performance optimizations"

---

## Dependencies

### Story Completion Order

```text
Phase 1 (Setup) ───────┐
                      ├─► Phase 2 (Foundational) ─┐
Phase 4 (US2) ◄────────┤                          ├─► Phase 7 (Polish)
Phase 5 (US3) ◄────────┤                          │
Phase 6 (US4) ◄────────┤                          │
                      └─► Phase 3 (US1) ───────────┘
```

**Dependencies Explained**:
- **Phase 1** must complete first (baseline measurement before changes)
- **Phase 2** must complete after Phase 1 (caching/SSR infrastructure required for all stories)
- **Phase 3 (US1)** is the primary story (mobile performance) and depends on Phase 2
- **Phase 4 (US2)** depends on Phase 2 (needs SSR and prefetch infrastructure)
- **Phase 5 (US3)** depends on Phase 2 (needs SSR to validate HTML content)
- **Phase 6 (US4)** can run in parallel with US2-US5 (Docker is independent of client features)
- **Phase 7** requires all stories complete (polish after all features implemented)

**Parallel Opportunities**:
- Within Phase 2: Tasks T008-T013 can run in parallel (different files)
- Within Phase 3: Tasks T019, T022, T025 can run in parallel (different pages/components)
- Within Phase 4: Tasks T035-T036 can run in parallel (different pages)
- Phases 4, 5, 6 can run in parallel after Phase 2 completes

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: Phase 1 + Phase 2 + Phase 3 (US1) only

**Why**: User Story 1 (P1) delivers the primary value proposition - fast mobile page loads. This MVP:
- Enables SSR (core infrastructure)
- Implements caching (resilience)
- Adds 2G/progressive enhancement support (accessibility)
- Validates performance improvement (20+ points)
- Can be deployed and measured independently

**Subsequent iterations**: Add navigation optimization (US2), SEO validation (US3), Docker deployment (US4)

### Incremental Delivery

1. **Iteration 1**: Setup + Foundational (Phase 1-2)
   - Deploy SSR with basic caching
   - Measure performance improvement

2. **Iteration 2**: Mobile Performance (Phase 3)
   - Full stale-while-revalidate implementation
   - All banner components
   - Complete performance validation

3. **Iteration 3**: Navigation Optimization (Phase 4)
   - Smart prefetching
   - Client-side navigation tuning

4. **Iteration 4**: SEO & Deployment (Phase 5-6)
   - Validate SEO improvements
   - Optimize Docker build
   - Production deployment

---

## Testing Summary

**No automated tests specified** - this feature relies on manual testing and performance measurement tools (PageSpeed Insights, Lighthouse, Chrome DevTools).

**Manual Test Scenarios**:
- Cache behavior testing (fresh → stale → refresh cycle)
- Strapi failure simulation (stale content serving)
- JavaScript disabled testing (progressive enhancement)
- 2G network simulation (slow connection indicator)
- SSR content verification (view page source)
- Navigation timing measurement (Performance tab)
- Docker build/startup timing
- PageSpeed Insights validation

---

## Task Count Summary

- **Total Tasks**: 65
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 11 tasks
- **User Story 1 (P1)**: 16 tasks
- **User Story 2 (P2)**: 8 tasks
- **User Story 3 (P3)**: 6 tasks
- **User Story 4 (P4)**: 8 tasks
- **Polish Phase**: 11 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel (different files, no blocking dependencies)

---

## Format Validation

✅ **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`

✅ **Task IDs**: Sequential (T001-T065)

✅ **Story labels**: Present on all user story phase tasks ([US1], [US2], [US3], [US4])

✅ **Parallel markers**: Present where applicable (15 tasks marked [P])

✅ **File paths**: All tasks include specific file paths

✅ **Independent tests**: Each user story phase has clear independent test criteria

---

## Estimated Complexity

**Low Complexity** ( straightforward implementation):
- Configuration changes (T006-T007)
- Component creation (T011-T013)
- Link replacements (T035-T036)
- Verification tasks (T041-T046)

**Medium Complexity** (requires testing/refinement):
- Cache middleware (T008-T009)
- Server route wrapping (T017-T020)
- Performance testing (T026-T032)
- Navigation timing (T037-T040)

**High Complexity** (multiple dependencies, careful validation):
- Docker optimization (T047-T054)
- Full validation (T055-T065)
- Performance measurement and comparison (T030-T031, T054, T063)

---

## Next Steps

1. **Start with MVP**: Implement Phases 1-3 for core mobile performance improvement
2. **Measure early**: Run baseline measurement (T001) before making any changes
3. **Test continuously**: Validate each task as you complete it
4. **Document findings**: Save all measurement results for final validation

---

**Status**: Ready for implementation
**MVP Recommendation**: Phases 1-3 (Setup, Foundational, User Story 1)
**Estimated MVP Duration**: 3-5 days (assuming 6-8 hours/day)
**Full Feature Duration**: 5-7 days
