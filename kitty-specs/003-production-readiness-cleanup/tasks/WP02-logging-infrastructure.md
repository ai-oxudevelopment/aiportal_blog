---
work_package_id: WP02
title: Logging Infrastructure
lane: "for_review"
dependencies: []
base_branch: main
base_commit: 01dfa5e8dd9309e37476ed695ac935a7b22fd9e1
created_at: '2026-02-24T12:52:19.957357+00:00'
subtasks: [T007, T008, T009, T010, T011, T012, T013]
shell_pid: "31260"
agent: "claude"
history:
- date: 2025-02-24
  action: Created
  author: spec-kitty.tasks
---

# Work Package: Logging Infrastructure

**ID**: WP02
**Priority**: P1 (Enables better debugging)
**Estimated Size**: ~420 lines
**Status**: Planned

---

## Objective

Implement Winston-based structured logging to replace all console.log statements throughout the codebase. This provides consistent, production-ready logging with levels, context, and request tracing.

## Context

The current codebase uses `console.log` and `console.error` scattered throughout. This is problematic because:
- No log levels (everything is logged equally)
- No structured context for debugging
- No request tracing for distributed systems
- Production logs are not useful

By implementing Winston logging:
- Logs have levels (error, warn, info, http, debug)
- Structured metadata (request_id, timestamp, user_id)
- Request tracing across API calls
- Console colors in development, JSON in production

---

## Subtasks

### T007: Install Winston and Dependencies

**Purpose**: Install Winston logging framework.

**Steps**:
1. Install packages:
   ```bash
   cd frontend
   npm install winston winston-daily-rotate-file
   ```

2. Add TypeScript types:
   ```bash
   npm install -D @types/winston
   ```

3. Verify installation:
   ```bash
   npm list winston
   ```

**Packages installed**:
- `winston` - Core logging library
- `winston-daily-rotate-file` - File rotation for production logs
- `@types/winston` - TypeScript types

**Validation**:
- [ ] Winston installed in package.json
- [ ] No install errors
- [ ] TypeScript types available

---

### T008: Create Logger Infrastructure

**Purpose**: Set up the core logging infrastructure.

**Steps**:
1. Create `frontend/src/infrastructure/logging/logger.ts`:
   ```typescript
   import { type ILogger } from '~/contracts/config-types'
   
   // Singleton logger instance
   let loggerInstance: ILogger | null = null
   
   export function setLogger(logger: ILogger): void {
     loggerInstance = logger
   }
   
   export function getLogger(): ILogger {
     if (!loggerInstance) {
       // Fallback to console if logger not initialized
       return createConsoleLogger()
     }
     return loggerInstance
   }
   
   function createConsoleLogger(): ILogger {
     return {
       error: (message: string, meta?: Record<string, unknown>) => {
         console.error('[ERROR]', message, meta || '')
       },
       warn: (message: string, meta?: Record<string, unknown>) => {
         console.warn('[WARN]', message, meta || '')
       },
       info: (message: string, meta?: Record<string, unknown>) => {
         console.info('[INFO]', message, meta || '')
       },
       http: (message: string, meta?: Record<string, unknown>) => {
         console.log('[HTTP]', message, meta || '')
       },
       debug: (message: string, meta?: Record<string, unknown>) => {
         console.log('[DEBUG]', message, meta || '')
       },
     }
   }
   ```

2. Create `frontend/src/infrastructure/logging/winston.ts`:
   ```typescript
   import winston from 'winston'
   import DailyRotateFile from 'winston-daily-rotate-file'
   import type { ILogger, LogMeta } from '~/contracts/config-types'
   
   // Create Winston logger
   export function createWinstonLogger(options: {
     level: string
     format: 'json' | 'text'
     environment: 'development' | 'staging' | 'production'
   }): ILogger {
     const transports: winston.transport[] = []
     
     // Console transport (always added)
     transports.push(
       new winston.transports.Console({
         format: winston.format.combine(
           winston.format.colorize({ all: options.environment === 'development' }),
           winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
           winston.format.printf(({ level, message, timestamp, ...meta }) => {
             const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
             return `${timestamp} [${level}]: ${message} ${metaStr}`
           })
         ),
       })
     )
     
     // File transport (production only)
     if (options.environment === 'production') {
       transports.push(
         new DailyRotateFile({
           filename: 'logs/error-%DATE%.log',
           datePattern: 'YYYY-MM-DD',
           level: 'error',
           format: winston.format.combine(
             winston.format.timestamp(),
             winston.format.json()
           ),
         })
       )
       
       transports.push(
         new DailyRotateFile({
           filename: 'logs/combined-%DATE%.log',
           datePattern: 'YYYY-MM-DD',
           format: winston.format.combine(
             winston.format.timestamp(),
             winston.format.json()
           ),
         })
       )
     }
     
     const winstonLogger = winston.createLogger({
       level: options.level,
       transports,
     })
     
     // Convert to ILogger interface
     return {
       error: (message: string, meta?: LogMeta) => {
         winstonLogger.error(message, meta)
       },
       warn: (message: string, meta?: LogMeta) => {
         winstonLogger.warn(message, meta)
       },
       info: (message: string, meta?: LogMeta) => {
         winstonLogger.info(message, meta)
       },
       http: (message: string, meta?: LogMeta) => {
         winstonLogger.http(message, meta)
       },
       debug: (message: string, meta?: LogMeta) => {
         winstonLogger.debug(message, meta)
       },
     }
   }
   ```

