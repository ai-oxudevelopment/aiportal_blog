# Contributing Guidelines

## Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd aiportal_blog/main/frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

## Code Style

### TypeScript
- **Strict mode enabled**: All TypeScript strict mode options are enabled
- **No `any` types**: Use proper TypeScript types. Document any exceptions in `types/any-justifications.ts`
- **Explicit returns**: Use explicit return types for public functions
- **Null safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

### Vue Components
- **Use Composition API**: Prefer `<script setup>` syntax
- **Type props**: Always define prop types with interfaces
- **Reactive state**: Use `ref` and `computed` from Vue

### Error Handling
```typescript
// Import error classes
import { ApiError, ValidationError } from '~/infrastructure/errors'

// Use appropriate error types
try {
  await apiCall()
} catch (error) {
  throw new ApiError('Failed to fetch data', '/api/endpoint', 'GET', 500)
}

// Log errors
const logger = getLogger()
logger.error('Operation failed', { error, context: 'additional-info' })
```

### Logging
```typescript
import { getLogger } from '~/infrastructure/logging'

const logger = getLogger()

// Use appropriate log levels
logger.error('Critical error', { error: err })
logger.warn('Warning message', { context })
logger.info('Info message', { data })
logger.debug('Debug message', { details })
```

## Configuration

- **Runtime config**: Use Nuxt runtime config for environment-specific values
- **Validation**: All config values are validated at startup
- **No hardcoded values**: Never hardcode URLs, API keys, or config values

```typescript
// Access runtime config
const config = useRuntimeConfig()
const strapiUrl = config.public.strapiUrl
```

## Adding New Features

1. **Configuration**: Add any new config to `nuxt.config.ts`
2. **Types**: Define TypeScript types in `types/` directory
3. **Logging**: Use structured logging with appropriate levels
4. **Error Handling**: Wrap async operations in try-catch with proper error types
5. **Testing**: Add integration tests for new functionality

## Testing

### Run Tests
```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e

# Type checking
yarn typecheck
```

### Test Structure
```
tests/
├── integration/
│   ├── config.test.ts
│   ├── logging.test.ts
│   └── errors.test.ts
└── e2e/
    └── smoke.spec.ts
```

## Git Workflow

1. **Branch naming**: Use feature branches (`feature/description`, `fix/bug-id`)
2. **Commit messages**: Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
3. **Before pushing**:
   - Run `yarn typecheck`
   - Run `yarn test`
   - Ensure no console errors in dev mode

## Architecture

The project follows Clean Architecture principles:

- **Domain**: Business entities and interfaces (`src/domain/`)
- **Application**: Use cases and business logic (`src/application/`)
- **Infrastructure**: External integrations (`src/infrastructure/`)
- **Presentation**: UI components and composables (`src/presentation/`)

## Performance

- **Bundle size**: Check with `ANALYZE=true yarn build`
- **Lighthouse**: Run with `yarn lighthouse`
- **Lazy loading**: Use dynamic imports for large components

## Getting Help

- Check `CLAUDE.md` for project overview
- Read `kitty-specs/001-clean-architecture-refactoring/` for architecture details
- Review test files for usage examples
