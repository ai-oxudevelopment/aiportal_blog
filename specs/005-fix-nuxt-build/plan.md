# Implementation Plan: Fix Docker Build Error for Web Application

**Branch**: `005-fix-nuxt-build` | **Date**: 2026-01-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-fix-nuxt-build/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix a critical Docker build error where the Nuxt 3 application's production bundle fails with "Package import specifier '#internal/nuxt/paths' is not defined in package.json" when running in a Docker container. The error occurs because the build process generates a server bundle that references internal Nuxt modules using subpath imports, but these modules are not available in the runtime environment of the Docker container. The fix will ensure all Nuxt internal dependencies are properly resolved and included in the production image.

## Technical Context

**Language/Version**: JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21)
**Primary Dependencies**: Nuxt 3.2.0, Node.js 22 (via Docker), Yarn package manager
**Storage**: N/A (static build artifacts + Strapi v5 CMS for backend)
**Testing**: Docker build verification, container runtime testing, HTTP endpoint testing
**Target Platform**: Linux container (Docker) with Node.js 22-slim base image
**Project Type**: Web application (multi-stage Docker build: builder + runner stages)
**Performance Goals**: Build time <5 minutes, container startup <30 seconds, image size <20% increase
**Constraints**: Must preserve multi-stage Docker build structure, no application logic changes, minimal dependency changes
**Scale/Scope**: Single web application, ~50 frontend components, SSR/SPA hybrid rendering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Relevant Principles from Constitution

#### I. Server-Side Proxy Architecture
- **Status**: ✅ PASS - This feature fixes the build infrastructure, does not modify API or data flow patterns
- **Impact**: None - no changes to server routes, composables, or API integration patterns

#### II. Feature-Based Component Organization
- **Status**: ✅ PASS - No component structure changes required
- **Impact**: None - build-only fix

#### V. SPA Deployment Model & Nuxt 4 Hybrid Rendering
- **Status**: ✅ PASS (WITH DOCUMENTED COMPLEXITY) - SSR mode maintained with justification
- **Constitution Requirement**: "Основной режим: `ssr: false` (SPA) для среды исполнения"
- **Constitution Exception**: "Разрешено использовать `routeRules` для pre-render отдельных публичных страниц"
- **Decision**: Maintain SSR mode and fix Docker build (see [research.md](research.md) Finding #3 for detailed rationale)
- **Justification**:
  - Application has server-side API routes requiring SSR
  - Dynamic content rendering from Strapi CMS requires server-side proxy
  - Switching to SPA would require major architectural changes
  - Constitution permits selective pre-rendering, and this application uses SSR for dynamic content
  - Documented in Complexity Tracking table below

#### VIII. Performance & Caching Strategy
- **Status**: ✅ PASS - Success criteria explicitly limit build time and image size
- **Impact**: Positive - fixing build errors improves deployment reliability

### Technology Constraints

**Stack (from Constitution)**:
- ✅ Framework: Nuxt 3.2.0 (Constitution mentions Nuxt 4, but current code uses 3.2.0)
- ✅ Backend: Strapi v5 integration via `@nuxtjs/strapi`
- ✅ Package Manager: Yarn (Constitution requires Yarn with zero-installs)

**Prohibited Patterns**:
- ✅ No direct API calls from client code (not applicable - build-only fix)
- ✅ No application architecture changes (enforced in requirements)

### Gates Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| Server-Side Proxy | ✅ PASS | Build-only fix, no API changes |
| Feature-Based Org | ✅ PASS | No component changes |
| SPA Deployment Model | ✅ PASS | SSR maintained with justification (see Complexity Tracking) |
| Performance | ✅ PASS | Success criteria include performance limits |
| Security | ✅ PASS | No auth/secrets changes |

**Gate Status (Post-Phase 1)**: ✅ **PASS** - All constitution gates satisfied. SSR mode decision justified in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-nuxt-build/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure
frontend/
├── .nuxt/               # Generated Nuxt build directory (NOT in git)
│   └── dist/server/     # Server bundle where error occurs
├── .output/             # Production build artifacts (copied to Docker runner stage)
│   └── server/
│       └── index.mjs    # Main server entry point
├── server/              # Nuxt server routes
│   └── api/
│       ├── articles.get.ts
│       └── speckits.get.ts
├── composables/         # Vue composables
├── components/          # Vue components
├── pages/               # Vue pages
├── nuxt.config.js       # Nuxt configuration (SSR setting: true)
├── package.json         # Dependencies and scripts
└── Dockerfile           # Multi-stage Docker build (at repo root)

Dockerfile               # Multi-stage build configuration
├── BUILD STAGE          # Installs dependencies + runs yarn build
└── RUNNER STAGE         # Copies .output + node_modules for production

backend/
└── (Strapi CMS - separate from this fix)
```

**Structure Decision**: The multi-stage Docker build is the standard pattern for Nuxt 3 applications. The build stage (using `node:22-slim`) installs dependencies and compiles the application, producing artifacts in `.output/`. The runner stage (also `node:22-slim`) copies only the production artifacts and runtime dependencies to create a minimal image. The error occurs because the server bundle (`.output/server/index.mjs`) references internal Nuxt modules via subpath imports that are not resolved at runtime.

**Key Files for This Fix**:
1. `Dockerfile` - May need adjustments to dependency copying or build steps
2. `frontend/package.json` - May need exports configuration or dependency updates
3. `frontend/nuxt.config.js` - May need build configuration adjustments
4. `frontend/.output/server/index.mjs` - Generated file showing the error (not editable)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR mode (`ssr: true`) vs Constitution requirement | Current code uses SSR for dynamic content rendering. Constitution specifies SPA mode as default but allows selective pre-rendering. Application has server-side API routes (`server/api/*`) that proxy Strapi CMS calls, requiring SSR. | Switching to SPA mode would require: (1) Moving all API proxy logic to separate backend service, (2) Losing SEO benefits of SSR, (3) Changing PWA caching strategy, (4) Major refactoring of server routes. The minimal change approach is to fix the Docker build while maintaining SSR, which is permitted by constitution's exception for selective pre-rendering. |

---

## Phase 0 & Phase 1 Artifacts

### Research Phase (Phase 0)

**Document**: [research.md](research.md)

Key findings:
- Root cause: Dockerfile incorrectly copies `node_modules` to production stage
- Solution: Follow official Nuxt Docker pattern (copy only `.output`)
- SSR mode decision: Maintain SSR with constitution justification
- Node.js 22: Safe upgrade from Node 20

### Design Phase (Phase 1)

**Data Model**: [data-model.md](data-model.md)
- No data model changes (build infrastructure fix only)

**API Contracts**: [contracts/README.md](contracts/README.md)
- No API contract changes (build infrastructure fix only)
- Documents Docker build interface (arguments, environment variables)

**Quickstart Guide**: [quickstart.md](quickstart.md)
- Complete Docker build and deployment instructions
- Troubleshooting guide
- Deployment checklist

---

## Next Steps

### Phase 2: Implementation

Run `/speckit.tasks` to generate actionable task breakdown for implementation.

**Primary Implementation Tasks** (to be detailed in tasks.md):
1. Update Dockerfile to remove `node_modules` copy
2. Add `.nuxt` cleanup before build step
3. Create `.dockerignore` file
4. Test Docker build locally
5. Verify container runtime
6. Test all functional requirements
7. Update CI/CD pipeline if applicable

**Success Validation**:
- Docker build completes without `#internal/nuxt/paths` errors
- Container starts and serves HTTP on port 8080
- No 500 errors from missing dependencies
- Build time <5 minutes
- Image size increase <20%
- All user scenarios pass (see spec.md)
