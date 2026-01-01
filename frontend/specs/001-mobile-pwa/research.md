# Research: Mobile PWA Implementation

**Feature**: 001-mobile-pwa
**Date**: 2026-01-01
**Status**: Complete

## Executive Summary

This document consolidates research findings for implementing Progressive Web App (PWA) features and mobile-responsive layouts for the AI Portal frontend. All technical unknowns from the planning phase have been resolved through comprehensive research into:

1. PWA implementation with Nuxt 4 + SPA mode
2. Vuetify 3 + Tailwind CSS responsive patterns
3. Mobile testing strategies and tools

---

## 1. PWA Implementation for Nuxt 4 SPA

### Decision: Use `@vite-pwa/nuxt` Module

**Module**: @vite-pwa/nuxt (latest version)
**Compatibility**: Nuxt 3.9.0+ with ongoing Nuxt 4 support updates
**Status**: Recommended with caveats

### Rationale

- Most actively maintained PWA module for Nuxt ecosystem
- Built on vite-plugin-pwa (established, reliable)
- Supports SPA mode (`ssr: false`)
- Automatic service worker generation
- Workbox integration for advanced caching strategies

### Known Issues & Workarounds

**Issue**: Nuxt 4 compatibility reported in [GitHub Issue #176](https://github.com/vite-pwa/nuxt/issues/176)

**Workaround**: Disable PWA in development mode:
```typescript
// nuxt.config.ts
pwa: {
  disable: process.env.NODE_ENV === 'development'
}
```

### Service Worker Caching Strategy

**Recommended Strategy**: Resource-type-based caching

| Resource Type | Strategy | Rationale |
|--------------|----------|-----------|
| App Shell (JS/CSS/HTML) | Cache First | Static assets, rarely change |
| API Calls (Strapi) | Stale-While-Revalidate | Instant load + fresh data |
| Images/Fonts | Cache First | Static resources, long expiration |
| Dynamic Content | Network First | Ensure fresh data with offline fallback |

**Configuration Example**:
```typescript
// nuxt.config.ts
pwa: {
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2}'],
    navigateFallback: '/',
    navigateFallbackDenylist: [/^\/api/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/strapi-backend\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'strapi-api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
          }
        }
      }
    ]
  }
}
```

### PWA Manifest Configuration

**Cross-Platform Support**:
- Android Chrome: Full PWA manifest support, automatic install prompts
- iOS Safari: Limited support, manual installation required, uses meta tags instead

**Required Icons**:
- Standard sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Maskable icons: 192x192, 512x512 (for adaptive Android icons)
- Apple touch icon: 180x180

**iOS-Specific Meta Tags**:
```html
<head>
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="AI Portal">
  <meta name="theme-color" content="#ff1493">
</head>
```

### Key Configuration Decisions

1. **Display Mode**: `standalone` (full-screen, no browser chrome)
2. **Orientation**: `portrait` (primary mobile use case)
3. **Theme Color**: `#ff1493` (pink from iridescent theme)
4. **Background Color**: `#ffffff` (white background)
5. **Scope**: `/` (entire application)
6. **Start URL**: `/` (root route)

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| @vite-pwa/nuxt | Active development, Nuxt-focused, Workbox integration | Nuxt 4 compatibility issues | **CHOSEN** - Best overall option |
| @nuxtjs/pwa | Stable, older module (190K downloads) | Less active, may not support Nuxt 4 | Rejected - Legacy |
| Custom service worker | Full control, no dependencies | Manual maintenance, more complex | Rejected - Unnecessary complexity |

---

## 2. Vuetify 3 + Tailwind CSS Responsive Patterns

### Decision: Leverage Both Frameworks Strategically

**Approach**: Vuetify for components, Tailwind for layout

### Vuetify 3 Breakpoint System

**Official Breakpoints**:
- `xs`: < 600px (extra small phones, 320px-599px)
- `sm`: 600px - 960px (small tablets, large phones)
- `md`: 960px - 1280px (tablets, small desktops)
- `lg`: 1280px - 1920px (desktops)
- `xl`: 1920px - 2560px (large desktops)
- `xxl`: > 2560px (4K monitors)

**Usage with Composition API**:
```vue
<script setup>
import { useDisplay } from 'vuetify'

const { mobile, sm, md, lg, xl, name, width } = useDisplay()

// Reactive breakpoint states
const isMobile = mobile.value  // true for screens < 600px
</script>
```

### Mobile Navigation Implementation

**Recommended Pattern**: Hamburger menu with temporary drawer (mobile) + permanent rail (desktop)

```vue
<template>
  <v-app-bar>
    <!-- Hamburger icon (mobile only) -->
    <v-app-bar-nav-icon
      v-if="mobile"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>

    <!-- Desktop navigation (hidden on mobile) -->
    <template v-if="!mobile">
      <v-btn v-for="item in navItems" :key="item.to" :to="item.to">
        {{ item.text }}
      </v-btn>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    :temporary="mobile"
    :permanent="!mobile"
  >
    <!-- Navigation items -->
  </v-navigation-drawer>
</template>
```

### Touch Target Guidelines

**Requirements**:
- Android Material Design: 48 x 48dp minimum
- iOS Human Interface: 44 x 44 points minimum
- WCAG 2.1 Level AAA: 44 x 44 CSS pixels

**Vuetify 3 Button Sizes**:
- `size="small"`: 36px height (insufficient for mobile)
- `size="default"`: 40px height (insufficient for mobile)
- `size="large"`: 48px height (✅ recommended for mobile)
- `size="x-large"`: 56px height (✅ excellent for touch)

**Best Practice**: Use `size="large"` for all mobile buttons, or set global defaults:
```javascript
// plugins/vuetify.js
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    defaults: {
      VBtn: {
        size: 'large',  // Ensure 48px touch targets
      },
    },
  });
});
```

### Responsive Data Grids on Mobile

**Three Approaches**:

1. **Card Stacking** (Recommended for our platform):
   - Desktop: Table view
   - Mobile: Vertical card layout
   - Already using card-based design → natural fit

2. **Vuetify Data Table Mobile Mode** (Vuetify 3.6.0+):
   ```vue
   <v-data-table
     :mobile="mobile"  <!-- Built-in mobile mode -->
   ></v-data-table>
   ```

3. **Horizontal Scroll** (Simple tables only):
   - Preserve full table width
   - Allow horizontal scroll on mobile
   - Use for complex data that can't be stacked

### Combining Vuetify + Tailwind

**Current Approach (Already Optimal)**:
```vue
<template>
  <!-- Tailwind for layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Vuetify components inside -->
    <v-card v-for="item in items" :key="item.id">
      <v-card-title>{{ item.title }}</v-card-title>
      <v-card-text class="text-gray-400">
        {{ item.description }}
      </v-card-text>
    </v-card>
  </div>
</template>
```

**Key Principles**:
- Use Tailwind for layout containers (grid, spacing, responsive classes)
- Use Vuetify for interactive components (forms, dialogs, navigation)
- Apply Tailwind utility classes to Vuetify components (e.g., `class="text-gray-400"`)
- Maintain iridescent gradient theme across viewports

### Dialogs and Forms on Small Screens

**Full-Screen Dialogs**:
```vue
<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="mobile"  <!-- Full-screen on mobile -->
    :scrolled="mobile ? 'body' : false"
  >
    <v-card>
      <v-toolbar :color="mobile ? 'primary' : 'surface'">
        <v-btn v-if="mobile" icon="mdi-close" @click="dialog = false"></v-btn>
      </v-toolbar>

      <v-card-text>
        <v-form>
          <!-- Stack fields vertically on mobile -->
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field label="Field"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
```

**Form Best Practices**:
- Use `density="comfortable"` for larger touch targets
- Stack form fields vertically on mobile (`cols="12"`)
- Use `block` prop on buttons for full-width touch targets
- Ensure input font-size ≥ 16px to prevent iOS auto-zoom

### Responsive Typography Scale

**Mobile-First Approach**:
- Mobile baseline: 16px (1rem) body text
- Tablet: 18px body text
- Desktop: 20px body text
- Headlines scale proportionally

**Tailwind Configuration**:
```javascript
// tailwind.config.js
theme: {
  extend: {
    fontSize: {
      'mobile-h1': ['2rem', { lineHeight: '2.5rem' }],  // 32px
      'mobile-h2': ['1.5rem', { lineHeight: '2rem' }],  // 24px
      'mobile-h3': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    },
  },
}
```

---

## 3. Mobile Testing Strategy

### Decision: Multi-Layered Testing Approach

**Stack**:
1. **Vitest Browser Mode** (v4.0+) for component testing
2. **Playwright** for E2E responsive testing
3. **Lighthouse CI** for PWA validation
4. **Playwright screenshots** for visual regression
5. **Manual testing** on real devices (final validation)

### Automated Responsive Testing with Playwright

**Viewport Testing Matrix**:
- iPhone SE: 375x667 (standard mobile)
- iPhone 12 Pro: 390x844 (larger mobile)
- iPad: 768x1024 (tablet)
- Desktop: 1280x720, 1920x1080

**Test Example**:
```typescript
// tests/responsive/layout.spec.ts
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667, isMobile: true },
  { name: 'iPad', width: 768, height: 1024, isMobile: true },
  { name: 'Desktop', width: 1280, height: 720, isMobile: false },
];

for (const viewport of VIEWPORTS) {
  test(`responsive layout - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBe(clientWidth);

    // Verify touch targets
    const buttons = page.locator('button, a, input');
    for (const btn of await buttons.all()) {
      const box = await btn.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
}
```

### PWA Feature Testing

**Service Worker Registration**:
```typescript
test('service worker registers', async ({ page }) => {
  await page.goto('/');

  const swRegistered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration !== undefined;
  });

  expect(swRegistered).toBe(true);
});
```

**Offline Mode**:
```typescript
test('offline mode caches content', async ({ page, context }) => {
  // First visit to cache assets
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Simulate offline
  await context.setOffline(true);
  await page.goto('/');

  // Verify page loads from cache
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();

  await context.setOffline(false);
});
```

### Visual Regression Testing

**Free Approach**: Playwright native screenshots
```typescript
const VIEWPORTS = [
  { width: 320, height: 568, name: 'mobile-320' },
  { width: 375, height: 667, name: 'mobile-375' },
  { width: 768, height: 1024, name: 'tablet-768' },
  { width: 1280, height: 720, name: 'desktop-1280' },
];

