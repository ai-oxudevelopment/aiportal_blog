# Research: Fix Nuxt Docker Build Error

**Feature**: 005-fix-nuxt-build
**Date**: 2026-01-09
**Status**: Complete

## Research Questions

This research phase addresses the following unknowns from the Technical Context:

1. **Primary Issue**: Why does `#internal/nuxt/paths` fail to resolve in Docker production builds?
2. **Docker Strategy**: What is the correct multi-stage build pattern for Nuxt 3 SSR applications?
3. **SSR vs SPA**: Should we maintain SSR mode or switch to SPA mode per constitution requirements?
4. **Node.js Version**: Impact of upgrading from Node 20 to Node 22
5. **Dependency Resolution**: How to ensure Nuxt internal modules are available in production runtime?

---

## Findings

### 1. Root Cause: `#internal/nuxt/paths` Import Error

**Decision**: This is a known Nuxt 3 issue related to incomplete dependency bundling in Docker multi-stage builds.

**Rationale**:
- The error occurs when Nuxt's server bundle (`.output/server/index.mjs`) references internal Nuxt modules using subpath imports like `#internal/nuxt/paths`
- These imports are resolved during development but fail in production Docker builds when the full `node_modules` is not properly available
- The issue is documented in [GitHub Issue #26731](https://github.com/nuxt/nuxt/issues/26731) from April 2024
- Users reported that standard fixes (deduping, `nuxi clean`, fresh install) did not resolve the issue

**Alternatives Considered**:
- Adding `exports` field to package.json (rejected - not a permanent solution)
- Manually copying `.nuxt` directory (rejected - increases image size, not production-recommended)
- Ensuring complete `node_modules` in runner stage (selected - see finding #2)

---

### 2. Docker Multi-Stage Build Strategy

**Decision**: Follow official Nuxt Docker documentation: copy only `.output` folder to production stage, not full `node_modules`.

**Rationale**:
- [Official Nuxt Docker documentation](https://content.nuxt.com/docs/deploy/docker) shows the recommended pattern:
  ```dockerfile
  # Build Stage
  FROM node:22-alpine AS build
  # ... build steps ...

  # Production Stage
  FROM node:22-alpine
  COPY --from=build /app/.output/ ./
  CMD ["node", "/app/server/index.mjs"]
  ```
- The current Dockerfile incorrectly copies `node_modules`:
  ```dockerfile
  # CURRENT (INCORRECT)
  COPY --from=build /frontend/.output ./.output
  COPY --from=build /frontend/node_modules ./node_modules  # ← WRONG
  COPY --from=build /frontend/package.json ./package.json
  ```
- [Practical guide from biomousavi.com](https://biomousavi.com/how-to-dockerize-nuxt-3-applications) confirms this pattern
- The `.output` folder is self-contained and includes all necessary runtime dependencies
- The `.output/server/index.mjs` entry point bundles all required code

**Why Current Dockerfile Fails**:
- Copying `node_modules` from build stage suggests the build is not properly bundling dependencies
- The `.output` folder should be complete and self-sufficient
- The error indicates Nuxt build process is not correctly creating a standalone server bundle

**Alternatives Considered**:
- Copying full `node_modules` (current approach) - rejected because it increases image size and doesn't fix the root cause
- Using `.nuxt` directory in production - rejected, not recommended by Nuxt documentation
- Switching to static hosting (if SPA mode) - considered, see finding #3

---

### 3. SSR vs SPA Mode Decision

**Decision**: Maintain SSR mode (`ssr: true`) and fix the Docker build to support it.

**Rationale**:
- Current codebase uses SSR for dynamic content rendering (server routes for Strapi API proxy)
- Constitution allows SSR for selective pre-rendering: "Разрешено использовать `routeRules` для pre-render отдельных публичных страниц"
- The application has server-side API routes (`server/api/articles.get.ts`, `server/api/speckits.get.ts`) that require SSR
- Switching to SPA would require architectural changes:
  - Move all API proxy logic to separate backend service
  - Lose SEO benefits of SSR
  - Change caching strategy (currently using SSR-aware PWA caching)
- The success criteria require "dynamic content rendering working as expected" (SC-006)

**Constitution Compliance**:
- Constitution states: "Основной режим: `ssr: false` (SPA) для среды исполнения"
- However, it also permits: "selective pre-rendering for individual public routes"
- This is a **documented complexity** (see plan.md Complexity Tracking table)
- Fixing the Docker build while maintaining SSR is the minimal change approach

**Alternatives Considered**:
- Switching to SPA mode - rejected because it requires significant architectural changes and loses SSR benefits
- Hybrid mode (SPA + selective static generation) - rejected because server routes require SSR
- Maintaining SSR with proper Docker build - **selected**

---

### 4. Node.js Version Impact

**Decision**: Upgrade from Node 20 to Node 22 in Dockerfile (already changed in current Dockerfile).

**Rationale**:
- Current Dockerfile uses `node:22-slim` (backup file used `node:20-slim`)
- Official Nuxt Docker documentation uses `node:22-alpine`
- Node 22 is the latest LTS and provides better performance and ES2022 support
- No breaking changes for Nuxt 3.2.0 with Node 22
- The change from `node:20-slim` to `node:22-slim` is not the root cause of the error

**Alternatives Considered**:
- Downgrading back to Node 20 - rejected, Node 22 is forward-compatible and recommended
- Using Alpine variants (`node:22-alpine`) - considered but `slim` variant is acceptable

---

### 5. Dependency Resolution Strategy

**Decision**: Ensure Nuxt build process creates a complete, standalone `.output` bundle.

**Rationale**:
- The error indicates that the `.output/server/index.mjs` file references internal modules that are not bundled
- This suggests the Nuxt build configuration may need adjustment
- Key areas to investigate:
  1. **Nuxt build configuration**: Check `vite.build.commonjsOptions` in `nuxt.config.js`
  2. **Package exports**: Ensure `package.json` does not have conflicting exports
  3. **Build cleanup**: Run `nuxi clean` before building to ensure fresh build
  4. **Dependency versions**: Ensure all Nuxt dependencies are compatible (nuxt@3.2.0 is older, current is 3.15+)

**Potential Root Causes**:
1. **Vite configuration issue**: The `vite.build.commonjsOptions.transformMixedEsModules: true` setting may interact poorly with bundling
2. **Nuxt version**: Nuxt 3.2.0 (from Feb 2023) is quite old; newer versions have fixed bundling issues
3. **Incomplete build artifacts**: The `.nuxt` directory may need to be cleaned before building
4. **Docker build context**: Missing `.dockerignore` may cause incorrect file copying

**Alternatives Considered**:
- Manually defining exports in package.json - rejected, Nuxt manages this automatically
- Copying `.nuxt` directory to production - rejected, increases image size
- Upgrading Nuxt version - considered as potential fix

---

## Recommended Implementation Strategy

### Primary Fix: Dockerfile Optimization

**Changes to Dockerfile**:
1. Remove incorrect `node_modules` copy in runner stage
2. Copy only `.output` folder (official Nuxt pattern)
3. Ensure proper build args are passed through
4. Add build step to clean `.nuxt` directory before building

**Updated Dockerfile Structure**:
```dockerfile
# Stage 1: Build
FROM node:22-slim AS build
WORKDIR /frontend
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy dependency files
COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./
RUN yarn install

# Set build environment
ARG STRAPI_URL
ENV STRAPI_URL=$STRAPI_URL
ARG NUXT_PUBLIC_YANDEX_METRIKA_ID
ENV NUXT_PUBLIC_YANDEX_METRIKA_ID=$NUXT_PUBLIC_YANDEX_METRIKA_ID

# Copy source and build
COPY frontend/ .
RUN rm -rf .nuxt && yarn build  # Clean before build

# Stage 2: Production
FROM node:22-slim AS runner
WORKDIR /frontend
ENV NODE_ENV=production

# Only copy .output (self-contained bundle)
COPY --from=build /frontend/.output ./.output

# Set runtime environment
ARG STRAPI_URL
ENV STRAPI_URL=$STRAPI_URL
ARG PORT=8080
ENV PORT=$PORT

EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
```

### Secondary Fix: Nuxt Configuration Review

**Potential nuxt.config.js Adjustments**:
1. Review `vite.build.commonjsOptions` settings
2. Ensure `nitro` configuration is correct for production bundling
3. Verify no conflicting `experimental` features that affect bundling

### Tertiary Fix (If Primary Fails): Nuxt Version Update

**Consider upgrading Nuxt**:
- Current: Nuxt 3.2.0 (February 2023)
- Latest stable: Nuxt 3.15+ (January 2025)
- Many bundling fixes have been implemented in newer versions
- **Risk**: May require dependency updates and testing

---

## Sources

- [Nuxt Issue #26731 - Failed to resolve import "#internal/nuxt/paths"](https://github.com/nuxt/nuxt/issues/26731) - April 2024
- [Official Nuxt Docker Documentation](https://content.nuxt.com/docs/deploy/docker) - Nuxt.com
- [How to dockerize Nuxt 3 applications?](https://biomousavi.com/how-to-dockerize-nuxt-3-applications) - Dec 2024
- [Docker multi-stage build on Nuxt](https://github.com/potato4d/docker-multi-stage-build-on-nuxt) - GitHub example
- Current codebase: `Dockerfile`, `Dockerfile.backup`, `nuxt.config.js`, `package.json`

---

## Next Steps

### Phase 1: Design

1. **Create data-model.md**: No data model changes (this is a build infrastructure fix)
2. **Create contracts/**: No API contracts (this is a build infrastructure fix)
3. **Create quickstart.md**: Document the fixed Docker build and deployment process
4. **Re-evaluate Constitution Check**: Confirm SSR mode justification is acceptable

### Phase 2: Implementation (via `/speckit.tasks`)

1. Update Dockerfile with recommended changes
2. Test Docker build locally
3. Test container runtime
4. Verify all functional requirements
5. Document any deviations from expected approach
