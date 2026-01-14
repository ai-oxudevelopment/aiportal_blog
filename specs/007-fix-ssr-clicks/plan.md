# Implementation Plan: Fix SSR Click Delay in Nuxt 4

**Branch**: `007-fix-ssr-clicks` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-fix-ssr-clicks/spec.md`

## Summary

Fix critical SSR hydration delay where card click handlers take 5-10 seconds to become active after page load. The root cause is currently UNKNOWN and requires diagnostic investigation. SSR MUST remain enabled per user requirements for SEO and fast First Contentful Paint. The solution involves investigation-first approach to identify actual cause, then implement targeted SSR optimizations (not blanket changes or SPA migration).

## Technical Context

**Language/Version**: JavaScript ES2022 + TypeScript 5.9.2 (Nuxt 3.2.0, Vue 3.4.21)
**Primary Dependencies**: Nuxt 3.2.0, Vue 3.4.21, Vuetify 3, Tailwind CSS, @nuxtjs/strapi 2.1.1, Pinia
**Storage**: N/A (static build artifacts + Strapi v5 CMS as backend)
**Testing**: Vitest (configured in project), manual browser testing for hydration timing
**Target Platform**: Web browsers (modern browsers with JavaScript enabled)
**Project Type**: Web application (Nuxt 3 frontend with SSR rendering)
**Performance Goals**:
  - Reduce Time to Interactive (TTI) from 5-10 seconds to under 2 seconds
  - Card click response within 1 second of HTML render
  - Bundle size reduction if identified as issue
**Constraints**:
  - **SSR MUST remain enabled** (explicit user requirement)
  - Cannot break existing navigation patterns
  - Must maintain server-side proxy architecture for Strapi
  - No changes to Strapi backend API structure
**Scale/Scope**:
  - Affects all card-based navigation across the application
  - Impacts 3 main card components: PromptCard, EnhancedPromptCard, SpeckitCard
  - Performance optimization may affect entire application bundle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Server-Side Proxy Architecture ✅

**Status**: PASS

**Compliance**:
- ✅ All Strapi API calls already go through server routes (`server/api/articles.js`)
- ✅ No direct Strapi calls from client code
- ✅ Composables (`useFetchArticles`) use internal `/api/articles` endpoint
- ✅ This feature optimizes client-side hydration without changing proxy pattern

**No violations** - optimization is client-side rendering/hydration focused.

### II. Feature-Based Component & App Organization ✅

**Status**: PASS

**Compliance**:
- ✅ Components organized by feature domain: `components/prompt/`, `components/speckit/`, `components/main/`
- ✅ No cross-feature imports detected
- ✅ Shared utilities in appropriate locations
- ✅ Optimizations will respect existing feature boundaries

**No violations** - changes will be localized to component loading patterns within feature domains.

### III. Dual UI Framework Integration ✅

**Status**: PASS

**Compliance**:
- ✅ Vuetify used for complex interactive components (cards with hover states, transitions)
- ✅ Tailwind CSS used for layout, spacing, utility classes
- ✅ No reinventing Vuetify components with Tailwind
- ✅ Custom iridescent theme preserved

**No violations** - optimization respects current framework integration.

### IV. Russian-Language First & i18n ✅

**Status**: PASS

**Compliance**:
- ✅ All UI text remains in Russian
- ✅ No localization changes required
- ✅ Performance improvements are language-agnostic

**No violations** - feature is purely technical optimization.

### V. SPA Deployment Model & Nuxt 4 Hybrid Rendering ⚠️ **CONSTITUTIONAL EXCEPTION**

**Status**: **JUSTIFIED EXCEPTION** - User explicitly requires SSR enabled

**Constitution Statement**: "Основной режим: `ssr: false` (SPA)"

**Current Reality**: `nuxt.config.js` has `ssr: true` (SSR enabled)

**User Clarification**: "Keep SSR enabled for SEO and fast First Contentful Paint" (Session 2026-01-14)

**Justification for Exception**:
1. **SEO Benefits**: Public-facing content requires search engine indexing
2. **Fast First Contentful Paint**: HTML from server renders immediately
3. **User Experience**: Better perceived performance on initial load
4. **Business Requirement**: Explicitly stated by user, takes precedence

**Constitutional Action**:
- Document this exception in ADR (Architecture Decision Record)
- Optimize SSR hydration to eliminate 5-10 second delay (NOT disable SSR)
- This is a justified business-driven exception to Principle V

**Resolution Strategy**:
- Keep `ssr: true` in configuration
- Investigate and fix hydration timing issues
- Optimize bundle size, component loading, or data fetching based on findings
- **NOT switching to SPA mode** (despite constitution suggesting SPA)

### VI. API & Data Modeling Standards ✅

**Status**: PASS

**Compliance**:
- ✅ Domain types defined in `types/article.ts`
- ✅ Server routes normalize Strapi responses
- ✅ No direct `any` types for backend data
- ✅ Optimization doesn't change data flow

**No violations** - client-side rendering optimization doesn't affect data modeling.

### VII. Error Handling & Observability ✅

**Status**: PASS

**Compliance**:
- ✅ Existing error logging in composables
- ✅ Console logging for debugging hydration
- ✅ Will add hydration-specific error logging as per FR-013

**Enhancement** - Adding hydration-specific diagnostics without breaking existing patterns.

### VIII. Performance & Caching Strategy ✅

**Status**: PASS WITH ENHANCEMENTS

**Compliance**:
- ✅ Existing PWA caching configured
- ✅ Code splitting already implemented
- ✅ Lazy loading for non-critical components
- ✅ This feature enhances performance strategy

**Enhancements**:
- Add synchronous imports for critical interactive components (if needed)
- Optimize chunk splitting for faster hydration (if needed)
- Ensure event handlers bind before hydration completes

**No violations** - this is a performance optimization feature.

### IX. Strapi Integration Patterns ✅

**Status**: PASS

**Compliance**:
- ✅ All calls through server proxy
- ✅ Dedicated server routes for articles
- ✅ Draft/published logic encapsulated
- ✅ No changes to Strapi client

**No violations** - optimization is purely client-side.

### X. Security, Auth & Secrets Management ✅

**Status**: PASS

**Compliance**:
- ✅ No secrets exposed to client
- ✅ JWT in HttpOnly cookie
- ✅ No auth changes required
- ✅ Optimization doesn't affect security model

**No violations** - rendering optimization doesn't touch auth.

### Constitution Check Summary

**Overall Status**: ✅ PASS (with justified constitutional exception)

**Required Actions**:
1. ✅ Keep SSR enabled (user requirement, constitutional exception)
2. Investigate root cause of 5-10 second hydration delay
3. Implement targeted SSR optimizations based on findings
4. Document constitutional exception in ADR
5. Add performance measurement logging

**Blockers**: None - constitutional exception is justified by explicit user requirements.

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-ssr-clicks/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Root cause investigation questions
├── data-model.md        # Phase 1 output - Component state & metrics entities
├── quickstart.md        # Phase 1 output - Testing procedures
├── contracts/           # Phase 1 output - API contracts (N/A for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
frontend/
├── nuxt.config.js       # SSR configuration (DO NOT DISABLE)
├── app.vue              # Root component - add performance logging
├── components/
│   ├── prompt/
│   │   ├── PromptGrid.vue           # Grid layout - check imports
│   │   ├── EnhancedPromptCard.vue   # Card component - add timing logs
│   │   └── PromptCard.vue           # Card component - verify @click
│   ├── speckit/
│   │   ├── SpeckitGrid.vue          # Grid layout - check imports
│   │   └── SpeckitCard.vue          # Card component - verify @click
│   └── main/
│       └── [other components]
├── pages/
│   ├── index.vue          # Main page - check imports
│   ├── speckits/index.vue # Speckits page - check imports
│   └── blogs.vue          # Blogs page - check imports
├── composables/
│   ├── useFetchArticles.ts    # Data fetching - check for blocking calls
│   ├── usePerformanceMetrics.ts # NEW - performance measurement utility
│   └── [other composables]
└── server/api/
    └── articles.js        # Server proxy - NO CHANGES (maintain architecture)
```