for (const viewport of VIEWPORTS) {
  test(`visual regression - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`prompts-${viewport.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });
}
```

**Paid Alternative**: Percy by BrowserStack
- AI-powered visual difference detection
- Automatic multi-viewport testing
- Seamless CI/CD integration
- $453/year (free for open source)

### Lighthouse CI Integration

**GitHub Actions Workflow**:
```yaml
# .github/workflows/pwa.yml
name: PWA Tests

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:8080
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**Budget Configuration**:
```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        { "metric": "first-contentful-paint", "budget": 2000 },
        { "metric": "interactive", "budget": 5000 }
      ]
    }
  ]
}
```

### Manual Testing Checklist

**iOS Safari Testing**:
- [ ] Verify HTTPS is working
- [ ] Check page loads < 3s on 4G
- [ ] Test on iPhone SE (320px), iPhone 13 (390px), iPad (768px)
- [ ] Verify no console errors
- [ ] Test touch targets are ≥ 44x44px
- [ ] Install from Share menu → "Add to Home Screen"
- [ ] Test offline mode (airplane mode)
- [ ] Verify keyboard doesn't hide input fields
- [ ] Test pinch-to-zoom, back/forward navigation

**Android Chrome Testing**:
- [ ] Lighthouse PWA score > 90
- [ ] Check manifest validation (Chrome DevTools)
- [ ] Test on Chrome for Android, Samsung Internet
- [ ] Verify install icon appears in address bar
- [ ] Install to home screen
- [ ] Test splash screen, theme color
- [ ] Verify full-screen standalone mode

