# Implementation Tasks: Speckit Catalog

**Feature**: 001-speckit-constitution
**Branch**: `001-speckit-constitution`
**Status**: Ready for Implementation
**Generated**: 2026-01-04

## Overview

This task breakdown implements a Speckit catalog at `/speckits` with detail pages at `/speckits/[speckitSlug]`, filtering by categories, and download functionality for .md and .zip formats. The implementation reuses existing components from the prompts feature and follows Nuxt 3 + Strapi patterns.

**Total Tasks**: 30
**Estimated Time**: 3-4 hours
**Parallel Opportunities**: 15 tasks can be parallelized

---

## Phase 1: Setup & Foundation (30 min)

### Goal
Establish type system and dependencies needed for the feature.

### Tasks

- [X] T001 Install JSZip dependency for .zip download functionality in frontend/
- [X] T002 Add SpeckitPreview and SpeckitFull types to frontend/types/article.ts
- [X] T003 [P] Create SpeckitCatalogItem type interface in frontend/types/article.ts
- [X] T004 [P] Create DownloadFormat type and DownloadOption interface in frontend/types/article.ts

**Completion Criteria**:
- `yarn add jszip` executed successfully
- TypeScript types compile without errors
- New types exported and ready for use

---

## Phase 2: Foundational - Server API & Composables (45 min)

### Goal
Create server routes and composables for fetching speckit data from Strapi.

### Tasks

- [X] T005 Create server API route for fetching speckit catalog at frontend/server/api/speckits.get.ts
- [X] T006 [P] Create server API route for fetching single speckit at frontend/server/api/speckits/[slug].get.ts
- [X] T007 Create composable for fetching speckit catalog at frontend/composables/useFetchSpeckits.ts
- [X] T008 [P] Create composable for fetching single speckit at frontend/composables/useFetchOneSpeckit.ts

**T005 Details** - Server route for catalog:
```
File: frontend/server/api/speckits.get.ts
- Fetch from Strapi /api/articles with filters[type][$eq]=speckit
- Populate categories relation
- Normalize response to SpeckitPreview[] type
- Handle errors with user-friendly Russian messages
- Follow existing server/api/articles.js pattern
```

**T006 Details** - Server route for detail:
```
File: frontend/server/api/speckits/[slug].get.ts
- Fetch from Strapi /api/articles with filters[slug][$eq]=slug
- Populate categories relation
- Normalize response to SpeckitFull type
- Return 404 if not found
- Handle errors with user-friendly Russian messages
```

**T007 Details** - Catalog composable:
```
File: frontend/composables/useFetchSpeckits.ts
- Call /api/speckits server route
- Return { data, pending, error, refresh }
- Extract unique categories from data
- Provide loading and error states
- Follow useFetchArticles.js pattern
```

**T008 Details** - Detail composable:
```
File: frontend/composables/useFetchOneSpeckit.ts
- Accept slug parameter
- Call /api/speckits/${slug} server route
- Return { data, pending, error, refresh }
- Follow useFetchOneArticle.js pattern
```

**Completion Criteria**:
- Server routes return normalized data
- Composables fetch data successfully
- Error handling works correctly
- Categories are populated in responses

---

## Phase 3: User Story 1/4 - Catalog & Navigation (60 min)

### User Story
**US1 - View Speckit Catalog (P1)**: A user visits the website and navigates to the Speckit catalog page via the "IDE инструкции" menu item to browse available IDE instructions and resources. They can view all speckit items in the catalog and filter by categories.

**US4 - Browse Speckit Catalog (P1)**: A user visits the Speckit catalog page to browse available resources, templates, and examples. They can view all items in the catalog and filter them by categories to find relevant content.

### Independent Test Criteria
Click "IDE инструкции" in the sidebar and verify:
1. Navigation to `/speckits` works
2. Catalog displays speckit items in a grid
3. Category filters work (client-side, instant)
4. "All Categories" clears filters
5. Responsive layout on mobile/tablet/desktop
6. Loading and error states display correctly

