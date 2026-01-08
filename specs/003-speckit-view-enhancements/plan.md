# Implementation Plan: Speckit View Enhancements

**Branch**: `003-speckit-view-enhancements` | **Date**: 2026-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-speckit-view-enhancements/spec.md`

## Summary

Enhance the Speckit detail page (`/speckits/[speckitSlug].vue`) with four key features to improve user experience:
1. **Copy Command Display** (P1) - Clickable wget command display (250px) that copies to clipboard
2. **Direct Download Button** (P1) - Quick file download button (50px) from Strapi
3. **Process Visualization** (P2) - Mermaid diagram under description showing Speckit workflow
4. **FAQ Section** (P3) - Static Q&A content covering usage and environment setup

Technical approach involves extending the existing `SpeckitDownloadBar` component, creating new composable functions for clipboard and diagram rendering, and integrating Mermaid.js for visualization. All data flows through Nuxt server routes following the Server-Side Proxy Architecture principle.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0)
**Primary Dependencies**:
- Nuxt 3.2.0 (Vue 3 framework)
- Vuetify 3 (UI components for buttons, cards)
- Tailwind CSS (layout, spacing, styling)
- @nuxtjs/mdc (Markdown rendering for existing content)
- Mermaid.js (diagram visualization)
- @nuxtjs/strapi (CMS integration)

**Storage**: Strapi v5 CMS (Articles content type with type="speckit", file uploads, diagram data fields)
**Testing**: Vitest (NEEDS CLARIFICATION - testing framework not currently configured)
**Target Platform**: Web browser (SPA mode), responsive design (mobile + desktop)
**Project Type**: web application (frontend + backend with Strapi CMS)
**Performance Goals**:
- Copy/download operations complete within 5 seconds of page load
- Visual feedback within 100ms of user interaction
- Diagram rendering under 500ms for standard diagrams
- No layout shifts or visual breaks

**Constraints**:
- Command display width: approximately 250px
- Download button width: approximately 50px
- Must preserve existing description component unchanged
- Mobile-responsive layout (250px may need adjustment on small screens)
- Clipboard API support (fallback for unsupported browsers)

**Scale/Scope**:
- Single page enhancement ([speckitSlug].vue)
- 4 new/modified components
- 2 new composables
- 1 new server route for diagram data
- Static FAQ content (3-5 Q&A pairs initially)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture ✅ PASS

**Status**: Compliant

All API interactions follow the server-side proxy pattern:
- Existing composables (`useFetchOneSpeckit`) call Nuxt server routes (`/api/speckits/[slug]`)
- Server routes encapsulate Strapi access with proper error handling
- No direct Strapi calls from client components
- New diagram data will be fetched through server route `/api/speckits/[slug]/diagram`
- Download functionality uses existing `useFileDownload` composable that proxies through server

### II. Feature-Based Component Organization ✅ PASS

**Status**: Compliant

Components follow the feature-based structure under `frontend/`:
- `components/speckit/` - Speckit-specific components
- `composables/` - Shared composables for feature logic
- No cross-feature imports (Speckit components don't import from Prompt/Research)
- New components will be added to `components/speckit/` directory:
  - `SpeckitCopyCommand.vue` - Copy command display
  - `SpeckitDiagramView.vue` - Mermaid diagram renderer
  - `SpeckitFaqSection.vue` - FAQ Q&A display

### III. Dual UI Framework Integration ✅ PASS

**Status**: Compliant

UI components appropriately use Vuetify 3 + Tailwind CSS:
- Buttons: Vuetify `v-btn` or custom button components with Vuetify styling
- Layout: Tailwind CSS for spacing, flexbox, responsive design
- Cards/Sections: Tailwind for container styling, Vuetify for interactive elements
- FAQ section: Vuetify expansion panels (`v-expansion-panels`)
- No reinvention of Vuetify components using Tailwind

### IV. Russian-Language First ✅ PASS

**Status**: Compliant

All UI text is in Russian:
- Button labels: "Скачать", "Копировать", "Скопировано!"
- Error messages: Russian localization
- FAQ content: Russian questions and answers
- Vuetify locale configured to `ru`

### V. SPA Deployment Model ✅ PASS

**Status**: Compliant

Application runs in SPA mode:
- `ssr: false` in Nuxt config
- Client-side rendering through composables
- No server-specific rendering logic
- Static deployment compatible

### VI. API & Data Modeling Standards ⚠️ NEEDS DESIGN

**Status**: Pending Phase 1 design

Need to define domain types for:
- `SpeckitDiagramData` - Structure for Mermaid diagram source from Strapi
- `SpeckitFaqEntry` - FAQ question/answer pairs
- Extend `SpeckitFull` type to include optional `diagramData` field

**Action**: Add type definitions in Phase 1 data modeling

### VII. Error Handling & Observability ✅ PASS

**Status**: Compliant

Error handling follows established patterns:
- Server routes wrap errors in `createError` with Russian messages
- Components show user-friendly error toasts (existing pattern in SpeckitDownloadBar)
- Console logging for debugging
- Unified error display components

### VIII. Performance & Caching Strategy ✅ PASS

**Status**: Compliant

Performance considerations addressed:
- `useFetch` with automatic caching for API calls
- Lazy loading for diagram component (P2 priority)
- Clipboard operations are synchronous (client-side)
- No blocking operations during page load

### IX. Strapi Integration Patterns ✅ PASS

**Status**: Compliant

Strapi integration follows established patterns:
- Server route `/api/speckits/[slug].get.ts` for article data
- Populate strategies for nested fields (categories, file, body)
- Fallback logic for missing fields (400 error handling)
- New `/api/speckits/[slug]/diagram` endpoint will follow same pattern

### X. Security, Auth & Secrets Management ✅ PASS

**Status**: Compliant

Security best practices maintained:
- No API keys in client code
- Clipboard API requires user gesture (click handler)
- File downloads through server proxy (no direct Strapi URLs exposed)
- No sensitive data in client-side state

**Overall Constitution Status**: ✅ PASS (with Phase 1 action item for data modeling)

## Project Structure

### Documentation (this feature)

```text
specs/003-speckit-view-enhancements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-endpoints.md # API contracts for new routes
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── components/speckit/
│   ├── SpeckitDownloadBar.vue       # EXISTING - will be enhanced
│   ├── SpeckitCopyCommand.vue       # NEW - copy command display
│   ├── SpeckitDiagramView.vue       # NEW - Mermaid diagram renderer
│   ├── SpeckitFaqSection.vue        # NEW - FAQ Q&A display
│   ├── SpeckitHelpModal.vue         # EXISTING - unchanged
│   └── EnhancedPromptCard.vue       # EXISTING - unchanged
├── composables/
│   ├── useFetchOneSpeckit.ts        # EXISTING - will extend for diagram data
│   ├── useFileDownload.ts           # EXISTING - unchanged
│   ├── useClipboard.ts              # NEW - clipboard operations
│   └── useMermaidDiagram.ts         # NEW - diagram rendering
├── pages/speckits/
│   ├── index.vue                    # EXISTING - unchanged
│   └── [speckitSlug].vue            # MODIFY - integrate new components
├── server/api/speckits/
│   ├── [slug].get.ts                # EXISTING - unchanged
│   └── [slug]/
│       └── diagram.get.ts           # NEW - fetch diagram data
├── types/
│   └── article.ts                   # MODIFY - add diagram/FAQ types
└── public/                          # Static FAQ content (optional)
    └── speckit-faq.json             # NEW - static FAQ data

