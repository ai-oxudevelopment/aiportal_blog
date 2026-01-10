# Quickstart: Fix Build Process - Missing Page Route Error

**Feature**: 002-fix-docker-build
**Last Updated**: 2026-01-10

## Overview

This quickstart guide provides step-by-step instructions to implement the fix for the Docker build error caused by a missing `/about` page in the prerender configuration.

## Prerequisites

- Node.js 22 (or version specified in `.nvmrc`)
- Yarn package manager
- Git access to the repository
- Docker (for testing the build locally, optional)

## Implementation Steps

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Edit Nuxt Configuration

Open `frontend/nuxt.config.js` in your editor and locate the `routeRules` section (around line 5-14):

**Before:**
```js
routeRules: {
  // Pre-render public pages (no dynamic data)
  '/': { prerender: true },
  '/speckits': { prerender: true },
  '/about': { prerender: true },  // ❌ Remove this line

  // SPA mode for non-critical routes (future enhancement)
  // '/research/**': { ssr: false },
  // '/admin/**': { ssr: false }
},
```

**After:**
```js
routeRules: {
  // Pre-render public pages (no dynamic data)
  '/': { prerender: true },
  '/speckits': { prerender: true },

  // SPA mode for non-critical routes (future enhancement)
  // '/research/**': { ssr: false },
  // '/admin/**': { ssr: false }
},
```

**Change**: Remove line 9: `'/about': { prerender: true },`

### Step 3: Clean Build Cache

```bash
rm -rf .nuxt
```

This removes the Nuxt build cache to ensure a clean build.

### Step 4: Run Build

```bash
yarn build
```

**Expected Output:**
```
✔ Server built in ~30s
[nitro] ℹ Initializing prerenderer
[nitro] ℹ Prerendering 2 routes
[nitro]   ├─ / (43s)
[nitro]   ├─ /speckits (43s)
[nitro]   ├─ /_payload.json (3ms)
✔ Client built in ~15s
✔ You can now deploy your application
```

**Success Criteria:**
- Exit code is 0
- No `[404] Page not found: /about` error
- Build completes in under 3 minutes
- `.output/public` directory is created with static files

### Step 5: Verify Build Output

```bash
ls -la .output/public/
```

**Expected Files:**
- `index.html` (home page)
- `speckits/index.html` (speckits listing)
- `speckits/_payload.json` (speckits data)
- `_payload.json` (home data)

### Step 6: Test Application Locally (Optional)

```bash
yarn preview
```

Then open:
- http://localhost:8080/ (home page)
- http://localhost:8080/speckits (speckits listing)

**Verify:**
- Pages load correctly
- No 404 errors for configured routes
- Styling and functionality work as expected

### Step 7: Commit Changes

```bash
git add frontend/nuxt.config.js
git commit -m "fix: remove /about from prerender config

The /about page was removed from the codebase but the prerender
configuration was not updated, causing Docker builds to fail with
a 404 error during the prerendering phase.

This change aligns the routeRules configuration with the actual
implemented pages, allowing the build process to complete successfully.

Fixes #002-fix-docker-build"
```

### Step 8: Test Docker Build (Optional)

If you have Docker installed locally, you can test the full Docker build:

```bash
cd ..  # Return to repository root
docker build -t test-build .
```

**Expected:** Docker build completes successfully without errors.

## Verification Checklist

Before deploying, verify:

- [ ] `yarn build` completes with exit code 0
- [ ] No prerender errors in build log
- [ ] Build completes in under 3 minutes
- [ ] `.output/public/` contains expected static files
- [ ] Application runs correctly with `yarn preview`
- [ ] Home page loads at http://localhost:8080/
- [ ] Speckits page loads at http://localhost:8080/speckits
- [ ] No console errors in browser DevTools
- [ ] Changes committed to git

## Troubleshooting

### Build Fails with Different Error

**Problem**: Build still fails but with a different error

**Solution**: Check the error message carefully:
1. If it's a dependency error: Run `yarn install`
2. If it's a TypeScript error: Check for type errors in recently changed files
3. If it's a prerender error for a different route: Apply the same fix (remove or create the page)

### Build Takes Longer Than Expected

**Problem**: Build takes more than 3 minutes

**Possible causes**:
1. Slow internet connection (fetching dependencies)
2. Slow machine (compilation)
3. Large node_modules cache

**Solution**: Be patient - the first clean build after cache removal can take longer. Subsequent builds will be faster.

### Application Doesn't Work After Build

**Problem**: Build succeeds but application has errors

**Solution**: Check:
1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. Environment variables are correctly set
4. Strapi backend is running and accessible

## Deployment

### Automatic Deployment (CI/CD)

If you have automatic deployment configured (e.g., Coolify, GitHub Actions):

1. Push your changes to the repository:
   ```bash
   git push origin 002-fix-docker-build
   ```

2. Create a pull request to merge into `master`

3. The CI/CD pipeline will:
   - Run `yarn build`
   - Run tests (if configured)
   - Build Docker image
   - Deploy to production

4. Monitor the deployment logs to ensure success

### Manual Deployment

If deploying manually:

1. Build the Docker image:
   ```bash
   docker build -t aiportal-blog:latest .
   ```

2. Push to your registry (if applicable):
   ```bash
   docker tag aiportal-blog:latest registry.example.com/aiportal-blog:latest
   docker push registry.example.com/aiportal-blog:latest
   ```

3. Deploy to your server:
   ```bash
   docker pull registry.example.com/aiportal-blog:latest
   docker stop aiportal-blog
   docker rm aiportal-blog
   docker run -d --name aiportal-blog -p 8080:8080 registry.example.com/aiportal-blog:latest
   ```

## Rollback Plan

If something goes wrong after deployment:

1. Revert the commit:
   ```bash
   git revert HEAD
   git push origin master
   ```

2. Or restore the previous version:
   ```bash
   git checkout <previous-commit-hash>
   git push origin master --force
   ```

3. Redeploy the previous version

## Success Criteria

The fix is successful when:

- ✅ Docker build completes without errors
- ✅ Build process exit code is 0
- ✅ No prerender errors in build logs
- ✅ Application functions correctly in production
- ✅ All existing routes work as before
- ✅ No new issues are introduced

## Next Steps

After successful deployment:

1. **Consider adding validation** (optional):
   - Add a pre-commit hook to check for missing pages
   - Add a build-time script to validate route configuration
   - Document the process for adding/removing prerendered routes

2. **Monitor production**:
   - Check application logs for any new errors
   - Monitor build times
   - Verify user-facing functionality

3. **Update documentation** (if needed):
   - Update CLAUDE.md with lessons learned
   - Update any deployment documentation
   - Document the route configuration process

## Additional Resources

- [Nuxt 3 Route Rules Documentation](https://nuxt.com/docs/guide/concepts/rendering#route-rules)
- [Nuxt 3 Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

If you encounter issues not covered in this guide:

1. Check the main [spec.md](spec.md) for requirements and constraints
2. Review the [research.md](research.md) for technical details
3. Check the [plan.md](plan.md) for implementation approach
4. Consult the project constitution at `.specify/memory/constitution.md`
