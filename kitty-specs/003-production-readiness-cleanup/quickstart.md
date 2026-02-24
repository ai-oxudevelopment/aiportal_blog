# Quickstart Guide: Production Readiness Cleanup

**Feature**: 003-production-readiness-cleanup
**Audience**: Developers
**Date**: 2025-02-24

---

## Overview

This guide helps you use the new configuration, logging, and error handling systems introduced in the production readiness cleanup.

---

## Table of Contents

1. [Configuration](#configuration)
2. [Logging](#logging)
3. [Error Handling](#error-handling)
4. [Type Safety](#type-safety)
5. [Migration Checklist](#migration-checklist)

---

## Configuration

### Accessing Config Values

```typescript
// In any component or composable
const config = useRuntimeConfig()

// Access public config
const apiUrl = config.public.apiBase
const cacheTtl = config.public.cacheTtl

// Access server-side only config
const serverSecret = config.apiSecret // Only available on server
```

### Adding New Config Values

1. **Define in nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      myNewValue: process.env.MY_NEW_VALUE || 'default'
    }
  }
})
```

2. **Add type definition** (create `types/config.ts`):
```typescript
interface RuntimeConfig {
  myNewValue: string
}

interface NuxtRuntimeConfig extends RuntimeConfig {}
```

3. **Use in code**:
```typescript
const config = useRuntimeConfig()
console.log(config.myNewValue)
```

---

## Logging

### Basic Usage

```typescript
// Import the logger
import { logger } from '~/infrastructure/logging/logger'

// Log at different levels
logger.error('Something went wrong', { userId: '123' })
logger.warn('Deprecated API used', { endpoint: '/api/old' })
logger.info('User logged in', { userId: '123' })
logger.debug('Debug info', { data: { foo: 'bar' } })
```

### With Request Context

```typescript
// In API route or server middleware
import { getLogger } from '~/infrastructure/logging/logger'

export default defineEventHandler((event) => {
  const logger = getLogger(event)
  
  logger.info('Processing request', {
    path: event.path,
    method: event.method
  })
})
```

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `error` | Errors that need attention | Failed API calls, exceptions |
| `warn` | Warnings that don't break flow | Deprecated features |
| `info` | Important events | User actions, state changes |
| `http` | HTTP request logging | API requests/responses |
| `debug` | Detailed debugging | Variable values, flow tracing |

---

## Error Handling

### Throwing Errors

```typescript
import { ApiError, ValidationError } from '~/infrastructure/errors'

// API error
throw new ApiError(
  'Failed to fetch data',
  '/api/articles',
  'GET',
  503
)

// Validation error
throw new ValidationError(
  'Invalid input',
  {
    email: ['Invalid email format'],
    password: ['Too short']
  }
)
```

### Catching and Handling Errors

```typescript
try {
  const data = await fetchData()
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    logger.error('API error', { endpoint: error.endpoint })
    showErrorToUser('Service unavailable, please try again')
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    showFormErrors(error.fields)
  } else {
    // Unknown error
    logger.error('Unexpected error', { error })
    showErrorToUser('Something went wrong')
  }
}
```

### Global Error Handler

The global error handler in `nuxt.config.ts` automatically:
1. Logs all errors
2. Maps error codes to user-friendly messages
3. Reports to error tracking (if configured)

---

## Type Safety

### Enabling Strict Mode

After migration, `tsconfig.json` will have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Dealing with `any` Types

**Bad** (avoid):
```typescript
const data: any = await fetch('/api/data')
```

**Good** (use proper types):
```typescript
interface ApiResponse {
  data: Article[]
  meta: PaginationMeta
}

const response = await fetch('/api/data') as ApiResponse
```

### Documenting Necessary `any`

If `any` is truly necessary:
```typescript
// @ts-expect-error: External library doesn't provide types
const externalLib = require('some-untyped-lib') as any
```

---

## Migration Checklist

### Configuration

- [ ] Move hardcoded URLs to `nuxt.config.ts`
- [ ] Add type definitions for config
- [ ] Test config access in components
- [ ] Verify environment-specific configs work

### Logging

- [ ] Replace `console.log` with `logger.info`
- [ ] Replace `console.error` with `logger.error`
- [ ] Add request context where appropriate
- [ ] Test log output in development

### Error Handling

- [ ] Wrap async operations in try-catch
- [ ] Use proper error classes (ApiError, ValidationError)
- [ ] Add user-friendly error messages
- [ ] Test error flows

### Type Safety

- [ ] Enable `noImplicitAny`
- [ ] Fix resulting type errors
- [ ] Enable `strictNullChecks`
- [ ] Fix resulting type errors
- [ ] Enable full `strict` mode
- [ ] Document remaining `any` types

---

## Common Patterns

### API Call with Logging and Error Handling

```typescript
import { logger } from '~/infrastructure/logging/logger'
import { ApiError } from '~/infrastructure/errors'

export async function fetchArticles() {
  try {
    logger.info('Fetching articles', { cacheKey: 'articles:all' })
    
    const response = await $fetch('/api/articles')
    
    logger.info('Articles fetched successfully', {
      count: response.data.length
    })
    
    return response
  } catch (error) {
    logger.error('Failed to fetch articles', { error })
    throw new ApiError(
      'Unable to load articles',
      '/api/articles',
      'GET',
      503,
      error
    )
  }
}
```

### Component with Error Boundary

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { logger } from '~/infrastructure/logging/logger'

const error = ref<string | null>(null)

onErrorCaptured((err) => {
  logger.error('Component error', {
    component: 'MyComponent',
    error: err
  })
  error.value = 'Something went wrong'
  return false // Prevent error from propagating
})
</script>

<template>
  <div v-if="error" class="error">
    {{ error }}
  </div>
  <div v-else>
    <!-- Normal content -->
  </div>
</template>
```

---

## Troubleshooting

### Config values are `undefined`

- Check that `nuxt.config.ts` is updated
- Restart the dev server after config changes
- Verify environment variables are set

### Logs not appearing

- Check log level in config
- Verify transport configuration
- Check console/server logs for errors

### Type errors after enabling strict mode

- Start with `noImplicitAny` only
- Gradually add more strict options
- Use `// @ts-ignore` sparingly and document why

---

## Next Steps

1. Review your code for hardcoded values → move to config
2. Find all `console.log` → replace with logger
3. Identify unhandled async operations → add error handling
4. Run TypeScript compiler → fix type errors

---

**Generated**: 2025-02-24
**Feature**: 003-production-readiness-cleanup
