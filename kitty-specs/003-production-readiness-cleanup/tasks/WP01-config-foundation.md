---
work_package_id: WP01
title: Configuration Foundation
lane: "doing"
dependencies: []
base_branch: main
base_commit: 8143d9879c4b692b6e9432f4930c9b948444680b
created_at: '2026-02-24T12:50:54.145730+00:00'
subtasks: [T001, T002, T003, T004, T005, T006]
shell_pid: "33241"
agent: "claude"
history:
- date: 2025-02-24
  action: Created
  author: spec-kitty.tasks
---

# Work Package: Configuration Foundation

**ID**: WP01
**Priority**: P0 (Foundation)
**Estimated Size**: ~350 lines
**Status**: Planned

---

## Objective

Create a centralized configuration system that eliminates all hardcoded values from the codebase. This foundation enables all other cleanup work by providing a type-safe, validated way to access configuration values.

## Context

The current codebase has hardcoded URLs, timeouts, and magic numbers scattered throughout. This makes the application difficult to configure for different environments and violates the 12-factor app principles for configuration.

By implementing Nuxt 3's `runtimeConfig` pattern with type-safe interfaces, we can:
- Centralize all configuration values
- Provide type safety through TypeScript
- Support environment-specific values via `.env`
- Validate configuration on startup

---

## Subtasks

### T001: Audit Codebase for Hardcoded Values

**Purpose**: Identify all hardcoded configuration values that need to be extracted.

**Steps**:
1. Search for common hardcoded patterns:
   ```bash
   # URLs
   grep -r "https://" --include="*.ts" --include="*.vue" --include="*.js"
   grep -r "http://" --include="*.ts" --include="*.vue" --include="*.js"
   
   # Timeouts (magic numbers > 1000 likely milliseconds)
   grep -rE "timeout.*[0-9]{4,}" --include="*.ts"
   
   # Magic numbers in configs
   grep -rE "(pageSize|maxSize|ttl|cache).*=.*[0-9]" --include="*.ts"
   ```

2. Document findings in a TODO list:
   - File path
   - Line number
   - Hardcoded value
   - Proposed config key name

3. Categorize by type:
   - API endpoints (Strapi URLs)
   - Timeouts (fetch timeouts, retry delays)
   - Cache settings (TTL, max size)
   - Feature flags

**Files to audit**:
- `frontend/composables/*.ts`
- `frontend/server/api/*.ts`
- `frontend/components/**/*.vue`
- Any config files

**Validation**:
- [ ] All hardcoded values documented
- [ ] Categorized by type
- [ ] Config key names proposed

---

### T002: Create Config Directory Structure

**Purpose**: Set up the centralized configuration directory.

**Steps**:
1. Create `frontend/config/` directory:
   ```bash
   mkdir -p frontend/config
   ```

2. Create `frontend/config/index.ts`:
   ```typescript
   // Main config aggregator - exports all config
   export * from './app.config'
   export * from './api.config'
   export * from './defaults'
   ```

3. Create `frontend/config/app.config.ts`:
   ```typescript
   // Application-level configuration
   export interface AppConfig {
     name: string
     version: string
     environment: 'development' | 'staging' | 'production'
     debug: boolean
   }
   
   export const appDefaults: Partial<AppConfig> = {
     name: 'AI Portal Blog',
     version: '1.0.0',
     environment: 'development',
     debug: true,
   }
   ```

4. Create `frontend/config/api.config.ts`:
   ```typescript
   // API endpoints and timeouts
   export interface ApiConfig {
     strapi: {
       url: string
       timeout: number
       retryAttempts: number
       retryDelay: number
     }
     cache: {
       ttl: number
       staleWhileRevalidate: number
       enabled: boolean
     }
   }
   
   export const apiDefaults: Partial<ApiConfig> = {
     strapi: {
       timeout: 10000,
       retryAttempts: 3,
       retryDelay: 1000,
     },
     cache: {
       ttl: 300000,  // 5 minutes
       staleWhileRevalidate: 3600000,  // 1 hour
       enabled: true,
     },
   }
   ```

5. Create `frontend/config/defaults.ts`:
   ```typescript
   // Default values for all config
   import { appDefaults } from './app.config'
   import { apiDefaults } from './api.config'
   
   export const defaults = {
     app: appDefaults,
     api: apiDefaults,
   }
   ```

