# Tasks: Mobile Progressive Web App

**Input**: Design documents from `/specs/001-mobile-pwa/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature. The specification does not explicitly request TDD approach, so test tasks are not included by default. Add tests only if specifically requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `frontend/` at repository root
- All paths assume frontend directory structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and PWA dependencies installation

- [X] T001 Install PWA module dependency @vite-pwa/nuxt using yarn add -D @vite-pwa/nuxt
- [ ] T002 Install testing dependencies Vitest and Playwright using yarn add -D vitest @vitest/ui @vue/test-utils @playwright/test (SKIPPED: Optional for MVP)
- [ ] T003 [P] Generate PWA icons from source logo using pwa-asset-generator CLI tool in frontend/public/icons/ (NOTE: Requires ImageMagick - using favicon.svg as placeholder for now)
- [X] T004 [P] Create frontend/public/offline.html fallback page for offline navigation
- [X] T005 [P] Create frontend/assets/css/mobile-responsive.css file for mobile-specific styles

**Checkpoint**: PWA dependencies installed, icon assets generated, basic CSS structure created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core PWA configuration and mobile infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Configure PWA module in frontend/nuxt.config.ts with manifest, service worker, and runtime caching strategies
- [X] T007 [P] Add iOS-specific meta tags to frontend/app.vue or root layout for PWA installation (apple-touch-icon, mobile-web-app-capable, theme-color)
- [X] T008 [P] Create frontend/composables/usePwaInstall.ts composable for handling PWA install prompts (beforeinstallprompt event, iOS detection, install/dismiss methods)
- [X] T009 [P] Create frontend/composables/useOfflineStatus.ts composable for tracking online/offline status (navigator.onLine/offline events, isOnline ref, isOffline computed)
- [X] T010 [P] Create frontend/composables/useMobileDetect.ts composable for device detection using Vuetify's useDisplay() (mobile breakpoint detection, viewport width tracking)
- [X] T011 [P] Add mobile-responsive CSS utilities to frontend/assets/css/mobile-responsive.css (touch target sizing 44x44px, safe-area-inset support, 100vh fixes, pull-to-refresh)
- [X] T012 Configure Tailwind mobile breakpoints in frontend/tailwind.config.js for 320px, 375px, 768px viewports
- [X] T013 Update frontend/plugins/vuetify.js to configure mobile defaults (mobileBreakpoint: 'sm', thresholds configured)

**Checkpoint**: PWA foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Mobile Responsive Layout (Priority: P1) 🎯 MVP

**Goal**: Users access the AI tools library platform from mobile devices and can view, navigate, and interact with all content without horizontal scrolling, zooming, or distorted layouts.

**Independent Test**: Open the application on a mobile device (or browser dev tools in mobile view) at viewport widths 375px-768px. Navigate through pages and verify: (1) all content fits within viewport width without horizontal scrolling, (2) text is readable without zooming (minimum 16px), (3) interactive elements are tappable (44x44px minimum), (4) orientation changes work without breaking layout.

### Implementation for User Story 1

#### Main Page Mobile Adaptations

- [ ] T014 [P] [US1] Update frontend/pages/index.vue to use mobile-first responsive grid layout (grid-cols-1 for mobile, md:grid-cols-2, lg:grid-cols-3)
- [ ] T015 [P] [US1] Update frontend/components/main/Header.vue to add mobile menu toggle button (v-app-bar-nav-icon with v-if="mobile" condition)
- [ ] T016 [P] [US1] Update frontend/components/main/Sidebar.vue to be collapsible on mobile (:temporary="mobile", :permanent="!mobile" props on v-navigation-drawer)
- [ ] T017 [US1] Update frontend/components/main/Hero.vue to use responsive typography classes (text-4xl md:text-6xl for headings, responsive spacing)

#### Prompt Card Mobile Optimization

- [ ] T018 [P] [US1] Update frontend/components/prompt/PromptCard.vue to ensure full-width on mobile (w-full class, responsive padding)
- [ ] T019 [P] [US1] Update frontend/components/prompt/PromptCard.vue to add minimum touch target sizing (min-h-[44px] class on interactive elements)
- [ ] T020 [P] [US1] Update frontend/components/prompt/CategoriesFilter.vue to use horizontal scroll on mobile (overflow-x-auto for mobile category chips)

#### Blog Page Mobile Responsiveness

- [ ] T021 [P] [US1] Update frontend/pages/blogs.vue to use single-column layout on mobile (grid-cols-1 mobile, lg:grid-cols-2 for articles)
- [ ] T022 [P] [US1] Update frontend/components/blog/BlogCard.vue (if exists) to use responsive images (max-width: 100%, height: auto)

#### Research Interface Mobile Adaptations

- [ ] T023 [P] [US1] Update frontend/pages/research/[searchId].vue to optimize chat interface for mobile (full-width input, responsive message list)
- [ ] T024 [P] [US1] Update frontend/components/research/ResearchChat.vue (if exists) to add mobile-specific input handling (inputmode attributes, proper font-size to prevent zoom)
- [ ] T025 [P] [US1] Update frontend/components/research/ResearchChat.vue to ensure keyboard doesn't hide input field (scroll input into view on focus)

#### Mobile Typography and Spacing

- [ ] T026 [P] [US1] Add responsive text scaling to frontend/assets/css/mobile-responsive.css (text-base 16px minimum, clamp() for scalable headings)
- [ ] T027 [P] [US1] Add responsive spacing utilities to frontend/assets/css/mobile-responsive.css (px-4 mobile, px-6 tablet, px-8 desktop patterns)
- [ ] T028 [P] [US1] Add safe-area-inset support to frontend/assets/css/mobile-responsive.css for notched devices (padding-top: env(safe-area-inset-top), padding-bottom: env(safe-area-inset-bottom))

#### Orientation and Viewport Handling

- [ ] T029 [US1] Add orientation change handling to frontend/app.vue or root layout (listen for resize event, update mobile detection state)
- [ ] T030 [US1] Test and fix horizontal scrolling issues on all pages (use max-width: 100% on all containers, overflow-x: hidden on body)

**Checkpoint**: At this point, User Story 1 (Mobile Responsive Layout) should be fully functional. All pages render correctly on mobile devices (320px-768px) without horizontal scrolling, text is readable without zooming, and interactive elements meet minimum touch target sizes.

---

## Phase 4: User Story 2 - Touch-Optimized Navigation (Priority: P2)

**Goal**: Users navigate through the application using touch gestures, with a mobile-friendly menu system, easily accessible navigation controls, and intuitive touch interactions.

**Independent Test**: Navigate through all main sections (home, prompts, research, blogs) using only touch interactions on a mobile device. Verify: (1) hamburger menu opens navigation drawer on tap, (2) all main sections are accessible from mobile menu, (3) back navigation is available on detail pages, (4) browser back/forward gestures work correctly, (5) navigation works in research interface without closing session.

### Implementation for User Story 2

#### Mobile Navigation Components

- [ ] T031 [P] [US2] Create frontend/shared/components/MobileNavigation.vue component with bottom navigation bar (v-bottom-nav with Home, Search, Research, Menu items)
- [ ] T032 [P] [US2] Create frontend/shared/components/OfflineBanner.vue component to display offline status (v-banner with "Нет подключения к интернету" message, data-testId="offline-banner")
- [ ] T033 [US2] Integrate MobileNavigation component into frontend/app.vue with conditional rendering (show on mobile only, hidden on desktop)
- [ ] T034 [US2] Integrate OfflineBanner component into frontend/app.vue (controlled by useOfflineStatus composable, show when offline)

#### Navigation Drawer Enhancement

- [ ] T035 [US2] Update frontend/components/main/Sidebar.vue to add mobile drawer state management (controlled by useMobileDetect composable, temporary mode on mobile)
- [ ] T036 [US2] Update frontend/components/main/Header.vue to connect hamburger menu button to drawer toggle (@click="drawer = !drawer" on v-app-bar-nav-icon)
- [ ] T037 [P] [US2] Add close-on-click-outside behavior to mobile drawer (click:outside.emit event on v-navigation-drawer)

#### Touch Feedback and Interactions

- [ ] T038 [P] [US2] Add visual feedback to touch targets in frontend/assets/css/mobile-responsive.css (:active { opacity: 0.7, transform: scale(0.98), transition: all 0.1s })
- [ ] T039 [P] [US2] Ensure all navigation buttons meet minimum touch target size in frontend/assets/css/mobile-responsive.css (min-height: 44px, min-width: 44px, padding: 12px 16px)
- [ ] T040 [P] [US2] Add smooth scrolling to frontend/assets/css/mobile-responsive.css (scroll-behavior: smooth, -webkit-overflow-scrolling: touch)

#### Back Navigation

- [ ] T041 [P] [US2] Add back button to frontend/components/main/Header.vue for detail pages (v-btn with icon="mdi-arrow-left", :to="backPath", show on mobile only)
- [ ] T042 [US2] Update frontend/pages/prompts/[promptSlug].vue to include back navigation to prompt list page

**Checkpoint**: At this point, User Story 2 (Touch-Optimized Navigation) should be fully functional. Mobile users can navigate efficiently using touch interactions, hamburger menu opens drawer, bottom navigation provides quick access to primary sections, and visual feedback confirms touch interactions.

---

## Phase 5: User Story 3 - Offline Capability & Installability (Priority: P3)

**Goal**: Users can install the application on their mobile devices as a Progressive Web App (PWA) and access previously viewed content offline, with basic functionality available without network connectivity.

**Independent Test**: Install the PWA on a mobile device (Android Chrome or iOS Safari). Verify: (1) install prompt appears or manual installation instructions are clear, (2) app icon appears on home screen after installation, (3) app launches in full-screen mode without browser chrome, (4) previously viewed pages load while offline (enable airplane mode), (5) offline message displays when accessing uncached content offline, (6) content updates when connection restored.

### Implementation for User Story 3

#### PWA Manifest Configuration

- [ ] T043 [P] [US3] Copy frontend/specs/001-mobile-pwa/contracts/manifest.json to frontend/public/manifest.webmanifest (PWA manifest with app metadata, icons, theme colors)
- [ ] T044 [P] [US3] Add manifest link tag to frontend/app.vue Head component (link rel="manifest" href="/manifest.webmanifest")

#### Service Worker Setup

- [ ] T045 [US3] Integrate service worker configuration from frontend/specs/001-mobile-pwa/contracts/service-worker-config.ts into frontend/nuxt.config.ts pwa.workbox section
- [ ] T046 [US3] Create service worker registration plugin in frontend/plugins/pwa.client.js (register service worker on app mount, handle updatefound event, log registration status)
- [ ] T047 [US3] Add offline fallback route handling in frontend/nuxt.config.ts (navigateFallback: '/', navigateFallbackDenylist: [/^\/api/])

#### PWA Install Handling

- [ ] T048 [US3] Update frontend/composables/usePwaInstall.ts to handle beforeinstallprompt event (save deferredPrompt, showInstallPrompt ref, install() method, dismiss() method)
- [ ] T049 [US3] Update frontend/composables/usePwaInstall.ts to detect iOS and show custom install instructions (navigator.userAgent detection, iOS install modal with step-by-step guide)
- [ ] T050 [P] [US3] Create PWA install prompt component in frontend/shared/components/PWAInstallPrompt.vue (v-dialog with "Установить приложение" button, show on canInstall, v-model for visibility)
- [ ] T051 [US3] Integrate PWAInstallPrompt component into frontend/app.vue (use usePwaInstall composable, show prompt when canInstall is true, handle install/dismiss actions)

#### Offline Status and Messaging

- [ ] T052 [US3] Update frontend/shared/components/OfflineBanner.vue to display clear offline message ("Нет подключения к интернету. Проверьте соединение.")
- [ ] T053 [US3] Update frontend/app.vue to conditionally show OfflineBanner based on useOfflineStatus composable (v-if="isOffline", dismissable with close button)
- [ ] T054 [US3] Add retry mechanism to OfflineBanner component (retry button that reconnects and refreshes content)

#### Testing and Validation

- [ ] T055 [US3] Test PWA installation on Android Chrome (navigate to app, wait for install icon, click install, verify home screen icon and full-screen launch)
- [ ] T056 [US3] Test PWA installation on iOS Safari (navigate to app, tap Share button, tap "Add to Home Screen", verify icon and full-screen launch)
- [ ] T057 [US3] Test offline mode (visit pages while online, enable airplane mode, reload previously visited pages, verify cached content loads, try navigating to uncached pages and verify offline message)
- [ ] T058 [US3] Run Lighthouse PWA audit and verify score > 90 (Chrome DevTools > Lighthouse > PWA category, address any failing audits)

**Checkpoint**: At this point, User Story 3 (Offline Capability & Installability) should be fully functional. Users can install the app as a PWA, launch it from home screen in full-screen mode, and access previously viewed content while offline with clear offline messaging.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T059 [P] Run Lighthouse mobile audit on all major pages (index, blogs, prompts, research) and verify Performance > 90, Accessibility > 90, Best Practices > 90, PWA > 90
- [ ] T060 [P] Test on real mobile devices (iPhone SE 320px, iPhone 12 390px, iPad 768px, Android phone) to verify no horizontal scrolling and proper touch targets
- [ ] T061 [P] Test orientation changes (portrait to landscape and back) on all pages to verify layouts adapt without breaking
- [ ] T062 [P] Verify all text is readable without zooming on mobile (base font-size 16px, no horizontal scroll at 320px width)
- [ ] T063 [P] Verify all interactive elements meet minimum touch target size (44x44px minimum on all buttons, links, form inputs)
- [ ] T064 [P] Test form inputs on mobile (verify font-size >= 16px to prevent auto-zoom, verify keyboard doesn't hide focused input)
- [ ] T065 [P] Performance optimization - lazy load images using NuxtImg with loading="lazy" attribute on all image components
- [ ] T066 [P] Performance optimization - lazy load heavy components using Lazy component prefix in Vue files
- [ ] T067 [P] Add loading indicators for async operations in frontend/shared/components/LoadingSpinner.vue (v-progress-circular with aria-label="Загрузка...")
- [ ] T068 [P] Document PWA installation instructions in frontend/docs/PWA_INSTALL_GUIDE.md (Android steps, iOS steps with screenshots, troubleshooting)
- [ ] T069 [P] Create GitHub Actions workflow for mobile testing in .github/workflows/mobile-testing.yml (Vitest setup, Playwright viewport tests, Lighthouse CI)
- [ ] T070 Run final validation using quickstart.md checklist (all items in mobile testing checklist completed, Lighthouse scores verified, real device testing complete)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Mobile Responsive Layout)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - Touch-Optimized Navigation)**: Can start after Foundational (Phase 2) - Enhances US1 navigation but should work independently
- **User Story 3 (P3 - Offline Capability & Installability)**: Can start after Foundational (Phase 2) - Works independently, adds PWA features to all pages

### Within Each User Story

- Component adaptations can be done in parallel (tasks marked [P])
- Main page adaptations should precede detail page adaptations (logical flow)
- Test each page independently before proceeding to next
- Story complete when all acceptance scenarios pass

### Parallel Opportunities

#### Phase 1 (Setup)
```bash
# Can run in parallel:
T003: Generate PWA icons (uses pwa-asset-generator CLI)
T004: Create offline.html
T005: Create mobile-responsive.css
```

#### Phase 2 (Foundational)
```bash
# Can run in parallel:
T007: Add iOS meta tags to app.vue
T008: Create usePwaInstall.ts composable
T009: Create useOfflineStatus.ts composable
T010: Create useMobileDetect.ts composable
T011: Add mobile-responsive CSS utilities
T012: Configure Tailwind breakpoints
T013: Update Vuetify mobile defaults
```

#### Phase 3 (User Story 1)
```bash
# Can run in parallel (different components):
T014: Update index.vue (main page)
T015: Update Header.vue (navigation)
T016: Update Sidebar.vue (navigation)
T017: Update Hero.vue (hero section)
T018: Update PromptCard.vue (prompt cards)
T019: Add touch targets to PromptCard.vue
T020: Update CategoriesFilter.vue (categories)
T021: Update blogs.vue (blog page)
T022: Update BlogCard.vue (blog cards)
T023: Update research/[searchId].vue (research page)
T024: Update ResearchChat.vue chat interface
T025: Add mobile input handling to ResearchChat.vue
T026: Add responsive text scaling
T027: Add responsive spacing utilities
T028: Add safe-area-inset support
```

#### Phase 4 (User Story 2)
```bash
# Can run in parallel (different components):
T031: Create MobileNavigation.vue component
T032: Create OfflineBanner.vue component
T038: Add touch feedback CSS
T039: Ensure touch target sizing
T040: Add smooth scrolling
```

#### Phase 5 (User Story 3)
```bash
# Can run in parallel:
T043: Copy manifest.json to public/
T044: Add manifest link tag
T055: Test Android installation
T056: Test iOS installation
T057: Test offline mode
T058: Run Lighthouse audit
```

#### Phase 6 (Polish)
```bash
# Can run in parallel:
T059: Run Lighthouse audits
T060: Test on real devices (multiple devices)
T061: Test orientation changes
T062: Verify text readability
T063: Verify touch targets
T064: Test form inputs
T065: Lazy load images
T066: Lazy load components
T067: Create LoadingSpinner component
T068: Write installation guide
T069: Create GitHub Actions workflow
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) - **CRITICAL**
3. Complete Phase 3: User Story 1 (T014-T030)
4. **STOP and VALIDATE**: Test Mobile Responsive Layout independently
   - Open app on mobile device (375px-768px viewport)
   - Verify no horizontal scrolling on any page
   - Verify text is readable without zooming
   - Verify all interactive elements are tappable (44x44px minimum)
   - Test orientation changes
