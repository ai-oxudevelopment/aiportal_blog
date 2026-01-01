# Quickstart: Mobile PWA Development

**Feature**: 001-mobile-pwa
**Date**: 2026-01-01
**Purpose**: Setup guide for mobile-responsive development and PWA testing

---

## 1. Development Environment Setup

### Prerequisites

- **Node.js**: v20.x or higher
- **Yarn**: 1.22.x or higher (zero-installs)
- **Git**: Latest version
- **Mobile Devices** (for testing): iOS device + Android device recommended

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (uses Yarn zero-installs)
yarn install

# Start development server
yarn dev

# Application will be available at http://localhost:8080
```

### Environment Variables

Create `.env` file (see `.env.example`):

```bash
# Backend Strapi CMS URL
STRAPI_URL=http://localhost:1337

# Application port (default: 8080)
PORT=8080

# Yandex Metrika analytics ID
NUXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id
```

---

## 2. Mobile Development Workflow

### Option A: Browser DevTools Emulation (Recommended for Development)

**Chrome DevTools**:
1. Open Chrome browser
2. Navigate to `http://localhost:8080`
3. Press `F12` (or Cmd+Option+I on Mac)
4. Click device toolbar icon (or press `Cmd+Shift+M`)
5. Select device: iPhone SE, iPhone 12 Pro, iPad, etc.
6. Test responsive layouts at different viewports

**Firefox Responsive Design Mode**:
1. Open Firefox browser
2. Press `F12` (or Cmd+Option+I on Mac)
3. Click responsive design mode icon (or press `Cmd+Shift+M`)
4. Select device from dropdown or enter custom viewport

**Key Viewports to Test**:
- 320px (iPhone SE, minimum target)
- 375px (iPhone 12/13 standard)
- 414px (iPhone 14 Pro Max)
- 768px (iPad portrait)
- 1024px+ (desktop)

### Option B: Real Device Testing (Recommended for Validation)

**Android Device**:
1. Connect Android device via USB
2. Enable USB debugging in Developer Options
3. Open Chrome on desktop
4. Navigate to `chrome://inspect`
5. Find your device under "Remote Target"
6. Click "inspect" to open DevTools for your device
7. Navigate to `http://[your-computer-ip]:8080` on device

**iOS Device**:
1. Connect iOS device via USB
2. Enable Web Inspector on device (Settings → Safari → Advanced)
3. On Mac, open Safari → Preferences → Advanced → "Show Develop menu"
4. In Safari menu, find your device under "Develop"
5. Select the webpage you want to inspect

**Network Access for Real Devices**:
```bash
# Find your computer's local IP address
# macOS
ipconfig getifaddr en0

# Linux
ip addr show | grep inet

# Windows
ipconfig

# On mobile device, navigate to:
# http://[your-ip]:8080
```

---

## 3. PWA Development Setup

### Installing Dependencies

```bash
# Install @vite-pwa/nuxt module
yarn add -D @vite-pwa/nuxt

# Install testing dependencies
yarn add -D vitest @vitest/ui @vue/test-utils @playwright/test
```

### Configure Nuxt for PWA

Add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt',
    // ... other modules
  ],

  pwa: {
    // Disable in development to avoid hydration issues
    disable: process.env.NODE_ENV === 'development',

    // Service worker configuration
    registerType: 'autoUpdate',

    workbox: {
      globPatterns: ['**/*.{js,css,html,woff2}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],

      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.strapi\.io\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'strapi-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 86400,
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
          },
        },
      ],
    },

    manifest: {
      name: 'AI Portal - Библиотека AI-инструментов',
      short_name: 'AI Portal',
      description: 'Библиотека промптов и AI-инструментов',
      theme_color: '#ff1493',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  },
})
```

### Add iOS-Specific Meta Tags

Add to `app.vue` or layout:

```vue
<template>
  <div>
    <Head>
      <!-- iOS Safari PWA meta tags -->
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="AI Portal" />

      <!-- Android Chrome PWA meta tags -->
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="AI Portal" />

      <!-- Theme color -->
      <meta name="theme-color" content="#ff1493" />
    </Head>

    <NuxtPage />
  </div>
</template>
```

---

## 4. PWA Icon Generation

### Generate Icons from Source Image

**Prerequisites**:
- Source logo: 1024x1024px PNG with transparent background
- Node.js installed

```bash
# Install icon generator
yarn add -D pwa-asset-generator

# Generate all required icons
pwa-asset-generator public/logo.png public/icons/ \
  --background "#ffffff" \
  --padding "20%" \
  --manifest manifest.json \
  --index index.html
```

**Required Output**:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-maskable-192x192.png`
- `icon-maskable-512x512.png`
- `apple-touch-icon-180x180.png`

