# AI Portal Blog - Production Readiness

## Overview

AI Portal Blog is a Nuxt 3 SSR application serving as a library of AI tools, prompts, and "speckits" (specialized instruction kits). Content is managed via Strapi v5 CMS.

## Production Readiness Cleanup (Feature 003)

This project has undergone comprehensive production readiness improvements:

### Completed Work Packages

1. **WP01: Configuration Foundation**
   - Runtime config pattern implementation
   - Configuration validation plugin
   - Type-safe config interfaces
   - Removed hardcoded values

2. **WP02: Logging Infrastructure**
   - Winston structured logging
   - Environment-appropriate log levels
   - Trace context for request tracking
   - Production-friendly JSON format

3. **WP03: Error Handling System**
   - Custom error class hierarchy (AppError, ApiError, ValidationError, ConfigError, NetworkError)
   - Vue error boundaries
   - User-friendly error messages
   - Centralized error handler

4. **WP04: Type Safety Phase 1**
   - Comprehensive API type definitions
   - Replaced all `any` types in infrastructure layer
   - Enabled `noImplicitAny` in tsconfig.json

5. **WP05: Type Safety Phase 2**
   - Enabled full TypeScript strict mode
   - Created `any-justifications.ts` for documented exceptions
   - Proper null handling with strictNullChecks

6. **WP06: Performance Optimization**
   - Lighthouse CI configuration
   - Bundle analysis tool integration
   - Route rules for caching and ISR
   - Vite build optimizations with manual chunks

7. **WP07: Testing and Polish**
   - Integration tests for config, logging, and error handling
   - E2E smoke tests
   - Contributing guidelines
   - Updated documentation

## Quick Start

```bash
cd frontend
yarn install
yarn dev
```

## Environment Variables

```bash
# Required
STRAPI_URL=http://localhost:1337
PORT=8080

# Optional
NUXT_PUBLIC_YANDEX_METRIKA_ID=<id>
LOG_LEVEL=info
CACHE_ENABLED=true
```

## Development

### Commands
```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn typecheck        # TypeScript type check
yarn test             # Run tests
yarn lighthouse       # Run Lighthouse audit
ANALYZE=true yarn build # Analyze bundle size
```

### Code Style
- TypeScript strict mode enabled
- No `any` types without justification (see `types/any-justifications.ts`)
- Winston structured logging
- Custom error classes extending AppError
- Runtime config validation

See [CONTRIBUTING.md](frontend/CONTRIBUTING.md) for detailed guidelines.

## Architecture

The project follows Clean Architecture principles:

```
src/
├── domain/          # Business entities and interfaces
├── application/     # Use cases and business logic
├── infrastructure/  # External integrations (Strapi, cache, logging, errors)
└── presentation/    # UI components and composables
```

## Testing

```bash
# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e

# Type checking
yarn typecheck
```

## Performance

- **SSR**: Server-side rendering for SEO and fast FCP
- **Caching**: Stale-While-Revalidate (5min fresh, 1hr stale)
- **PWA**: Service worker with strategic caching
- **Bundle Optimization**: Code splitting and lazy loading

Run `yarn lighthouse` to check performance scores (target: 80+).

## Troubleshooting

### Configuration Errors
If you see configuration errors at startup:
1. Check `.env` file exists
2. Verify `STRAPI_URL` is a valid URL
3. Ensure all required environment variables are set

### Type Errors
If TypeScript shows errors:
1. Run `yarn typecheck`
2. Check for unjustified `any` types
3. Verify strict mode compliance

### Performance Issues
If the app is slow:
1. Run `ANALYZE=true yarn build` to check bundle size
2. Run `yarn lighthouse` for performance audit
3. Check cache settings in `nuxt.config.ts`

## Documentation

- [CLAUDE.md](CLAUDE.md) - Project overview and architecture
- [CONTRIBUTING.md](frontend/CONTRIBUTING.md) - Development guidelines
- [kitty-specs/003-production-readiness-cleanup/](kitty-specs/003-production-readiness-cleanup/) - Feature specification