**Structure Decision**: Frontend-only optimization. Backend/Strapi integration unchanged. No new API contracts needed (feature is client-side performance optimization).

## Complexity Tracking

> **Constitutional Exception Justification**

| Constitutional Principle | Required Behavior | Actual Behavior | Why Exception Needed |
|------------------------|-------------------|-----------------|----------------------|
| **V. SPA Deployment Model** | `ssr: false` (SPA mode) | `ssr: true` (SSR mode) | User explicitly requires SSR for SEO benefits and fast First Contentful Paint. This is a business requirement for public-facing content that must be indexed by search engines. |
| | | | **Justification**: (1) SEO critical for public content, (2) Fast FCP improves perceived performance, (3) User explicitly clarified: "Keep SSR enabled", (4) Alternative (SPA) would break SEO. |

**Simpler Alternative Rejected**: Switching to SPA mode (disable SSR)
**Why Rejected**:
- User explicitly requires SSR enabled for SEO
- Public-facing content needs search engine indexing
- Fast First Contentful Paint is important for UX
- User clarified: "optimize SSR hydration, not disable SSR"

**Resolution**: Keep SSR enabled, optimize hydration timing to eliminate 5-10 second delay. This is a justified exception to Principle V based on explicit business requirements.

---

## Implementation Phases

