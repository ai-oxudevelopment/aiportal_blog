# Implementation Plan: Speckit Catalog

**Branch**: `001-speckit-constitution` | **Date**: 2026-01-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-speckit-constitution/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a Speckit catalog page at `/speckits` that displays IDE instructions, templates, and examples managed in Strapi CMS. The catalog reuses existing components from the prompts implementation and filters Articles by `type="speckit"`. Detail pages at `/speckits/[speckitSlug]` display full content with download options for .md and .zip formats. Navigation is updated to add "IDE инструкции" menu item to the Sidebar.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi, Pinia, @nuxtjs/mdc (Markdown rendering)
**Storage**: Strapi v5 CMS (Articles content type with type="speckit")
**Testing**: Manual testing, automated unit/integration tests (NEEDS CLARIFICATION - testing framework not specified)
**Target Platform**: Web browser (responsive: desktop, tablet, mobile)
**Project Type**: Web application (frontend SPA with Strapi backend)
**Performance Goals**:
- Catalog page load: < 3 seconds
- Detail page load: < 3 seconds
- Download initiation: < 2 seconds
- Category filtering: Instantaneous (client-side)

**Constraints**:
- Reuse existing components from `pages/index.vue` and `prompts/[promptSlug].vue`
- Use existing Articles content type (no new Strapi content type)
- Follow existing server proxy pattern for API calls
- SPA mode with SSR disabled
- Maintain Russian-language UI

**Scale/Scope**:
- 1 new catalog page (`/speckits`)
- 1 new detail page pattern (`/speckits/[speckitSlug]`)
- 1 navigation update (Sidebar menu item)
- TypeScript type extensions for Article types
- 1 new or updated composable for fetching speckits
- Download functionality for .md and .zip formats

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture ✅ PASS

**Requirements**:
- All Strapi API calls must go through Nuxt server routes (`server/api/*`)
- Components must call composables, not direct API calls
- Composables must call server routes, not Strapi directly

**Implementation Plan**:
- Create/update `server/api/speckits.get.ts` for fetching speckit catalog
- Create/update `server/api/speckits/[slug].get.ts` for fetching individual speckit
- Create `composables/useFetchSpeckits.ts` wrapping server API calls
- Create `composables/useFetchOneSpeckit.ts` for detail page
- Reuse existing `server/api/articles.js` pattern with type="speckit" filter

**Status**: ✅ Aligned with constitution - reusing existing proxy pattern

### II. Feature-Based Component Organization ✅ PASS

**Requirements**:
- Organize by feature, not by technical type
- Auto-imports for components, composables, stores
- No upward/sideways imports (only downward or from shared/)

**Implementation Plan**:
- Create `pages/speckits/index.vue` (catalog page)
- Create `pages/speckits/[speckitSlug].vue` (detail page)
- Reuse existing components from `components/prompt/` (PromptCard, EnhancedPromptCard, PromptGrid)
- Update `components/main/Sidebar.vue` (shared component)
- Add TypeScript types in `types/article.ts` (shared types)

**Status**: ✅ Aligned with constitution - follows Nuxt pages structure and component reuse

### III. Dual UI Framework Integration ✅ PASS

**Requirements**:
- Vuetify for complex interactive components (forms, dialogs, navigation)
- Tailwind CSS for layout, spacing, typography, colors
- No reinventing Vuetify components with Tailwind

**Implementation Plan**:
- Reuse Vuetify components from existing prompts pages
- Use Tailwind for catalog grid layout, spacing, responsive design
- Apply iridescent theme (pink → orange → blue gradients)
- Use existing animation classes (`gradient-chaos`, `gradient-pulse`)

**Status**: ✅ Aligned with constitution - reusing existing UI patterns

### IV. Russian-Language First ✅ PASS

**Requirements**:
- All UI text in Russian by default
- Vuetify configured with `ru` locale
- Dates in DD.MM.YYYY format

**Implementation Plan**:
- Menu item: "IDE инструкции" (Russian)
- Catalog and detail page text in Russian
- Vuetify locale already configured in `nuxt.config.js`

**Status**: ✅ Aligned with constitution - Russian UI maintained

### V. SPA Deployment Model ✅ PASS

**Requirements**:
- `ssr: false` for SPA mode
- Client-side data fetching via composables
- Static build artifacts

**Implementation Plan**:
- Use existing SPA configuration
- Fetch data with `useFetch` via composables
- Build static files for deployment

**Status**: ✅ Aligned with constitution - SPA mode preserved

### VI. API & Data Modeling Standards ✅ PASS

**Requirements**:
- Domain types defined in frontend, not direct Strapi types
- Normalize Strapi responses to domain models
- Explicit TypeScript interfaces

