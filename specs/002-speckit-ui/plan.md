# Implementation Plan: Speckit UI Enhancements

**Branch**: `002-speckit-ui` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-speckit-ui/spec.md`

## Summary

This feature enhances the speckit detail page by relocating the configuration file download button from the top section to the bottom of the page, styled consistently with the AI platform selector. It also adds a help button that opens an instruction modal and integrates AI assistant selection buttons (ChatGPT, Claude, Perplexity) similar to the prompt page. The technical approach involves creating reusable Vue components for the download/help bar and reusing the existing AiPlatformSelector component, following Nuxt 4 conventions and the project's frontend constitution.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/mdc (Markdown rendering), Pinia (state management)
**Storage**: N/A (client-side UI enhancement, no new storage requirements)
**Testing**: Manual testing in browser (no automated test framework specified in constitution)
**Target Platform**: Web browser (responsive: desktop and mobile < 768px)
**Project Type**: Web application (frontend-only feature, existing backend integration via Strapi v5)
**Performance Goals**: Page load time < 2 seconds for initial load, no negative impact on existing performance
**Constraints**: Must match visual design of existing AiPlatformSelector (rounded pills, gradient background), must handle edge cases (missing files, no content, network errors, mobile responsive)
**Scale/Scope**: Single page enhancement (~[speckitSlug].vue), 2 new components (SpeckitDownloadBar, SpeckitHelpModal), modifications to existing page component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture (Nuxt 4)
- ✅ **PASS**: Feature is frontend-only UI enhancement. No new API endpoints required. Uses existing server routes (`/api/speckits/[slug]`) via composables (`useFetchOneSpeckit`).
- ✅ **PASS**: Download functionality uses existing composable (`useFileDownload`) which handles file downloads client-side (appropriate for this use case).

### II. Feature-Based Component & App Organization (Nuxt 4 `app/` layout)
- ✅ **PASS**: New components will be placed in feature-specific directory structure:
  - `frontend/components/speckit/` - Speckit-specific components (SpeckitDownloadBar, SpeckitHelpModal)
  - Reuses `frontend/components/research/AiPlatformSelector.vue` from shared location
- ✅ **PASS**: No cross-feature imports (speckit feature doesn't import from prompt/research features).

### III. Dual UI Framework Integration (Vuetify 3 + Tailwind CSS)
- ✅ **PASS**: Design matches existing AiPlatformSelector which uses Tailwind CSS for layout/styling.
- ✅ **PASS**: Modal dialog can use Vuetify's dialog system (if needed) or custom Tailwind implementation matching existing patterns.
- ✅ **PASS**: Visual consistency with iridescent theme (gradient backgrounds, rounded pills).

### IV. Russian-Language First & i18n
- ✅ **PASS**: All UI text will be in Russian (button labels, modal content, error messages).
- ✅ **PASS**: Error messages follow Russian locale standards (already in codebase: "Не удалось скачать файл. Попробуйте еще раз.").

### V. SPA Deployment Model & Nuxt 4 Hybrid Rendering
- ✅ **PASS**: Feature works in SPA mode (client-side navigation, composables).
- ✅ **PASS**: No SSR-specific code required.

### VI. API & Data Modeling Standards
- ✅ **PASS**: Uses existing domain types (`SpeckitFull`, `SpeckitFile`) from `frontend/types/article.ts`.
- ✅ **PASS**: No new data models required (reuses existing speckit data structure).

### VII. Error Handling & Observability
- ✅ **PASS**: Error handling follows existing patterns (error messages displayed for 5 seconds, console logging).
- ✅ **PASS**: Loading states prevent multiple concurrent actions (download button disabled during fetch).

### VIII. Performance & Caching Strategy
- ✅ **PASS**: No performance impact expected (components load on-demand, no heavy computations).
- ✅ **PASS**: Existing composables provide data fetching with appropriate caching.

### IX. Strapi Integration Patterns
- ✅ **PASS**: Uses existing server route pattern (`/api/speckits/[slug]`) with fallback for missing fields.
- ✅ **PASS**: No new Strapi integration required.

### X. Security, Auth & Secrets Management
- ✅ **PASS**: No security concerns (public content, no authentication required for viewing/downloading speckits).

**Overall Status**: ✅ **ALL GATES PASSED** - No constitution violations. Feature aligns with all architectural principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-speckit-ui/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (domain types)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output (N/A - no new API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
frontend/
├── components/
│   ├── speckit/                        # NEW: Speckit-specific components
│   │   ├── SpeckitDownloadBar.vue      # NEW: Download + help button bar
│   │   └── SpeckitHelpModal.vue        # NEW: Help instructions modal
│   └── research/
│       └── AiPlatformSelector.vue      # EXISTING: Reused for AI platform buttons
├── composables/
│   ├── useFetchOneSpeckit.ts           # EXISTING: Fetch speckit data
│   └── useFileDownload.ts              # EXISTING: File download utilities
├── pages/
│   └── speckits/
│       └── [speckitSlug].vue           # MODIFY: Add download bar and AI platform selector
├── types/
│   └── article.ts                      # EXISTING: Domain types (SpeckitFull, SpeckitFile)
└── server/
    └── api/
        └── speckits/
            └── [slug].get.ts           # EXISTING: Server route (no changes needed)
```

