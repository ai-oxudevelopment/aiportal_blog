# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Portal Blog is a Nuxt 3 SSR application that serves as a library of AI tools, prompts, and "speckits" (specialized instruction kits). Content is managed via Strapi v5 CMS. The app is deployed as a Docker container using Node.js 22.

**Key Content Types:**
- **Speckits**: Specialized instruction kits with markdown body, optional file attachments, and Mermaid diagrams
- **Prompts**: AI prompts stored as articles in Strapi
- **Categories**: Used to filter and organize content

## Commands

### Development
```bash
cd frontend
yarn install        # Install dependencies (uses Yarn package manager)
yarn dev            # Start dev server on http://localhost:8080
```

### Build & Preview
```bash
cd frontend
yarn build          # Production build (SSR mode)
yarn generate       # Static site generation
yarn preview        # Preview production build locally
```

### Docker
```bash
# Build with build args
docker build --build-arg STRAPI_URL=<url> --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=<id> -t aiportal-blog .

# Run container
docker run -p 8080:8080 -e STRAPI_URL=<url> aiportal-blog
```

## Project Structure

```
main/
├── frontend/               # Nuxt 3 application
│   ├── pages/             # File-based routing (index.vue, blogs.vue, speckits/, prompts/, research/)
│   ├── components/        # Vue components organized by feature
│   │   ├── main/          # Header, Sidebar, HeroSection, etc.
│   │   ├── speckit/       # SpeckitCard, SpeckitDetail, SpeckitFilter
│   │   ├── prompt/        # PromptCard, PromptDetail
│   │   └── ui/            # Reusable UI components
│   ├── composables/       # Vue composables (auto-imported)
│   │   ├── useFetchArticles.ts
│   │   ├── useFileDownload.ts
│   │   ├── useClipboard.ts
│   │   ├── useMobileDetect.ts
│   │   ├── useNetworkDetection.ts
│   │   ├── useOfflineStatus.ts
│   │   ├── usePerformanceMetrics.ts
│   │   └── usePwaInstall.ts
│   ├── server/            # Nitro server routes
│   │   ├── api/           # API endpoints: articles.get.ts, speckits.get.ts
│   │   └── utils/         # cache-wrapper.ts, cache-control.ts
│   ├── plugins/           # Nuxt plugins (formkit, pwa, strapi, web-vitals)
│   ├── layouts/           # default.vue (wraps pages with Header + Sidebar)
│   ├── middleware/        # auth.js
│   ├── types/             # TypeScript definitions (article.ts)
│   ├── assets/css/        # Critical CSS, animations, theme styles
│   ├── public/            # Static assets
│   ├── nuxt.config.js     # Nuxt configuration
│   └── app.vue            # Root component with performance metrics
├── specs/                 # Feature specifications (SpeckIt workflow)
├── Dockerfile             # Multi-stage Docker build
└── .specify/              # Spec Kitty configuration
```

## Architecture Notes

