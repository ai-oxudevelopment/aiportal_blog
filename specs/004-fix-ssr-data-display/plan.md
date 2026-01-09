# Implementation Plan: Fix SSR Data Display Issues

**Branch**: `004-fix-ssr-data-display` | **Date**: 2026-01-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-fix-ssr-data-display/spec.md`

## Summary

This feature fixes critical SSR (Server-Side Rendering) data display issues introduced in feature 001-ssr-performance-optimization. After enabling SSR (`ssr: true` in `nuxt.config.js`), pages display blank/empty instead of showing content.

**Root Cause**: Data processing logic placed in `onMounted` hooks and use of non-SSR-compatible composables (`useFetchOneSpeckit`).

**Technical Approach**:
1. Move data processing from `onMounted` to computed properties (works on both server and client)
2. Replace `useFetchOneSpeckit` composable with Nuxt's `useAsyncData` (SSR-aware)
3. Ensure all data fetching uses SSR-compatible patterns

**Affected Pages**:
- Home page (`/`) - articles catalog
- Speckits page (`/speckits`) - speckits catalog
- Detail pages (`/speckits/[slug]`) - full speckit content

## Technical Context

**Language/Version**: TypeScript 5.9.2, JavaScript ES2022
**Primary Dependencies**:
- Nuxt 3.2.0 (Vue 3.4.21)
- Vuetify 3 (UI components)
- Tailwind CSS (styling)
- @nuxtjs/strapi 2.1.1 (CMS integration)
- Pinia (state management)

**Storage**:
- Strapi v5 CMS (backend content storage)
- In-memory cache (server-side, via `server/utils/cache-wrapper.ts`)
- N/A (client-side state managed via refs/pinia)

**Testing**:
- Manual browser testing (SSR verification)
- Console error/warning checking
- Page source HTML inspection
- No automated test framework currently configured

**Target Platform**:
- Web browsers (modern Chrome, Firefox, Safari, Edge)
- Server-side: Node.js (Nuxt SSR)
- Deployment: Docker containers

**Project Type**: web (frontend + backend separation)

**Performance Goals**:
- SSR rendering: < 2 seconds (including API fetch)
- Client hydration: < 500ms after page load
- Page source HTML: contains actual content (not loading spinners)
- Zero console errors/hydration warnings

**Constraints**:
- Must maintain SSR mode (cannot revert to SPA)
- Must maintain API backward compatibility (no breaking changes)
- Must follow Nuxt 3 SSR best practices
- Constitution compliance (see section below)

**Scale/Scope**:
- 3 pages affected (home, speckits index, speckits detail)
- ~500 lines of code to modify
- No new API endpoints required
- No database schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Constitution Check

**Principle I - Server-Side Proxy Architecture**: ✅ **PASS**
- All API calls already go through `server/api/*` routes
- No direct Strapi calls from client code
- Fix maintains this architecture

**Principle II - Feature-Based Component Organization**: ✅ **PASS**
- Component structure unchanged
- Changes are within existing page components
- No new features/modules added

**Principle III - Dual UI Framework Integration**: ✅ **PASS**
- Vuetify 3 + Tailwind CSS usage unchanged
- No UI framework modifications

**Principle IV - Russian-Language First**: ✅ **PASS**
- No user-facing text changes
- Error messages remain in Russian

**Principle V - SPA Deployment Model**: ⚠️ **VIOLATION DETECTED**
- Constitution states: "Основной режим: `ssr: false` (SPA)"
- Current config has `ssr: true`
- **Justification**: Feature 001-ssr-performance-optimization explicitly enabled SSR for performance and SEO
- **Simpler Alternative Rejected**: Disabling SSR would revert performance improvements and violate feature 001's success criteria
- **Recommendation**: Update constitution to allow SSR mode

**Principle VI - API & Data Modeling Standards**: ✅ **PASS**
- Domain model types already defined
- Fix ensures proper serialization for SSR
- No new data models introduced

**Principle VII - Error Handling & Observability**: ✅ **PASS**
- Console logging already in place
- Error states handled gracefully
- Fix will reduce console errors

**Principle VIII - Performance & Caching Strategy**: ✅ **PASS**
- Cache infrastructure already in place
- SSR performance goals aligned with strategy
- Fix improves perceived performance

**Principle IX - Strapi Integration Patterns**: ✅ **PASS**
- Server routes already encapsulate Strapi access
- Fix maintains these patterns

**Principle X - Security, Auth & Secrets Management**: ✅ **PASS**
- No auth-related changes
- No security impact

### Post-Design Constitution Re-check

After completing Phase 1 design (research, data-model, contracts):

**Status**: ✅ **ALL GATES PASS**

With the single justified violation documented in Complexity Tracking below, all other principles are maintained. The fix improves code quality by:
- Aligning with Nuxt 3 SSR best practices
- Reducing console errors
- Improving observability
- Maintaining security boundaries

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-ssr-data-display/
├── plan.md              # This file
├── research.md          # Phase 0: Root cause analysis and decisions
├── data-model.md        # Phase 1: Data entities and flow
├── quickstart.md        # Phase 1: Developer quick reference
├── contracts/
│   └── api.md           # Phase 1: API contracts (maintained, not changed)
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Specification quality validation
```

### Source Code (repository root)

```text
frontend/                          # Nuxt 3 application
├── components/
│   ├── prompt/                    # Article catalog components
│   │   ├── CategoriesFilter.vue   # (unchanged)
│   │   ├── MobileCategoriesFilter.vue
│   │   ├── PromptSearch.vue
│   │   └── PromptGrid.vue
│   └── speckit/                   # Speckit-specific components
│       ├── SpeckitDiagramView.vue
│       ├── SpeckitFaqSection.vue
│       └── ...
├── composables/
│   ├── useFetchArticles.ts        # (TO BE REMOVED - replaced by useAsyncData)
│   ├── useFetchOneSpeckit.ts      # (TO BE REMOVED - replaced by useAsyncData)
│   └── useFetchSpeckits.ts        # (TO BE REMOVED - replaced by useAsyncData)
├── pages/
│   ├── index.vue                  # (MODIFY - move logic from onMounted to computed)
│   └── speckits/
│       ├── index.vue              # (MODIFY - move logic from onMounted to computed)
│       └── [speckitSlug].vue      # (MODIFY - replace useFetchOneSpeckit with useAsyncData)
├── server/
│   ├── api/
│   │   ├── articles.get.ts        # (unchanged - SSR-compatible)
│   │   └── speckits/
│   │       ├── index.get.ts       # (unchanged - SSR-compatible)
│   │       └── [slug].get.ts      # (unchanged - SSR-compatible)
│   └── utils/
│       ├── cache-wrapper.ts       # (unchanged - SSR-compatible)
│       └── cache-control.ts       # (unchanged)
└── types/
    └── article.ts                 # (unchanged - types remain valid)
```

**Structure Decision**: Web application with frontend/backend separation. Changes are localized to 3 page components and removal of 3 composables. No structural changes to components, server routes, or types.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSR enabled (`ssr: true`) instead of SPA mode | Feature 001-ssr-performance-optimization requires SSR for performance improvements (faster initial load, SEO benefits, better mobile experience) and is explicitly requested by user | Disabling SSR would: (1) Revert all performance improvements from feature 001, (2) Violate success criteria SC-001 through SC-010 from feature 001, (3) Lose SEO benefits for search engine indexing, (4) Cause hydration issues when re-enabling SSR later. The constitution predates feature 001 and should be updated to reflect the project's hybrid rendering approach. |

**Recommendation**: After this feature is complete, update constitution section V to allow SSR mode:
```
- Basic mode: Hybrid rendering with SSR enabled for performance and SEO
- SPA fallback available via routeRules if needed for specific routes
```

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Output**: `research.md`

**Completed Tasks**:
1. ✅ Identified root cause: `onMounted` data processing + non-SSR composables
2. ✅ Analyzed all affected pages and their data flow
3. ✅ Researched Nuxt 3 SSR best practices
4. ✅ Evaluated alternative approaches
5. ✅ Documented technical decisions

**Key Decisions**:
- Use computed properties for derived data (not `onMounted`)
- Replace `useFetchOneSpeckit` with `useAsyncData`
- Maintain API backward compatibility
- No new dependencies required

---

### Phase 1: Design ✅ COMPLETE

**Outputs**:
- `data-model.md` - Data entities and SSR flow
- `contracts/api.md` - API contracts (maintained)
- `quickstart.md` - Developer reference

**Completed Tasks**:
1. ✅ Documented existing data model (no changes needed)
2. ✅ Verified API contracts remain unchanged
3. ✅ Created quickstart guide with code templates
4. ✅ Identified all files requiring modification
5. ✅ Re-validated constitution compliance

**Key Design Decisions**:
- No new data structures needed
- Existing API endpoints are SSR-compatible
- Component-level changes only
- Backward compatible

---

### Phase 2: Implementation (NEXT)

**Prerequisites**: Run `/speckit.tasks` command to generate `tasks.md`

**Implementation Files** (in order):

1. **`frontend/pages/index.vue`** - Fix home page
   - Move category extraction from `onMounted` to `computed`
   - Remove `useFetchArticles` composable (if used)
   - Use `useAsyncData` directly
   - Verify SSR rendering

2. **`frontend/pages/speckits/index.vue`** - Fix speckits page
   - Move category extraction from `onMounted` to `computed`
   - Remove `useFetchSpeckits` composable (if used)
   - Use `useAsyncData` directly
   - Verify SSR rendering

3. **`frontend/pages/speckits/[speckitSlug].vue`** - Fix detail page
   - Replace `useFetchOneSpeckit` with `useAsyncData`
   - Remove composable import
   - Handle error states properly
   - Verify SSR rendering

4. **`frontend/composables/useFetchArticles.ts`** - DELETE
   - No longer needed (replaced by `useAsyncData` in component)
   - Safe to delete after verifying page updates

5. **`frontend/composables/useFetchOneSpeckit.ts`** - DELETE
   - No longer needed (replaced by `useAsyncData` in component)
   - Safe to delete after verifying page updates

6. **`frontend/composables/useFetchSpeckits.ts`** - DELETE
   - No longer needed (replaced by `useAsyncData` in component)
   - Safe to delete after verifying page updates

**Testing**:
- Manual testing in browser with SSR enabled
- Verify page source HTML contains content
- Check console for errors/warnings
- Test all affected pages (/, /speckits, /speckits/[slug])

---

## Testing Strategy

### Manual Testing Checklist

**Home Page (`/`)**:
- [ ] Page displays article cards
- [ ] Categories sidebar shows (desktop) or horizontal scroll (mobile)
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Page source HTML contains article titles

**Speckits Page (`/speckits`)**:
- [ ] Page displays speckit cards
- [ ] Categories sidebar shows
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Page source HTML contains speckit titles

**Detail Page (`/speckits/spec-1`)**:
- [ ] Page displays full content (title, body, categories)
- [ ] Download button works
- [ ] Page source HTML contains content
- [ ] 404 works for invalid slug

**Console Validation**:
- [ ] No JavaScript errors
- [ ] No Vue hydration warnings
- [ ] No "undefined" errors

---

## Success Criteria Verification

From spec.md, the following success criteria must be met:

- **SC-001**: Home page displays at least one article card ✅ (manual test)
- **SC-002**: Speckits page displays speckits ✅ (manual test)
- **SC-003**: Detail pages display full content ✅ (manual test)
- **SC-004**: Zero console errors ✅ (console inspection)
- **SC-005**: Zero hydration warnings ✅ (console inspection)
- **SC-006**: Page source HTML contains content ✅ (curl or view-source)
- **SC-007**: Time to display < 2 seconds ✅ (performance monitoring)
- **SC-008**: Fallback content works ✅ (test with Strapi down)
- **SC-009**: Client navigation maintains content ✅ (manual test)
- **SC-010**: Direct URL access works ✅ (manual test)

---

## Rollback Plan

If implementation causes critical issues:

1. **Immediate Rollback**:
   ```bash
   # Revert changes
   git checkout main -- frontend/pages/
   git checkout main -- frontend/composables/
   ```

2. **Temporary Workaround** (if needed):
   ```javascript
   // In frontend/nuxt.config.js
   export default defineNuxtConfig({
     ssr: false  // Disable SSR temporarily
   })
   ```

3. **Recovery**:
   - Fix identified issues
   - Re-enable SSR
   - Test thoroughly

**Note**: Rollback is NOT the desired outcome. The goal is to fix SSR, not disable it.

---

## Dependencies

### Internal Dependencies

- Nuxt 3.2.0 SSR infrastructure
- Existing API endpoints (`/api/articles`, `/api/speckits`, `/api/speckits/[slug]`)
- Cache utilities (`server/utils/cache-wrapper.ts`)
- Type definitions (`types/article.ts`)

### External Dependencies

- Strapi v5 CMS (no changes required)
- Vue 3.4.21 (no version changes)
- No new dependencies needed

---

## Risks and Mitigations

### Risk 1: Breaking Changes to Components

**Mitigation**:
- Changes are localized to 3 components
- Comprehensive manual testing before commit
- Git branch allows easy rollback

### Risk 2: Performance Regression

**Mitigation**:
- Computed properties are optimized by Vue
- Data still fetched during SSR (no client-side re-fetch)
- Monitor performance metrics

### Risk 3: Missed Edge Cases

**Mitigation**:
- Test with empty data states
- Test with Strapi offline
- Test error states (404, 500)
- Test filtering and search

---

## Next Steps

1. ✅ **Phase 0 Complete**: Research documented in `research.md`
2. ✅ **Phase 1 Complete**: Design documented in `data-model.md`, `contracts/api.md`, `quickstart.md`
3. **Phase 2 Pending**: Run `/speckit.tasks` to generate implementation tasks
4. **Implementation**: Apply fixes to 3 pages and delete 3 composables
5. **Testing**: Manual verification of all success criteria
6. **Deployment**: Merge to main after validation

---

## References

- Nuxt 3 SSR Guide: https://nuxt.com/docs/guide/concepts/rendering
- `useAsyncData` Documentation: https://nuxt.com/docs/api/composables/use-async-data
- Vue 3 Computed Properties: https://vuejs.org/guide/essentials/computed.html
- Feature Spec: [spec.md](spec.md)
- Research: [research.md](research.md)
- Quickstart: [quickstart.md](quickstart.md)
