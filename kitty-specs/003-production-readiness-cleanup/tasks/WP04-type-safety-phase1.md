---
work_package_id: WP04
title: Type Safety Phase 1
lane: "doing"
dependencies: []
base_branch: main
base_commit: b924be1d8f2db2772c2ff9890104383709679c35
created_at: '2026-02-24T12:54:46.171553+00:00'
subtasks: [T020, T021, T022, T023, T024, T025]
shell_pid: "1"
agent: "claude"
history:
- date: 2025-02-24
  action: Created
  author: spec-kitty.tasks
---

# Work Package: Type Safety Phase 1

**ID**: WP04
**Priority**: P2 (First phase of type safety)
**Estimated Size**: ~360 lines
**Status**: Planned

---

## Objective

Create comprehensive API type definitions and begin replacing `any` types with proper TypeScript types. This is the first phase of type safety improvements.

## Context

The codebase uses `any` types extensively, which defeats TypeScript's type checking:
- API responses are not typed
- Components use `any` for props
- External libraries typed as `any`

By adding proper types:
- TypeScript catches errors at compile time
- Better IDE autocomplete and intellisense
- Self-documenting code through types
- Refactoring becomes safer

---

## Subtasks

### T020: Create API Response Type Definitions

**Purpose**: Define types for Strapi API responses.

**Steps**:
1. Create `frontend/types/api.ts`:
   ```typescript
   // Strapi response wrapper
   export interface StrapiResponse<T> {
     data: T
     meta: StrapiMeta
   }
   
   export interface StrapiMeta {
     pagination: {
       page: number
       pageSize: number
       pageCount: number
       total: number
     }
   }
   
   // Article entity (Speckits/Prompts/Blogs)
   export interface Article {
     id: number
     documentId: string
     title: string
     description: string
     slug: string
     body: string
     categories: Category[]
     createdAt: string
     updatedAt: string
     publishedAt: string
     // Add fields based on actual Strapi schema
   }
   
   // Category
   export interface Category {
     id: number
     name: string
     slug: string
     description?: string
   }
   
   // Research session
   export interface ResearchSession {
     id: number
     searchId: string
     title: string
     messages: ResearchMessage[]
     createdAt: string
   }
   
   export interface ResearchMessage {
     id: number
     role: 'user' | 'assistant'
     content: string
     timestamp: string
   }
   
   // API request params
   export interface ArticleFilters {
     category?: string
     search?: string
     sort?: 'asc' | 'desc'
     limit?: number
   }
   
   // API error response
   export interface ApiErrorResponse {
     error: {
       status: number
       name: string
       message: string
       details?: Record<string, unknown>
     }
   }
   ```

2. Create `frontend/types/index.ts`:
   ```typescript
   export * from './api'
   export * from './config'
   export * from './errors'
   ```

**Files created**:
- `frontend/types/api.ts`
- `frontend/types/index.ts` (if not exists)

**Validation**:
- [ ] Types compile without errors
- [ ] Types match Strapi schema
- [ ] All exports work

---

### T021: Audit Codebase for `any` Types

**Purpose**: Find all `any` types in the codebase.

**Steps**:
1. Search for all `any` types:
   ```bash
   # Direct any usage
   grep -rn ": any" --include="*.ts" --include="*.vue" frontend/
   
   # Any in type annotations
   grep -rn "<any>" --include="*.ts" --include="*.vue" frontend/
   
   # Any in arrays
   grep -rn "any\[" --include="*.ts" --include="*.vue" frontend/
   ```

2. Document findings in a structured list:
   ```markdown
   | File | Line | Context | Proposed Type | Priority |
   |------|------|---------|---------------|----------|
   | composables/useFetchArticles.ts | 15 | API response | StrapiResponse<Article[]> | High |
   | components/SpeckitCard.vue | 23 | Props speckit | Article | High |
   ```

3. Prioritize by impact:
   - **High**: API responses, component props, public interfaces
   - **Medium**: Internal function parameters
   - **Low**: Test files, private utilities

**Output**: Documented list of all `any` types

**Validation**:
- [ ] All `any` types found
- [ ] Documented with context
- [ ] Prioritized by impact

---

### T022: Replace `any` Types (Part 1 - API Responses)

**Purpose**: Replace `any` types in API calls with proper types.

**Steps**:
1. Focus on composables that fetch data:
   ```typescript
   // Before
   const response = await $fetch('/api/articles') as any
   articles.value = response.data
   
   // After
   import type { StrapiResponse, Article } from '~/types/api'
   
   const response = await $fetch('/api/articles') as StrapiResponse<Article[]>
   articles.value = response.data
   ```

2. Update these files:
   - `composables/useFetchArticles.ts`
   - `composables/useSpeckitFaq.ts`
   - Any other data fetching composables

