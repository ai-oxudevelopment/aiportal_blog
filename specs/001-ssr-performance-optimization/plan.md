# Implementation Plan: SSR Performance Optimization and Mobile Speed Improvements

**Branch**: `001-ssr-performance-optimization` | **Date**: 2025-01-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ssr-performance-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable Server-Side Rendering (SSR) for the AI Portal blog to improve mobile performance, SEO, and initial page load times. The system will use a hybrid approach: SSR for first page load with client-side navigation for subsequent page transitions. Key goals include sub-1.5s load times on 4G mobile, 20+ point improvement in PageSpeed Insights scores, and maintaining Docker deployment compatibility. The solution includes smart prefetching, stale-while-revalidate caching for Strapi CMS failures, progressive enhancement for JavaScript failures, and 2G network support with functional but slow behavior.

## Technical Context

**Language/Version**: TypeScript 5.9.2, JavaScript ES2022
**Primary Dependencies**: Nuxt 3.2.0 (Vue 3.4.21), Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
**Storage**: N/A (static assets cached via PWA service worker, Strapi v5 CMS as backend)
**Testing**: Vitest (configured for Nuxt 3), manual performance testing with PageSpeed Insights/Lighthouse
**Target Platform**: Linux/Unix server (Node.js 22 containerized via Docker), web browsers (mobile-first)
**Project Type**: web (Nuxt frontend with separate Strapi backend)
**Performance Goals**:
  - 4G mobile: < 1.5s Time to Interactive (TTI)
  - 3G mobile: < 3s TTI
  - Page navigation: < 500ms transition time
  - PageSpeed Insights: +20 points improvement on Performance score
  - First Contentful Paint: < 1.5s on 4G mobile
  - Cumulative Layout Shift: < 0.1
  - Docker build: < 10 minutes
  - Container startup: < 10 seconds
**Constraints**:
  - Must maintain PWA capabilities (service worker, offline support)
  - Must preserve existing Vuetify 3 + Tailwind CSS integration
  - Must maintain Russian-language UI
  - Must support progressive enhancement (content readable without JavaScript)
  - Docker deployment must continue working
**Scale/Scope**:
  - ~50-100 pages (articles, speckits, research)
  - Target: 1000+ concurrent mobile users
  - Static asset caching for images, fonts, stylesheets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Server-Side Proxy Architecture ✅ PASS

**Status**: Compliant with enhancement

**Implementation Plan**:
- Enable SSR in Nuxt config (currently `ssr: false`)
- All Strapi API calls continue through Nuxt server routes (`server/api/*`)
- Client components call composables, composables call `/api/*` routes
- No direct Strapi calls from client code

**Enhancement**: Add caching layer in server routes for stale-while-revalidate pattern

### Principle II: Feature-Based Component Organization ✅ PASS

**Status**: Compliant

**Implementation Plan**:
- No changes to feature structure required
- SSR affects rendering, not component organization
- Existing `app/` layout (or current `pages/` structure) maintained

### Principle III: Dual UI Framework Integration ✅ PASS

**Status**: Compliant

**Implementation Plan**:
- Vuetify 3 components remain for forms, dialogs, navigation
- Tailwind CSS for layout and styling
- SSR renders both framework components correctly
- Client-side hydration preserves framework functionality

### Principle IV: Russian-Language First ✅ PASS

**Status**: Compliant

**Implementation Plan**:
- SSR renders Russian content from Strapi
- Date/number formatting preserved
- No i18n layer needed (single-language site)

### Principle V: SPA Deployment Model & Nuxt Hybrid Rendering ⚠️ MODIFICATION

**Status**: Constitution modification required

**Change**: Constitution states "Основной режим: `ssr: false` (SPA)", but this feature explicitly requires SSR

**Justification**:
- User requirement: "включить SSR" (enable SSR)
- Performance goals require server-side rendering
- SEO benefits require HTML in initial response
- Progressive enhancement requires SSR

**Modified Approach**:
- Primary mode: `ssr: true` (hybrid SSR/SPA)
- Client-side navigation after initial load (preserves SPA-like UX)
- Static build artifacts remain compatible with CDN deployment
- Port remains 8080

**Complexity Tracking**:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR enabled (constitution says `ssr: false`) | User requirement for mobile performance, SEO, and fast initial load | SPA mode cannot meet <1.5s mobile load time targets or provide HTML for search engines |

### Principle VI: API & Data Modeling Standards ✅ PASS

**Status**: Compliant with enhancement

**Implementation Plan**:
- Domain types remain unchanged
- Server routes normalize Strapi responses
- Add caching metadata to normalized types (e.g., `cachedAt`, `stale`)

### Principle VII: Error Handling & Observability ⚠️ PARTIAL

