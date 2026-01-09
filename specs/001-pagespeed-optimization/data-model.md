# Data Model: PageSpeed Performance Optimization

**Feature**: 001-pagespeed-optimization
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document defines the data model for performance monitoring, caching strategies, and success criteria tracking. Note that this is primarily **measurement and configuration data**, not persistent application data - the feature optimizes existing functionality without adding new domain entities.

---

## Core Web Vitals Domain Model

### WebVitalMetric

Represents a single Core Web Vitals measurement from real-user monitoring.

```typescript
interface WebVitalMetric {
  // Metric identification
  id: string                  // Unique ID for this specific measurement
  name: MetricName            // Type of metric (FCP, LCP, CLS, FID, TTFB)

  // Measurement value
  value: number               // Raw value in milliseconds (or unitless for CLS)
  rating: Rating              // Performance rating (good, needs-improvement, poor)

  // Navigation context
  navigationType: NavigationType  // navigate, reload, back_forward, prerender
  url: string                // Page URL where measured

  // Delta tracking (for analytics)
  delta: number              // Change from previous measurement (if available)

  // Timestamp
  timestamp: ISO8601         // When the measurement was taken
}

type MetricName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'FCP' | 'SI'

type Rating = 'good' | 'needs-improvement' | 'poor'

type NavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender'
```

### Thresholds (Performance SLA)

Success criteria thresholds for each metric:

```typescript
interface PerformanceThresholds {
  FCP: {
    good: number              // ≤ 1800ms (SC-001)
    needsImprovement: number  // 1800ms - 3000ms
    poor: number              // > 3000ms
  }
  LCP: {
    good: number              // ≤ 2500ms (SC-002)
    needsImprovement: number  // 2500ms - 4000ms
    poor: number              // > 4000ms
  }
  TBT: {                      // Derived from FID in field data
    good: number              // ≤ 200ms (SC-003)
    needsImprovement: number  // 200ms - 600ms
    poor: number              // > 600ms
  }
  CLS: {
    good: number              // ≤ 0.1 (SC-005)
    needsImprovement: number  // 0.1 - 0.25
    poor: number              // > 0.25
  }
  SpeedIndex: {
    target: number            // ≤ 4000ms (SC-004)
  }
}
```

---

## Performance Report Aggregation

### PerformanceReport

Aggregated performance metrics for a time period (e.g., daily, weekly).

```typescript
interface PerformanceReport {
  // Report identification
  id: string
  period: ReportPeriod        // daily, weekly, monthly
  startDate: ISO8601
  endDate: ISO8601

  // Metric aggregates (75th percentile)
  metrics: {
    FCP: MetricAggregate
    LCP: MetricAggregate
    CLS: MetricAggregate
    FID: MetricAggregate
    TTFB: MetricAggregate
    SpeedIndex: MetricAggregate
  }

  // Business metrics
  businessMetrics: {
    bounceRate: number        // Mobile bounce rate (SC-007)
    avgTimeOnPage: number     // Average time on page in seconds (SC-008)
    pageViews: number         // Total page views
    uniqueVisitors: number    // Unique visitors
  }

  // Success criteria status
  successCriteria: {
    SC_001_FCP: boolean       // 82% improvement from 10.2s to ≤1.8s
    SC_002_LCP: boolean       // 86% improvement from 18.3s to ≤2.5s
    SC_003_TBT: boolean       // 95% improvement from 3650ms to ≤200ms
    SC_004_SI: boolean        // 79% improvement from 18.7s to ≤4s
    SC_005_CLS: boolean       // Maintain ≤0.1
    SC_006_PageSpeedScore: boolean  // Mobile score ≥80
    SC_007_BounceRate: boolean  // Decrease by ≥30%
    SC_008_TimeOnPage: boolean  // Increase by ≥20%
  }

  // Overall status
  overallStatus: 'pass' | 'partial' | 'fail'
}

interface MetricAggregate {
  p75: number                 // 75th percentile value
  p50: number                 // Median value
  p95: number                 // 95th percentile value
  rating: Rating              // Based on p75 value
  sampleSize: number          // Number of measurements
}
```

---

## Caching Strategy Model

### CacheRule

Configuration for caching static and dynamic resources.