### Tasks

- [X] T009 [P] [US1] Add "IDE инструкции" menu item to Sidebar.vue navigation
- [X] T010 [P] [US1] Create catalog page at frontend/pages/speckits/index.vue
- [X] T011 [US1] Implement category filtering with computed properties in catalog page
- [X] T012 [US1] Add loading state with skeleton component in catalog page
- [X] T013 [US1] Add error state with user-friendly message in catalog page
- [X] T014 [US1] Add empty state when no speckits available in catalog page

**T009 Details** - Sidebar menu item:
```
File: frontend/components/main/Sidebar.vue
- Add "IDE инструкции" to items array at the end
- Link to /speckits route
- Preserve Russian language
- Follow existing menu item pattern
```

**T010 Details** - Catalog page structure:
```
File: frontend/pages/speckits/index.vue
- Reuse layout from pages/index.vue
- Use EnhancedPromptCard components for speckit cards
- Use PromptGrid for grid layout
- Use useFetchSpeckits composable
- Display title, description, category on each card
- Make cards clickable to navigate to detail pages
- Apply Tailwind CSS responsive classes
- Apply iridescent theme styling
```

**T011 Details** - Category filtering:
```
File: frontend/pages/speckits/index.vue
- Extract unique categories from speckits
- Use ref for selectedCategory (default: 'all')
- Use computed for filteredSpeckits
- Filter by category.name match
- Client-side only (no server round-trip)
- Instant response (meets SC-008)
```

**T012 Details** - Loading state:
```
File: frontend/pages/speckits/index.vue
- Check pending from composable
- Show PromptGrid skeleton during load
- Display text: "Загрузка..." in Russian
- Maintain layout stability
```

**T013 Details** - Error state:
```
File: frontend/pages/speckits/index.vue
- Check error from composable
- Display error message in Russian
- Provide retry button
- Suggest checking connection or trying later
```

**T014 Details** - Empty state:
```
File: frontend/pages/speckits/index.vue
- Check if filteredSpeckits.length === 0
- Display "Нет speckit в этой категории" message
- Suggest selecting another category
- Maintain visual consistency
```

**Completion Criteria**:
- All acceptance scenarios for US1 and US4 pass
- Catalog page loads < 3 seconds (SC-001, SC-002)
- Filtering is instant (< 100ms) (SC-008)
- Responsive layout works on all devices
- Loading, error, and empty states display correctly

---

## Phase 4: User Story 2/5/6 - Detail Page & Downloads (75 min)

### User Story
**US5 - View Speckit Detail Page (P1)**: A user browsing the catalog clicks on a speckit item to view its detail page, showing the full title, description, file preview, and download options.

**US2/US6 - Download Speckit (P1)**: A user viewing a speckit detail page wants to download it to their local device for offline use, sharing with team, or as a starting template.

### Independent Test Criteria
Click a speckit card from catalog and verify:
1. Navigation to `/speckits/[speckitSlug]` works
2. Detail page displays title, description, categories
3. Content preview renders markdown correctly
4. Download buttons (.md and .zip) are visible
5. Clicking download initiates file download within 2 seconds
6. Downloaded files contain correct content
7. "Back to Catalog" link returns to catalog
8. 404 page shows for non-existent slugs

### Tasks

- [X] T015 [P] [US5] Create detail page at frontend/pages/speckits/[speckitSlug].vue
- [X] T016 [P] [US5] Implement markdown content rendering in detail page
- [X] T017 [US5] Add "Back to Catalog" link in detail page
- [X] T018 [US5] Add error handling for 404 (non-existent speckit) in detail page
- [X] T019 [P] [US2] Create useFileDownload composable at frontend/composables/useFileDownload.ts
- [X] T020 [US2] Implement .md download functionality in detail page
- [X] T021 [US2] Implement .zip download functionality in detail page
- [X] T022 [US2] Add download error handling in detail page

