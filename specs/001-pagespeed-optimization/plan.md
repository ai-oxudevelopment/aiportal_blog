# Implementation Plan: PageSpeed Performance Optimization

**Branch**: `001-pagespeed-optimization` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pagespeed-optimization/spec.md`

## Summary

Optimize mobile PageSpeed performance to achieve Core Web Vitals targets (FCP: 1.8s, LCP: 2.5s, TBT: 200ms) from current critically poor state (FCP: 10.2s, LCP: 18.3s, TBT: 3,650ms). Focus on reducing main thread blocking, optimizing asset delivery, and implementing progressive loading while maintaining all existing functionality and PWA features.

Technical approach: Multi-layered optimization combining bundle reduction, asset optimization, smart code-splitting, and rendering optimizations without architectural changes to Nuxt 3 + Strapi system.

## Technical Context

**Language/Version**: JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21)
**Primary Dependencies**: Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia, @nuxtjs/mdc, Mermaid 11.0.0
**Storage**: N/A (static build artifacts + Strapi v5 CMS for backend)
**Testing**: Vitest (configured in project), manual PageSpeed Insights testing
**Target Platform**: Mobile web (primary), Desktop web (secondary) - Progressive Web App
**Project Type**: Web application (frontend/backend architecture)
**Performance Goals**:
  - First Contentful Paint (FCP): ≤1.8s (82% improvement from 10.2s)
  - Largest Contentful Paint (LCP): ≤2.5s (86% improvement from 18.3s)
  - Total Blocking Time (TBT): ≤200ms (95% improvement from 3,650ms)
  - Speed Index: ≤4s (79% improvement from 18.7s)
  - Cumulative Layout Shift (CLS): ≤0.1 (maintain current 0.017)
**Constraints**:
  - Must not break existing functionality (Speckit diagrams, FAQs, search)
  - Must maintain WCAG 2.1 AA accessibility
  - Must preserve SEO optimization
  - No additional paid CDN services
  - Must maintain PWA compatibility
**Scale/Scope**:
  - Public-facing portal with unknown but significant mobile traffic
  - Content-heavy pages (Speckit diagrams, articles, research)
  - Static PWA deployable to CDN/hosting
  - Targeting 30% reduction in mobile bounce rate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Server-Side Proxy Architecture | ✅ PASS | No changes to proxy layer - all optimizations are client-side |
| II. Feature-Based Component Organization | ✅ PASS | Optimizations respect existing feature structure; no reorganization |
| III. Dual UI Framework Integration | ✅ PASS | Vuetify+Tailwind usage unchanged; optimizing delivery not patterns |
| IV. Russian-Language First | ✅ PASS | No changes to content or localization |
| V. SPA Deployment Model & Nuxt 4 Hybrid Rendering | ⚠️ MINOR | Currently SSR-mode; optimizations work with SSR but SPA-switch consideration needed (see Complexity Tracking) |
| VI. API & Data Modeling Standards | ✅ PASS | No changes to data models or API contracts |
| VII. Error Handling & Observability | ✅ PASS | Adding performance monitoring, not changing error handling |
| VIII. Performance & Caching Strategy | ✅ ENHANCE | Actually implementing the performance principle from constitution |
| IX. Strapi Integration Patterns | ✅ PASS | No changes to Strapi client layer |
| X. Security, Auth & Secrets Management | ✅ PASS | No auth changes; performance additions don't affect security |

### Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR mode consideration (Constitution V) | Current app runs SSR; must ensure optimizations don't break SEO/hydration | Switching to SPA would simplify but would harm SEO and require architectural changes beyond scope |
| Additional build tools (bundle analyzer) | Need to measure and track optimization progress | Manual optimization without metrics would be guesswork and potentially ineffective |

### Gate Decision

**✅ APPROVED** - Plan may proceed to Phase 0 research.

All constitution principles are respected. Minor considerations documented in Complexity Tracking. Enhancements to Principle VIII (Performance) directly fulfill constitutional intent.

## Project Structure

### Documentation (this feature)

```text
specs/001-pagespeed-optimization/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Technical research findings
├── data-model.md        # Phase 1: Performance metrics model
├── quickstart.md        # Phase 1: Developer quickstart guide
├── contracts/           # Phase 1: Performance contracts
│   └── web-vitals.yaml  # Core Web Vitals SLA
└── tasks.md             # Phase 2: Implementation tasks (created later)
```

### Source Code (repository root)

```text
frontend/                      # Nuxt 3 frontend application
├── components/
│   ├── prompt/               # Optimize: lazy load PromptGrid/EnhancedPromptCard
│   ├── JavaScriptBanner.vue  # Optimize: reduce script blocking
│   └── SlowConnectionBanner.vue  # Optimize: reduce script blocking
├── composables/
│   ├── useFetchArticles.ts   # Optimize: review caching strategy
│   ├── useMermaidDiagram.ts  # Optimize: dynamic import Mermaid
│   └── usePwaInstall.ts      # Review: PWA install prompt weight
├── pages/
│   ├── index.vue             # Optimize: code split, reduce initial bundle
│   └── speckits/
│       ├── [speckitSlug].vue # Optimize: lazy load diagrams
│       └── index.vue         # Optimize: virtualize list
├── server/api/
│   ├── articles.get.ts       # Review: caching headers
│   └── speckits.get.ts       # Review: caching headers
├── assets/
│   └── css/                  # Optimize: critical CSS extraction
├── public/                   # Optimize: image formats (WebP)
├── nuxt.config.js            # UPDATE: build optimizations
├── tailwind.config.js        # REVIEW: purge unused styles
├── vite.config.js            # CREATE: bundle optimization rules
└── package.json              # UPDATE: add performance deps