3. Add proper error types:
   ```typescript
   try {
     const response = await $fetch(url) as StrapiResponse<Article[]>
   } catch (error) {
     if (error instanceof Error) {
       // Error is now typed
     }
   }
   ```

**Files modified**:
- Data fetching composables

**Validation**:
- [ ] API responses are typed
- [ ] TypeScript compiles
- [ ] Data flow works correctly

---

### T023: Replace `any` Types (Part 2 - Components)

**Purpose**: Replace `any` types in component props and data.

**Steps**:
1. Update component props:
   ```vue
   <!-- Before -->
   <script setup lang="ts">
   defineProps<{
     speckit: any
   }>()
   </script>
   
   <!-- After -->
   <script setup lang="ts">
   import type { Article } from '~/types/api'
   
   interface Props {
     speckit: Article
   }
   
   defineProps<Props>()
   </script>
   ```

2. Focus on these components:
   - `components/speckit/SpeckitCard.vue`
   - `components/speckit/SpeckitDownloadBar.vue`
   - `components/prompt/PromptCard.vue`
   - Any other components with `any` props

3. Fix template type issues:
   - Add `v-if` for null checks
   - Use optional chaining where appropriate

**Files modified**:
- Components with `any` props

**Validation**:
- [ ] Component props are typed
- [ ] Templates work correctly
- [ ] No runtime type errors

---

### T024: Enable noImplicitAny in tsconfig.json

**Purpose**: Enable `noImplicitAny` TypeScript compiler option.

**Steps**:
1. Update `frontend/tsconfig.json`:
   ```json
   {
     "extends": "./.nuxt/tsconfig.json",
     "compilerOptions": {
       "noImplicitAny": true
     }
   }
   ```

2. Run TypeScript check:
   ```bash
   npx nuxi typecheck
   ```

3. Document the output - this will show all implicit any usage.

**Files modified**:
- `frontend/tsconfig.json`

**Validation**:
- [ ] tsconfig.json updated
- [ ] Type check runs
- [ ] Errors documented

---

### T025: Fix Type Errors from noImplicitAny

**Purpose**: Fix all type errors from enabling noImplicitAny.

**Steps**:
1. For each type error, add explicit type annotation:
   ```typescript
   // Before (error: implicit any)
   function formatData(data) {
     return data.map(x => x.value)
   }
   
   // After
   interface DataItem {
     value: string
   }
   
   function formatData(data: DataItem[]): string[] {
     return data.map(x => x.value)
   }
   ```

2. Common fixes:
   - Add parameter types
   - Add return types
   - Import types from `~/types/api`
   - Use generics for reusable functions

3. Fix in priority order:
   1. Public APIs and composables
   2. Component scripts
   3. Utilities and helpers
   4. Private functions

**Files modified**:
- All files with type errors

**Validation**:
- [ ] `npx nuxi typecheck` passes
- [ ] No implicit any errors remain
- [ ] App functionality unchanged

---

## Test Strategy

**Manual testing**:
1. Run `npx nuxi typecheck` - should pass
2. Start dev server - should work
3. Verify all pages load correctly

**Validation**:
- TypeScript compiles without errors
- App works at runtime
- No regression in functionality

---

## Definition of Done

- [ ] API types defined
- [ ] All `any` types documented
- [ ] API response types added
- [ ] Component props typed
- [ ] noImplicitAny enabled
- [ ] All type errors fixed
- [ ] TypeScript compiles cleanly
- [ ] Zero regression

---

## Risks

| Risk | Mitigation |
|------|------------|
| Types don't match Strapi schema | Verify schema, use optional properties |
| Fixing types breaks app | Test thoroughly, use `v-if` guards |
| Too many type errors | Fix incrementally, prioritize public APIs |

---

## Reviewer Guidance

**What to verify**:
1. API types match Strapi schema
2. No `any` in public APIs
3. Component props are fully typed
4. TypeScript compiles cleanly
5. App works correctly

**Integration points**:
- Independent work (no dependencies)
- Leads to WP05 (strict mode)

---

## Implementation Command

```bash
spec-kitty implement WP04
```

No base WP required (independent work).

## Activity Log

- 2026-02-24T12:54:46Z – claude – shell_pid=31714 – lane=doing – Assigned agent via workflow command
- 2026-02-24T12:57:45Z – claude – shell_pid=31714 – lane=for_review – Ready for review: Created comprehensive API type definitions, replaced all any types in infrastructure layer with proper TypeScript types, enabled noImplicitAny in tsconfig.json. All 6 subtasks completed.
- 2026-02-24T13:21:25Z – claude – shell_pid=1 – lane=doing – Started review via workflow command