**T015 Details** - Detail page structure:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Reuse layout from prompts/[promptSlug].vue
- Extract slug from route.params
- Use useFetchOneSpeckit composable
- Display title, description, categories
- Show content preview in monospace
- Apply Tailwind CSS styling
- Apply iridescent theme
- Support large content with proper formatting
```

**T016 Details** - Markdown rendering:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Use @nuxtjs/mdc MarkdownRenderer component
- Apply github-markdown-css class (markdown-body)
- Render speckit body field
- Handle code blocks, lists, headings
- Ensure scannability (SC-006)
```

**T017 Details** - Back navigation:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Add link or button to return to /speckits
- Use Vuetify v-btn or NuxtLink
- Label: "← Вернуться к каталогу" (Russian)
- Position near top of page
```

**T018 Details** - 404 error handling:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Check if data is null after fetch
- Display user-friendly error message in Russian
- Suggest returning to catalog
- Link to catalog page
- Return 404 status code for SEO
```

**T019 Details** - File download composable:
```
File: frontend/composables/useFileDownload.ts
- Export downloadMarkdown(filename, content) function
- Export downloadZip(filename, files) function
- Use Blob API for .md downloads
- Use JSZip for .zip downloads
- Create temporary <a> element for triggering download
- Clean up with URL.revokeObjectURL
- Handle errors gracefully
```

**T020 Details** - .md download:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Add button "Скачать Markdown" (Russian)
- On click: call downloadMarkdown(slug, content)
- Use descriptive filename: {slug}.md
- Content from speckit.body field
- Initiates within 2 seconds (SC-003)
```

**T021 Details** - .zip download:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Add button "Скачать ZIP-архив" (Russian)
- On click: call downloadZip(slug, { 'README.md': content })
- Use descriptive filename: {slug}.zip
- Include speckit markdown in zip
- Optionally include supplementary resources
- Initiates within 2 seconds (SC-003)
```

**T022 Details** - Download error handling:
```
File: frontend/pages/speckits/[speckitSlug].vue
- Catch download errors
- Display error message in Russian: "Не удалось скачать файл. Попробуйте еще раз."
- Clear error after 5 seconds
- Log error for diagnostics
- Don't block UI on error
```

**Completion Criteria**:
- All acceptance scenarios for US2, US5, US6 pass
- Detail page loads < 3 seconds (SC-001)
- Download initiates < 2 seconds (SC-003)
- Download success rate ≥ 99% (SC-004)
- Downloaded content 100% matches displayed (SC-007)
- 404 handling works correctly
- Markdown renders correctly

---

## Phase 5: User Story 3 - Preview Enhancement (Optional, 30 min)

### User Story
**US3 - Preview Speckit Before Download (P3)**: A user browsing the catalog wants to quickly preview what's included in a speckit before clicking through to the detail page or downloading, ensuring it meets their needs.

### Independent Test Criteria
View catalog page and verify:
1. Cards show sufficient information (title, description, category)
2. Hover state provides visual feedback
3. Truncated descriptions allow scanning
4. Category badges are visible and clear

### Tasks

- [ ] T023 [P] [US3] Add hover state to speckit cards in catalog page
- [ ] T024 [US3] Implement description truncation in catalog page cards

**T023 Details** - Hover state:
```
File: frontend/pages/speckits/index.vue (or EnhancedPromptCard)
- Add hover effects using Tailwind classes
- Scale card slightly on hover
- Increase shadow on hover
- Change cursor to pointer
- Smooth transition (150-200ms)
```

**T024 Details** - Description truncation:
```
File: frontend/pages/speckits/index.vue (or EnhancedPromptCard)
- Limit description to 2-3 lines (~150 chars)
- Add ellipsis (...) for truncated text
- Ensure consistent card heights
- Maintain readability
```