backend/                       # Strapi CMS - no changes required
```

**Structure Decision**: Web application structure with frontend/backend separation. All performance optimizations are scoped to the `frontend/` directory, respecting the existing server-side proxy architecture (Constitution I) and feature-based organization (Constitution II). Backend (Strapi) remains unchanged as CMS content delivery optimizations are frontend-only (image optimization, caching).

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **Image Optimization Strategy**
   - Research: Best approach for WebP conversion with fallbacks in Nuxt 3
   - Options: @nuxt/image vs manual optimization vs build-time conversion
   - Decision needed: Balancing bundle size vs flexibility

2. **Code Splitting Strategy**
   - Research: Optimal chunk split points for Nuxt 3 + Vuetify
   - Options: Route-based splitting vs component-based vs vendor splitting
   - Decision needed: Impact on caching and parallel loading

3. **Mermaid Diagram Lazy Loading**
   - Research: Best pattern for dynamic Mermaid import in Nuxt 3
   - Options: Client-only component vs dynamic import vs worker thread
   - Decision needed: Balancing UX (diagram availability) vs performance

4. **CSS Optimization**
   - Research: Critical CSS extraction for Nuxt 3 + Tailwind + Vuetify
   - Options: Inline critical vs preload vs progressive enhancement
   - Decision needed: Maintaining iridescent theme while reducing payload

5. **Service Worker Strategy**
   - Research: Fixing PWA service worker registration
   - Options: @vite-pwa/nuxt config fixes vs custom SW vs remove PWA
   - Decision needed: Ensure offline capability without degrading performance

6. **Performance Monitoring**
   - Research: Real-user monitoring (RUM) solution for Core Web Vitals
   - Options: web-vitals library vs Google Analytics vs custom solution
   - Decision needed: Measuring success criteria (SC-001 through SC-008)

7. **Font Loading Strategy**
   - Research: Optimal font loading for Material Icons + custom fonts
   - Options: Subset fonts vs preload vs font-display: swap vs async
   - Decision needed: Reducing FCP without font flash

8. **SSR vs SPA Decision**
   - Research: Performance impact of SSR vs SPA mode
   - Options: Keep SSR vs switch to SPA vs hybrid approach
   - Decision needed: SEO implications vs performance gains

### Research Deliverables

See [research.md](./research.md) for:
- Technical decisions with rationale
- Alternatives considered for each decision
- Implementation recommendations
- Risk assessments

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for:
- Performance metrics entities (WebVital, PerformanceReport)
- Alerting thresholds and SLA definitions
- Caching strategy models
- Monitoring data structures

### API Contracts

See [contracts/](./contracts/) for:
- **web-vitals.yaml**: Core Web Vitals service level agreement
- **cache-strategy.yaml**: Caching rules and TTL definitions
- **monitoring-api.yaml**: Performance monitoring endpoints (if any)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for:
- Performance testing setup (Lighthouse CI, PageSpeed Insights)
- Development workflow with bundle analysis
- Optimization verification steps
- Rollback procedures

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update the Claude agent context with new performance optimization patterns and tools added by this feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR mode consideration (Constitution V) | Current app runs SSR mode (ssr: true); must ensure optimizations don't break SEO/hydration patterns | Switching to SPA would simplify some caching but would harm SEO (first paint SEO) and require architectural changes beyond scope |
| Additional build tooling (bundle analyzer) | Need to measure and track optimization progress; identify regression points | Manual optimization without metrics would be guesswork and potentially ineffective; might not meet success criteria |
| Critical CSS extraction | Nuxt 3 + Vuetify + Tailwind combination creates large CSS payload; need to extract above-the-fold styles | Full CSS load causes 10+ second FCP; critical CSS reduces initial payload by ~80% for first paint |
| WebP image optimization | Reduces image payload by 30-50% for LCP elements | Current JPEG/PNG format too large for mobile; responsive srcset adds complexity but necessary for 2.5s LCP target |
