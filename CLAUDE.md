# aiportal_blog Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-03

## Active Technologies
- Nuxt 3.2.0 (Vue 3), TypeScript 5.9.2 + Vuetify 3 (UI components), Tailwind CSS (styling), @nuxtjs/mdc (Markdown rendering), @nuxtjs/strapi (CMS integration - may not be needed for static content), Pinia (state management) (001-speckit-constitution)
- Static files in `public/` directory for constitution content and downloadable assets (001-speckit-constitution)
- Nuxt 3.2.0 (Vue 3), TypeScript 5.9.2 + Vuetify 3 (UI components), Tailwind CSS (styling), @nuxtjs/strapi (CMS integration), Pinia (state management) (001-speckit-constitution)
- TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi, Pinia, @nuxtjs/mdc (Markdown rendering) (001-speckit-constitution)
- Strapi v5 CMS (Articles content type with type="speckit") (001-speckit-constitution)
- TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/mdc (Markdown rendering), Pinia (state management) (002-speckit-ui)
- N/A (client-side UI enhancement, no new storage requirements) (002-speckit-ui)
- Strapi v5 CMS (Articles content type with type="speckit", file uploads, diagram data fields) (003-speckit-view-enhancements)
- TypeScript 5.9.2, JavaScript ES2022 + Nuxt 3.2.0 (Vue 3.4.21), Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia (001-ssr-performance-optimization)
- N/A (static assets cached via PWA service worker, Strapi v5 CMS as backend) (001-ssr-performance-optimization)
- JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21) + Nuxt 3.2.0, Node.js 22 (via Docker), Yarn package manager (005-fix-nuxt-build)
- N/A (static build artifacts + Strapi v5 CMS for backend) (005-fix-nuxt-build)
- TypeScript 5.9.2, Vue 3.4.21 (Nuxt 3.2.0) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia (006-fix-speckits-positioning)
- N/A (static build artifacts + Strapi v5 CMS as backend) (006-fix-speckits-positioning)
- JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia, @nuxtjs/mdc, Mermaid 11.0.0 (001-pagespeed-optimization)
- Strapi v5 CMS (backend for speckits and categories) (001-speckit-category-filter)

- (001-fix-docker-build)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

# Add commands for 

## Code Style

: Follow standard conventions

## Recent Changes
- 001-fix-card-clicks: Added JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia, @nuxtjs/mdc
- 002-fix-docker-build: Added JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21) + Nuxt 3.2.0, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
- 001-speckit-category-filter: Added TypeScript 5.9.2, JavaScript ES2022 + Nuxt 3.2.0 (Vue 3.4.21), Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
