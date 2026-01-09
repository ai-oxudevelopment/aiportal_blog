# Implementation Plan: Speckit Category Filter Display

**Branch**: `001-speckit-category-filter` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-speckit-category-filter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix the missing category filter on the /speckits page by ensuring categories are properly extracted from the API response and filtered by type="speckit". The existing filter components (CategoriesFilter, MobileCategoriesFilter) will be reused with proper category type filtering logic.

## Technical Context

**Language/Version**: TypeScript 5.9.2, JavaScript ES2022
**Primary Dependencies**: Nuxt 3.2.0 (Vue 3.4.21), Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
**Storage**: Strapi v5 CMS (backend for speckits and categories)
**Testing**: Manual testing (existing test infrastructure)
**Target Platform**: Web browsers (desktop and mobile)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3s to filter from page load (SC-002), <500ms additional load time (SC-008)
**Constraints**: SSR-optimized with stale-while-revalidate caching, SPA deployment model
**Scale/Scope**: Single page (/speckits), reuses existing filter components, 3 user stories with 14 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture (Nuxt 4)
- ✅ **PASS**: Existing `/api/speckits` server route already handles Strapi integration
- ✅ **PASS**: Client component uses composable pattern (useAsyncData)
- ✅ **PASS**: No direct Strapi calls from client code

### II. Feature-Based Component Organization (Nuxt 4 `app/` layout)
- ✅ **PASS**: Reuses existing components from `~/components/prompt/` (shared)
- ✅ **PASS**: Page component at `frontend/pages/speckits/index.vue`
- ✅ **PASS**: Follows auto-import pattern for components

### III. Dual UI Framework Integration (Vuetify 3 + Tailwind CSS)
- ✅ **PASS**: Filter components use Vuetify for interactive elements
- ✅ **PASS**: Tailwind used for layout (existing pattern in speckits/index.vue)
- ✅ **PASS**: No reinventing Vuetify components with Tailwind

### IV. Russian-Language First & i18n
- ✅ **PASS**: UI text in Russian (existing in speckits/index.vue)
- ✅ **PASS**: Vuetify configured with Russian locale
- ✅ **PASS**: No English UI text being added

### V. SPA Deployment Model & Nuxt 4 Hybrid Rendering
- ✅ **PASS**: Client-side filtering through composables
- ✅ **PASS**: Static build artifacts for CDN deployment
- ✅ **PASS**: Existing stale-while-revalidate caching in server route

### VI. API & Data Modeling Standards
- ✅ **PASS**: Domain types defined in `~/types/article.ts`
- ✅ **PASS**: Server route normalizes Strapi response to domain model
- ✅ **PASS**: Category type filtering happens in server layer

### VII. Error Handling & Observability
- ✅ **PASS**: Existing error states in speckits/index.vue (loading, error, empty)
- ✅ **PASS**: Server route logs errors (existing pattern in speckits.get.ts)
- ✅ **PASS**: User-friendly error messages in Russian

### VIII. Performance & Caching Strategy
- ✅ **PASS**: Existing cache headers (Cache-Control, stale-while-revalidate)
- ✅ **PASS**: Lazy-loaded filter components (defineAsyncComponent)
- ✅ **PASS**: Meets performance goals (<3s filter, <500ms load time)

### IX. Strapi Integration Patterns
- ✅ **PASS**: Uses existing `/api/speckits` server route
- ✅ **PASS**: Populate categories in Strapi query
- ✅ **PASS**: Normalize response to domain model

### X. Security, Auth & Secrets Management
- ✅ **PASS**: Public content (no auth required)
- ✅ **PASS**: No sensitive data exposed
- ✅ **PASS**: Server route handles Strapi URL via environment variable

**Overall Status**: ✅ **PASS** - All constitution gates satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── pages/
│   └── speckits/
│       ├── index.vue          # Main speckits listing page (MODIFY: fix category extraction)
│       └── [speckitSlug].vue  # Individual speckit detail page (unchanged)
├── components/
│   └── prompt/                # Shared filter components (REUSE)
│       ├── CategoriesFilter.vue      # Desktop sidebar filter (unchanged)
│       ├── MobileCategoriesFilter.vue # Mobile horizontal scroll filter (unchanged)
│       ├── PromptSearch.vue          # Search input (unchanged)
│       └── PromptGrid.vue            # Grid display component (unchanged)
├── server/
│   └── api/
│       ├── speckits.get.ts    # Server route for fetching speckits (MODIFY: fix category normalization)
│       └── speckits/
│           └── [slug].get.ts  # Individual speckit endpoint (unchanged)
├── types/
│   └── article.ts             # Domain types for Article, PromptPreview, SpeckitPreview, Category (REVIEW)
└── composables/
    └── (existing composables for data fetching)
```

**Structure Decision**: Web application with frontend/backend separation. The feature touches the frontend speckits page, reuses shared filter components, and modifies the server route for proper category extraction.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates passed. This section remains empty.
