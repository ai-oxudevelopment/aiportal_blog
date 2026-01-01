# Implementation Plan: Mobile PWA Adaptation

**Branch**: `001-mobile-pwa` | **Date**: 2026-01-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mobile-pwa/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transform the AI tools library web application into a mobile-optimized Progressive Web App (PWA) with installability, offline functionality, and native app-like user experience. The technical approach involves:

1. **Responsive Design**: Implement mobile-first CSS with Tailwind breakpoints for 320px-428px screens
2. **PWA Foundation**: Add web app manifest and service worker for installability and offline caching
3. **Performance Optimization**: Optimize assets and implement caching strategies to meet Web Vitals thresholds
4. **Mobile UX Enhancement**: Touch-optimized interactions, pull-to-refresh, and appropriate mobile input patterns

## Technical Context

**Language/Version**: JavaScript (ES2022+), Vue 3.2+ (Nuxt 3 framework)
**Primary Dependencies**:
- Nuxt 3 (3.2+)
- Vuetify 3 (3.1+)
- Tailwind CSS (3.x)
- @nuxtjs/tailwindcss module
- Vite plugin for PWA (@vitejs/plugin-pwa or workbox)
- Yandex Metrika for analytics

**Storage**: Service Worker Cache API (offline asset storage), browser localStorage (app preferences)
**Testing**: Manual testing on real devices, Chrome DevTools Lighthouse audit
**Target Platform**:
- Mobile browsers: Chrome 90+, Safari 14+, Edge 90+, Samsung Internet 14+
- Devices: Smartphones (320px-428px width), tablets (768px-1024px)
- Desktop: Existing experience maintained

**Project Type**: Web application (SPA mode, SSR disabled)
**Performance Goals**:
- Lighthouse PWA score: 90+
- Time to Interactive (TTI): <5s on 3G
- First Contentful Paint (FCP): <2s on 3G
- Visual feedback: <100ms after interaction
- Smooth scrolling: 60fps

**Constraints**:
- No backend changes (Strapi CMS integration unchanged)
- Existing functionality must remain intact
- Service worker cache limit: 50-100MB
- Must work offline for core functionality
- No native app store distribution

**Scale/Scope**:
- ~10 pages/components requiring mobile adaptation
- ~50-100 static assets to cache (images, icons, fonts)
- 5 main user flows to optimize (browse, search, view, navigate, install)
- Support for Russian language only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

**Rationale**: This is a frontend-only enhancement project that:
1. Maintains existing backend integrations (no contract changes)
2. Uses established web standards (PWA specification, CSS best practices)
3. Follows Nuxt 3 framework conventions
4. Preserves existing data models and API contracts
5. No new dependencies on external services beyond PWA capabilities
6. Implementing responsive design is a standard web development practice

**Re-evaluation**: After Phase 1 design, verify that:
- Service worker strategy doesn't introduce breaking changes
- PWA installation flow doesn't conflict with existing authentication
- Mobile layouts don't require new API endpoints

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-pwa/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - technical research and decisions
├── data-model.md        # Phase 1 output - No changes (read-only from backend)
├── quickstart.md        # Phase 1 output - Development setup and testing guide
├── contracts/           # Phase 1 output - Not applicable (no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/                                    # Nuxt 3 application
├── public/                                   # Static assets
│   ├── manifest.webmanifest                 # NEW: PWA manifest
│   ├── sw.js                                # NEW: Service worker (or auto-generated)
│   ├── icons/                               # NEW: PWA app icons
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── maskable-icon.png
│   │   └── favicon.ico
│   └── offline.html                         # NEW: Offline fallback page
├── components/
│   ├── main/                                # EXISTING: Layout components
│   │   ├── Header.vue                       # MODIFY: Add mobile menu toggle
│   │   └── Sidebar.vue                      # MODIFY: Make collapsible on mobile
│   ├── prompt/                              # EXISTING: Prompt library UI
│   │   ├── PromptCard.vue                   # MODIFY: Optimize for mobile
│   │   ├── CategoriesFilter.vue             # MODIFY: Horizontal scroll on mobile
│   │   └── PromptSearch.vue                 # MODIFY: Mobile input enhancements
│   ├── research/                            # EXISTING: AI chat interface
│   │   └── [components]                     # MODIFY: Mobile layout adaptations
│   └── ui/                                  # EXISTING: Reusable components
│       └── [components]                     # MODIFY: Touch target sizing
├── pages/
│   ├── index.vue                            # MODIFY: Mobile layout structure
│   ├── blogs.vue                            # MODIFY: Mobile responsive
│   ├── prompts/[promptSlug].vue             # MODIFY: Mobile reading experience
│   ├── research/[searchId].vue              # MODIFY: Mobile chat interface
│   └── app.vue                              # MODIFY: Update viewport meta
├── composables/                             # EXISTING: Data fetching
│   └── usePwaInstall.js                     # NEW: PWA install prompt handling
├── plugins/
│   ├── vuetify.js                           # EXISTING: Vuetify config
│   └── pwa.client.js                        # NEW: PWA initialization and service worker registration
├── assets/css/
│   ├── tailwind.css                         # EXISTING: Tailwind base
│   ├── mobile-responsive.css                # NEW: Mobile-specific styles
│   └── iridescent-accents.css               # EXISTING: Theme (no changes)
├── nuxt.config.js                           # MODIFY: Add PWA module config
├── tailwind.config.js                       # MODIFY: Add mobile breakpoints
└── server/api/                              # EXISTING: Backend proxy (NO CHANGES)
    └── [existing endpoints]
