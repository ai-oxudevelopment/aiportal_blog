# Implementation Plan: Fix Docker Build Failure

**Branch**: `001-fix-docker-build` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-docker-build/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Fix Docker build failure where `yarn build` exits with error during production deployment, preventing any deployments to production.

**Technical Approach**: Remove invalid `networkTimeoutSeconds` option from PWA Workbox configuration in [nuxt.config.js](../frontend/nuxt.config.js#L128). The `networkTimeoutSeconds` option is only compatible with `NetworkFirst` handler, but the Strapi API cache rule uses `StaleWhileRevalidate` handler. This one-line change resolves the build failure while maintaining optimal caching behavior.

**Key Changes**:
1. Remove `networkTimeoutSeconds: 10` from Strapi API runtimeCaching config
2. (Optional) Remove outdated esbuild workaround from Dockerfile
3. (Optional) Update package.json nuxt version to match actual installed version

## Technical Context

**Language/Version**:
- JavaScript/TypeScript
- Node.js 20.x (Docker base: `node:20-slim`)
- Nuxt 3.19.2 (package.json specifies ^3.2.0 but actual installed is 3.19.2)

**Primary Dependencies**:
- `nuxt`: ^3.2.0 (actually 3.19.2 installed)
- `@nuxtjs/strapi`: ^2.1.1 - Strapi CMS integration
- `@nuxtjs/tailwindcss`: ^6.14.0 - Tailwind CSS integration
- `@vite-pwa/nuxt`: ^1.1.0 - PWA support (build failure source)
- `vuetify`: ^3.1.4 - UI component library
- `pinia`: ^2.0.30 - State management
- `vite`: ^7.1.5 - Build tool (actually 7.2.2 installed)
- Yarn 3.x (Berry) with `nodeLinker: node-modules`

**Storage**: N/A (frontend-only, Strapi backend is external)

**Testing**:
- Manual build testing (`yarn build`)
- Docker build testing (`docker build`)
- Container runtime testing (`docker run`)
- No automated test suite currently configured for build process

**Target Platform**:
- Docker container (Linux)
- Static hosting / CDN (build artifacts are static files)
- Port 8080 (default)

**Project Type**: Single web application (frontend only, SPA deployment model)

**Performance Goals**:
- Build time: < 5 minutes (Docker), < 30 seconds (local)
- Runtime: Serve static assets efficiently
- Bundle size: Currently has warnings for chunks > 500kB (P3 optimization)

**Constraints**:
- Must build successfully in constrained Docker environments (min 1GB memory)
- Must maintain PWA functionality (offline support, service worker)
- Cannot break existing Strapi integration
- Build must complete with exit code 0

**Scale/Scope**:
- Small fix scope: 1 line change in nuxt.config.js
- Impact: Unblocks all production deployments
- Affected users: All users (build failure blocks deployments)
- Code affected: 1 configuration file, optional Dockerfile cleanup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Server-Side Proxy Architecture** | ✅ PASS | No changes to API layer. Fix is in PWA config only. |
| **II. Feature-Based Component Organization** | ⚠️ N/A | Project uses Nuxt 3 (not Nuxt 4 `app/` layout). Out of scope for this fix. |
| **III. Dual UI Framework Integration** | ✅ PASS | No UI framework changes. |
| **IV. Russian-Language First** | ✅ PASS | No localization changes. |
| **V. SPA Deployment Model** | ✅ PASS | Fix maintains SPA mode (`ssr: false`). |
| **VI. API & Data Modeling Standards** | ✅ PASS | No data model changes. |
| **VII. Error Handling & Observability** | ✅ PASS | Fix resolves build error, improving error handling. |
| **VIII. Performance & Caching Strategy** | ✅ PASS | Fix maintains optimal `StaleWhileRevalidate` caching. |
| **IX. Strapi Integration Patterns** | ✅ PASS | No changes to Strapi integration. |
| **X. Security, Auth & Secrets Management** | ✅ PASS | No auth/security changes. |

**Overall Status**: ✅ **PASS** - No constitutional violations. The fix is a single-line configuration change that resolves a Workbox rule violation while maintaining all architectural principles.

### Post-Phase 1 Re-evaluation

After completing research and design, the constitution check remains **PASS**. The fix:
- Does not introduce new dependencies
- Maintains existing architecture
- Follows Workbox/PWA best practices
- Preserves all constitutional principles

### Technology Constraints Compliance

| Constraint | Status | Notes |
|------------|--------|-------|
| **Nuxt 4 (Vue 3, `app/` layout)** | ⚠️ N/A | Project on Nuxt 3. Migration is separate effort. |
| **Pinia state management** | ✅ PASS | No changes to state management. |
| **Vuetify 3, Radix Vue** | ✅ PASS | No UI component changes. |
| **Tailwind CSS + iridescent theme** | ✅ PASS | No styling changes. |
| **Strapi v5 integration** | ✅ PASS | No changes to Strapi module. |
| **Prohibited patterns avoided** | ✅ PASS | No direct Strapi calls from client code. |

**Result**: ✅ All applicable constraints satisfied.

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
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components (global)
├── composables/         # Vue composables (auto-imported)
├── layouts/             # Nuxt layout components
├── middleware/          # Nuxt middleware
├── pages/               # File-based routing
├── plugins/             # Nuxt plugins
├── public/              # Static public files
├── server/              # Nuxt server routes
├── stores/              # Pinia stores
├── types/               # TypeScript type definitions
├── .env                 # Environment variables (local)
├── .env.example         # Environment variables template
├── nuxt.config.js       # Nuxt configuration (🎯 fix target: line 128)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── yarn.lock            # Yarn lockfile

Dockerfile               # Docker build configuration (🎯 optional cleanup: line 8)
```

**Structure Decision**: Single frontend application using Nuxt 3 with SPA deployment mode. The build fix affects only the PWA configuration in `nuxt.config.js` and optionally the `Dockerfile`. No changes to component structure, routing, or business logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This section is not applicable for this feature.

The fix is a simple configuration change that:
- Resolves a Workbox PWA rule violation
- Maintains all architectural principles
- Introduces no new complexity
- Requires no architectural trade-offs
