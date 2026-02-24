---
work_package_id: WP03
title: Error Handling System
lane: "doing"
dependencies: []
base_branch: 003-production-readiness-cleanup-WP02
base_commit: b1fbc10cea71fd58cc48d1d8e930da47c93ce74f
created_at: '2026-02-24T12:53:12.048390+00:00'
subtasks: [T014, T015, T016, T017, T018, T019]
shell_pid: "31449"
agent: "claude"
history:
- date: 2025-02-24
  action: Created
  author: spec-kitty.tasks
---

# Work Package: Error Handling System

**ID**: WP03
**Priority**: P1 (Enables graceful error handling)
**Estimated Size**: ~380 lines
**Status**: Planned

---

## Objective

Implement a comprehensive error handling system with custom error classes, global error handler, and error boundaries. This ensures all errors are caught, logged, and presented to users in a friendly way.

## Context

The current codebase lacks consistent error handling:
- Async operations may throw unhandled errors
- No error boundaries for component errors
- Generic error messages don't help users
- Errors not logged for debugging

By implementing error classes and handlers:
- Errors are categorized by type (API, validation, config, network)
- Global handler catches and logs all errors
- Users see friendly messages
- Developers can debug with detailed logs

---

## Subtasks

### T014: Create Error Class Hierarchy

**Purpose**: Define custom error classes for different error types.

**Steps**:
1. Create `frontend/src/infrastructure/errors/AppError.ts`:
   ```typescript
   import type { ErrorJson } from '~/contracts/config-types'
   
   export abstract class AppError extends Error {
     constructor(
       message: string,
       public readonly code: string,
       public readonly statusCode: number = 500,
       public readonly isOperational: boolean = true
     ) {
       super(message)
       this.name = this.constructor.name
       Error.captureStackTrace(this, this.constructor)
     }
   
     toJSON(): ErrorJson {
       return {
         name: this.name,
         code: this.code,
         message: this.message,
         statusCode: this.statusCode,
       }
     }
   }
   ```

2. Create `frontend/src/infrastructure/errors/ApiError.ts`:
   ```typescript
   import { AppError } from './AppError'
   import type { ApiErrorJson } from '~/contracts/config-types'
   
   export class ApiError extends AppError {
     constructor(
       message: string,
       public readonly endpoint: string,
       public readonly method: string,
       statusCode: number = 500,
       public readonly originalError?: unknown
     ) {
       super(message, 'API_ERROR', statusCode)
     }
   
     toJSON(): ApiErrorJson {
       return {
         ...super.toJSON(),
         endpoint: this.endpoint,
         method: this.method,
       }
     }
   }
   ```

3. Create `frontend/src/infrastructure/errors/ValidationError.ts`:
   ```typescript
   import { AppError } from './AppError'
   import type { ValidationErrorJson } from '~/contracts/config-types'
   
   export class ValidationError extends AppError {
     constructor(
       message: string,
       public readonly fields: Record<string, string[]>
     ) {
       super(message, 'VALIDATION_ERROR', 400)
     }
   
     toJSON(): ValidationErrorJson {
       return {
         ...super.toJSON(),
         fields: this.fields,
       }
     }
   }
   ```

4. Create `frontend/src/infrastructure/errors/ConfigError.ts`:
   ```typescript
   import { AppError } from './AppError'
   import type { ConfigErrorJson } from '~/contracts/config-types'
   
   export class ConfigError extends AppError {
     constructor(
       message: string,
       public readonly configKey: string,
       public readonly expectedType?: string
     ) {
       super(message, 'CONFIG_ERROR', 500)
       this.isOperational = false // Config errors are not recoverable
     }
   
     toJSON(): ConfigErrorJson {
       return {
         ...super.toJSON(),
         configKey: this.configKey,
         expectedType: this.expectedType,
       }
     }
   }
   ```

5. Create `frontend/src/infrastructure/errors/NetworkError.ts`:
   ```typescript
   import { AppError } from './AppError'
   import type { NetworkErrorJson } from '~/contracts/config-types'
   
   export class NetworkError extends AppError {
     constructor(
       message: string,
       public readonly url: string,
       public readonly originalError?: unknown
     ) {
       super(message, 'NETWORK_ERROR', 503)
     }
   
     toJSON(): NetworkErrorJson {
       return {
         ...super.toJSON(),
         url: this.url,
       }
     }
   }
   ```

6. Create `frontend/src/infrastructure/errors/index.ts`:
   ```typescript
   export * from './AppError'
   export * from './ApiError'
   export * from './ValidationError'
   export * from './ConfigError'
   export * from './NetworkError'
   
   // Convenience export
   export * from '~/contracts/config-types'
   ```