**Implementation Plan**:
- Add `SpeckitPreview` and `SpeckitFull` interfaces to `types/article.ts`
- Normalize Articles with type="speckit" to Speckit types
- Map Strapi responses in server routes or composables

**Status**: ✅ Aligned with constitution - extending existing Article type system

### VII. Error Handling & Observability ✅ PASS

**Requirements**:
- Unified error handling in server routes
- User-friendly error messages in Russian
- Error logging for diagnostics

**Implementation Plan**:
- Reuse existing error handling from `server/api/articles.js`
- Display user-friendly errors when Strapi API fails
- Show empty state when no speckits available
- Handle 404 for non-existent speckit slugs

**Status**: ✅ Aligned with constitution - reusing existing error patterns

### VIII. Performance & Caching Strategy ✅ PASS

**Requirements**:
- Use Nuxt composables with caching
- Skeleton states for loading
- Client-side filtering for performance

**Implementation Plan**:
- Use `useFetch` with automatic caching
- Implement client-side category filtering (no server round-trip)
- Show skeleton states during data fetch
- Lazy-load components if needed

**Status**: ✅ Aligned with constitution - following performance best practices

### IX. Strapi Integration Patterns ✅ PASS

**Requirements**:
- Dedicated functions for Strapi collections
- Encapsulate filtering and pagination
- Support draft/published logic if used

**Implementation Plan**:
- Add type="speckit" filter to existing Articles fetching
- Populate categories relation in queries
- Reuse existing Strapi client patterns

**Status**: ✅ Aligned with constitution - extending existing Strapi integration

### X. Security, Auth & Secrets Management ✅ PASS

**Requirements**:
- No sensitive data in client code
- HttpOnly cookies for auth (if applicable)
- Environment variables for secrets

**Implementation Plan**:
- Public access to catalog (no auth required)
- Use existing Strapi URL from runtime config
- No new secrets introduced

**Status**: ✅ Aligned with constitution - no auth needed for public content

### Overall Constitution Check Result

**Status**: ✅ **PASS** - All principles satisfied

No violations detected. The feature reuses existing patterns and extends the current architecture without introducing anti-patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-speckit-constitution/
├── spec.md              # Feature specification
├── plan.md              # This file (planning output)
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: Data model and types
├── quickstart.md        # Phase 1: Developer quickstart guide
├── contracts/           # Phase 1: API contracts (if needed)
│   └── speckits-api.yaml
└── tasks.md             # Phase 2: Task breakdown (NOT created yet)
```

### Source Code (repository root)

```text
frontend/
├── pages/
│   ├── speckits/
│   │   ├── index.vue              # NEW: Catalog page
│   │   └── [speckitSlug].vue      # NEW: Detail page
│   ├── index.vue                  # EXISTING: Reused for reference
│   └── prompts/
│       └── [promptSlug].vue       # EXISTING: Reused for reference
│
├── components/
│   ├── main/
│   │   └── Sidebar.vue            # UPDATE: Add "IDE инструкции" menu item
│   ├── prompt/
│   │   ├── PromptCard.vue         # REUSE: For speckit cards
│   │   ├── EnhancedPromptCard.vue # REUSE: For enhanced speckit cards
│   │   └── PromptGrid.vue         # REUSE: For speckit grid
│   └── shared/                    # NEW: Shared components if needed
│
├── composables/
│   ├── useFetchArticles.js        # EXISTING: Reference for pattern
│   ├── useFetchOneArticle.js      # EXISTING: Reference for pattern
│   ├── useFetchSpeckits.ts        # NEW: Fetch speckit catalog
│   └── useFetchOneSpeckit.ts      # NEW: Fetch single speckit
│
├── server/
│   └── api/
│       ├── articles.get.js        # EXISTING: Reference for pattern
│       ├── speckits.get.ts        # NEW: Fetch speckits from Strapi
│       └── speckits/
│           └── [slug].get.ts      # NEW: Fetch single speckit by slug
│
├── types/
│   └── article.ts                 # UPDATE: Add SpeckitPreview and SpeckitFull types
│
└── nuxt.config.js                 # EXISTING: No changes needed
```

**Structure Decision**: This is a web application with frontend and backend separation. The frontend is a Nuxt 3 SPA consuming Strapi CMS APIs. The speckit feature follows the existing project structure:

- **Pages**: Follow Nuxt file-based routing with nested folder for speckits
- **Components**: Reuse existing prompt components (they share similar card/grid patterns)
- **Composables**: New composables follow existing `useFetch*` pattern
- **Server routes**: New API routes follow existing server proxy pattern
- **Types**: Extend existing article.ts with speckit-specific types

No new top-level directories are created. The feature integrates seamlessly with the current architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is not applicable.

