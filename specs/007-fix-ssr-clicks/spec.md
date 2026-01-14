# Feature Specification: Fix SSR Click Delay in Nuxt 4

**Feature Branch**: `007-fix-ssr-clicks`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "## Задача: Исправить задержку кликов при SSR в Nuxt 4

**Проблема:**
После включения SSR на nuxt4 перестал работать клик по карточкам. Требуется 5-10 секунд пока сайт полностью загрузится, чтобы заработал клик и роутинг по другим разделам.

**Причины (вероятные):**
1. Гидрация отстает от отрисовки — браузер получает HTML и отрисовывает, но JavaScript еще загружается
2. Слишком много async операций на сервере блокируют отправку HTML
3. Обработчики событий не привязаны к элементам после гидрации
4. ClientOnly обертки задерживают интерактивность

**Требуемые решения:**
1. Проверить nuxt.config.ts на settings гидрации (ssr, experimental.asyncEntry)
2. Перенести fetch запросы с сервера на клиент (onMounted вместо setup)
3. Убедиться что @click обработчики корректно привязаны, не используется innerHTML
4. Убрать/оптимизировать <ClientOnly> обертки где возможно
5. Оптимизировать размер bundle и скорость загрузки JS

**Входные данные:**
- nuxt.config.ts
- Структура app.vue / главного layout
- Компонент карточки с @click обработчиком
- Вывод консоли браузера (ошибки гидрации)

**Выходной результат:**
Рабочий код с исправленной конфигурацией и компонентами, чтобы клики работали сразу после отрисовки HTML, без задержки гидрации."

## Clarifications

### Session 2026-01-14

- Q: What is the primary goal for SSR mode after fixing the click delay issue? → A: Keep SSR enabled for SEO and fast First Contentful Paint, eliminate hydration delay
- Q: What is the suspected root cause of the 5-10 second hydration delay? → A: Unknown - needs investigation (no diagnostic data available)
- Q: What approach should we take given the unknown root cause? → A: Investigate first (profiling, bundle analysis, console logs), then implement targeted fixes
- Q: What is the urgency level for fixing this issue? → A: Critical - production blocking, fix needed today
- Q: What should we do if root cause cannot be identified within the timebox (2-3 hours)? → A: Continue investigating until found (may exceed 1 day)

**Impact**: These clarifications confirm that (1) SSR mode MUST remain enabled, (2) the root cause is currently unknown, (3) the implementation approach is investigation-first with targeted fixes based on findings, (4) this is CRITICAL/PRODUCTION BLOCKING requiring resolution ASAP, and (5) finding the actual root cause is prioritized over quick workarounds - take however long needed to diagnose properly before implementing fixes. The workflow: thorough diagnose → identify actual cause → implement correct fix → verify → deploy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant Click Interactivity (Priority: P1)

As a visitor to the website, I want to be able to click on cards and navigate between sections immediately when the page appears, without waiting 5-10 seconds for the site to "fully load", so that I can efficiently browse content and reach my destination quickly.

**Why this priority**: This is a critical user experience issue. Users expect immediate interactivity when they see visual content on a page. A 5-10 second delay before clicks work creates frustration, increases bounce rates, and makes the site feel broken. This is the highest priority because it directly affects all user interactions with the primary navigation elements (cards).

**Independent Test**: Can be fully tested by loading any page with cards and immediately clicking on a card. If the click responds and navigation occurs within 1 second of the page appearing visually, the story is complete. This delivers immediate value by restoring expected interactive behavior.

**Acceptance Scenarios**:

1. **Given** a user visits any page on the website, **When** the page content becomes visible, **Then** all clickable cards respond to user clicks within 1 second
2. **Given** a user clicks on a card immediately after page load, **When** the click event fires, **Then** navigation to the target page occurs without delay
3. **Given** a user is on a slow connection, **When** the page HTML renders, **Then** cards become clickable before all JavaScript finishes loading

---

### User Story 2 - Fast Initial Page Load (Priority: P2)

As a user waiting for the website to load, I want to see page content quickly even if full interactivity takes a moment longer, so that I perceive the site as fast and responsive.

**Why this priority**: While instant interactivity is most important (P1), optimizing the initial page load contributes to overall performance perception. This improves perceived speed even if there's a brief moment before full hydration completes.

**Independent Test**: Can be tested by measuring time to first contentful paint and time to interactive. Success is when the page displays content quickly regardless of connection speed. This provides value by improving perceived performance.

**Acceptance Scenarios**:

1. **Given** a user visits any page, **When** the server responds, **Then** HTML is rendered and visible in under 2 seconds on standard connections
2. **Given** the page is loading, **When** content appears, **Then** there is visible indication of loading state if full interactivity is not yet available
3. **Given** a user on mobile device, **When** page loads, **Then** content renders efficiently without excessive bundle delays

---

### User Story 3 - Consistent Navigation Behavior (Priority: P3)

As a user navigating through the website, I want all navigation methods (card clicks, menu links, route changes) to work consistently and predictably, so that I don't encounter confusion about whether the site is working properly.

**Why this priority**: This ensures that once the primary issue (P1) is resolved, the overall navigation experience is smooth and consistent across the entire application. It's lower priority because it depends on the core click functionality working first.