**Files created**:
- `frontend/src/infrastructure/errors/AppError.ts`
- `frontend/src/infrastructure/errors/ApiError.ts`
- `frontend/src/infrastructure/errors/ValidationError.ts`
- `frontend/src/infrastructure/errors/ConfigError.ts`
- `frontend/src/infrastructure/errors/NetworkError.ts`
- `frontend/src/infrastructure/errors/index.ts`

**Validation**:
- [ ] All error classes compile
- [ ] Error classes match contract interfaces
- [ ] toJSON() methods work correctly

---

### T015: Implement Global Error Handler

**Purpose**: Add global error handler in nuxt.config.ts.

**Steps**:
1. Update `frontend/nuxt.config.ts`:
   ```typescript
   import { getLogger } from '~/infrastructure/logging'
   import type { AppError } from '~/infrastructure/errors'
   
   export default defineNuxtConfig({
     // ... existing config ...
     
     vue: {
       onError: (err, instance, info) => {
         const logger = getLogger()
         
         // Log error with context
         logger.error('Vue error handler caught error', {
           error: err instanceof Error ? {
             message: err.message,
             stack: err.stack,
             name: err.name,
           } : err,
           componentName: instance?.$options?.name || 'Unknown',
           lifecycleHook: info,
         })
         
         // In development, show full error
         if (process.env.NODE_ENV === 'development') {
           console.error('Vue error:', err)
           console.error('Info:', info)
         }
       }
     },
     
     // Hook into Nitro error handler (server-side)
     nitro: {
       errorHandler: (error, event) => {
         const logger = getLogger(event)
         
         logger.error('Nitro error handler caught error', {
           error: error instanceof Error ? {
             message: error.message,
             stack: error.stack,
             name: error.name,
           } : error,
           path: event.path,
           method: event.method,
         })
       }
     }
   })
   ```

2. Create `frontend/server/error-handler.ts`:
   ```typescript
   import { getLogger } from '~/infrastructure/logging'
   import { AppError } from '~/infrastructure/errors'
   
   // User-friendly error messages
   const errorMessages: Record<string, { title: string; message: string; canRetry: boolean }> = {
     API_ERROR: {
       title: 'Service Unavailable',
       message: 'Unable to connect to the service. Please try again later.',
       canRetry: true,
     },
     VALIDATION_ERROR: {
       title: 'Invalid Input',
       message: 'Please check your input and try again.',
       canRetry: false,
     },
     NETWORK_ERROR: {
       title: 'Connection Error',
       message: 'Unable to reach the server. Please check your connection.',
       canRetry: true,
     },
     CONFIG_ERROR: {
       title: 'Configuration Error',
       message: 'The application is not configured correctly.',
       canRetry: false,
     },
   }
   
   export function getUserFriendlyMessage(error: Error): { title: string; message: string; canRetry: boolean } {
     if (error instanceof AppError) {
       return errorMessages[error.code] || {
         title: 'Error',
         message: 'An unexpected error occurred.',
         canRetry: false,
       }
     }
     
     return {
       title: 'Error',
       message: 'An unexpected error occurred.',
       canRetry: false,
     }
   }
   
   export function handleApiError(error: unknown, context: { endpoint: string; method: string }): AppError {
     if (error instanceof AppError) {
       return error
     }
   
     if (error instanceof Error) {
       return new ApiError(
         error.message,
         context.endpoint,
         context.method,
         500,
         error
       )
     }
   
     return new ApiError(
       'Unknown error occurred',
       context.endpoint,
       context.method,
       500
     )
   }
   ```

**Files created**:
- `frontend/server/error-handler.ts`

**Files modified**:
- `frontend/nuxt.config.ts` (add error handlers)

**Validation**:
- [ ] Vue errors are caught and logged
- [ ] Nitro errors are caught and logged
- [ ] Error messages are user-friendly
- [ ] App doesn't crash on errors

---

### T016: Create Vue Error Boundary Component

**Purpose**: Create reusable error boundary component.