**Structure Decision**: Web application (frontend-only enhancement). New components are organized in feature-based directory (`components/speckit/`) following Nuxt 4 conventions. The modification is isolated to a single page component (`[speckitSlug].vue`) with no impact on other features.

## Complexity Tracking

> **No violations to track** - All constitution gates passed. Feature follows established architectural patterns without requiring exceptions or workarounds.

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design completion*

### Design Decisions Review

All design decisions from [research.md](./research.md) and [data-model.md](./data-model.md) were evaluated against constitutional principles:

**No Changes Required** - All original gates still pass:

1. **Server-Side Proxy**: ✅ Confirmed - No new API endpoints, reuses existing routes
2. **Feature Organization**: ✅ Confirmed - Components in `components/speckit/`, no cross-feature imports
3. **UI Framework**: ✅ Confirmed - Uses Tailwind CSS for consistency, no Vuetify dependencies
4. **Russian Language**: ✅ Confirmed - All UI text in Russian, follows locale standards
5. **SPA Model**: ✅ Confirmed - Client-side only, no SSR concerns
6. **Data Modeling**: ✅ Confirmed - Uses existing types (`SpeckitFull`, `SpeckitFile`), adds `SpeckitUsageInstructions`
7. **Error Handling**: ✅ Confirmed - Follows existing patterns (5-second toast, console logging)
8. **Performance**: ✅ Confirmed - Minimal bundle impact, lazy-loaded modal, GPU-accelerated animations
9. **Strapi Integration**: ✅ Confirmed - No new integration required
10. **Security**: ✅ Confirmed - Public content, no auth, proper `rel="noopener noreferrer"` on external links

### New Types Added

The design adds one new type definition to `frontend/types/article.ts`:
- `SpeckitUsageInstructions` - Structure for help modal content
- `InstructionSection` - Sub-type for instruction sections

**Impact**: Minimal - These are pure TypeScript interfaces for type safety, no runtime overhead or architectural changes.

**Constitution Compliance**: ✅ Aligns with Principle VI (API & Data Modeling Standards) - typed interfaces, no `any` types.

### Component Architecture

**Components Created**:
1. `SpeckitDownloadBar.vue` - ~150 LOC, handles download + help button logic
2. `SpeckitHelpModal.vue` - ~100 LOC, handles modal display with teleport

**Components Modified**:
1. `[speckitSlug].vue` - Adds ~20 LOC to import and use new components

**Total Complexity**: Low (~270 new lines of code, all isolated to speckit feature)

**Constitution Compliance**: ✅ Aligns with Principle II (Feature-Based Organization) - no cross-feature coupling, clear boundaries.

### Final Status

**Re-evaluation Result**: ✅ **ALL GATES PASSED** (Post-Design)

The design phase has not introduced any constitutional violations. All technical decisions align with established architectural principles. Feature is ready for implementation (Phase 2: `/speckit.tasks`).