```typescript
interface CacheRule {
  // Rule identification
  id: string
  name: string

  // Resource pattern
  urlPattern: string | RegExp  // URL pattern to match

  // Cache strategy
  strategy: CacheStrategy
  options: CacheOptions

  // Priority (for conflict resolution)
  priority: number
}

type CacheStrategy =
  | 'CacheFirst'              // Check cache, fallback to network
  | 'NetworkFirst'            // Check network, fallback to cache
  | 'StaleWhileRevalidate'    // Serve from cache, update in background
  | 'NetworkOnly'             // Always from network (no caching)
  | 'CacheOnly'               // Only from cache (offline)

interface CacheOptions {
  cacheName: string           // Cache storage name
  maxEntries?: number         // Maximum number of entries
  maxAgeSeconds?: number      // Expiration time
  purgeOnQuota?: boolean      // Remove when storage quota exceeded
}
```

### Default Cache Rules

Based on research decisions:

```typescript
const DEFAULT_CACHE_RULES: CacheRule[] = [
  {
    id: 'strapi-api',
    name: 'Strapi CMS API',
    urlPattern: /^https:\/\/.*\.aiworkplace\.ru\/api\//i,
    strategy: 'StaleWhileRevalidate',
    options: {
      cacheName: 'strapi-cache',
      maxEntries: 50,
      maxAgeSeconds: 300      // 5 minutes fresh, 1 hour stale
    },
    priority: 10
  },
  {
    id: 'images',
    name: 'Static Images',
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
    strategy: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      maxEntries: 100,
      maxAgeSeconds: 2592000  // 30 days
    },
    priority: 5
  },
  {
    id: 'static-assets',
    name: 'JS/CSS Assets',
    urlPattern: /\.(?:js|css)$/i,
    strategy: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-cache',
      maxAgeSeconds: 86400    // 24 hours
    },
    priority: 8
  },
  {
    id: 'analytics',
    name: 'Analytics Scripts',
    urlPattern: /\/analytics\//i,
    strategy: 'NetworkOnly',
    options: {
      cacheName: 'analytics-cache'
    },
    priority: 1
  }
]
```

---

## Image Optimization Configuration

### ImagePreset

Configuration for responsive image generation.

```typescript
interface ImagePreset {
  name: string                // Preset name (thumbnail, hero, etc.)
  modifiers: ImageModifiers
}

interface ImageModifiers {
  width?: number              // Target width in pixels
  height?: number             // Target height in pixels
  quality?: number            // JPEG/WebP quality (1-100)
  format?: ImageFormat        // Output format
  fit?: ImageFit              // Resizing method
}

type ImageFormat = 'webp' | 'jpg' | 'png' | 'avif'

type ImageFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
```

### Default Image Presets

Based on research decision 1:

```typescript
const IMAGE_PRESETS: ImagePreset[] = [
  {
    name: 'thumbnail',
    modifiers: {
      width: 300,
      quality: 75,
      format: 'webp',
      fit: 'cover'
    }
  },
  {
    name: 'card',
    modifiers: {
      width: 600,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    }
  },
  {
    name: 'hero',
    modifiers: {
      width: 1200,
      quality: 85,
      format: 'webp',
      fit: 'cover'
    }
  },
  {
    name: 'diagram',
    modifiers: {
      width: 800,
      quality: 90,
      format: 'webp',
      fit: 'inside'
    }
  }
]
```

---

## Code Split Configuration

### ChunkDefinition

Defines how code should be split into chunks.

```typescript
interface ChunkDefinition {
  name: string                // Chunk name
  modules: string[]           // Module paths to include
  strategy: ChunkStrategy
}

type ChunkStrategy =
  | 'vendor'                  // Third-party libraries (rarely change)
  | 'shared'                  // Code shared across routes
  | 'route'                   // Route-specific chunks (automatic with Nuxt)
  | 'component'               // Lazy-loaded components
```

### Default Chunks

Based on research decision 2:

```typescript
const CHUNK_DEFINITIONS: ChunkDefinition[] = [
  {
    name: 'vuetify',
    modules: ['vuetify'],
    strategy: 'vendor'
  },
  {
    name: 'mermaid',
    modules: ['mermaid'],
    strategy: 'component'     // Lazy-loaded
  },
  {
    name: 'vue-vendor',
    modules: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
    strategy: 'vendor'
  }
]
```

---

## Font Loading Configuration

### FontDefinition

Configuration for font loading and subsetting.

