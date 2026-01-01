# Research: Mobile PWA Adaptation

**Feature**: 001-mobile-pwa | **Date**: 2026-01-01
**Purpose**: Document technical research and decisions for PWA implementation

## Overview

This document consolidates research findings for implementing Progressive Web App features and mobile responsiveness in the AI tools library Nuxt 3 application.

---

## Decision 1: PWA Module Selection

**Question**: Which Nuxt 3 PWA module to use?

### Decision: Use `@vitejs/plugin-pwa` with Vite PWA plugin

**Rationale**:
- **Native Vite Integration**: Works seamlessly with Nuxt 3's Vite-based build system
- **Automatic Service Worker Generation**: Zero-config service worker with Workbox under the hood
- **Manifest Injection**: Automatically injects web app manifest into HTML
- **Update Management**: Built-in service worker update flow with user prompts
- **Community Support**: Most widely used PWA solution for Vite/Nuxt 3 (2M+ weekly downloads)
- **Active Maintenance**: Regular updates and strong community backing
- **Nuxt 3 Compatibility**: Well-tested with Nuxt 3 projects

**Alternatives Considered**:

1. **@nuxtjs/pwa**
   - ❌ **Rejected**: Primarily designed for Nuxt 2, limited Nuxt 3 support
   - ❌ Last stable release for Nuxt 2 (Nuxt 3 support experimental)
   - ✅ Pro: Official Nuxt module ecosystem
   - ❌ Con: Migration path unclear, potential breaking changes

2. **Custom Service Worker Implementation**
   - ❌ **Rejected**: Too complex for timeline
   - ❌ Requires manual cache management, update handling, and Workbox configuration
   - ✅ Pro: Maximum control and customization
   - ❌ Con: High maintenance burden, reinventing well-solved problems

3. **workbox-webpack-plugin (direct)**
   - ❌ **Rejected**: Vite PWA plugin wraps this with better defaults
   - ❌ More configuration overhead
   - ✅ Pro: Direct Workbox access
   - ❌ Con: Vite PWA provides same control with better DX

**Implementation Notes**:
```javascript
// nuxt.config.js
import VitePWA from 'vite-plugin-pwa'

export default defineNuxtConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'favicon.ico'],
        manifest: {
          // manifest configuration
        },
        workbox: {
          // caching strategies
        }
      })
    ]
  }
})
```

---

## Decision 2: Service Worker Caching Strategy

**Question**: Which caching strategies for different asset types?

### Decision: Hybrid Strategy Based on Asset Type

**Rationale**:
Different asset types have different update frequencies and criticality, requiring tailored strategies.

**Strategy Breakdown**:

#### 1. **App Shell (CacheFirst)**
- **Assets**: HTML framework, CSS framework, JS runtime, core UI components
- **Pattern**: `CacheFirst` with network timeout fallback
- **Rationale**: App shell rarely changes, speed is critical for perceived performance
- **Cache Duration**: Permanent (version controlled by build hash)

```javascript
// App Shell Pattern
workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'app-shell',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
)
```

#### 2. **Static Assets (CacheFirst)**
- **Assets**: Images, icons, fonts
- **Pattern**: `CacheFirst` with expiration
- **Rationale**: Never change, cache for speed
- **Cache Duration**: 30 days with LRU eviction

```javascript
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
)
```

#### 3. **Dynamic Content (NetworkFirst)**
- **Assets**: Strapi API responses (`/api/articles`, `/api/prompts`)
- **Pattern**: `NetworkFirst` with cache fallback
- **Rationale**: Content changes frequently, freshness is critical
- **Cache Duration**: 24 hours with stale-while-revalidate

```javascript
workbox.routing.registerRoute(
  /^https?:\/\/.*\/api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-content',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 // 24 hours
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)
```

#### 4. **HTML Pages (StaleWhileRevalidate)**
- **Assets**: Nuxt-generated HTML pages
- **Pattern**: `StaleWhileRevalidate`
- **Rationale**: Instant page loads with background updates
- **Cache Duration**: 1 hour

```javascript
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 // 1 hour
      })
    ]
  })
)
```

#### 5. **Offline Fallback**
- **Assets**: All navigation requests when offline
- **Pattern**: NetworkOnly with offline fallback
- **Rationale**: Graceful degradation when offline

```javascript
workbox.routing.setCatchHandler(({ event }) => {
  switch (event.request.destination) {
    case 'document':
      return workbox.precaching.matchPrecache('/offline.html')
    default:
      return Response.error()
  }
})
```

**Alternatives Considered**:

1. **Cache-Only for Everything**
   - ❌ **Rejected**: Stale content, no freshness guarantees
   - ❌ Poor experience for frequently updated content