### SSR & Performance
- **SSR Mode Enabled**: HTML is rendered server-side for SEO and fast FCP
- **Hybrid Rendering**: Home page and `/speckits` are pre-rendered (`prerender: true`)
- **Hydration**: Vue hydrates server-rendered HTML on client-side
- **Critical CSS**: Inlined in [app.vue](frontend/app.vue#L78-L206) for fastest FCP
- **Non-critical CSS**: Deferred 2s (animations.css) via dynamic import
- **Performance Metrics**: Tracked in [app.vue](frontend/app.vue#L18-L74) (TTI, FCP, hydration duration)

### Caching Strategy
- **Server-side**: Stale-While-Revalidate via [cache-wrapper.ts](frontend/server/utils/cache-wrapper.ts)
  - Fresh cache: 5 minutes
  - Stale cache: 1 hour (served during Strapi outages)
- **HTTP headers**: `Cache-Control: public, max-age=300, stale-while-revalidate=3600`
- **PWA Service Worker**: Configured in [nuxt.config.js](frontend/nuxt.config.js#L204-L338)
  - API: StaleWhileRevalidate (5min fresh)
  - Images: CacheFirst (30 days)
  - Fonts: CacheFirst (1 year)

### Strapi Integration
- Configured via @nuxtjs/strapi in [nuxt.config.js](frontend/nuxt.config.js#L65-L79)
- Entities: `categories`, `articles`
- Article types: `speckit`, `prompt`
- Server routes normalize Strapi v4/v5 response formats (see [speckits.get.ts](frontend/server/api/speckits.get.ts#L52-L77))

### Data Types
See [types/article.ts](frontend/types/article.ts) for:
- `SpeckitPreview`, `SpeckitFull` - with optional `file` and `diagram` fields
- `PromptPreview`, `PromptFull`
- `Category` - with `type: 'prompt' | 'speckit'`
- `SpeckitFaqData`, `SpeckitDiagramData`

### Component Organization
Components are organized by feature domain:
- `components/main/` - Header, Sidebar, HeroSection (main layout)
- `components/speckit/` - SpeckitCard, SpeckitDetail, SpeckitFilter, SpeckitCatalog
- `components/prompt/` - PromptCard, PromptDetail
- `components/ui/` - Reusable UI components
- `components/research/` - Research-specific components

### Auto-imports
- `composables/` - Auto-imported (configured in [nuxt.config.js](frontend/nuxt.config.js#L153))
- `stores/` - Auto-imported (Pinia)
- Vue APIs: `ref`, `computed`, `onMounted`, etc.

### Environment Variables
Required (see [frontend/.env.example](frontend/.env.example)):
```
STRAPI_URL=http://localhost:1337
PORT=8080
NUXT_PUBLIC_YANDEX_METRIKA_ID=<id>  # Optional
```

### Code Style
- ESLint configured: [frontend/.eslintrc.js](frontend/.eslintrc.js)
- TypeScript for type definitions
- Vue 3 Composition API (`<script setup>`)
- Client-only plugins use `.client.js/ts` suffix
- CSS uses Tailwind + custom theme files

### PWA Configuration
- Manifest includes shortcuts and app metadata
- Service worker caches API, images, fonts
- Workbox cleanup removes outdated caches
- Development mode: PWA disabled

---

## Clean Architecture (In Progress)

**Status**: Migrating to layered architecture per feature [001-clean-architecture-refactoring](kitty-specs/001-clean-architecture-refactoring/spec.md)

### Target Structure (New)

```
frontend/
├── src/                          # New layered architecture
│   ├── domain/                   # Domain Layer (types, interfaces)
│   │   ├── entities/             # Article, Category, ResearchSession
│   │   ├── repositories/         # IArticlesRepository, ICategoriesRepository
│   │   └── value-objects/        # SpeckitSlug, ArticleId (branded types)
│   │
│   ├── application/              # Application Layer (business logic)
│   │   └── use-cases/            # GetSpeckitList, GetPromptDetail, DownloadSpeckitFile
│   │   ├── speckits/
│   │   ├── prompts/
│   │   ├── research/
│   │   └── categories/
│   │
│   ├── infrastructure/           # Infrastructure Layer (implementation)
│   │   ├── repositories/         # StrapiArticlesRepository, StrapiCategoriesRepository
│   │   ├── cache/                # InMemoryCacheProvider, CacheWrapper
│   │   └── api/                  # StrapiClient
│   │
│   └── presentation/             # Presentation Layer (UI adapters)
│       └── composables/          # useSpeckitList, usePromptDetail, useResearchChat
│
├── components/                   # Existing components (being simplified)
├── composables/                  # Legacy composables (being replaced)
└── server/                       # Legacy server routes (logic moving to use cases)
```

### Architecture Principles

**Layer Responsibilities:**
- **Domain**: Types, interfaces, business rules (no dependencies on framework)
- **Application**: Use cases, business logic orchestration (framework-agnostic)
- **Infrastructure**: Data access, external APIs, caching (implements Domain interfaces)
- **Presentation**: UI-only composables adapting use cases for Vue

**Dependency Rule**: Dependencies point inward — Presentation → Application → Domain ← Infrastructure

**Migration Strategy**: Feature-based by module (Research → Speckits → Prompts → Blogs)

### When Working with New Architecture

**Creating a new feature:**
1. Define entities in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Implement repository in `src/infrastructure/repositories/`
4. Create use case in `src/application/use-cases/`
5. Create presentation composable in `src/presentation/composables/`
6. Use composable in Vue component

**See**: [quickstart.md](kitty-specs/001-clean-architecture-refactoring/quickstart.md) for detailed examples

### Migration Status

| Module | Status | Notes |
|--------|--------|-------|
| Foundation | ⏳ Pending | WP-01: Base layers, types, interfaces |
| Research | ⏳ Pending | WP-02: First module for pattern validation |
| Speckits | ⏳ Pending | WP-03: Most complex content module |
| Prompts | ⏳ Pending | WP-04: Reuses patterns from Speckits |
| Blogs | ⏳ Pending | WP-05: Final content module |
| Cleanup | ⏳ Pending | WP-06: Remove legacy code |

**DO NOT**: Add new features to legacy structure (`composables/`, `server/api/`). Use new `src/` structure instead.

**SEE**: [plan.md](kitty-specs/001-clean-architecture-refactoring/plan.md) for full migration strategy