```typescript
interface FontDefinition {
  name: string                // Font family name
  src: string                 // Font file path
  format: string              // WOFF2, WOFF, TTF
  display: FontDisplay
  preload: boolean            // Whether to preload in <head>
  subset?: string[]           // Character subset (if applicable)
}

type FontDisplay =
  | 'auto'                    // Default browser behavior
  | 'block'                   // Hide text until font loads
  | 'swap'                    // Show fallback immediately, swap when loaded
  | 'fallback'                // Short timeout then fallback
  | 'optional'                // Don't swap if takes too long
```

### Font Configuration

Based on research decision 7:

```typescript
const FONT_DEFINITIONS: FontDefinition[] = [
  {
    name: 'Material Icons',
    src: '/fonts/material-icons-subset.woff2',
    format: 'woff2',
    display: 'swap',
    preload: true,
    subset: [
      'menu', 'close', 'search', 'home', 'arrow_forward',
      'add', 'delete', 'edit', 'save', 'cancel',
      // ... all used icons
    ]
  },
  {
    name: 'Roboto',
    src: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    format: 'woff2',
    display: 'swap',
    preload: true
  }
]
```

---

## Critical CSS Configuration

### CriticalCSSDefinition

Defines which CSS selectors are considered "critical" for above-the-fold content.

```typescript
interface CriticalCSSDefinition {
  // Viewport dimensions for critical area
  viewport: {
    width: number              // Viewport width in pixels (e.g., 375)
    height: number             // Viewport height in pixels (e.g., 667)
  }

  // Critical selectors (regex or string)
  include: SelectorPattern[]

  // Non-critical selectors to exclude
  exclude?: SelectorPattern[]
}

type SelectorPattern = string | RegExp
```

### Critical CSS Configuration

Based on research decision 4:

```typescript
const CRITICAL_CSS: CriticalCSSDefinition = {
  viewport: {
    width: 375,                // Mobile viewport
    height: 667                // Typical mobile screen height
  },
  include: [
    // App shell
    /^\.v-app$/,
    /^\.v-application$/,

    // Header
    /^\.v-app-bar$/,
    /^\.v-toolbar$/,
    /^\.v-navigation-drawer$/,

    // Hero section
    /^\.hero-section$/,
    /^\.v-container$/,

    // Loading states
    /^\.loading-skeleton$/,
    /^\.v-progress-linear$/,

    // Typography basics
    /^h1$/, /^h2$/, /^h3$/,
    /^\.text-$/,
    /^\.font-/
  ],
  exclude: [
    // Animations (non-critical)
    /gradient-chaos/,
    /gradient-pulse/,
    /iridescent-glow/,

    // Below-fold components
    /\.speckit-diagram/,
    /\.research-chat/,
    /\.prompt-grid/,

    // Interactive elements
    /\.v-menu/,
    /\.v-dialog/,
    /\.v-tooltip/
  ]
}
```

---

## Relationships

```
WebVitalMetric (individual measurement)
    └─ aggregates into ─→ PerformanceReport (time-period summary)

CacheRule (configuration)
    └─ applied by ─→ Service Worker (runtime)

ImagePreset (configuration)
    └─ used by ─→ @nuxt/image (build/runtime)

ChunkDefinition (configuration)
    └─ used by ─→ Vite build process

FontDefinition (configuration)
    └─ used by ─→ Nuxt app head (preload)

CriticalCSSDefinition (configuration)
    └─ used by ─→ Critical CSS extractor (build)
```

---

## Implementation Notes

1. **Non-Persistent Data**: Most of this data is configuration or ephemeral measurements. Only `PerformanceReport` might be persisted if long-term tracking is needed.

2. **Privacy**: `WebVitalMetric` should not include PII. URLs can be hashed if needed for privacy.

3. **Sampling**: Consider sampling metrics (e.g., 10% of users) to reduce data volume while maintaining statistical significance.

4. **Aggregation**: Metrics should be aggregated at the 75th percentile (p75) per Core Web Vitals best practices.

5. **Configuration Files**: Most configurations (CacheRule, ImagePreset, etc.) will be implemented as:
   - Nuxt config settings (`nuxt.config.js`)
   - Vite config settings (`vite.config.js`)
   - Tailwind config settings (`tailwind.config.js`)
   - Static JSON files for runtime consumption

---

## Next Steps

1. **Phase 1 Contracts**: See [contracts/web-vitals.yaml](./contracts/web-vitals.yaml) for formal SLA definition
2. **Phase 2 Tasks**: Generate implementation tasks using `/speckit.tasks`
3. **Implementation**: Apply configurations in order of priority (P0 → P1 → P2)