2. **Network-Only for Everything**
   - ❌ **Rejected**: No offline functionality
   - ❌ Defeats purpose of PWA

3. **Stale-While-Revalidate for Everything**
   - ❌ **Rejected**: Complex to implement correctly
   - ❌ Overkill for static assets that never change

---

## Decision 3: Mobile Navigation Pattern

**Question**: Which navigation pattern works best for the existing content structure?

### Decision: Responsive Collapsible Sidebar with Mobile Bottom Navigation

**Rationale**:
The existing application has:
- Hierarchical categories (sidebar filter)
- Main content area (prompt grid)
- Search functionality
- Multiple sections (prompts, research, blogs)

**Desktop (>1024px)**: Fixed sidebar (existing behavior)
**Tablet (768px-1024px)**: Collapsible sidebar with toggle
**Mobile (<768px)**:
- **Primary Navigation**: Bottom tab bar (Home, Search, Research, Profile)
- **Secondary Navigation**: Drawer/hamburger menu for categories
- **Search**: Always-visible search bar at top

**Pattern Selection**:

**Bottom Navigation Bar** for primary sections:
- ✅ **Thumb-friendly**: Easy to reach with one-handed use
- ✅ **Clear hierarchy**: Primary actions always visible
- ✅ **Standard pattern**: Users expect this on mobile apps
- ✅ **Space-efficient**: Doesn't take vertical scroll space
- ✅ **Platform-consistent**: Matches iOS and Android conventions

```vue
<!-- components/main/MobileBottomNav.vue -->
<template>
  <v-bottom-nav>
    <v-btn value="home" to="/">
      <v-icon>mdi-home</v-icon>
      <span>Главная</span>
    </v-btn>
    <v-btn value="search" to="/?search=true">
      <v-icon>mdi-magnify</v-icon>
      <span>Поиск</span>
    </v-btn>
    <v-btn value="research" to="/research">
      <v-icon>mdi-brain</v-icon>
      <span>Research</span>
    </v-btn>
    <v-btn value="menu" @click="openDrawer">
      <v-icon>mdi-menu</v-icon>
      <span>Меню</span>
    </v-btn>
  </v-bottom-nav>
</template>
```

**Collapsible Sidebar** for categories:
- ✅ **Maintains existing UX**: Users familiar with desktop sidebar
- ✅ **Accessibility**: Drawers are accessible patterns
- ✅ **Flexibility**: Can accommodate deep category hierarchies
- ✅ **Progressive disclosure**: Hidden by default, shown when needed

```vue
<!-- components/main/Sidebar.vue - Modified -->
<template>
  <v-navigation-drawer
    v-model="isOpen"
    :temporary="isMobile"
    :permanent="!isMobile"
    app
  >
    <!-- Categories filter (existing code) -->
  </v-navigation-drawer>
</template>
```

**Alternatives Considered**:

1. **Hamburger Menu Only**
   - ❌ **Rejected**: Everything hidden, poor discoverability
   - ❌ Extra tap to access primary features
   - ❌ Doesn't match app-like feel

2. **Top Tab Bar**
   - ❌ **Rejected**: Harder to reach (top of screen)
   - ❌ Takes valuable vertical space on small screens
   - ❌ Less thumb-friendly

3. **Full-Screen Gestures**
   - ❌ **Rejected**: Discoverability issues
   - ❌ Hard to implement without native feel
   - ❌ Conflicts with browser gestures

---

## Decision 4: Icon Generation

**Question**: How to generate required PWA icon sizes from existing branding?

### Decision: Use Squoosh or PWA Asset Generator CLI Tool