**Steps**:
1. Create `frontend/components/ErrorBoundary.vue`:
   ```vue
   <script setup lang="ts">
   import { onErrorCaptured, ref } from 'vue'
   import { getLogger } from '~/infrastructure/logging'
   import { getUserFriendlyMessage } from '~/server/error-handler'
   
   interface Props {
     fallback?: string
     showDetails?: boolean
   }
   
   const props = withDefaults(defineProps<Props>(), {
     fallback: 'Something went wrong.',
     showDetails: false,
   })
   
   const emit = defineEmits<{
     error: [error: Error]
   }>()
   
   const error = ref<Error | null>(null)
   const logger = getLogger()
   
   onErrorCaptured((err: Error) => {
     logger.error('ErrorBoundary caught error', {
       error: {
         message: err.message,
         stack: err.stack,
         name: err.name,
       },
     })
   
     error.value = err
     emit('error', err)
   
     // Return false to prevent error from propagating further
     return false
   })
   
   function retry() {
     error.value = null
   }
   </script>
   
   <template>
     <slot v-if="!error" />
     <div v-else class="error-boundary">
       <div class="error-icon">⚠️</div>
       <h3>{{ fallback }}</h3>
       <p v-if="showDetails && error">{{ error.message }}</p>
       <button @click="retry" class="retry-button">Try Again</button>
     </div>
   </template>
   
   <style scoped>
   .error-boundary {
     padding: 2rem;
     text-align: center;
     border: 1px solid #ef4444;
     border-radius: 0.5rem;
     background: #fef2f2;
   }
   
   .error-icon {
     font-size: 3rem;
     margin-bottom: 1rem;
   }
   
   .retry-button {
     margin-top: 1rem;
     padding: 0.5rem 1rem;
     background: #ef4444;
     color: white;
     border: none;
     border-radius: 0.25rem;
     cursor: pointer;
   }
   </style>
   ```

2. Create usage example in documentation.

**Files created**:
- `frontend/components/ErrorBoundary.vue`

**Validation**:
- [ ] Component catches child errors
- [ ] Retry button resets error state
- [ ] Errors are logged
- [ ] Works in SSR

---

### T017: Wrap Async Operations (Server Routes)

**Purpose**: Add try-catch to all server API routes.

**Steps**:
1. For each server route, wrap in try-catch:
   ```typescript
   // server/api/articles.get.ts
   import { getLogger } from '~/infrastructure/logging'
   import { handleApiError } from '~/server/error-handler'
   
   export default defineEventHandler(async (event) => {
     const logger = getLogger(event)
     
     try {
       // ... existing code ...
       return response
     } catch (err) {
       const apiError = handleApiError(err, {
         endpoint: '/api/articles',
         method: 'GET',
       })
       
       logger.error('articles.get: Failed', {
         error: apiError.toJSON(),
       })
       
       throw createError({
         statusCode: apiError.statusCode,
         statusMessage: apiError.message,
       })
     }
   })
   ```

2. Focus on these routes:
   - `server/api/articles.get.ts`
   - `server/api/speckits.get.ts`
   - `server/api/speckits/[slug].get.ts`
   - Any other async server routes

**Files modified**:
- All server API routes

**Validation**:
- [ ] All routes have try-catch
- [ ] Errors are logged with context
- [ ] Appropriate HTTP status codes returned
- [ ] API functionality unchanged

---

### T018: Wrap Async Operations (Composables)

**Purpose**: Add try-catch to all async composables.

**Steps**:
1. For each composable with async operations, add error handling:
   ```typescript
   // composables/useFetchArticles.ts
   import { getLogger } from '~/infrastructure/logging'
   import { ApiError, NetworkError } from '~/infrastructure/errors'
   
   export function useFetchArticles() {
     const articles = ref([])
     const loading = ref(true)
     const error = ref<Error | null>(null)
     const logger = getLogger()
     
     const fetchArticles = async (filter?: any) => {
       loading.value = true
       error.value = null
       
       try {
         logger.info('useFetchArticles: Fetching articles', { filter })
         
         const config = useRuntimeConfig()
         const response = await $fetch(`${config.public.strapiUrl}/api/articles`)
         
         articles.value = response.data || []
         
         logger.info('useFetchArticles: Fetched successfully', {
           count: articles.value.length,
         })
       } catch (err) {
         logger.error('useFetchArticles: Failed to fetch', { error: err })
         
         // Wrap in appropriate error type
         if (err instanceof TypeError && err.message.includes('fetch')) {
           error.value = new NetworkError(
             'Failed to connect to server',
             config.public.strapiUrl,
             err
           )
         } else {
           error.value = new ApiError(
             'Failed to fetch articles',
             '/api/articles',
             'GET',
             503,
             err
           )
         }
       } finally {
         loading.value = false
       }
     }
     
     // Auto-fetch on call
     fetchArticles()
     
     return { articles, loading, error, fetchArticles }
   }
   ```

2. Focus on these composables:
   - `composables/useFetchArticles.ts`
   - `composables/useFileDownload.ts`
   - Any other async composables

**Files modified**:
- All async composables

**Validation**:
- [ ] All async operations wrapped
- [ ] Errors are caught and stored
- [ ] Appropriate error types used
- [ ] Error state exposed to callers
- [ ] Composables work as before

---

### T019: Add User-Friendly Error Messages