3. Create `frontend/src/infrastructure/logging/index.ts`:
   ```typescript
   export * from './logger'
   export * from './winston'
   export * from './context'
   ```

**Files created**:
- `frontend/src/infrastructure/logging/logger.ts`
- `frontend/src/infrastructure/logging/winston.ts`
- `frontend/src/infrastructure/logging/index.ts`

**Validation**:
- [ ] TypeScript compiles without errors
- [ ] ILogger interface matches contract
- [ ] All log levels implemented

---

### T009: Implement TraceContext

**Purpose**: Create request tracing context for distributed logging.

**Steps**:
1. Create `frontend/src/infrastructure/logging/context.ts`:
   ```typescript
   import { type TraceContext, type TraceContextOptions } from '~/contracts/config-types'
   
   // Store trace context in async local storage (server) or a global (client)
   let currentContext: TraceContext | null = null
   
   export function createTraceContext(options?: Partial<TraceContextOptions>): TraceContext {
     return {
       requestId: options?.generateId?.() || generateRequestId(),
       timestamp: new Date().toISOString(),
       userId: options?.userId,
       sessionId: options?.sessionId,
       metadata: options?.metadata || {},
     }
   }
   
   export function getTraceContext(): TraceContext | null {
     return currentContext
   }
   
   export function setTraceContext(context: TraceContext): void {
     currentContext = context
   }
   
   export function clearTraceContext(): void {
     currentContext = null
   }
   
   export function withTraceContext<T>(context: TraceContext, fn: () => T): T {
     const previous = currentContext
     currentContext = context
     try {
       return fn()
     } finally {
       currentContext = previous
     }
   }
   
   function generateRequestId(): string {
     return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
   }
   
   // Extract request ID from headers
   export function extractRequestId(headers: Headers): string | undefined {
     return headers.get('x-request-id') || undefined
   }
   ```

2. Create server middleware for request tracing:
   ```typescript
   // server/middleware/tracing.ts
   import { getTraceContext, setTraceContext, createTraceContext } from '~/infrastructure/logging/context'
   
   export default defineEventHandler((event) => {
     const requestId = getHeader(event, 'x-request-id') || createTraceContext().requestId
     
     setTraceContext({
       requestId,
       timestamp: new Date().toISOString(),
       sessionId: getCookie(event, 'session-id') || undefined,
     })
     
     event.context.traceContext = getTraceContext()
   })
   ```

**Files created**:
- `frontend/src/infrastructure/logging/context.ts`
- `frontend/server/middleware/tracing.ts` (optional, for server-side tracing)

**Validation**:
- [ ] TraceContext creates unique IDs
- [ ] Context can be set and retrieved
- [ ] Request ID extraction from headers works

---

### T010: Create Nuxt Plugin for Logger

**Purpose**: Inject logger into Nuxt app context.

**Steps**:
1. Create `frontend/plugins/logger.ts`:
   ```typescript
   import { setLogger, createWinstonLogger } from '~/infrastructure/logging'
   
   export default defineNuxtPlugin((nuxtApp) => {
     const config = useRuntimeConfig()
     
     // Create logger instance
     const logger = createWinstonLogger({
       level: config.public.logLevel || 'info',
       format: config.public.environment === 'production' ? 'json' : 'text',
       environment: config.public.environment || 'development',
     })
     
     // Set logger globally
     setLogger(logger)
     
     // Provide logger to app
     nuxtApp.provide('logger', logger)
   })
   ```

2. Update `nuxt.config.ts` to register plugin:
   ```typescript
   plugins: ['~/plugins/logger.ts']
   ```

3. Add log level to runtime config:
   ```typescript
   runtimeConfig: {
     public: {
       // ... existing config ...
       logLevel: process.env.LOG_LEVEL || 'info',
     }
   }
   ```

**Files created**:
- `frontend/plugins/logger.ts`

**Files modified**:
- `frontend/nuxt.config.ts` (add plugin and logLevel)

**Validation**:
- [ ] Plugin loads on startup
- [ ] Logger is available via `useNuxtApp().logger`
- [ ] Logger writes to console

---

### T011: Replace console.log with logger.info

**Purpose**: Replace all console.log statements with structured logging.

**Steps**:
1. Find all console.log statements:
   ```bash
   grep -r "console\.log" --include="*.ts" --include="*.vue" frontend/
   ```

2. For each console.log, replace with logger:
   ```typescript
   // Before
   console.log('[useFetchArticles] Fetching articles...')
   
   // After
   const logger = getLogger()
   logger.info('useFetchArticles: Fetching articles...', {
     cacheKey: 'articles:all',
   })
   ```

