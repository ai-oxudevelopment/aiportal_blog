# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 frontend application for an AI tools library platform ("aiworkplace"). The app serves as a prompt library and AI research interface, connecting to a Strapi CMS backend. It's designed for operational staff to browse, search, and use AI prompts and tools.

## Development Commands

```bash
# Install dependencies (uses Yarn with zero-installs)
yarn install

# Start development server on port 8080
yarn dev

# Build for production
yarn build

# Preview production build locally
yarn preview
```

### Docker Development

The Dockerfile is located in the parent directory (`../Dockerfile`) and builds the frontend:

```bash
# Build with required environment variables
docker build --build-arg STRAPI_URL=<url> --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=<id> -t aiportal-frontend .
```

## Environment Variables

Create a `.env` file in the frontend directory (see `.env.example`):

- `STRAPI_URL` - Backend Strapi CMS URL (default: `http://localhost:1337`)
- `PORT` - Application port (default: `8080`)
- `NUXT_PUBLIC_YANDEX_METRIKA_ID` - Yandex Metrika analytics ID

## Architecture

### Core Technology Stack

- **Framework**: Nuxt 3 with Vue 3 (SSR disabled, SPA mode)
- **State Management**: Pinia
- **UI Libraries**:
  - Vuetify 3 (Material Design components, Russian locale configured)
  - Radix Vue (headless UI components)
  - Tailwind CSS with custom iridescent theme
- **Forms**: FormKit Vue
- **Markdown**: nuxt-markdown-render, @nuxtjs/mdc with Shiki syntax highlighting
- **Backend Integration**: @nuxtjs/strapi module
- **Real-time**: nuxt-socket-io
- **Icons**: MDI (Material Design Icons) and Lucide Vue Next

### Key Directories

- `components/` - Vue components organized by feature:
  - `main/` - Core layout components (Header, Hero, Sidebar, Tabs)
  - `prompt/` - Prompt library UI (cards, filters, search, grid)
  - `research/` - AI chat and research interface components
  - `ui/` - Reusable UI components
- `pages/` - File-based routing:
  - `index.vue` - Main prompt library page with search and filtering
  - `blogs.vue` - Blog/articles listing
  - `prompts/[promptSlug].vue` - Individual prompt detail pages
  - `research/[searchId].vue` - AI research/chat interface
  - `research/v2/[searchId].vue` - Alternative research UI version
  - `research/v3/[searchId].vue` - Another research UI iteration
  - `tests/` - Development test pages for various features
- `composables/` - Auto-imported composables for data fetching:
  - `useFetchArticles.js` - Fetches articles from Strapi via server proxy
  - `useFetchOneArticle.js` - Fetches single article
  - `useStrapiHelpers.js` - Strapi utility functions
  - `useSyncProps.js` - Props synchronization helper
- `server/api/` - Nitro server API routes:
  - `articles.js` - Server-side proxy for Strapi articles (bypasses CORS)
  - `airesponse.js` - AI response handler
  - `[searchId]/submit.js` - Research session submission
  - `[searchId]/form.js` - Form handling for research sessions
- `plugins/` - Nuxt plugins:
  - `vuetify.js` - Vuetify configuration (dark theme, Russian locale)
  - `formkit.client.js` - FormKit theming
  - `strapi.client.js` - Strapi client configuration
- `middleware/` - Route middleware (auth currently disabled)
- `assets/css/` - Custom styles:
  - `tailwind.css` - Tailwind directives
  - `perplexity-theme.css` - Perplexity-inspired styling
  - `iridescent-accents.css` - Custom gradient animations
  - `formkit-theme.css` - FormKit customization

### Data Flow Architecture

The app uses a **server-side proxy pattern** for Strapi integration:

1. Client components call composables (e.g., `useFetchArticles`)
2. Composables fetch from Nuxt server routes (`/api/articles`)
3. Server routes proxy to Strapi backend, handling CORS and authentication
4. Response data cached and returned to UI

**Key Point**: Always use server API routes (`server/api/`) for Strapi requests, never call Strapi directly from client code.

### Strapi Integration

- Strapi v5 configured via `@nuxtjs/strapi` module
- Entities: `categories`, `articles`
- JWT authentication stored in cookies (`strapi_jwt`)
- Server and client runtime config in `nuxt.config.js`
- Articles fetched with `populate=categories` for hierarchical data

### Component Patterns

- **Organization**: Components grouped by feature domain, not technical type
- **Auto-imports**: Components, composables, and Pinia stores auto-imported via `imports.dirs` config
- **Props Sync**: Use `useSyncProps` composable for two-way binding with parent state
- **Vuetify + Tailwind**: Both used together - Vuetify for complex components, Tailwind for layout/utility

### Custom Styling System

The app uses a distinctive **iridescent gradient theme**:

- Three-color gradient: pink (`#ff1493`), orange (`#ff6b00`), blue (`#00bfff`)
- Custom animations: `gradient-chaos`, `gradient-pulse`, `iridescent-glow`
- Tailwind utilities extended in `tailwind.config.js`
- Custom shadows for depth effects

### Markdown Rendering

- GitHub-flavored markdown via `github-markdown-css`
- Syntax highlighting with Shiji
- Used for rendering prompt templates and article content
- Both light and dark themes available (currently using light)

## Important Notes

- **SSR Disabled**: App runs in SPA mode (`ssr: false` in nuxt.config.js)
- **Port**: Development server runs on port 8080, not default 3000
- **Yarn Zero-Installs**: Uses `.yarn/cache` - do not commit `node_modules`
- **Russian Locale**: Primary language is Russian; Vuetify configured with `ru` locale
- **Authentication**: Strapi auth middleware exists but is currently commented out/disabled
- **ESLint**: Configured for TypeScript, Vue 3, Nuxt, and Prettier
- **Socket.io**: Configured for main connection to Strapi URL