**Purpose**: Map error codes to user-friendly messages.

**Steps**:
1. Update `frontend/server/error-handler.ts` with comprehensive messages:
   ```typescript
   const errorMessages: Record<string, { title: string; message: string; canRetry: boolean }> = {
     API_ERROR: {
       title: 'Service Unavailable',
       message: 'Unable to connect to the service. Please try again later.',
       canRetry: true,
     },
     VALIDATION_ERROR: {
       title: 'Invalid Input',
       message: 'Please check your input and try again.',
       canRetry: false,
     },
     NETWORK_ERROR: {
       title: 'Connection Error',
       message: 'Unable to reach the server. Please check your connection.',
       canRetry: true,
     },
     CONFIG_ERROR: {
       title: 'Configuration Error',
       message: 'The application is not configured correctly. Please contact support.',
       canRetry: false,
     },
     NOT_FOUND: {
       title: 'Not Found',
       message: 'The requested resource was not found.',
       canRetry: false,
     },
     UNAUTHORIZED: {
       title: 'Unauthorized',
       message: 'You need to log in to access this resource.',
       canRetry: false,
     },
   }
   
   export function getUserFriendlyMessage(
     error: Error,
     statusCode?: number
   ): { title: string; message: string; canRetry: boolean } {
     // Check for AppError with code
     if (error instanceof AppError) {
       return errorMessages[error.code] || errorMessages.API_ERROR
     }
     
     // Map HTTP status codes to messages
     if (statusCode) {
       const statusMessages: Record<number, ReturnType<typeof getUserFriendlyMessage>> = {
         400: errorMessages.VALIDATION_ERROR,
         401: errorMessages.UNAUTHORIZED,
         403: errorMessages.UNAUTHORIZED,
         404: errorMessages.NOT_FOUND,
         500: errorMessages.API_ERROR,
         502: errorMessages.NETWORK_ERROR,
         503: errorMessages.API_ERROR,
         504: errorMessages.NETWORK_ERROR,
       }
       
       return statusMessages[statusCode] || errorMessages.API_ERROR
     }
   
     // Default error
     return errorMessages.API_ERROR
   }
   ```

2. Create error display component:
   ```vue
   <!-- components/ErrorMessage.vue -->
   <script setup lang="ts">
   import { getUserFriendlyMessage } from '~/server/error-handler'
   
   interface Props {
     error: Error
     statusCode?: number
   }
   
   const props = defineProps<Props>()
   const message = computed(() => getUserFriendlyMessage(props.error, props.statusCode))
   </script>
   
   <template>
     <div class="error-message">
       <div class="error-icon">⚠️</div>
       <h3>{{ message.title }}</h3>
       <p>{{ message.message }}</p>
       <button v-if="message.canRetry" @click="$emit('retry')" class="retry-button">
         Try Again
       </button>
     </div>
   </template>
   ```

**Files created**:
- `frontend/components/ErrorMessage.vue`

**Files modified**:
- `frontend/server/error-handler.ts`

**Validation**:
- [ ] All error codes have messages
- [ ] Messages are user-friendly
- [ ] Can retry is accurate
- [ ] Component displays correctly

---

## Test Strategy

**Manual testing**:
1. Trigger API errors (disconnect network, invalid URLs)
2. Verify error boundaries catch component errors
3. Verify user-friendly messages appear
4. Verify errors are logged

**Integration tests** (to be added in WP07):
- Error classes serialize correctly
- Error handler catches all error types
- User messages are appropriate

---

## Definition of Done

- [ ] All error classes created
- [ ] Global error handler configured
- [ ] Error boundary component created
- [ ] Server routes have error handling
- [ ] Composables have error handling
- [ ] User-friendly error messages defined
- [ ] Errors logged with full context
- [ ] Zero regression in functionality

---

## Risks

| Risk | Mitigation |
|------|------------|
| Some errors not caught | Test error scenarios thoroughly |
| Error boundaries don't work in SSR | Test in SSR mode |
| User messages not helpful | Get feedback from real users |
| Error logging creates noise | Use appropriate log levels |

---

## Reviewer Guidance

**What to verify**:
1. All error classes extend AppError
2. Error handler catches Vue and Nitro errors
3. Error boundary component works
4. Async operations have try-catch
5. User messages are friendly
6. Errors are logged with context

**Integration points**:
- Depends on WP02 (Logging) for error logging
- WP04 (Type Safety) will add error types

---

## Implementation Command

```bash
spec-kitty implement WP03 --base WP02
```

Base: WP02 (for logger integration)

## Activity Log

- 2026-02-24T12:53:12Z – claude – shell_pid=31449 – lane=doing – Assigned agent via workflow command