**Cross-Platform Testing**:
- [ ] Test at 320px, 375px, 414px, 768px widths
- [ ] Verify no horizontal scroll at any viewport
- [ ] Test landscape/portrait orientations
- [ ] Check layout breakpoints trigger correctly
- [ ] Verify font sizes scale appropriately
- [ ] Test smooth scrolling performance

### Tool Comparison Summary

| Tool | Cost | Use Case | Complexity |
|------|------|----------|------------|
| **Vitest Browser Mode** | Free | Component unit tests | Medium |
| **Playwright** | Free | E2E, responsive, PWA | Medium |
| **Percy** | Paid ($453/yr) | Visual regression | Low |
| **Lighthouse CI** | Free | PWA validation | Low |
| **BrowserStack** | Paid ($199/mo) | Real device testing | Medium |

### Recommended Testing Stack

**Phase 1** (Foundation):
- Vitest for component testing
- Playwright for E2E responsive testing
- Lighthouse CI for PWA validation

**Phase 2** (Visual Regression):
- Start with Playwright native screenshots (free)
- Add Percy if budget allows (better UX, AI diff detection)

**Phase 3** (Real Device Testing):
- Use BrowserStack for one month before major releases
- Maintain internal device lab (iPhone SE, iPad, Android phone)

---

## 4. Key Implementation Decisions