**Files created**:
- `frontend/config/index.ts`
- `frontend/config/app.config.ts`
- `frontend/config/api.config.ts`
- `frontend/config/defaults.ts`

**Validation**:
- [ ] All files created with proper exports
- [ ] TypeScript compiles without errors
- [ ] Imports work correctly

---

### T003: Update nuxt.config.ts with runtimeConfig

**Purpose**: Configure Nuxt 3 runtime config for environment-specific values.

**Steps**:
1. Read current `frontend/nuxt.config.ts` (or create if doesn't exist)

2. Add `runtimeConfig` section:
   ```typescript
   import { fileURLToPath } from 'url'
   
   export default defineNuxtConfig({
     // ... existing config ...
     
     runtimeConfig: {
       // Private config (server-side only)
       apiSecret: process.env.API_SECRET || '',
       
       // Public config (exposed to client)
       public: {
         // App config
         appName: process.env.APP_NAME || 'AI Portal Blog',
         appVersion: process.env.APP_VERSION || '1.0.0',
         environment: process.env.NODE_ENV || 'development',
         debug: process.env.DEBUG === 'true',
         
         // API config
         strapiUrl: process.env.STRAPI_URL || 'https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru',
         strapiTimeout: parseInt(process.env.STRAPI_TIMEOUT || '10000'),
         strapiRetryAttempts: parseInt(process.env.STRAPI_RETRY_ATTEMPTS || '3'),
         
         // Cache config
         cacheTtl: parseInt(process.env.CACHE_TTL || '300000'),
         cacheStaleWhileRevalidate: parseInt(process.env.CACHE_STALE_WHILE_REVALIDATE || '3600000'),
         cacheEnabled: process.env.CACHE_ENABLED !== 'false',
       }
     }
   })
   ```

3. Add auto-imports for composables if needed:
   ```typescript
   imports: {
     dirs: ['composables', 'infrastructure/logging', 'infrastructure/errors']
   }
   ```

4. Update `.env` file if needed:
   ```bash
   # App
   APP_NAME=AI Portal Blog
   APP_VERSION=1.0.0
   NODE_ENV=development
   DEBUG=true
   
   # API
   STRAPI_URL=https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru
   STRAPI_TIMEOUT=10000
   STRAPI_RETRY_ATTEMPTS=3
   
   # Cache
   CACHE_TTL=300000
   CACHE_STALE_WHILE_REVALIDATE=3600000
   CACHE_ENABLED=true
   ```

**Files modified**:
- `frontend/nuxt.config.ts` (updated)
- `frontend/.env` (updated or created)

**Validation**:
- [ ] nuxt.config.ts has runtimeConfig section
- [ ] .env file has all required variables
- [ ] Dev server starts without errors

---

### T004: Create Config Type Definitions

**Purpose**: Add TypeScript types for configuration.

**Steps**:
1. Create `frontend/types/config.ts`:
   ```typescript
   // Runtime config interface for Nuxt
   interface RuntimeConfig {
     // Private config (server-side only)
     apiSecret: string
   }
   
   interface PublicRuntimeConfig {
     // App config
     appName: string
     appVersion: string
     environment: 'development' | 'staging' | 'production'
     debug: boolean
     
     // API config
     strapiUrl: string
     strapiTimeout: number
     strapiRetryAttempts: number
     
     // Cache config
     cacheTtl: number
     cacheStaleWhileRevalidate: number
     cacheEnabled: boolean
   }
   
   // Extend Nuxt's runtime config interface
   interface NuxtRuntimeConfig extends RuntimeConfig {}
   interface NuxtPublicRuntimeConfig extends PublicRuntimeConfig {}
   ```

2. Export types from `frontend/types/index.ts`:
   ```typescript
   export * from './config'
   ```

**Files created**:
- `frontend/types/config.ts`
- `frontend/types/index.ts` (updated or created)

**Validation**:
- [ ] TypeScript types compile
- [ ] Intellisense works for config values
- [ ] No type errors in nuxt.config.ts

---

### T005: Add Config Validation on Startup

**Purpose**: Validate required config values when app starts.

**Steps**:
1. Create `frontend/server/plugins/config-validation.ts`:
   ```typescript
   export default defineNuxtPlugin((nuxtApp) => {
     const config = useRuntimeConfig()
     
     // Validate required config values
     const errors: string[] = []
     
     // Check required API config
     if (!config.public.strapiUrl) {
       errors.push('STRAPI_URL is required')
     }
     
     // Validate URLs
     try {
       new URL(config.public.strapiUrl)
     } catch {
       errors.push('STRAPI_URL must be a valid URL')
     }
     
     // Validate numeric values
     if (config.public.strapiTimeout < 1000) {
       errors.push('STRAPI_TIMEOUT must be at least 1000ms')
     }
     
     if (config.public.strapiRetryAttempts < 0) {
       errors.push('STRAPI_RETRY_ATTEMPTS must be non-negative')
     }
     
     // Fail fast if errors
     if (errors.length > 0) {
       console.error('❌ Configuration errors:')
       errors.forEach(err => console.error(`  - ${err}`))
       throw new Error('Invalid configuration')
     }
     
     console.log('✅ Configuration validated')
   })
   ```

2. Test validation by breaking config values and verifying startup fails.

**Files created**:
- `frontend/server/plugins/config-validation.ts`

**Validation**:
- [ ] Plugin runs on startup
- [ ] Invalid config causes startup failure
- [ ] Valid config allows startup
- [ ] Errors are descriptive

---

### T006: Replace Hardcoded Values with Config References

**Purpose**: Replace all identified hardcoded values with config references.

**Steps**:
1. For each hardcoded value from T001:

   **Example - Replace hardcoded URL**:
   ```typescript
   // Before
   const response = await $fetch('https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru/api/articles')
   
   // After
   const config = useRuntimeConfig()
   const response = await $fetch(`${config.public.strapiUrl}/api/articles`)
   ```

   **Example - Replace hardcoded timeout**:
   ```typescript
   // Before
   const response = await fetch(url, { timeout: 10000 })
   
   // After
   const config = useRuntimeConfig()
   const response = await fetch(url, { timeout: config.public.strapiTimeout })
   ```

2. Focus on these files first:
   - `frontend/composables/useFetchArticles.ts`
   - `frontend/server/api/articles.get.ts`
   - `frontend/server/api/speckits.get.ts`
   - Any other files with hardcoded values

3. For component templates, use a composable:
   ```typescript
   // In component
   const config = useRuntimeConfig()
   const apiUrl = computed(() => config.public.strapiUrl)
   ```

**Files modified**:
- All files with hardcoded values (from T001 audit)

**Validation**:
- [ ] No hardcoded URLs remain
- [ ] No hardcoded timeouts remain
- [ ] App still works after migration
- [ ] Environment variables are respected

---

## Test Strategy

**Manual testing**:
1. Start dev server with default .env
2. Verify all pages load correctly
3. Change .env values and restart
4. Verify new values are used

**Validation tests** (to be added in WP07):
- Config loads correctly
- Invalid config fails startup
- Environment variables override defaults

---

## Definition of Done

- [ ] All hardcoded values identified and extracted
- [ ] Config directory structure created
- [ ] nuxt.config.ts updated with runtimeConfig
- [ ] TypeScript types defined for config
- [ ] Config validation plugin created
- [ ] All hardcoded values replaced with config references
- [ ] App works correctly with new config system
- [ ] TypeScript compiles without errors
- [ ] Zero regression in functionality

---

## Risks

| Risk | Mitigation |
|------|------------|
| Config value missed during audit | Use comprehensive grep search |
| Config values incorrect in .env | Provide sensible defaults |
| Type errors prevent compilation | Test after each file change |
| Breaking changes to existing code | Test thoroughly before committing |

---

## Reviewer Guidance

**What to verify**:
1. No hardcoded URLs remain in code
2. Config types are complete and accurate
3. .env file has all required variables
4. Config validation works (try invalid values)
5. App functions correctly with new config
6. TypeScript compiles without errors

**Integration points**:
- This WP is foundational for all other WPs
- WP02 (Logging) will use config for log level
- WP03 (Error Handling) will use config for error messages

---

## Implementation Command

```bash
spec-kitty implement WP01
```

No base WP required (foundation work).

## Activity Log

- 2026-02-24T12:50:54Z – claude – shell_pid=30919 – lane=doing – Assigned agent via workflow command
- 2026-02-24T12:52:12Z – claude – shell_pid=30919 – lane=for_review – Ready for review: Configuration foundation implemented
- 2026-02-24T13:20:54Z – claude – shell_pid=33241 – lane=doing – Started review via workflow command