**Rationale**:
The existing branding uses an iridescent gradient theme (pink #ff1493, orange #ff6b00, blue #00bfff). We need to generate:

**Required Icon Sizes**:
- **favicon.ico**: 16x16, 32x32
- **Apple Touch Icon**: 180x180
- **PWA Icons**: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Maskable Icon** (optional): 512x512 with safe zone
- **Splash Screen**: 512x512 (auto-generated by some platforms)

**Approach**:

#### Option 1: Online Tool - Squoosh.app (Recommended for Quick Start)
- ✅ **No installation**: Web-based tool by Google
- ✅ **Batch processing**: Generate all sizes at once
- ✅ **Optimization**: Automatic compression and format conversion
- ✅ **Free**: No cost
- **Workflow**:
  1. Upload source logo (SVG or high-res PNG)
  2. Select output sizes (72, 96, 128, 144, 152, 192, 384, 512)
  3. Download batch

#### Option 2: CLI Tool - pwa-asset-generator (Recommended for Automation)
```bash
# Install globally
npm install -g pwa-asset-generator

# Generate all icons from source
pwa-asset-generator public/logo.svg public/icons/ \
  --background "linear-gradient(45deg, #ff1493, #ff6b00, #00bfff)" \
  --manifest public/manifest.webmanifest \
  --index public/index.html
```

- ✅ **Automated**: Part of build process
- ✅ **Manifest integration**: Auto-generates manifest entries
- ✅ **HTML injection**: Adds link tags to HTML
- ✅ **Flexible**: Custom backgrounds, padding, output formats

#### Option 3: Figma/Sketch Design File (If source is design tool)
- ✅ **Consistency**: Maintain design system
- ✅ **Vector export**: SVG source for scaling
- ❌ **Manual work**: Export each size manually
- ❌ **Designer dependency**: Requires designer time

**Decision**: Start with **pwa-asset-generator** CLI for automation and consistency.

**Icon Design Specifications**:

```json
{
  "purpose": "any maskable",
  "sizes": "512x512",
  "type": "image/png",
  "background": "linear-gradient(45deg, #ff1493, #ff6b00, #00bfff)",
  "safe_zone_padding": "10%"
}
```

**Icon File Structure**:
```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── maskable-icon-512x512.png
│   └── apple-touch-icon-180x180.png
└── favicon.ico
```

**Alternatives Considered**:

1. **Manual Photoshop/GIMP**
   - ❌ **Rejected**: Too time-consuming, error-prone
   - ❌ Inconsistent across sizes

2. **Favicon.io Generator**
   - ✅ **Considered**: Easy web interface
   - ❌ **Rejected**: Limited customization for gradient backgrounds
   - ❌ No maskable icon support

3. **RealFaviconGenerator.net**
   - ✅ **Considered**: Comprehensive, handles all edge cases
   - ❌ **Rejected**: Web-based, can't automate
   - ✅ Good for one-time setup, CLI better for iteration

---

## Decision 5: iOS PWA Limitations and Workarounds

**Question**: What are iOS Safari's PWA limitations and workarounds?

### Decision: Accept Limitations and Implement Progressive Enhancement

**Rationale**:
iOS Safari has historically lagged behind Chrome in PWA support. We should implement core PWA features for all platforms, with graceful degradation for iOS limitations.

**iOS Safari PWA Support (as of iOS 17+)**:

| Feature | iOS 17+ | Android Chrome | Workaround |
|---------|---------|----------------|------------|
| Install Prompt | ✅ Manual (Add to Home Screen) | ✅ Auto prompt | ✅ Show custom install instructions for iOS |
| Service Worker | ✅ Since iOS 11.3 | ✅ Full support | ✅ Assume available, test for support |
| Offline Mode | ✅ Full support | ✅ Full support | ✅ Consistent implementation |
| Cache Storage | ✅ Full support | ✅ Full support | ✅ Consistent implementation |
| Push Notifications | ❌ Not supported | ✅ Full support | ❌ Out of scope (per spec) |
| Background Sync | ❌ Not supported | ✅ Full support | ❌ Out of scope (per spec) |
| App Badging | ❌ Not supported | ✅ Full support | ❌ Out of scope (per spec) |
| Share Target | ❌ Not supported | ✅ Full support | ❌ Out of scope (per spec) |
| Full Screen API | ✅ Partial (no browser UI) | ✅ Full control | ✅ Consistent implementation |
| Display Mode | `standalone` only | `standalone`, `fullscreen`, `minimal-ui` | ✅ Use `standalone` (cross-platform) |
| Safe Areas | ✅ Required (notch support) | N/A (mostly no notches) | ✅ Use `env(safe-area-inset-*)` CSS |
| Splash Screen | ✅ Auto-generated from icon | ✅ Configurable | ✅ Provide 512x512 icon |

**Key iOS Limitations and Workarounds**:

#### 1. **No Automatic Install Prompt**
**Limitation**: iOS doesn't show `beforeinstallprompt` event. Users must manually "Share → Add to Home Screen"

**Workaround**:
```javascript
// composables/usePwaInstall.js
export function usePwaInstall() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const canInstall = ref(false)
  const showInstallPrompt = ref(false)

  onMounted(() => {
    if (isIOS) {
      // Show custom iOS install instructions
      showInstallPrompt.value = true
    } else {
      // Listen for Chrome install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        canInstall.value = true
      })
    }
  })

  return { isIOS, canInstall, showInstallPrompt }
}
```

**UX**: Show iOS-specific install dialog:
```
"Установите приложение:
1. Нажмите кнопку "Поделиться" (📤)
2. Прокрутите вниз и нажмите "На экран 'Домой'"
3. Нажмите "Добавить"
```

#### 2. **Notch/Safe Area Handling**
**Limitation**: iPhone X+ has notch that requires safe area padding

**Workaround**:
```css
/* mobile-responsive.css */
/* Add safe area padding for top */
.header {
  padding-top: env(safe-area-inset-top);
}

/* Add safe area padding for bottom */
.mobile-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(56px + env(safe-area-inset-bottom));
}

/* Side padding for landscape */
.content {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

#### 3. **Viewport Height Issues (100vh Bug)**
**Limitation**: iOS Safari treats `100vh` as address bar visible height, causing layout jumps

**Workaround**:
```css
/* mobile-responsive.css */
.hero-section {
  height: 100dvh; /* Use dynamic viewport height */
  height: 100vh;  /* Fallback for browsers without dvh support */
}
```

#### 4. **No Service Worker Update Control**
**Limitation**: iOS manages service worker updates aggressively, can't control update timing

**Workaround**: Accept iOS behavior, implement `updatefound` listener for other platforms:
```javascript
// plugins/pwa.client.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('updatefound', () => {
    // Show update prompt for non-iOS platforms
  })
}
```

#### 5. **Input Zoom on Focus**
**Limitation**: iOS auto-zooms on font size <16px inputs

**Workaround**: Ensure minimum 16px font on inputs:
```css
input, textarea, select {
  font-size: 16px !important;
}
```

**Testing Strategy**:
1. **Test on real iOS devices** (iPhone 12+, latest iOS)
2. **Test on Android devices** (Chrome, Edge, Samsung Internet)
3. **Use iOS Simulator** for quick iteration
4. **Test in both orientations** (portrait/landscape)
5. **Test offline behavior** (airplane mode)

**Alternatives Considered**:

1. **Wait for iOS to catch up**
   - ❌ **Rejected**: iOS 17+ has most needed features
   - ❌ Delays project indefinitely

2. **Feature detection only, no iOS workarounds**
   - ❌ **Rejected**: Poor iOS experience
   - ❌ Users can't install app easily on iOS

3. **Native app wrapper (Capacitor)**
   - ❌ **Rejected**: Defeats purpose of PWA (no app store)
   - ❌ Adds complexity and maintenance burden
   - ✅ Could be future enhancement if app store needed

---

## Additional Technical Considerations

### Pull-to-Refresh Implementation

**Decision**: Use native browser pull-to-refresh with CSS

**Approach**:
```css
/* Enable pull-to-refresh */
html {
  overscroll-behavior-y: none; /* Prevent rubber-banding */
}