**Completion Criteria**:
- Users can assess relevance without clicking
- Visual feedback is smooth and professional
- Cards maintain consistent layout
- Scanability is improved

---

## Phase 6: Polish & Cross-Cutting Concerns (30 min)

### Goal
Ensure accessibility, performance, and production readiness.

### Tasks

- [ ] T025 Verify WCAG 2.1 AA accessibility compliance in catalog and detail pages
- [ ] T026 [P] Test responsive layout on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] T027 [P] Test category filtering performance with 100+ speckits
- [ ] T028 [P] Test download functionality on Chrome, Firefox, Safari
- [ ] T029 Add keyboard navigation support for catalog cards
- [ ] T030 Verify Russian language consistency across all UI text

**Completion Criteria**:
- All accessibility requirements met (Non-Functional Requirements)
- Responsive layout works on all target devices
- Performance meets all success criteria (SC-001 through SC-008)
- Downloads work on all major browsers
- Keyboard navigation works (Tab, Enter, Arrow keys)
- No English text in user-facing UI

---

## Dependencies

### Story Completion Order

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Server API + Composables)
    ↓
    ├─→ Phase 3 (US1/US4: Catalog & Navigation)
    │       ↓
    └─→ Phase 4 (US2/US5/US6: Detail Page & Downloads)
                ↓
            Phase 5 (US3: Preview Enhancement - Optional)
                ↓
            Phase 6 (Polish & Testing)