### Phase 0: Research & Investigation ✅ COMPLETE

**Output**: `research.md` with diagnostic questions and tools

**Research Questions**:
1. What is the current bundle size and composition?
2. Are server-side operations blocking HTML response?
3. How long does hydration actually take?
4. Are there hydration errors in console?
5. Are critical components loaded synchronously?
6. Are there configuration issues?

**Key Finding**: Root cause UNKNOWN - requires diagnostic investigation before implementing fixes.

**Decision Framework**: After diagnosis, apply targeted fix based on actual cause:
- Bundle size issue → optimize code splitting, lazy-load non-critical JS
- Server blocking → move data fetching to client-side (onMounted)
- Component loading → convert to sync imports for critical components
- Configuration → adjust Nuxt SSR settings
- Hydration errors → fix SSR/client mismatches

---

### Phase 1: Design & Contracts (IN PROGRESS)

**Goal**: Create data model and testing procedures

**Deliverables**:
1. `data-model.md` - Component state and metrics entities
2. `quickstart.md` - Testing and verification procedures
3. Update agent context (CLAUDE.md)

**Status**: data-model.md and quickstart.md already exist from previous plan run

---

### Phase 2: Implementation (NOT STARTED)

**Goal**: Execute diagnostic investigation and implement targeted fixes

**Approach**: Investigation-first (2-3 hours timebox) → identify cause → implement fix → verify

**High-Level Tasks** (to be detailed in tasks.md):
1. Add performance measurement logging
2. Run diagnostic investigation (bundle analysis, console inspection, profiling)
3. Document findings and identify root cause
4. Implement targeted optimization based on findings
5. Verify fix (TTI < 2000ms, click response < 1000ms)
6. Document ADR for constitutional exception

**Critical Constraint**: SSR MUST remain enabled throughout implementation

---

## Success Criteria

From spec.md:

- **SC-001**: Users can click cards within 1 second ✅
- **SC-002**: 100% click capture rate ✅
- **SC-003**: TTI reduced from 5-10s to < 2s ✅
- **SC-004**: No hydration errors in console ✅
- **SC-005**: 0% users experience 5-10s delay ✅
- **SC-006**: Bundle optimized (if applicable) ✅
- **SC-007**: 95%+ first-click success rate ✅
- **SC-008**: Navigation < 500ms ✅

**Verification**: See quickstart.md for test procedures

---

## Risks & Mitigations

### Risk 1: Root Cause Cannot Be Identified (Medium Risk)

**Mitigation**:
- 2-3 hour timebox for investigation
- If unclear, apply safest optimizations (bundle, ClientOnly removal)
- User approved: "Continue investigating until found" - prioritize thorough diagnosis

### Risk 2: Fix Doesn't Meet Performance Targets (Medium Risk)

**Mitigation**:
- Measure baseline before changes
- Apply incremental optimizations
- Iterate based on performance metrics
- May need multiple optimization passes

### Risk 3: SSR Optimization More Complex Than Expected (Low Risk)

**Mitigation**:
- Investigation-first approach reduces complexity
- Targeted fixes based on actual findings
- Not applying blanket changes
- Reversible if needed

### Risk 4: Constitutional Exception Confuses Future Developers (Low Risk)

**Mitigation**:
- Document exception clearly in ADR
- Explain business justification (SEO, FCP)
- Note this is exception, not new default
- Reference user clarification session

---

## Dependencies

### External Dependencies
- Strapi v5 CMS (unchanged)
- Nuxt 3.2.0 framework
- Browser DevTools for profiling

### Internal Dependencies
- Existing server proxy architecture (maintain)
- Current component structure (optimize, don't redesign)
- PWA configuration (may need adjustment for SSR)

---

## Next Steps

1. ✅ Research complete - diagnostic questions defined
2. ✅ Data model and quickstart already exist
3. ⏳ Update agent context (`.specify/scripts/bash/update-agent-context.sh claude`)
4. ⏳ Run `/speckit.tasks` to generate implementation tasks
5. ⏳ Execute investigation-first implementation

---

**Status**: Plan complete, ready for task generation. Key principle: **SSR MUST remain enabled** - optimize hydration, don't disable SSR.