```

**Structure Decision**: The existing Nuxt 3 frontend structure is maintained with additions for PWA capabilities:
- PWA assets (manifest, icons, service worker) in `public/`
- New mobile-specific CSS in `assets/css/`
- New PWA composable for install handling
- Modifications to existing components for mobile responsiveness
- No backend changes - the `server/api/` directory remains unchanged
- Following Nuxt 3 conventions for PWA integration

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | No constitutional violations - this is a standard frontend enhancement using established web standards |

## Phase 0: Research & Technical Decisions

### Unknowns to Resolve

1. **PWA Module Selection**
   - **Question**: Which Nuxt 3 PWA module to use? (@vitejs/plugin-pwa vs @nuxtjs/pwa vs custom implementation)
   - **Impact**: Affects service worker generation strategy, update mechanism, and Nuxt config complexity
   - **Research**: Compare features, community support, Nuxt 3 compatibility

2. **Service Worker Caching Strategy**
   - **Question**: Which caching strategy for different asset types? (CacheFirst, NetworkFirst, StaleWhileRevalidate)
   - **Impact**: Affects offline experience, freshness of content, and cache management complexity
   - **Research**: PWA best practices for content-heavy applications

3. **Mobile Navigation Pattern**
   - **Question**: Which navigation pattern works best for existing content structure? (Hamburger menu, bottom nav, collapsible sidebar)
   - **Impact**: Affects UX consistency, implementation complexity, and screen real estate
   - **Research**: Mobile UX patterns for content-heavy apps with hierarchical categories

4. **Icon Generation**
   - **Question**: How to generate required PWA icon sizes from existing branding?
   - **Impact**: Affects visual consistency, install experience, and development workflow
   - **Research**: Icon generation tools and PWA icon requirements

5. **iOS PWA Limitations**
   - **Question**: What are iOS Safari's PWA limitations and workarounds?
   - **Impact**: Affects feature parity testing and user expectations on iOS
   - **Research**: iOS Safari PWA support status and known limitations

### Deliverables

- **research.md**: Documented decisions for each unknown with rationale and alternatives

## Phase 1: Design Artifacts

### Data Model

**Status**: No changes required - read-only from backend

The feature does not introduce new data models. All data comes from the existing Strapi CMS backend via the established server proxy pattern.

**Key Entities** (from spec):
- PWA Manifest (metadata file)
- Service Worker (background script)
- Cache Storage (browser API)
- App Shell (cached UI framework)
- Dynamic Content (prompts, articles from Strapi)

### Contracts

**Status**: No API contracts - no backend changes

Since this is a frontend-only enhancement with no modifications to backend APIs or data models, there are no new contracts to define.

**Existing Integrations** (unchanged):
- Strapi CMS API via server proxy (`/api/articles`)
- Cookie-based authentication (strapi_jwt)
- Yandex Metrika analytics

### Quickstart Guide

**Status**: To be created in Phase 1

Will include:
- Local development setup for PWA testing
- Testing on real mobile devices
- Lighthouse audit workflow
- Service worker debugging techniques
- Install flow testing instructions

### Agent Context Update

**Status**: To be executed in Phase 1

Update agent-specific context file with:
- PWA development best practices
- Mobile-first responsive design patterns
- Service worker debugging techniques
- Chrome DevTools Lighthouse workflows

## Next Steps

1. ✅ **Setup**: Completed - Branch created, spec loaded
2. ⏳ **Phase 0**: Execute research tasks and document decisions in `research.md`
3. ⏳ **Phase 1**: Create design artifacts (data-model.md, quickstart.md)
4. ⏳ **Phase 1**: Update agent context
5. ⏳ **Constitution Re-check**: Verify design decisions don't introduce violations
6. 🛑 **Stop**: Report completion and await `/speckit.tasks` for implementation task breakdown

---

**Plan Status**: Phase 0 ready to begin | **Last Updated**: 2026-01-01