5. Deploy/demo if ready - **MVP delivers mobile-responsive app**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T013)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Mobile Responsive App!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced: Touch-Optimized Navigation)
4. Add User Story 3 → Test independently → Deploy/Demo (Complete: PWA with Offline Capability)
5. Each story adds value without breaking previous stories:
   - US1: Mobile users can access and use the application
   - US2: Mobile navigation becomes intuitive and efficient
   - US3: App becomes installable with offline support

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T030) - Mobile Layout
   - Developer B: User Story 2 (T031-T042) - Navigation
   - Developer C: User Story 3 (T043-T058) - PWA Features
3. Stories complete and integrate independently:
   - US1 can demo mobile-responsive layouts
   - US2 can demo touch-optimized navigation
   - US3 can demo PWA installation and offline mode
4. Final: Polish phase (T059-T070) with all developers

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be **independently completable and testable**
- **Tests are NOT included** in this task list (specification does not require TDD)
- **Commit after each task or logical group** to maintain atomic changes
- **Stop at checkpoints** to validate story independently before proceeding
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Format validation**: ALL tasks follow required format `- [ ] [ID] [P?] [Story?] Description with file path`
- **Mobile-first**: Always test on smallest viewport (320px) first, then enhance for larger screens
- **Touch targets**: Never compromise on 44x44px minimum for interactive elements
- **Performance**: Lazy loading is critical for mobile - implement early in each story

---

## Task Summary

**Total Tasks**: 70 tasks
- **Phase 1 (Setup)**: 5 tasks (T001-T005)
- **Phase 2 (Foundational)**: 8 tasks (T006-T013) - **BLOCKS all user stories**
- **Phase 3 (User Story 1)**: 17 tasks (T014-T030) - **MVP milestone**
- **Phase 4 (User Story 2)**: 12 tasks (T031-T042)
- **Phase 5 (User Story 3)**: 16 tasks (T043-T058)
- **Phase 6 (Polish)**: 12 tasks (T059-T070)

**Parallel Opportunities**: 40 tasks marked [P] can be parallelized within their phases

**Independent Test Criteria**:
- US1: Open mobile device (375px), verify no horizontal scroll, text readable, tappable elements, orientation changes work
- US2: Navigate all sections via touch, verify hamburger menu, back navigation works, browser gestures work
- US3: Install PWA, verify full-screen launch, test offline mode, verify offline messages, test reconnection

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 30 tasks
**Deliverable**: Mobile-responsive application that works on all devices (320px-768px+)