.pull-refresh-container {
  overscroll-behavior-y: contain; /* Allow pull-to-refresh */
}
```

**JavaScript**:
```javascript
// composables/usePullToRefresh.js
let startY = 0
let currentY = 0

export function usePullToRefresh() {
  const touchStart = (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY
    }
  }

  const touchMove = (e) => {
    if (window.scrollY === 0) {
      currentY = e.touches[0].clientY
      const diff = currentY - startY

      if (diff > 100 && diff < 200) {
        // Show refresh indicator
      }
    }
  }

  const touchEnd = () => {
    if (currentY - startY > 150) {
      // Trigger refresh
      window.location.reload()
    }
    startY = 0
    currentY = 0
  }

  return { touchStart, touchMove, touchEnd }
}
```

### Touch Target Sizing

**Decision**: Use CSS minimum touch target sizes

```css
/* mobile-responsive.css */
/* Ensure minimum touch target size */
button, a, input, select, [role="button"] {
  min-height: 44px; /* iOS standard */
  min-height: 48px; /* Android standard - use larger */
  min-width: 44px;
  padding: 12px 16px;
}

/* Add visual feedback */
button:active, a:active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s;
}
```

### Performance Optimization

**Decision**: Lazy load images and components

```vue
<!-- Lazy load images -->
<NuxtImg
  :src="prompt.image"
  loading="lazy"
  width="400"
  height="300"
/>

<!-- Lazy load components -->
<LazyPromptCard v-for="prompt in prompts" :key="prompt.id" :prompt="prompt" />
```

---

## Summary of Decisions

| Decision | Choice | Key Rationale |
|----------|--------|---------------|
| PWA Module | `@vitejs/plugin-pwa` | Native Vite integration, auto service worker |
| Caching Strategy | Hybrid (CacheFirst, NetworkFirst, StaleWhileRevalidate) | Optimized for asset type |
| Mobile Navigation | Bottom nav + collapsible sidebar | Thumb-friendly, platform-consistent |
| Icon Generation | `pwa-asset-generator` CLI | Automated, consistent |
| iOS Limitations | Progressive enhancement | Accept limitations, workarounds where needed |

---

## Next Steps

1. ✅ Research complete
2. ⏳ Create `data-model.md` (no changes expected)
3. ⏳ Create `quickstart.md` (development guide)
4. ⏳ Update agent context
5. ⏳ Constitution re-check

---

**Research Status**: Complete | **Last Updated**: 2026-01-01