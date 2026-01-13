# Quickstart: Fix Card Click Interaction Delay

**Feature**: 001-fix-card-clicks
**Last Updated**: 2026-01-10

## Overview

This quickstart guide provides step-by-step instructions to fix the critical usability issue where cards are unclickable for 30-50 seconds after page load. The fix removes excessive lazy loading from critical interactive components while preserving performance optimizations for less critical features.

## Prerequisites

- Node.js 22 (or version specified in `.nvmrc`)
- Yarn package manager
- Git access to the repository
- Browser with DevTools (Chrome, Firefox, or Edge)

## Understanding the Fix

### Problem

Multi-level lazy loading cascade:
```
Page loads
  ↓ (wait for chunk)
PromptGrid loads
  ↓ (wait for chunk)
EnhancedPromptCard loads
  ↓
Click handlers finally work (30-50 seconds later!)
```

### Solution

Synchronous imports for cards:
```
Page loads
  ↓
PromptGrid & EnhancedPromptCard load immediately
  ↓
Click handlers work immediately! (< 1 second)
```

**Trade-off**: Slightly larger initial bundle size for immediate interactivity

## Implementation Steps

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Update Home Page (`pages/index.vue`)

Open `frontend/pages/index.vue` in your editor and locate the component imports (around lines 56-73).

**Before:**
```typescript
// Lazy load heavy components to reduce Total Blocking Time
const CategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/CategoriesFilter.vue')
)
const MobileCategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/MobileCategoriesFilter.vue')
)
const PromptSearch = defineAsyncComponent(() =>
  import('~/components/prompt/PromptSearch.vue')
)
const PromptGrid = defineAsyncComponent(() =>  // ❌ Remove lazy loading
  import('~/components/prompt/PromptGrid.vue')
)
```

**After:**
```typescript
// Lazy load non-critical components (filters, search)
const CategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/CategoriesFilter.vue')
)
const MobileCategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/MobileCategoriesFilter.vue')
)
const PromptSearch = defineAsyncComponent(() =>
  import('~/components/prompt/PromptSearch.vue')
)

// CRITICAL: Import PromptGrid synchronously for immediate interactivity
import PromptGrid from '~/components/prompt/PromptGrid.vue'  // ✅ Synchronous import
```

**Change**: Convert `defineAsyncComponent` wrapper to direct `import` statement for `PromptGrid` only.

### Step 3: Update PromptGrid Component

Open `frontend/components/prompt/PromptGrid.vue` in your editor and locate the EnhancedPromptCard import (around lines 37-44).

**Before:**
```typescript
import { defineAsyncComponent } from 'vue'

// Lazy load EnhancedPromptCard to reduce Total Blocking Time
const EnhancedPromptCard = defineAsyncComponent(() =>  // ❌ Remove lazy loading
  import('./EnhancedPromptCard.vue')
)
```

**After:**
```typescript
// CRITICAL: Import EnhancedPromptCard synchronously for immediate interactivity
import EnhancedPromptCard from './EnhancedPromptCard.vue'  // ✅ Synchronous import
```

**Change**: Remove `defineAsyncComponent` wrapper and import `EnhancedPromptCard` directly.

### Step 4: Clean Build Cache

```bash
rm -rf .nuxt
```

This removes the Nuxt build cache to ensure a clean build with the updated imports.

### Step 5: Build and Test Locally

```bash
yarn build
yarn preview
```

**Expected Results:**
1. Build completes successfully (exit code 0)
2. Preview server starts on http://localhost:8080
3. Navigate to http://localhost:8080/
4. **Immediately** after page loads, click on any card
5. **Expected**: Card click works within 1 second, navigation happens
6. **Expected**: No 30-50 second delay before click works

### Step 6: Verify with Browser DevTools

#### Network Tab Check

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Refresh the page (Cmd+R or F5)
4. Filter by "JS" or "Doc"
5. **Verify**:
   - Main JavaScript bundle loads
   - No additional lazy chunks for PromptGrid or EnhancedPromptCard
   - All card-related code is in the initial bundle

#### Performance Tab Check

1. Go to **Performance** tab
2. Click **Record** (circle icon)
3. Refresh the page
4. Wait for page to load completely
5. Click **Stop** recording
6. **Verify**:
   - Time to Interactive (TTI) < 3 seconds
   - First Input Delay (FID) < 100ms
   - Total Blocking Time (TBT) < 300ms (mobile) or < 200ms (desktop)
   - No long tasks (>50ms) blocking the main thread after initial load

#### Manual Click Test

1. Refresh the page
2. **Immediately** (within 1 second) try clicking on different cards
3. **Verify**: Each click responds immediately and navigation works

### Step 7: Run Lighthouse Test (Optional but Recommended)

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Performance** checkbox
4. Click **Analyze page load**
5. **Verify**:
   - Performance score is still acceptable (target: >80)
   - FCP < 1.8s
   - LCP < 2.5s
   - TBT < 300ms (mobile) or < 200ms (desktop)
   - FID < 100ms

**Note**: Bundle size increase may slightly affect TBT, but immediate interactivity is worth the trade-off.

### Step 8: Test Cross-Browser (Optional)

Test in multiple browsers to verify fix works consistently:

- **Chrome**: Primary browser, should work perfectly
- **Firefox**: Verify no hydration issues
- **Safari**: Test on macOS or iOS
- **Edge**: Chromium-based, should match Chrome

### Step 9: Commit Changes

