# Implementation Plan: Fix Build Process - Missing Page Route Error

**Branch**: `002-fix-docker-build` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-fix-docker-build/spec.md`

## Summary

The Docker build fails because Nuxt is configured to pre-render the `/about` route, but the corresponding page file (`about.vue`) doesn't exist in the `frontend/pages/` directory. The build process exits with a 404 error during prerendering, blocking all deployments.

**Technical Approach**: Remove the `/about` route from the `routeRules` prerender configuration in `nuxt.config.js`. This aligns the route configuration with the actual implemented pages and allows the build to complete successfully.

## Technical Context

**Language/Version**: JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
**Storage**: N/A (static build artifacts + Strapi v5 CMS as backend)
**Testing**: Nuxt build process (yarn build)
**Target Platform**: Node.js 22 (via Docker container)
**Project Type**: web (frontend + backend architecture)
**Performance Goals**: Build completes in <3 minutes, zero prerender errors
**Constraints**: Must maintain existing route behavior for `/` and `/speckits`, no changes to deployed application behavior
**Scale/Scope**: Single configuration file change, affects build process only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Relevant Principles

**I. Server-Side Proxy Architecture**: ✅ NOT APPLICABLE - This fix involves configuration changes only, no API calls or data fetching.

**II. Feature-Based Component Organization**: ✅ NOT APPLICABLE - No component changes required.

**III. Dual UI Framework Integration**: ✅ NOT APPLICABLE - No UI component changes.

**IV. Russian-Language First**: ✅ NOT APPLICABLE - No user-facing text changes.

**V. SPA Deployment Model**: ✅ NOT APPLICABLE - Fix maintains existing SPA/Hybrid rendering model, only corrects configuration mismatch.

**VI. API & Data Modeling Standards**: ✅ NOT APPLICABLE - No API or data model changes.

**VII. Error Handling & Observability**: ✅ NOT APPLICABLE - Fix prevents the error, doesn't add new error handling.

**VIII. Performance & Caching Strategy**: ✅ NOT APPLICABLE - No performance-related changes.

**IX. Strapi Integration Patterns**: ✅ NOT APPLICABLE - No Strapi integration changes.

**X. Security, Auth & Secrets Management**: ✅ NOT APPLICABLE - No security-related changes.

### Gate Result

✅ **PASSED** - No constitution violations. This is a configuration correction that maintains all existing architectural principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-docker-build/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (below)
├── data-model.md        # Phase 1 output (N/A for this feature)
├── quickstart.md        # Phase 1 output (below)
├── contracts/           # Phase 1 output (N/A for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure
backend/
└── [Strapi v5 CMS - out of scope for this fix]

frontend/
├── pages/
│   ├── index.vue              # Home page (exists)
│   ├── speckits/
│   │   ├── index.vue          # Speckits listing (exists)
│   │   └── [speckitSlug].vue  # Speckit detail page (exists)
│   ├── blogs.vue              # Blog listing (exists)
│   ├── prompts/               # Prompt pages (exist)
│   ├── research/              # Research pages (exist)
│   ├── tests/                 # Test pages (exist)
│   └── about.vue              # ❌ DOES NOT EXIST - root cause
├── nuxt.config.js             # ⭐ TARGET FILE - contains prerender config
└── [other directories...]
```

**Structure Decision**: This is a web application with frontend (Nuxt 3) and backend (Strapi v5) in separate directories. The fix targets a single configuration file (`frontend/nuxt.config.js`) to align route rules with implemented pages.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this section is not applicable.