### 4.1 Breakpoint Strategy

**Decision**: Use Vuetify 3's default breakpoints with Tailwind's responsive utilities

**Rationale**:
- Vuetify breakpoints align with Material Design standards
- Tailwind breakpoints (`sm:`, `md:`, `lg:`) complement Vuetify
- No need for custom breakpoint configuration
- Mobile-first: design for 320px baseline, enhance for larger viewports

### 4.2 Navigation Pattern

**Decision**: Hamburger menu with temporary drawer (mobile) + permanent sidebar (desktop)

**Rationale**:
- Follows platform conventions (iOS/Android apps use drawers)
- Vuetify's `v-navigation-drawer` handles mobile/desktop automatically
- Temporary drawer on mobile doesn't consume screen space
- Permanent sidebar on desktop provides consistent navigation

### 4.3 Touch Target Standards

**Decision**: Minimum 48x48px touch targets (WCAG AAA / Material Design)

**Implementation**:
- Vuetify buttons: Use `size="large"` (48px height)
- Custom buttons: Add `min-w-[44px] min-h-[44px]` Tailwind classes
- Interactive elements: Ensure 8px padding minimum

### 4.4 PWA Install Strategy

**Decision**: Support both automatic (Android) and manual (iOS) installation flows

**Implementation**:
- Android: Leverage `beforeinstallprompt` event for custom UI
- iOS: Create modal with "Add to Home Screen" instructions
- Cross-platform: Provide "Install App" button in settings

### 4.5 Offline Strategy

**Decision**: Cache-first for app shell, stale-while-revalidate for API data

**Rationale**:
- App shell (JS/CSS) rarely changes → cache for instant loads
- API data changes frequently → serve stale cache, revalidate in background
- Images/static assets → cache with long expiration
- Offline fallbacks for network-dependent features

---

## 5. Risk Mitigation

### 5.1 Nuxt 4 Compatibility Issues

**Risk**: @vite-pwa/nuxt may have compatibility issues with Nuxt 4

**Mitigation**:
- Monitor GitHub repository for updates
- Disable PWA in development to avoid hydration errors
- Have fallback plan: custom service worker implementation
- Test thoroughly in Nuxt 4 environment early in implementation

### 5.2 iOS PWA Limitations

**Risk**: iOS Safari has limited PWA support compared to Android

**Mitigation**:
- Document iOS-specific limitations in user guide
- Provide clear installation instructions for iOS users
- Test on multiple iOS versions (12+, 13+, 14+, 15+)
- Focus on core PWA features that work on both platforms
- Avoid relying on features unsupported on iOS (push notifications, background sync)

### 5.3 Cross-Browser Testing Coverage

**Risk**: Testing across many device/OS combinations is resource-intensive

**Mitigation**:
- Prioritize testing based on user analytics (most common devices)
- Use automated testing for viewports (Playwright)
- Use BrowserStack for comprehensive testing before releases
- Maintain internal device lab for quick smoke tests
- Focus on iOS Safari + Chrome for Android (90%+ coverage)

### 5.4 Performance on Low-End Devices

**Risk**: PWA features may impact performance on older mobile devices

**Mitigation**:
- Set performance budgets in Lighthouse CI
- Use lazy loading for heavy components
- Optimize images (WebP format, responsive sizes)
- Minimize JavaScript bundle size
- Test on 3G network conditions during development
- Monitor Core Web Vitals in production

---

## 6. Alternatives Considered

### 6.1 PWA Module Options

| Option | Status | Reason for Rejection |
|--------|--------|---------------------|
| **@vite-pwa/nuxt** | ✅ CHOSEN | Best overall option for Nuxt 4 |
| @nuxtjs/pwa | ❌ Rejected | Legacy module, less active development |
| Custom service worker | ❌ Rejected | Unnecessary complexity, harder to maintain |
| No PWA features | ❌ Rejected | Feature requirement (US3) |

### 6.2 Mobile Navigation Patterns

| Pattern | Status | Reason for Rejection |
|---------|--------|---------------------|
| **Hamburger + Drawer** | ✅ CHOSEN | Platform-standard, Vuetify-native |
| Bottom tab bar | ❌ Rejected | Less suitable for content-heavy app |
| Top tab bar | ❌ Rejected | Insufficient space for all sections |
| Full-screen sidebar | ❌ Rejected | Consumes too much screen on mobile |

### 6.3 Testing Approaches