**Status**: Enhancement required

**Implementation Plan**:
- Add stale-while-revalidate error handling for Strapi failures
- Add "Content may be outdated" banner component
- Add "Loading on slow connection" indicator for 2G networks
- Add "Enable JavaScript for faster navigation" banner

**Complexity Tracking**:

| Enhancement | Why Needed | Simpler Alternative Rejected Because |
|-------------|------------|-------------------------------------|
| Stale-while-revalidate caching | Strapi failures should not break site, user experience | Showing error pages violates FR-013 requirement to serve cached content |
| Progressive enhancement banners | Users without JavaScript need clear guidance | Breaking site without JS violates progressive enhancement principles |

### Principle VIII: Performance & Caching Strategy ✅ PASS

**Status**: Compliant with enhancement

**Implementation Plan**:
- Implement smart link prefetching on hover/touch
- Add stale-while-revalidate caching in server routes
- Optimize static asset delivery (images, fonts)
- Use Nuxt composables with caching
- Lazy-load heavy components where appropriate

### Principle IX: Strapi Integration Patterns ✅ PASS

**Status**: Compliant

**Implementation Plan**:
- Continue using `@nuxtjs/strapi` module or custom client
- All collections accessed through server routes
- Server routes handle caching and error recovery

### Principle X: Security, Auth & Secrets Management ✅ PASS

**Status**: Compliant

**Implementation Plan**:
- JWT remains in HttpOnly cookie
- SSR uses cookies from incoming request
- No secrets leak to client code

### Overall Gate Status: ⚠️ CONDITIONAL PASS

**Condition**: Constitution modification required for Principle V (SSR mode)

**Decision**: Proceed with implementation. The modification is:
- Explicitly requested by user ("включить SSR")
- Necessary for performance goals
- Aligns with modern Nuxt 4 hybrid rendering patterns
- Does not violate other principles

## Project Structure

### Documentation (this feature)

```text
specs/001-ssr-performance-optimization/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0: SSR research findings
├── data-model.md        # Phase 1: Data entities and caching
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Performance contracts (SLOs)
│   └── performance-slo.yaml
└── tasks.md             # Phase 2: Implementation tasks (NOT created yet)
```

### Source Code (repository root)

```text
# Current structure (Option 2: Web application)
backend/
├── [Strapi CMS - separate, not modified in this feature]

frontend/
├── .output/              # Nuxt build output (SSR server)
│   └── server/
│       └── index.mjs     # Node.js server for SSR
├── server/
│   ├── api/              # [EXISTING] Server routes to Strapi
│   │   ├── articles.get.ts
│   │   └── ...
│   ├── middleware/       # [NEW] Request handling middleware
│   │   ├── cache.ts      # Stale-while-revalidate caching
│   │   └── prefetch.ts   # Link prefetching logic
│   └── utils/            # [NEW] Server utilities
│       ├── cache-control.ts
│       └── network-detection.ts
├── composables/          # [EXISTING] Client-side data fetching
│   ├── useArticles.ts
│   └── ...
├── components/           # [EXISTING] Vue components
│   └── shared/
│       └── banners/      # [NEW] User notification banners
│           ├── StaleContentBanner.vue
│           ├── SlowConnectionBanner.vue
│           └── JavaScriptBanner.vue
├── pages/                # [EXISTING] Page routes
│   ├── index.vue
│   ├── speckits/
│   └── ...
├── app.vue               # [MODIFY] Root component with prefetch handlers
├── nuxt.config.js        # [MODIFY] Enable SSR, add performance config
├── Dockerfile            # [MODIFY] Optimize for SSR build
└── package.json          # [VERIFY] Dependencies for SSR
```

**Structure Decision**: Using existing "Option 2: Web application" structure (frontend + backend). SSR modifications focused on `frontend/` directory. Backend (Strapi) unchanged. New server middleware and utilities added for caching and prefetching. Shared banner components for user notifications.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR enabled (Principle V: constitution says `ssr: false`) | User requirement: "включить SSR". Performance goals (<1.5s mobile load) require server-side rendering. SEO benefits (FR-004) require HTML in initial response. Progressive enhancement (FR-015) requires SSR content. | SPA mode cannot meet performance targets, SEO requirements, or progressive enhancement needs simultaneously |
| Stale-while-revalidate caching (Principle VII enhancement) | FR-013 requires serving cached content when Strapi fails with "Content may be outdated" banner | Showing error pages breaks user experience during temporary backend issues |
| Progressive enhancement banners (Principle VII enhancement) | FR-015 requires showing "Enable JavaScript for faster navigation" when JS fails | Breaking site entirely without JavaScript violates accessibility and failsafe principles |