3. Focus on these files:
   - `frontend/composables/useFetchArticles.ts`
   - `frontend/composables/useFileDownload.ts`
   - `frontend/components/**/*.vue` (script sections)
   - Any other files with console.log

4. Use appropriate log levels:
   - User actions → `info`
   - Data fetching → `info` or `http`
   - Debug info → `debug`
   - Important state changes → `info`

**Files modified**:
- All files with console.log (from grep)

**Validation**:
- [ ] No console.log remain in source files
- [ ] Logger output appears in console
- [ ] Log messages are structured
- [ ] App functionality unchanged

---

### T012: Replace console.error with logger.error

**Purpose**: Replace all console.error statements with structured error logging.

**Steps**:
1. Find all console.error statements:
   ```bash
   grep -r "console\.error" --include="*.ts" --include="*.vue" frontend/
   ```

2. For each console.error, replace with logger:
   ```typescript
   // Before
   console.error('[useFetchArticles] Failed to fetch:', error)
   
   // After
   const logger = getLogger()
   logger.error('useFetchArticles: Failed to fetch', {
     error: error.message,
     stack: error.stack,
     endpoint: '/api/articles',
   })
   ```

3. For API routes, add context:
   ```typescript
   // In server/api/articles.get.ts
   const logger = getLogger(event)
   logger.error('articles.get: Failed to fetch from Strapi', {
     error: err.message,
     apiUrl: strapiUrl.toString(),
     traceContext: event.context.traceContext,
   })
   ```

**Files modified**:
- All files with console.error (from grep)

**Validation**:
- [ ] No console.error remain in source files
- [ ] Error logs include error details
- [ ] Stack traces captured
- [ ] Context included where available

---

### T013: Add Logging to Server API Routes

**Purpose**: Add structured logging to all server API routes.

**Steps**:
1. For each server API route, add logging:
   ```typescript
   // server/api/articles.get.ts
   import { getLogger } from '~/infrastructure/logging'
   
   export default defineEventHandler(async (event) => {
     const logger = getLogger(event)
     const traceContext = event.context.traceContext
     
     logger.info('articles.get: Fetching articles', {
       requestId: traceContext?.requestId,
       query: getQuery(event),
     })
     
     try {
       // ... existing code ...
       
       logger.info('articles.get: Successfully fetched', {
         count: response.data?.length || 0,
         requestId: traceContext?.requestId,
       })
       
       return response
     } catch (err) {
       logger.error('articles.get: Failed to fetch', {
         error: err.message,
         requestId: traceContext?.requestId,
       })
       throw err
     }
   })
   ```

2. Add logging to these routes:
   - `server/api/articles.get.ts`
   - `server/api/speckits.get.ts`
   - `server/api/speckits/[slug].get.ts`
   - Any other server routes

3. Include in each log:
   - Request ID (from trace context)
   - Query parameters
   - Response count/status
   - Error details (if applicable)

**Files modified**:
- `frontend/server/api/*.ts`

**Validation**:
- [ ] All API routes have logging
- [ ] Logs include request ID
- [ ] Success and error cases logged
- [ ] API functionality unchanged

---

## Test Strategy

**Manual testing**:
1. Start dev server
2. Make API requests
3. Verify logs appear in console with proper structure
4. Verify request ID is consistent across logs
5. Change log level to debug/warn and verify output

**Integration tests** (to be added in WP07):
- Logger writes to console
- Log levels filter output
- Request tracing works end-to-end

---

## Definition of Done

- [ ] Winston installed and configured
- [ ] Logger infrastructure created
- [ ] TraceContext implemented
- [ ] Nuxt plugin injects logger
- [ ] All console.log replaced with logger.info
- [ ] All console.error replaced with logger.error
- [ ] Server API routes have logging
- [ ] Logs include request context
- [ ] App functionality unchanged
- [ ] Zero regression

---

## Risks

| Risk | Mitigation |
|------|------------|
| Winston doesn't work in browser | Test early, consider client-side fallback |
| Performance overhead | Use debug level sparingly in production |
| Log spam | Set appropriate default log level |
| Request ID not propagating | Test trace context thoroughly |

---

## Reviewer Guidance

**What to verify**:
1. No console.log/console.error in source files
2. Logger is properly initialized
3. Logs have structured metadata
4. Request IDs are present and consistent
5. Server routes log requests/responses
6. All log levels are used appropriately

**Integration points**:
- WP03 (Error Handling) will use logger for error logging
- WP01 (Config) provides log level configuration

---

## Implementation Command

```bash
spec-kitty implement WP02
```

No base WP required (independent work).

## Activity Log

- 2026-02-24T12:52:20Z – claude – shell_pid=31260 – lane=doing – Assigned agent via workflow command
- 2026-02-24T12:53:05Z – claude – shell_pid=31260 – lane=for_review – Ready for review: Logging infrastructure with Winston, TraceContext, and Nuxt plugin