**Independent Test**: Can be tested by navigating through multiple pages using different methods (cards, menus, direct URLs). Success is when all navigation methods respond promptly. This delivers value by ensuring a cohesive user experience.

**Acceptance Scenarios**:

1. **Given** a user navigates between pages, **When** using any navigation method, **Then** all methods respond with consistent speed
2. **Given** a user clicks browser back/forward buttons, **When** navigation occurs, **Then** page state and interactivity are preserved
3. **Given** a user navigates to a new page, **When** the page loads, **Then** clicks work immediately without needing to wait for "full load"

---

### Edge Cases

- What happens when a user clicks a card during the hydration gap (between HTML render and JS load)?
- How does the system behave when JavaScript fails to load or errors during hydration?
- What happens when a user rapidly clicks multiple cards before the first navigation completes?
- How does the system handle navigation on very slow networks (3G, 2G)?
- What occurs when a user interacts with the page before async data fetching completes?
- How does the browser's back button behavior work with SSR and client-side navigation?
- What happens when the server is slow to respond but HTML eventually arrives?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST keep SSR enabled and make all clickable cards interactive within 1 second of HTML rendering completing
- **FR-002**: The system MUST bind click event handlers to card elements before or immediately upon hydration completion
- **FR-003**: The system MUST render card content on the server (SSR) for fast initial page display and SEO benefits
- **FR-004**: The system MUST include diagnostic investigation to identify root cause before implementing fixes (bundle analysis, hydration profiling, server-side timing)
- **FR-005**: The system MUST fetch data required for card interactivity on the client side rather than blocking server HTML generation
- **FR-006**: The system MUST optimize JavaScript bundle size to minimize hydration delay
- **FR-007**: The system MUST provide visual feedback for cards before they become fully interactive if there's a delay
- **FR-008**: The system MUST support immediate card clicking without waiting for all async operations to complete
- **FR-009**: The system MUST ensure click handlers are properly bound and not lost during hydration
- **FR-010**: The system MUST avoid using innerHTML for rendering clickable elements (which strips event handlers)
- **FR-011**: The system MUST minimize or eliminate unnecessary ClientOnly wrappers that delay interactivity
- **FR-012**: The system MUST handle navigation events consistently whether triggered during or after hydration
- **FR-013**: The system MUST log hydration errors to console for debugging without breaking functionality

### Key Entities

- **Card Component**: Interactive UI element displaying content that users can click to navigate to detail pages. Contains title, description, and visual content. Must respond to click events immediately after page render.
- **Page Content**: Data displayed on cards, fetched from backend. Can be loaded on client-side without blocking initial HTML render.
- **Route/Navigation**: User's path through the application. Must work consistently across server-rendered and client-rendered pages.
- **Hydration State**: Process of attaching event handlers and state to server-rendered HTML. Critical for determining when interactivity becomes available.
- **User Interaction Event**: Click, tap, or keyboard navigation that triggers navigation. Must be captured and processed immediately when user initiates it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully click on cards within 1 second of page content becoming visible on screen
- **SC-002**: 100% of card click events are captured and processed without loss during the hydration process
- **SC-003**: Time to interactive (TTI) is reduced from 5-10 seconds to under 2 seconds on standard broadband connections
- **SC-004**: No hydration mismatch errors appear in browser console during normal navigation
- **SC-005**: Click functionality works immediately after HTML render, with 0% of users experiencing the 5-10 second delay
- **SC-006**: Bundle size optimization reduces JavaScript payload by at least 20% to improve load performance
- **SC-007**: User testing shows 95%+ success rate for clicking cards on first attempt after page load
- **SC-008**: Navigation response time is under 500ms once click is registered, regardless of hydration status

## Assumptions & Dependencies

### Assumptions

- **SSR mode will remain enabled** - the solution must optimize hydration, not disable SSR
- The issue is specific to SSR mode and does not occur in client-side only rendering
- Card components use Vue's @click directive or similar event binding
- The application uses Nuxt 3.2.0+ with SSR enabled in configuration
- Users primarily interact with the site using modern browsers with JavaScript enabled
- The backend API response time is reasonable (under 1 second) and not the primary bottleneck
- Existing codebase structure follows standard Nuxt 3 patterns (composables, components, pages)

### Dependencies

- Current SSR configuration in nuxt.config.ts must be accessible and modifiable
- Card component source code must be available for inspection and modification
- Build process and bundler configuration must support optimization changes
- Browser developer tools console output is available for debugging hydration issues
- Existing test coverage (if any) can be extended to cover click timing scenarios
- No external constraints prevent moving data fetching from server to client where needed

## Out of Scope

- **Switching to SPA mode** - SSR MUST remain enabled for SEO and fast First Contentful Paint
- Complete redesign of the card component architecture (only optimization of existing implementation)
- Changing the underlying CMS or backend API structure
- Implementing progressive web app (PWA) features beyond scope of this fix
- Accessibility improvements unrelated to click timing (e.g., keyboard navigation enhancement)
- SEO optimization beyond what's necessary to maintain current search rankings
- Performance optimization for assets (images, videos) unless they directly impact hydration timing
- Adding loading skeletons or other UI states not directly related to click responsiveness
- Refactoring other parts of the application that are working correctly