| Approach | Status | Reason for Rejection |
|----------|--------|---------------------|
| **Vitest + Playwright** | ✅ CHOSEN | Free, covers 90% of needs |
| Cypress E2E | ❌ Rejected | More expensive, slower than Playwright |
| Testing Library only | ❌ Rejected | Insufficient for responsive/E2E testing |
| Manual testing only | ❌ Rejected | Not scalable, error-prone |

---

## 7. Implementation Dependencies

### Required Packages

```json
{
  "dependencies": {
    "@vite-pwa/nuxt": "latest"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@playwright/test": "^1.40.0",
    "@vitest/ui": "^2.0.0",
    "@vue/test-utils": "^2.4.0"
  }
}
```

### Icon Generation

**Tool**: [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator)

**Command**:
```bash
pwa-asset-generator source-logo.png icons/ --background "#ffffff" --padding "20%"
```

**Required Output Sizes**:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- icon-maskable-192x192.png
- icon-maskable-512x512.png
- apple-touch-icon-180x180.png

---

## 8. Success Criteria Alignment

### Performance Targets

| Metric | Target | Testing Method |
|--------|--------|----------------|
| Page load (4G) | <3s (90th percentile) | Lighthouse CI |
| First Contentful Paint | <2s | Lighthouse CI |
| Time to Interactive | <5s | Lighthouse CI |
| Lighthouse Performance | >90 | Lighthouse CI |
| Lighthouse PWA | >90 | Lighthouse CI |
| Horizontal scrolling | Zero incidents | Playwright viewport tests |

### Usability Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Touch target compliance | 100% ≥ 44x44px | Playwright automated tests |
| Task completion rate | >95% on mobile | User testing (post-launch) |
| Mobile satisfaction | >4.0/5.0 | User surveys (post-launch) |

### Quality Assurance

| Metric | Target | Testing Method |
|--------|--------|----------------|
| Critical mobile bugs | Zero in first month | Real device testing |
| PWA install rate | >30% within 3 months | Analytics tracking |
| Mobile engagement | Within 15% of desktop | Analytics tracking |

---

## 9. Sources

### PWA Implementation
- [@vite-pwa/nuxt · Nuxt Modules](https://nuxt.com/modules/vite-pwa-nuxt)
- [Nuxt 4 - Turn Your App into a PWA with @vite-pwa/nuxt](https://marcusn.dev/articles/2024-12/nuxt-4-pwa)
- [Web app manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Making PWAs installable - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [5 Service Worker Caching Strategies for Your Next PWA App](https://blog.bitsrc.io/5-service-worker-caching-strategies-for-your-next-pwa-app-58539f156f52)

### Vuetify 3 + Tailwind
- [Vuetify Display & Platform Documentation](https://vuetifyjs.com/en/features/display-and-platform/)
- [Vuetify Navigation Drawer Documentation](https://vuetifyjs.com/en/components/navigation-drawers/)
- [Vuetify App Bar Documentation](https://vuetifyjs.com/en/components/app-bars/)
- [Material Design Touch Target Spec](https://m2.material.io/develop/web/supporting/touch-target)
- [Tailwind CSS Responsive Design Documentation](https://tailwindcss.com/docs/responsive-design)

### Testing & Validation
- [Playwright Emulation Documentation](https://playwright.dev/docs/emulation)
- [Vitest Browser Mode Guide](https://vitest.dev/guide/browser/)
- [How to Test PWA](https://medium.com/effective-developers/how-to-test-pwa-daa1a6eaf7bf)
- [Progressive Web Apps Technical & Security Checklist](https://synodus.com/blog/web-development/progressive-web-apps-checklist/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

### Best Practices
- [Best practices for PWAs - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)
- [PWA on iOS - Current Status & Limitations 2025](https://brainhub.eu/library/pwa-on-ios)
- [Build a Blazing-Fast, Offline-First PWA with Vue 3 and Vite 2025](https://medium.com/@Christopher_Tseng/build-a-blazing-fast-offline-first-pwa-with-vue-3-and-vite-in-2025-the-definitive-guide-5b4969bc7f96)

---

## 10. Next Steps

With research complete, proceed to **Phase 1: Design Artifacts**:

1. **[data-model.md](data-model.md)**: No new data models (presentation layer)
2. **[contracts/](contracts/)**: Generate PWA manifest and service worker configuration
3. **[quickstart.md](quickstart.md)**: Create mobile development setup guide

All technical unknowns have been resolved. Ready for implementation planning.
