# Implementation Plan: Mobile Progressive Web App

**Branch**: `001-mobile-pwa` | **Date**: 2026-01-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mobile-pwa/spec.md`

## Summary

Adapt the AI tools library platform for mobile devices with responsive layouts (320px-768px viewport), touch-optimized navigation, and Progressive Web App (PWA) capabilities including offline caching and installability. The feature focuses on presentation-layer enhancements without backend changes, maintaining the existing Vuetify 3 + Tailwind CSS dual framework approach and iridescent gradient theme.

## Technical Context

**Language/Version**: JavaScript/TypeScript (Vue 3, Nuxt 4 framework)
**Primary Dependencies**: Vuetify 3 (Material Design components), Tailwind CSS (utility-first styling), @vite-pwa/nuxt (PWA support), FormKit Vue (forms)
**Storage**: N/A (presentation layer only, no new data storage)
**Testing**: Vitest (unit tests), Playwright/Vitest browser mode (component testing), manual testing on real devices
**Target Platform**: Modern mobile browsers (iOS Safari 12+, Chrome for Android, Samsung Internet) - responsive web application
**Project Type**: Single frontend application with PWA enhancements
**Performance Goals**:
  - <3s page load on 4G networks (90th percentile)
  - 90+ Lighthouse mobile audit scores (Performance, Accessibility, Best Practices)
  - <5s above-the-fold content on 3G networks
**Constraints**:
  - Must work offline for previously viewed content (service worker caching)
  - No horizontal scrolling on 320px-768px viewports
  - Minimum 44x44px touch targets
  - Full-screen PWA installation mode
**Scale/Scope**:
  - ~10 pages requiring responsive adaptation (index, blogs, prompt detail, research interfaces, test pages)
  - ~5-7 shared components needing mobile optimization (header, navigation, forms, cards)
  - PWA manifest and service worker configuration
  - Performance optimization for mobile networks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Server-Side Proxy Architecture
**Status**: ✅ COMPLIANT

This feature is presentation-layer only. No new API endpoints or direct Strapi integration required. All existing server routes remain unchanged. PWA service worker will cache responses from existing server routes, maintaining the proxy pattern.

### Principle II: Feature-Based Component Organization (Nuxt 4 `app/` layout)
**Status**: ✅ COMPLIANT

Mobile-specific components will be organized within existing feature directories (`main/`, `prompt/`, `research/`, `shared/`). Any new mobile components will be placed in appropriate feature namespaces. No feature reorganization required - we adapt existing layouts for mobile.

### Principle III: Dual UI Framework Integration (Vuetify 3 + Tailwind CSS)
**Status**: ✅ COMPLIANT

Responsive layouts will leverage both frameworks strategically:
- Vuetify 3's built-in responsive breakpoints (`sm`, `md`, `lg`, `xl`) for component-level adaptation
- Tailwind CSS responsive utilities (`md:`, `lg:`) for layout spacing and grid systems
- Maintain existing iridescent gradient theme across desktop and mobile
- No reimplementing Vuetify components in Tailwind

**Note**: This is a strength of the current architecture - both frameworks have excellent mobile support.

### Principle IV: Russian-Language First & i18n
**Status**: ✅ COMPLIANT

All mobile UI text, error messages, and user-facing content remains in Russian. Vuetify locale `ru` configuration already handles mobile-specific formatting (dates, numbers, validation messages). No i18n changes required.

### Principle V: SPA Deployment Model & Nuxt 4 Hybrid Rendering
**Status**: ⚠️ REQUIRES CLARIFICATION

Current mode is `ssr: false` (SPA). PWA features work well with SPA mode. However, we need to clarify:
- Will we use Nuxt 4's `routeRules` for selective pre-rendering of public pages?
- Should PWA service worker be configured differently for SPA vs pre-rendered routes?

**Decision**: Keep SPA mode for consistency. PWA caching strategies will be designed around SPA navigation patterns. No pre-rendering in Phase 1 (MVP).

### Principle VIII: Performance & Caching Strategy
**Status**: ✅ COMPLIANT with Enhancement

PWA service worker will extend existing caching strategy:
- Current: Nuxt composables with client-side caching
- Enhanced: Service worker caching for offline access to previously viewed pages
- Lazy-loading for heavy components (already in constitution)
- Code-splitting by feature (already in constitution)

**Justification**: Service worker caching is the standard PWA approach and enhances the constitution's performance goals without contradicting existing patterns.

### Overall Compliance
**Result**: ✅ PASS - All constitution principles are compliant or enhance existing patterns.

No violations identified. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-pwa/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (PWA manifest, service worker config)
│   ├── manifest.json    # PWA manifest
│   └── service-worker.ts # Service worker caching strategy
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (frontend application)

```text
frontend/
├── app/                          # Nuxt 4 app directory (existing)
│   ├── layout.vue               # Root layout (adapt for mobile viewport)
│   ├── main/                    # Main page feature
│   │   ├── page.vue            # Index page (responsive adaptations)
│   │   └── components/
│   │       ├── main-header.vue # Mobile navigation (hamburger menu)
│   │       └── main-hero.vue   # Responsive hero section
│   ├── prompt/                  # Prompt library feature
│   │   ├── page.vue            # Prompt list (responsive grid)
│   │   ├── [promptSlug].vue    # Prompt detail (mobile-friendly)
│   │   └── components/
│   │       └── prompt-card.vue # Touch-optimized card
│   ├── research/                # Research/Chat feature
│   │   ├── page.vue            # Research list (responsive)
│   │   ├── [searchId].vue      # Chat interface (mobile-optimized input)
│   │   └── components/
│   │       └── research-chat.vue # Touch-friendly chat
│   └── shared/                   # Shared components
│       ├── components/
│       │   ├── mobile-navigation.vue # Mobile menu drawer
│       │   └── offline-banner.vue    # PWA offline indicator
│       └── composables/
│           └── use-mobile-detect.ts  # Device detection utility
│
├── components/                   # Existing components (adapt for mobile)
│   ├── main/                    # Header, sidebar (responsive versions)
│   ├── prompt/                  # Filters, cards (touch-optimized)
│   └── research/                # Chat UI (mobile-friendly)
│
├── pages/                        # Nuxt 3 pages (transitioning to app/ in Nuxt 4)
│   ├── index.vue                # Main page
│   ├── blogs.vue                # Blog listing
│   ├── prompts/[promptSlug].vue # Prompt details
│   └── research/[searchId].vue  # Research chat
│
├── public/                       # Static assets
│   ├── icons/                   # PWA icons (multiple sizes)
│   │   ├── icon-192x192.png    # Android adaptive icon
│   │   ├── icon-512x512.png    # Splash screen
│   │   └── apple-touch-icon.png # iOS icon
│   └── manifest.json            # PWA manifest (or generated via module)
│
├── server/api/                   # Existing server routes (no changes)
│   ├── articles.js
│   └── [searchId]/submit.js
│
├── assets/css/                   # Existing styles (mobile enhancements)
│   ├── tailwind.css             # Add mobile-specific utilities
│   └── mobile-responsive.css    # New: Mobile-specific styles
│
└── nuxt.config.ts               # Nuxt configuration (PWA module added)
```

**Structure Decision**: Existing Nuxt 3 frontend application with progressive enhancement for mobile. PWA features added via `@vite-pwa/nuxt` module. Mobile adaptations are applied to existing pages and components, maintaining feature-based organization. No major structural reorganization required - this is an adaptation layer on top of existing architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This table remains empty as all constitution principles are compliant.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

This phase will resolve the following technical unknowns:

1. **PWA Module for Nuxt 4**: Evaluate `@vite-pwa/nuxt` compatibility with Nuxt 4 and SPA mode
2. **Mobile Testing Strategy**: Determine approach for testing responsive layouts and PWA features
3. **Service Worker Caching Strategy**: Design cache patterns for SPA navigation and offline access
4. **Viewport Breakpoints**: Define specific breakpoint values for mobile devices (320px, 375px, 768px)
5. **Touch Interaction Patterns**: Research best practices for mobile gestures and interactions in Vuetify 3 + Tailwind

See [research.md](research.md) for detailed findings and decisions.

---

## Phase 1: Design Artifacts

This phase will produce:

1. **[data-model.md](data-model.md)**: No new data models (presentation layer only)
2. **[contracts/](contracts/)**:
   - PWA manifest (app metadata, icons, theme colors)
   - Service worker configuration (caching strategy, offline routes)
3. **[quickstart.md](quickstart.md)**: Development setup for mobile testing and PWA validation

See Phase 1 artifacts for detailed design specifications.

---

## Notes

- This plan follows Nuxt 4 architecture with `app/` directory (migrating from Nuxt 3 `pages/`)
- PWA features use standard browser APIs (Service Worker, Web App Manifest)
- Mobile-first approach: design for 320px baseline, enhance for larger viewports
- All Russian language, iridescent gradient theme maintained across desktop/mobile
- Performance targets aligned with Google Lighthouse and Core Web Vitals