**Alternative Tools**:
- [LogoFoundry PWA Icon Generator](https://logofoundry.app/tools/pwa-icon-generator) (web-based)
- [RealFaviconGenerator](https://realfavicongenerator.net/) (web-based)

---

## 5. Testing PWA Features

### Manual Testing Checklist

**Chrome DevTools (Desktop)**:
1. Open DevTools (`F12`)
2. Navigate to "Application" tab
3. Verify:
   - **Manifest**: Valid JSON, all icons present
   - **Service Workers**: Registered and active
   - **Cache Storage**: Contains cached assets
   - **Lighthouse**: Run PWA audit (score > 90)

**Install PWA on Android**:
1. Open Chrome for Android
2. Navigate to your app URL
3. Wait for install icon to appear in address bar
4. Tap install icon → "Add to Home Screen"
5. Verify:
   - App icon appears on home screen
   - Launches in full-screen mode (no browser chrome)
   - Splash screen displays
   - Theme color matches manifest

**Install PWA on iOS**:
1. Open Safari on iOS device
2. Navigate to your app URL
3. Tap Share button
4. Scroll down → "Add to Home Screen"
5. Tap "Add"
6. Verify:
   - App icon appears on home screen
   - Launches in full-screen mode
   - Name and icon match manifest

**Test Offline Mode**:
1. Open app while online
2. Navigate to several pages (to cache content)
3. Enable airplane mode (disconnect from network)
4. Try to:
   - Reload previously visited pages (should load from cache)
   - Navigate to new pages (should show offline message)
5. Disable airplane mode
6. Verify app reconnects and updates content

---

## 6. Testing Responsive Layouts

### Playwright Viewport Testing

Create `tests/responsive.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 720 },
]

for (const viewport of VIEWPORTS) {
  test(`responsive layout - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBe(clientWidth)

    // Verify key components visible
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })
}
```

Run tests:
```bash
# Run Playwright tests
yarn test:e2e

# Run with UI mode
yarn test:e2e:ui
```

### Visual Regression Testing

```typescript
import { test, expect } from '@playwright/test'

test('visual regression - mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveScreenshot('prompts-mobile-375.png', {
    fullPage: true,
  })
})
```

---

## 7. Debugging Mobile Issues

### Common Issues and Solutions

**Issue**: Horizontal scroll on mobile
- **Cause**: Element width exceeds viewport
- **Debug**: Chrome DevTools → Rendering → Show scrolling issues
- **Fix**: Use `max-width: 100%` and `overflow-x: hidden` on problematic elements

**Issue**: Text too small on mobile
- **Cause**: Base font size < 16px
- **Fix**: Set base font size to 16px in CSS
- **Verify**: Use 1rem (16px) as minimum for body text

**Issue**: Touch targets too small
- **Debug**: Chrome DevTools → Rendering → Show touch buttons
- **Fix**: Ensure buttons/links are ≥ 44x44px
- **Test**: Manually tap all interactive elements

**Issue**: Keyboard hides input fields (iOS)
- **Cause**: Fixed positioning or viewport issues
- **Fix**: Use `viewport` meta tag, avoid fixed positioning on mobile
- **Workaround**: Scroll input into view when focused

**Issue**: Service worker not registering
- **Debug**: Chrome DevTools → Application → Service Workers
- **Fix**: Ensure HTTPS (required for service workers)
- **Workaround**: Disable PWA in development mode

**Issue**: PWA not installing on iOS
- **Cause**: iOS PWA limitations, manual installation required
- **Fix**: Provide clear "Add to Home Screen" instructions
- **Verify**: Safari shows "Add to Home Screen" in Share menu

---

## 8. Performance Monitoring

### Lighthouse CI Integration

```bash
# Install Lighthouse CI
yarn add -D @lhci/cli

# Run Lighthouse audit
lhci autorun --collect.url="http://localhost:8080"
```

**Target Scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- PWA: > 90

### Core Web Vitals

**Metrics to Monitor**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Testing**:
- Chrome DevTools → Lighthouse
- PageSpeed Insights (https://pagespeed.web.dev/)
- Search Console (Core Web Vitals report)

---

## 9. Development Workflow

### Feature Development Cycle

1. **Develop**: Use Chrome DevTools emulation for rapid iteration
2. **Test**: Run Playwright viewport tests
3. **Validate**: Test on real devices (Android + iOS)
4. **Debug**: Use DevTools remote debugging
5. **Iterate**: Fix issues and repeat

### Pre-Release Checklist

- [ ] Test on iPhone SE (320px minimum)
- [ ] Test on iPhone 12/13 (390px standard)
- [ ] Test on iPad (768px+)
- [ ] Test on Android device (Chrome + Samsung Internet)
- [ ] Verify no horizontal scroll at any viewport
- [ ] Verify all touch targets ≥ 44x44px
- [ ] Install PWA on Android → verify full-screen mode
- [ ] Install PWA on iOS → verify full-screen mode
- [ ] Test offline mode → verify cached content loads
- [ ] Run Lighthouse audit → verify score > 90
- [ ] Test on 3G network throttling → verify acceptable performance

---

## 10. CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/mobile-testing.yml
name: Mobile & PWA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build
        run: yarn build

      - name: Run Playwright tests
        run: yarn test:e2e

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:8080
          uploadArtifacts: true
```

---

## 11. Resources

### Documentation
- [Vuetify 3 Display & Platform](https://vuetifyjs.com/en/features/display-and-platform/)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [PWA Best Practices (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Best_practices)

### Tools
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack (Real Device Testing)](https://www.browserstack.com/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Lighthouse (Performance Auditing)](https://developers.google.com/web/tools/lighthouse)

### Testing
- [Playwright Emulation](https://playwright.dev/docs/emulation)
- [How to Test PWA](https://medium.com/effective-developers/how-to-test-pwa-daa1a6eaf7bf)
- [Mobile Testing Checklist](https://synodus.com/blog/web-development/progressive-web-apps-checklist/)

---

## Next Steps

1. ✅ Complete development environment setup
2. ✅ Install dependencies and configure PWA module
3. ✅ Generate PWA icons
4. ✅ Run manual tests on emulated devices
5. ✅ Set up automated testing infrastructure
6. ⏭️ Begin implementation (see [tasks.md](tasks.md) - generated by `/speckit.tasks`)
