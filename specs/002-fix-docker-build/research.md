# Research: Fix Build Process - Missing Page Route Error

**Feature**: 002-fix-docker-build
**Date**: 2026-01-10
**Status**: Complete

## Root Cause Analysis

### Problem

The Docker build fails with this error:

```
[nitro]   ├─ /about (43058ms)
[nitro]   │ └── [404] Page not found: /about
ERROR  Exiting due to prerender errors.
```

### Investigation

1. **Checked Nuxt configuration** (`frontend/nuxt.config.js`):
   - Line 9: `'/about': { prerender: true }`
   - This configures Nuxt to pre-render the `/about` route as static HTML during build

2. **Checked page files** (`frontend/pages/`):
   - `index.vue` ✅ exists
   - `speckits/index.vue` ✅ exists
   - `blogs.vue` ✅ exists
   - `prompts/[promptSlug].vue` ✅ exists
   - `research/[searchId].vue` ✅ exists
   - `about.vue` ❌ DOES NOT EXIST

3. **Conclusion**: The configuration references a route that doesn't have a corresponding page file.

### Root Cause

Configuration drift: The `/about` route was removed from the codebase but the prerender configuration was not updated. This is a common issue when refactoring pages without updating the route rules.

## Solution Options

### Option A: Remove `/about` from Prerender Configuration (CHOSEN)

**Decision**: Remove line `'/about': { prerender: true }` from `routeRules` in `nuxt.config.js`

**Rationale**:
- Minimal change, affects only the configuration file
- No functional change to the application (the page doesn't exist anyway)
- Aligns configuration with actual implementation
- Fastest path to unblock deployments

**Risks**:
- None identified - the page is not referenced anywhere else in the codebase
- If the page is needed in the future, it can be added back with proper configuration

**Impact**:
- Build process will complete successfully
- No impact on deployed application behavior
- No impact on users (page was inaccessible anyway due to build failure)

### Option B: Create the Missing `about.vue` Page

**Decision**: REJECTED

**Rationale**:
- Creates new code without requirement/specification
- Adds maintenance burden
- The spec explicitly states "Creation of new content or pages" is out of scope
- Unclear what content should be on the page

**Why Not**:
- The business need is to unblock deployments, not add an about page
- Creating an empty/stub page would be misleading
- If an about page is needed, it should be properly specified and designed

### Option C: Change Prerender to SSR/SPA Mode

**Decision**: REJECTED

**Rationale**:
- More complex change with unclear benefits
- Would allow the route to be accessed but still return 404
- Doesn't solve the underlying misconfiguration

**Why Not**:
- The page doesn't exist, so changing rendering mode doesn't help
- Adds complexity without solving the root problem

## Technical Details

### Nuxt Route Rules

Nuxt 3 supports hybrid rendering through `routeRules` in `nuxt.config.js`:

```js
routeRules: {
  '/': { prerender: true },        // Pre-render as static HTML at build time
  '/about': { prerender: true },   // ❌ This route has no page file
  '/speckits': { prerender: true },
  // Other routes can use SSR or SPA modes
}
```

When a route is marked for prerendering:
1. Nuxt checks if a corresponding page file exists
2. If the file doesn't exist, prerendering fails with 404
3. The build process exits with an error

### Build Process

The Docker build runs:
```bash
rm -rf .nuxt && yarn build
```

This:
1. Cleans the `.nuxt` build cache
2. Runs `yarn build` which:
   - Compiles the application
   - Prerenders configured routes
   - Exits with error code 1 if any route fails

### Verification Strategy

After the fix:
1. Run `yarn build` in the frontend directory
2. Verify build completes with exit code 0
3. Verify no `[404] Page not found` errors in build log
4. Verify `.output/public` directory contains generated files
5. Deploy and verify application works correctly

## Alternatives Considered

### Alternative 1: Add Build-time Validation

**Decision**: NOT IMPLEMENTED (out of scope)

Could add a pre-build script that validates all prerender routes have corresponding pages:

```js
// scripts/validate-routes.js
const fs = require('fs')
const path = require('path')

// Read nuxt.config.js and validate each prerender route
// Exit with error if any route is missing
```

**Why Not**: Adds complexity for a one-time fix. The issue is caught by the build process itself, so validation would be redundant.

### Alternative 2: Use Dynamic Routes Instead

**Decision**: NOT APPLICABLE

Dynamic routes (e.g., `[...slug].vue`) catch missing routes, but this doesn't help because:
1. The error occurs during prerendering, not at runtime
2. A catch-all route wouldn't match the configured `/about` route
3. Would require significant refactoring

## Implementation Notes

### Files to Modify

1. `frontend/nuxt.config.js` (line 9)
   - Remove: `'/about': { prerender: true },`
   - Result: routeRules contains only implemented routes

### Testing Approach

1. **Local Build Test**:
   ```bash
   cd frontend
   yarn build
   ```
   Expected: Build completes successfully, no prerender errors

2. **Docker Build Test**:
   ```bash
   docker build -t test-build .
   ```
   Expected: Docker build completes successfully

3. **Deployment Test**:
   - Deploy to staging/production
   - Verify application loads correctly
   - Verify existing routes (`/`, `/speckits`) work as before

## Conclusion

The fix is straightforward: remove the `/about` route from the prerender configuration. This aligns the configuration with the actual codebase and unblocks deployments immediately.

**Next Steps**:
1. Remove `/about` from `routeRules` in `nuxt.config.js`
2. Run `yarn build` to verify fix
3. Commit and deploy
4. Consider adding a pre-commit hook to prevent similar issues in the future (optional)