```bash
git add frontend/pages/index.vue frontend/components/prompt/PromptGrid.vue
git commit -m "fix: remove lazy loading from card components for immediate interactivity

Cards were unclickable for 30-50 seconds after page load due to multi-level
lazy loading cascade (PromptGrid → EnhancedPromptCard).

Changes:
- Import PromptGrid synchronously in pages/index.vue
- Import EnhancedPromptCard synchronously in PromptGrid.vue
- Preserve lazy loading for non-critical components (filters, search)

Root cause:
- defineAsyncComponent creates async chunk loading
- Multi-level lazy loading causes sequential waterfall
- Click handlers not attached until all chunks loaded

Trade-off:
- Slightly larger initial bundle size
- Preserves immediate interactivity (user experience priority)

Fixes #001-fix-card-clicks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Verification Checklist

Before deploying, verify:

- [ ] `yarn build` completes with exit code 0
- [ ] Cards are clickable within 1 second of page load
- [ ] Click-to-response time is under 100ms
- [ ] No 30-50 second delay before interactivity
- [ ] Navigation works correctly when clicking cards
- [ ] Network tab shows no lazy chunks for PromptGrid/EnhancedPromptCard
- [ ] Performance tab shows TTI < 3 seconds
- [ ] Lighthouse score is acceptable (>80)
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari)
- [ ] Changes committed to git

## Troubleshooting

### Cards Still Not Clickable Immediately

**Problem**: Fix applied but cards still take time to become clickable

**Solutions**:
1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear Nuxt cache**: Run `rm -rf .nuxt && yarn build`
3. **Check for other lazy components**: Search for other `defineAsyncComponent` usages
4. **Verify imports**: Check that imports are synchronous, not async
5. **Check console for errors**: Open DevTools Console tab for errors

### Build Fails with Import Errors

**Problem**: Build fails with "Cannot find module" or similar errors

**Solutions**:
1. **Verify file paths**: Check that import paths are correct
2. **Check for typos**: Ensure component names match exactly
3. **Run yarn install**: Ensure all dependencies are installed
4. **Check TypeScript errors**: Fix any type errors in components

### PageSpeed Metrics Degraded Significantly

**Problem**: Lighthouse score dropped significantly after fix

**Solutions**:
1. **Measure bundle size**: Check if bundle increased dramatically
2. **Analyze chunks**: Use `yarn build --analyze` (if available) to see bundle composition
3. **Consider selective lazy loading**: Lazy load only heaviest card variants
4. **Code splitting**: Move heavy dependencies (e.g., Mermaid) to separate chunks
5. **Accept trade-off**: If score is still >80, immediate interactivity may be worth slight degradation

### Filters/Search Still Slow

**Expected behavior**: Filters and search may still have slight delay (1-2 seconds)

**Why this is OK**:
- Filters and search are less critical than card clicks
- They're still lazy-loaded to preserve optimization benefits
- Users typically don't need filters immediately upon page load
- This is the intended trade-off: immediate card clicks, deferred filters

## Deployment

### Automatic Deployment (CI/CD)

If you have automatic deployment configured:

1. Push your changes to the repository:
   ```bash
   git push origin 001-fix-card-clicks
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

1. **Revert the commit**:
   ```bash
   git revert HEAD
   git push origin master
   ```

2. **Or restore the previous version**:
   ```bash
   git checkout <previous-commit-hash>
   git push origin master --force
   ```

3. **Redeploy the previous version**

4. **Verify the old behavior is restored** (with the click delay issue)

## Success Criteria

The fix is successful when:

- ✅ Cards are clickable within 1 second of page load
- ✅ Click-to-response time is under 100ms
- ✅ No 30-50 second delay before interactivity
- ✅ Users can immediately interact with the page
- ✅ PageSpeed metrics are still acceptable (>80 score)
- ✅ No new errors in browser console
- ✅ Navigation works correctly on all pages with cards

## Post-Deployment Monitoring

After deploying to production:

1. **Monitor user feedback**: Check for any new complaints about click delays
2. **Monitor analytics**: Look for improvements in bounce rate and time on page
3. **Monitor PageSpeed**: Run periodic Lighthouse tests to ensure metrics stay acceptable
4. **Monitor bundle size**: Track initial bundle size over time
5. **Monitor errors**: Check browser console logs and error tracking (e.g., Sentry)

## Next Steps

After successful deployment:

1. **Consider further optimization** (optional):
   - Analyze bundle composition with `yarn build --analyze`
   - Identify heavy dependencies that could be code-split
   - Consider lazy loading heavy card variants (if any)
   - Implement prefetch hints for critical routes

2. **Document lessons learned** (optional):
   - Update CLAUDE.md with insights on lazy loading best practices
   - Document the trade-off between bundle size and interactivity
   - Add guidelines for when to use `defineAsyncComponent`

3. **Monitor for similar issues**:
   - Be cautious when introducing lazy loading in critical user paths
   - Test for waterfall loading patterns
   - Prioritize immediate interactivity for primary UI elements

## Additional Resources

- [Vue 3 Async Components Guide](https://vuejs.org/guide/components/async.html)
- [Web.dev - Optimize Initial Page Load](https://web.dev/fast/)
- [Chrome DevTools - Performance Reference](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)

## Support

If you encounter issues not covered in this guide:

1. Check the main [spec.md](spec.md) for requirements and constraints
2. Review the [research.md](research.md) for technical details and root cause analysis
3. Check the [plan.md](plan.md) for implementation approach and constitution check
4. Consult the project constitution at `.specify/memory/constitution.md`
