# Research: Fix Docker Build Failure

**Feature**: Fix Docker Build Failure
**Date**: 2026-01-01
**Status**: Complete

## Problem Statement

Docker builds are failing during `yarn build` with exit code 1. The build appears to complete client and server bundling successfully but fails during the PWA service worker generation phase.

## Root Cause Analysis

### Identified Issue

**Primary Root Cause**: PWA Workbox Configuration Error

The build fails with the following error:
```
ERROR  Unable to generate service worker from template.
'When using networkTimeoutSeconds, you must set the handler to 'NetworkFirst'.'
```

### Technical Details

**Location**: [nuxt.config.js:117-129](../frontend/nuxt.config.js#L117-L129)

**Problematic Configuration**:
```javascript
{
  urlPattern: /^https:\/\/.*\.strapi\.io\/.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'strapi-api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400
    },
    cacheableResponse: {
      statuses: [0, 200]
    },
    networkTimeoutSeconds: 10  // ← THIS IS THE PROBLEM
  }
}
```

**Why This Fails**:
- Google Workbox (the library behind PWA service worker generation) enforces a strict rule: `networkTimeoutSeconds` can only be used with the `NetworkFirst` handler
- The current configuration uses `StaleWhileRevalidate` handler with `networkTimeoutSeconds`, which violates this constraint
- When the build process tries to generate the service worker, Workbox validates the configuration and throws an error

### Build Process Flow

1. ✅ Client build completes successfully (14s)
2. ✅ Server build completes successfully (26ms)
3. ❌ PWA service worker generation fails due to invalid configuration

### Impact

- **Docker builds**: Exit with error code 1, preventing deployment
- **Local builds**: Also fail with same error (reproducible locally)
- **Build artifacts**: Client and server bundles are generated, but service worker is not
- **Deployment**: Cannot deploy to production due to build failure

## Solution Alternatives

### Option 1: Remove networkTimeoutSeconds (RECOMMENDED)

**Approach**: Remove the `networkTimeoutSeconds` option from the Strapi API cache rule

**Rationale**:
- The `StaleWhileRevalidate` strategy already provides good performance for API calls
- It serves cached content immediately while updating the cache in the background
- Adding a timeout doesn't make sense for this strategy since it doesn't wait for the network first
- This is the simplest fix with no functional drawbacks

**Changes Required**:
- [nuxt.config.js:128](../frontend/nuxt.config.js#L128) - Remove `networkTimeoutSeconds: 10` line

**Pros**:
- Minimal change (single line removal)
- No impact on functionality
- `StaleWhileRevalidate` is actually better for API caching than `NetworkFirst`
- Build will succeed immediately

**Cons**:
- None identified

### Option 2: Change Handler to NetworkFirst

**Approach**: Change the handler from `'StaleWhileRevalidate'` to `'NetworkFirst'`

**Rationale**:
- Would allow keeping the `networkTimeoutSeconds` option
- `NetworkFirst` tries the network first, falls back to cache on timeout

**Changes Required**:
- [nuxt.config.js:118](../frontend/nuxt.config.js#L118) - Change `handler: 'StaleWhileRevalidate'` to `handler: 'NetworkFirst'`

**Pros**:
- Keeps the timeout configuration

**Cons**:
- Worse user experience for API calls (users wait for network before seeing cached data)
- Slower perceived performance compared to `StaleWhileRevalidate`
- Defeats the purpose of having a fast API cache

### Option 3: Remove Entire Strapi Cache Rule

**Approach**: Remove the entire Strapi API caching rule from PWA configuration

**Rationale**:
- The application may not need aggressive caching for Strapi API calls
- Simplifies PWA configuration

**Changes Required**:
- [nuxt.config.js:117-130](../frontend/nuxt.config.js#L117-L130) - Remove entire runtimeCaching entry for Strapi

**Pros**:
- Simpler configuration

**Cons**:
- Loses offline capability for Strapi API calls
- Slower performance when API is slow
- Not recommended for a PWA application

## Best Practices Research

### PWA Caching Strategies

**StaleWhileRevalidate** (Current choice for Strapi):
- ✅ Best for API calls and data that can be slightly stale
- ✅ Immediate response from cache
- ✅ Updates cache in background
- ✅ Great user experience
- ❌ Cannot use `networkTimeoutSeconds`

**NetworkFirst**:
- ✅ Good for frequently updated content
- ✅ Ensures fresh data
- ❌ Slower perceived performance (waits for network)
- ✅ Can use `networkTimeoutSeconds`

**CacheFirst**:
- ✅ Best for static assets (images, fonts, CSS, JS)
- ✅ Fastest performance
- ❌ Not suitable for dynamic API content

### Workbox Documentation Reference

From [Workbox Runtime Caching Guide](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_with_network_timeout):
> The `networkTimeoutSeconds` option is only available for the `NetworkFirst` strategy.

This is a hard requirement in Workbox, not a configurable option.

## Dependencies and Environment

### Nuxt and PWA Module Versions

From [package.json](../frontend/package.json):
- `"nuxt": "^3.2.0"` (Actual installed: 3.19.2)
- `"@vite-pwa/nuxt": "^1.1.0"`
- `"vite": "^7.1.5"` (Actual: 7.2.2)

### Environment Variables

Required build-time environment variables:
- `STRAPI_URL` - Backend API URL
- `NUXT_PUBLIC_YANDEX_METRIKA_ID` - Analytics ID

Note: The build error occurs regardless of whether these variables are set or not.

## Edge Cases and Validation

### Test Scenarios to Validate Fix

1. **Clean Docker build**:
   ```bash
   docker build --build-arg STRAPI_URL=<url> \
                --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=<id> \
                -t aiportal-frontend .
   ```
   Expected: Exit code 0, valid Docker image created

2. **Local build**:
   ```bash
   yarn build
   ```
   Expected: Completes without errors, generates `.output` directory

3. **Production image verification**:
   ```bash
   docker run -p 8080:8080 aiportal-frontend
   ```
   Expected: Application serves correctly on port 8080

4. **PWA functionality verification**:
   - Service worker registered correctly
   - Caching works for static assets
   - Strapi API calls use stale-while-revalidate strategy

### Potential Issues

**Memory Constraints**:
- Docker build may fail with OOM in memory-constrained environments
- Solution: Increase Docker memory limit to at least 2GB

**Missing Environment Variables**:
- Build will succeed but runtime may fail if STRAPI_URL is not set
- Solution: Make environment variables mandatory in Dockerfile

**Node Version Mismatches**:
- Dockerfile uses `node:20-slim`
- Local development may use different Node version
- Solution: Ensure local Node version matches Docker (v20)

## Recommended Implementation

**Chosen Solution**: Option 1 - Remove `networkTimeoutSeconds`

**Implementation Steps**:
1. Edit [nuxt.config.js:128](../frontend/nuxt.config.js#L128)
2. Remove the line `networkTimeoutSeconds: 10,`
3. Keep the `StaleWhileRevalidate` handler
4. Test local build: `yarn build`
5. Test Docker build
6. Verify PWA functionality

**Code Change**:
```diff
{
  urlPattern: /^https:\/\/.*\.strapi\.io\/.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'strapi-api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400
    },
    cacheableResponse: {
      statuses: [0, 200]
    },
-   networkTimeoutSeconds: 10
  }
}
```

## Additional Findings

### Warning During Build

```
WARN [baseline-browser-mapping] The data in this module is over two months old.
To ensure accurate Baseline data, please update: npm i baseline-browser-mapping@latest -D
```

**Impact**: Low - This is a warning, not an error
**Recommendation**: Update package (not blocking for this fix)
**Priority**: P3 (can be addressed in performance optimization story)

### Large Bundle Sizes

```
WARN (!) Some chunks are larger than 500 kB after minification.
```

**Impact**: Low - This is a warning, not an error
**Recommendation**: Consider code splitting for better performance
**Priority**: P3 (can be addressed in performance optimization story)

## References

- [Workbox Strategies Documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [Vite PWA Plugin Documentation](https://vite-plugin-pwa.netlify.app/)
- [Nuxt PWA Module Documentation](https://pwa.nuxtjs.org/)
- [Workbox build error issue reference](https://github.com/GoogleChrome/workbox/issues/2793)