backend/
└── [No changes - Strapi CMS only]
```

**Structure Decision**: Web application (Option 2) with frontend enhancement focus. The feature extends the existing Nuxt frontend application with new components and composables while maintaining the established server-side proxy architecture for Strapi CMS integration. No backend code changes required as Strapi v5 handles data storage.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. The feature follows all constitution principles with one Phase 1 action item for data modeling (standard practice, not a violation).

## Phase 0: Research & Technology Decisions

### Research Topics

1. **Mermaid.js Integration with Nuxt 3/Vue 3**
   - Question: What is the recommended way to integrate Mermaid.js for dynamic diagram rendering in Nuxt 3?
   - Considerations: Nuxt module vs. npm package, SSR compatibility, performance
   - Alternatives: `mermaid` npm package, `vue-mermaid-string`, custom integration

2. **Clipboard API Browser Support & Fallbacks**
   - Question: How to handle clipboard operations in browsers with limited or no Clipboard API support?
   - Considerations: `navigator.clipboard` API, `document.execCommand('copy')` fallback
   - Alternatives: Modern Clipboard API, fallback to legacy execCommand, graceful degradation

3. **Mermaid Diagram Data Structure in Strapi**
   - Question: What field type and structure should be used in Strapi to store Mermaid diagram source code?
   - Considerations: Text field, JSON field, Rich text, Custom component
   - Alternatives: Simple text field (store Mermaid syntax directly), JSON field (structured data with metadata), Rich text with code block

4. **Static FAQ Content Management**
   - Question: Where and how should FAQ content be stored for easy maintenance?
   - Considerations: Hardcoded in component, JSON file in public/, Strapi CMS
   - Alternatives: Static JSON in frontend (public/), Strapi content type, Component props

5. **Mobile Responsive Layout for Fixed Width Elements**
   - Question: How to handle 250px command display and 50px download button on mobile devices (<375px width)?
   - Considerations: CSS media queries, flexible width with min/max, scrollable container
   - Alternatives: Responsive width percentages, horizontal scrolling, stacked layout

### Deliverables

- [ ] **research.md** - Document all research findings with decisions and rationale
- [ ] All NEEDS CLARIFICATION topics resolved
- [ ] Technology choices justified with alternatives considered

## Phase 1: Design Artifacts

### Data Modeling

**Deliverables**:
- [ ] **data-model.md** - Complete data model including:
  - `SpeckitDiagramData` interface
  - `SpeckitFaqEntry` interface
  - Extended `SpeckitFull` with optional `diagramData` field
  - Strapi schema requirements (new fields for Articles content type)
  - Entity relationships and validation rules

### API Contracts

**Deliverables**:
- [ ] **contracts/api-endpoints.md** - API documentation for:
  - `GET /api/speckits/{slug}/diagram` - Fetch diagram source code
  - Response format, error codes, examples
  - Strapi query parameters and population strategy

### Quick Start Guide

**Deliverables**:
- [ ] **quickstart.md** - Developer onboarding guide with:
  - Prerequisites (Node.js, Yarn, Strapi access)
  - Environment setup steps
  - Local development workflow
  - Testing procedures for copy/download/diagram features
  - FAQ content management instructions

### Agent Context Update

**Deliverables**:
- [ ] Run `.specify/scripts/bash/update-agent-context.sh claude`
- [ ] Verify new technologies (Mermaid.js) added to agent context file

## Phase 2: Task Breakdown (NOT PART OF PLAN)

**Note**: This phase is executed by `/speckit.tasks` command, not `/speckit.plan`.

After Phase 1 design is complete, run `/speckit.tasks` to generate:
- Dependency-ordered task list
- Implementation tasks for each component/composable
- Testing tasks
- Deployment tasks