```

### Critical Path
1. **Must Complete Sequentially**: T001 → T002 → T005/T007 → T010 → T015 → T020
2. **Can Parallelize**: T003/T004, T006/T008, T009/T010, T016/T017, T019/T020

### External Dependencies
- Strapi CMS must be running and accessible
- Articles content type must exist with `type` field
- Categories content type must exist
- Test speckit data with `type="speckit"` should exist in Strapi

---

## Parallel Execution Opportunities

### Phase 1 (Setup)
- **Parallel Group 1**: T003, T004 (type definitions)
  - Different files, no dependencies
  - Can be done simultaneously

### Phase 2 (Foundational)
- **Parallel Group 2**: T006, T008 (detail server route + composable)
  - Independent from catalog route/composable
  - Can be done alongside T005/T007

### Phase 3 (Catalog)
- **Parallel Group 3**: T009, T010 (Sidebar + catalog page)
  - Independent files
  - Can be done simultaneously

### Phase 4 (Detail Page)
- **Parallel Group 4**: T015, T019 (detail page + download composable)
  - Independent concerns
  - Can be started together

- **Parallel Group 5**: T016, T017 (markdown rendering + back link)
  - Different features in same file
  - Can be done in parallel

### Phase 5 (Preview)
- **Parallel Group 6**: T023, T024 (hover state + truncation)
  - Different aspects of card enhancement
  - Can be done simultaneously

### Phase 6 (Polish)
- **Parallel Group 7**: T026, T027, T028 (testing tasks)
  - Different test scenarios
  - Can be done in parallel by multiple testers

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Phases 1-4 only** (Tasks T001-T022)

This delivers:
- ✅ Navigation with "IDE инструкции" menu item
- ✅ Catalog page at `/speckits` with filtering
- ✅ Detail page at `/speckits/[speckitSlug]`
- ✅ Download functionality (.md and .zip)
- ✅ Core user stories (US1, US2, US4, US5, US6) fully functional
- ⏸️ Preview enhancements (US3) deferred

**Time to MVP**: 3-3.5 hours
**Value Delivered**: Users can browse and download speckits immediately

### Incremental Delivery

**Sprint 1** (Day 1):
- Complete Phases 1-2 (Setup + Foundational)
- Deliver: Working API routes and composables
- Test: Verify data fetching works

**Sprint 2** (Day 1-2):
- Complete Phase 3 (Catalog & Navigation)
- Deliver: Working catalog page with filtering
- Test: Verify catalog displays and filters work

**Sprint 3** (Day 2):
- Complete Phase 4 (Detail Page & Downloads)
- Deliver: Full feature functionality
- Test: End-to-end user flows

**Sprint 4** (Day 2-3, Optional):
- Complete Phase 5 (Preview Enhancements)
- Polish UX based on testing feedback

**Sprint 5** (Day 3):
- Complete Phase 6 (Polish & Testing)
- Production deployment preparation

---

## Testing Strategy

### Manual Testing (Primary)
Since automated testing is not specified in the spec, manual testing is the primary approach:

**Catalog Page Testing**:
1. Navigate via "IDE инструкции" menu item
2. Verify speckit items display
3. Test category filters (each category)
4. Test "All Categories" reset
5. Test responsive layout (mobile, tablet, desktop)
6. Test loading state (slow network)
7. Test error state (Strapi down)
8. Test empty state (no speckits in category)

**Detail Page Testing**:
1. Click various speckit cards
2. Verify detail page loads
3. Verify content renders correctly
4. Test "Back to Catalog" link
5. Test 404 for invalid slug
6. Test .md download
7. Test .zip download
8. Verify downloaded content matches displayed

**Cross-Browser Testing**:
- Chrome (primary)
- Firefox
- Safari
- Edge (if needed)

### Performance Testing
- Page load time: < 3 seconds
- Download initiation: < 2 seconds
- Category filtering: < 100ms (instant)
- Test with 100+ speckits in catalog

### Accessibility Testing
- Keyboard navigation (Tab, Enter, Arrows)
- Screen reader compatibility
- Color contrast verification
- Focus indicators visible

---

## Format Validation

All tasks follow the required checklist format:
- ✅ Checkbox prefix: `- [ ]`
- ✅ Task ID: T001-T030 (sequential)
- ✅ [P] marker: Present for parallelizable tasks
- ✅ [Story] label: Present for user story tasks ([US1], [US2], etc.)
- ✅ File paths: Specified for all implementation tasks
- ✅ Descriptions: Clear and actionable

---

## Notes

### Component Reuse
- **PromptCard**: For simple speckit cards
- **EnhancedPromptCard**: For enhanced speckit cards with hover effects
- **PromptGrid**: For responsive grid layout
- **MarkdownRenderer** (from @nuxtjs/mdc): For content rendering

### Existing Patterns to Follow
- `pages/index.vue`: Catalog page structure
- `prompts/[promptSlug].vue`: Detail page structure
- `server/api/articles.js`: Server API pattern
- `composables/useFetchArticles.js`: Composable pattern
- `types/article.ts`: Type definition pattern

### Strapi Integration
- Filter by `type="speckit"` on Articles content type
- Populate categories relation
- Use existing Strapi client or @nuxtjs/strapi module
- Server routes handle authorization if needed

### Download Implementation
- Client-side only (no server round-trip)
- Blob API for .md files
- JSZip library for .zip archives
- Automatic cleanup with URL.revokeObjectURL

---

## Summary

| Phase | Tasks | Time | Parallelizable | Priority |
|-------|-------|------|----------------|----------|
| Phase 1: Setup | 4 | 30 min | 2 | P0 |
| Phase 2: Foundational | 4 | 45 min | 2 | P0 |
| Phase 3: Catalog & Navigation (US1/4) | 6 | 60 min | 2 | P1 |
| Phase 4: Detail Page & Downloads (US2/5/6) | 8 | 75 min | 4 | P1 |
| Phase 5: Preview Enhancement (US3) | 2 | 30 min | 2 | P3 |
| Phase 6: Polish & Testing | 6 | 30 min | 3 | P1 |
| **Total** | **30** | **3.5-4 hrs** | **15 parallelizable** | - |

**Recommended MVP**: Phases 1-4 (Tasks T001-T022) - delivers full core functionality

**Next Command**: Run `/speckit.implement` to execute these tasks, or implement manually following this task breakdown.
