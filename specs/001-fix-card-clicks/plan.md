# Implementation Plan: Fix Card Click Interaction Delay

**Branch**: `001-fix-card-clicks` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-card-clicks/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix a critical usability regression where interactive elements (cards, navigation links) are unclickable for 30-50 seconds after page load. The root cause is multi-level lazy loading introduced by PageSpeed optimizations (commit fd101a1), creating a waterfall effect that delays event handler attachment.

**Technical Approach**: Remove `defineAsyncComponent` wrappers from critical interactive components (PromptGrid, EnhancedPromptCard) while preserving lazy loading for non-critical components (filters, search). This ensures immediate interactivity (< 1 second) while maintaining most PageSpeed optimization benefits.

## Technical Context

**Language/Version**: JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia, @nuxtjs/mdc
**Storage**: N/A (static build artifacts + Strapi v5 CMS as backend)
**Testing**: Manual testing with Chrome DevTools Performance profiling, Lighthouse metrics validation
**Target Platform**: Web browsers (Chrome, Firefox, Safari) - desktop and mobile
**Project Type**: Web application (SPA with hybrid rendering, frontend + backend architecture)
**Performance Goals**:
- Time to Interactive (TTI) < 3 seconds
- First Input Delay (FID) < 100ms for 95% of page loads
- Click response time < 100ms
- Total Blocking Time (TBT) < 300ms mobile, < 200ms desktop
**Constraints**:
- Must maintain PageSpeed optimization benefits where possible
- Must not significantly degrade bundle size (< 50KB increase acceptable)
- Must preserve existing SSR/hybrid rendering architecture
- Must not break existing functionality (filters, search, navigation)
**Scale/Scope**:
- Affects all pages with interactive cards (home page, speckits listing, blog listings)
- 2 core components modified (PromptGrid, EnhancedPromptCard)
- 3 components preserved with lazy loading (CategoriesFilter, MobileCategoriesFilter, PromptSearch)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Assessment (Before Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server-Side Proxy Architecture | ✅ PASS | No changes to API layer or data fetching patterns |
| II. Feature-Based Component Organization | ✅ PASS | Maintains existing component structure, no new features added |
| III. Dual UI Framework Integration | ✅ PASS | No changes to Vuetify/Tailwind usage patterns |
| IV. Russian-Language First | ✅ PASS | No UI text changes required |
| V. SPA Deployment Model | ✅ PASS | Maintains SPA architecture with SSR/hybrid rendering |
| VI. API & Data Modeling Standards | ✅ PASS | No data model changes, bug fix only |
| VII. Error Handling & Observability | ✅ PASS | No error handling changes required |
| VIII. Performance & Caching Strategy | ⚠️ REVIEW | **Trade-off**: Slightly larger initial bundle for immediate interactivity. See Complexity Tracking below. |
| IX. Strapi Integration Patterns | ✅ PASS | No Strapi integration changes |
| X. Security, Auth & Secrets Management | ✅ PASS | No security or auth changes |

### Post-Design Assessment (After Phase 1)

✅ **All Principles Pass** - No additional violations identified after design phase.

| Principle | Re-Evaluation | Status | Notes |
|-----------|---------------|--------|-------|
| VIII. Performance & Caching Strategy | Reviewed trade-off | ✅ PASS | The synchronous import trade-off is justified: immediate interactivity (< 1s) is prioritized over slightly larger initial bundle (+10-50KB). This aligns with the principle that "performance is a functional requirement" - user experience (clickable UI) is the most critical performance metric. |

### Complexity Tracking

| Trade-off | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Synchronous card component imports | Critical interactivity requirement: users must be able to click cards within 1 second of page load. Multi-level lazy loading (PromptGrid → EnhancedPromptCard) creates 30-50 second waterfall delay. | Lazy loading: Would maintain smaller bundle but causes critical UX regression. Users cannot interact with primary UI elements for nearly a minute. |
| Preserved lazy loading for filters/search | Maintains PageSpeed optimization benefits for non-critical UI components. Filters and search are secondary interactions not required for initial page functionality. | Remove all lazy loading: Would simplify architecture but increase initial bundle size unnecessarily without proportional UX benefit. |

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
backend/
├── [Strapi CMS - not modified by this fix]

frontend/
├── pages/
│   └── index.vue                    # MODIFY: Remove defineAsyncComponent from PromptGrid import
├── components/
│   └── prompt/
│       ├── PromptGrid.vue           # MODIFY: Remove defineAsyncComponent from EnhancedPromptCard import
│       ├── EnhancedPromptCard.vue   # AFFECTED: Click handlers now work immediately
│       └── PromptCard.vue           # UNCHANGED: Different component path, not affected by bug
├── composables/
│   └── [no changes]
└── [rest of frontend unchanged]

tests/
├── [manual testing with DevTools - no automated tests for this fix]
```

**Structure Decision**: Web application (frontend + backend). This is a bug fix affecting only the frontend layer, specifically component loading patterns in the Nuxt 3 application. No backend (Strapi) changes required.


