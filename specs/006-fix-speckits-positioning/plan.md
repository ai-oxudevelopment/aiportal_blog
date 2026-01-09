# Implementation Plan: Fix Speckits Page Positioning Error

**Branch**: `006-fix-speckits-positioning` | **Date**: 2026-01-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-fix-speckits-positioning/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Eliminate layout shift on the speckits page by removing conditional rendering (`v-if="categories.length > 0"`) from sidebar, search bar, and mobile category filters. Implement fallback category data (matching homepage pattern) to ensure components always render with consistent positioning, regardless of API data state.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
**Storage**: N/A (static build artifacts + Strapi v5 CMS as backend)
**Testing**: Manual visual testing (layout shift detection via Chrome DevTools Layout Shift API)
**Target Platform**: Web browser (responsive: mobile, tablet, desktop)
**Project Type**: web application (frontend/backend separation)
**Performance Goals**: Zero layout shift (CLSI), components visible in DOM within 100ms
**Constraints**: No visual design changes, no API changes, maintain current responsive behavior
**Scale/Scope**: Single page fix (frontend/pages/speckits/index.vue only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture (Nuxt 4)
**Status**: ✅ PASS - No API changes required
**Rationale**: Fix is client-side only. Components will use existing `/api/speckits` endpoint via current composable pattern. No new server routes needed.

### II. Feature-Based Component Organization (Nuxt 4 `app/` layout)
**Status**: ✅ PASS - Respects component boundaries
**Rationale**: Changes are localized to `frontend/pages/speckits/index.vue`. Existing shared components (`CategoriesFilter.vue`, `MobileCategoriesFilter.vue`, `PromptSearch.vue`) are used as-is without modifications. No cross-feature imports.

### III. Dual UI Framework Integration (Vuetify 3 + Tailwind CSS)
**Status**: ✅ PASS - Maintains current usage pattern
**Rationale**: Fix uses Tailwind classes only for layout stability. No new Vuetify components or custom Tailwind implementations. Current styling approach unchanged.

### IV. Russian-Language First & i18n
**Status**: ✅ PASS - No UI text changes
**Rationale**: Fix addresses rendering behavior only. No new user-facing text. Existing Russian text remains unchanged.

### V. SPA Deployment Model & Nuxt 4 Hybrid Rendering
**Status**: ✅ PASS - Client-side rendering fix
**Rationale**: Fix ensures stable SPA behavior. No SSR/Hybrid rendering changes. Layout stability improves during client-side data fetching.

### VI. API & Data Modeling Standards
**Status**: ✅ PASS - No new domain models
**Rationale**: Uses existing `Category` type from `~/types/article`. No new types or normalization needed. Fallback categories match existing structure.

### VII. Error Handling & Observability
**Status**: ✅ PASS - No new error states
**Rationale**: Existing error handling in speckits/index.vue (lines 52-63) remains unchanged. Fix improves stability during normal operation, not error scenarios.

### VIII. Performance & Caching Strategy
**Status**: ✅ PASS - Improves perceived performance
**Rationale**: Eliminating layout shift directly improves CLSI metrics. No new caching logic. Components render immediately with fallback data, reducing perceived latency.

### IX. Strapi Integration Patterns
**Status**: ✅ PASS - No Strapi client changes
**Rationale**: Existing `useAsyncData` pattern with `/api/speckits` endpoint remains. No changes to Strapi query logic or data normalization.

### X. Security, Auth & Secrets Management
**Status**: ✅ PASS - No security impact
**Rationale**: Fix is client-side rendering only. No auth, secrets, or security-related changes.

**Overall Gate Status**: ✅ **PASS** - All constitution principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-speckits-positioning/
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
│       └── index.vue           # MODIFIED: Remove conditional rendering, add fallback data
├── components/
│   └── prompt/
│       ├── CategoriesFilter.vue        # UNCHANGED
│       ├── MobileCategoriesFilter.vue  # UNCHANGED
│       └── PromptSearch.vue            # UNCHANGED
└── types/
    └── article.ts              # UNCHANGED
```

**Structure Decision**: Single-page fix in existing web application structure. Only `frontend/pages/speckits/index.vue` modified. Shared components remain unchanged to respect feature boundaries.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No constitution violations | N/A |

---

## Phase 0: Research & Decisions

### Unknowns Identified

1. **Fallback Categories**: Should we use exact same categories as homepage or create speckit-specific ones?
2. **Loading State**: Should filters show loading indicator or skeleton while data fetches?
3. **Empty Categories Handling**: How should filter components behave when categories array is truly empty (not loading)?

### Research Tasks

1. Compare homepage fallback categories with potential speckit-specific categories
2. Review best practices for loading states in filter components (Nuxt/Vue 3)
3. Analyze existing component behavior with empty arrays

### Research Output

See [research.md](research.md) for detailed findings and decisions.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](data-model.md) for entity definitions and relationships.

### API Contracts

No new API endpoints required. Using existing `/api/speckits` endpoint.

See [contracts/](contracts/) for existing endpoint documentation.

### Quickstart Guide

See [quickstart.md](quickstart.md) for implementation steps.

---

## Constitution Re-Check (Post-Design)

*Re-evaluated after Phase 1 design completion*

All principles remain ✅ PASS. Design decisions uphold constitution:
- No cross-feature component modifications
- No new API routes or Strapi client changes
- No visual design framework violations
- Maintains SPA architecture
- Uses existing type system

**Final Gate Status**: ✅ **PASS** - Ready for implementation (Phase 2: `/speckit.tasks`)
