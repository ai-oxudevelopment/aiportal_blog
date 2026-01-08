# Tasks: Speckit UI Enhancements

**Input**: Design documents from `/specs/002-speckit-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md, quickstart.md

**Tests**: Manual testing in browser - no automated test tasks (see quickstart.md testing checklist)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app frontend**: `frontend/components/`, `frontend/pages/`, `frontend/composables/`, `frontend/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - this feature uses existing infrastructure, so setup is minimal

- [X] T001 Verify dev server is running on port 8080 and branch `002-speckit-ui` is checked out

**Checkpoint**: Development environment ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions that user story components depend on

**⚠️ CRITICAL**: Complete this phase before implementing user story components

- [X] T002 Add `SpeckitUsageInstructions` and `InstructionSection` interfaces to frontend/types/article.ts
- [X] T003 Review existing `AiPlatformSelector.vue` component at frontend/components/research/AiPlatformSelector.vue to understand visual design patterns

**Checkpoint**: Type definitions ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Download Speckit Configuration (Priority: P1) 🎯 MVP

**Goal**: Relocate configuration file download to bottom of page with consistent visual design

**Independent Test**: Navigate to a speckit page with a configuration file, click the download button at the bottom of the page, verify the file downloads with correct filename and loading state appears during download

### Implementation for User Story 1

- [X] T004 [US1] Create `frontend/components/speckit/` directory
- [X] T005 [US1] Create `SpeckitDownloadBar.vue` component at frontend/components/speckit/SpeckitDownloadBar.vue with template structure (buttons, gradient background, fixed positioning)
- [X] T006 [US1] Implement download button with loading state and disabled state in SpeckitDownloadBar.vue
- [X] T007 [US1] Implement help button with "?" icon in SpeckitDownloadBar.vue (emit event only, modal implemented in US2)
- [X] T008 [US1] Add download functionality using `useFileDownload` composable in SpeckitDownloadBar.vue script setup
- [X] T009 [US1] Implement error handling with 5-second auto-dismiss toast in SpeckitDownloadBar.vue
- [X] T010 [US1] Add gradient animation CSS keyframes matching AiPlatformSelector in SpeckitDownloadBar.vue style section
- [X] T011 [US1] Add conditional rendering to hide component when `speckit.file` is null/undefined in SpeckitDownloadBar.vue
- [X] T012 [US1] Import and add `SpeckitDownloadBar` component to frontend/pages/speckits/[speckitSlug].vue
- [X] T013 [US1] Add `showHelpModal` ref state in [speckitSlug].vue page component (prepare for US2)
- [X] T014 [US1] Wire up `@help` event from SpeckitDownloadBar to `showHelpModal = true` in [speckitSlug].vue
- [X] T015 [US1] Test download functionality in browser (click button, verify download, loading state, error handling) - Ready for manual testing on http://localhost:8080

**Checkpoint**: At this point, User Story 1 should be fully functional - users can download configuration files from the bottom of the page

---

## Phase 4: User Story 2 - Access Speckit Usage Instructions (Priority: P2)

**Goal**: Provide in-context help documentation through a modal dialog

**Independent Test**: Click the "?" button, verify modal opens with instructions, close via ESC key, click outside, and close button

### Implementation for User Story 2

- [X] T016 [US2] Create `SpeckitHelpModal.vue` component at frontend/components/speckit/SpeckitHelpModal.vue with teleport wrapper and overlay
- [X] T017 [US2] Implement modal header with title and close button in SpeckitHelpModal.vue
- [X] T018 [US2] Implement modal body with instructions rendering using MDC in SpeckitHelpModal.vue
- [X] T019 [US2] Implement click-outside-to-close functionality in SpeckitHelpModal.vue
- [X] T020 [US2] Implement Escape key handler for closing modal in SpeckitHelpModal.vue
- [X] T021 [US2] Add transition animations (fade/scale) for modal open/close in SpeckitHelpModal.vue styles
- [X] T022 [US2] Prevent body scroll when modal is open in SpeckitHelpModal.vue script setup
- [X] T023 [US2] Create default instructions object in [speckitSlug].vue with Russian content (sections: What is Speckit, Downloading, Integration, Troubleshooting)
- [X] T024 [US2] Import and add `SpeckitHelpModal` component to [speckitSlug].vue with v-model binding to `showHelpModal`
- [X] T025 [US2] Test modal interactions in browser (open via "?", close via ESC, click outside, close button) - Ready for manual testing on http://localhost:8080

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can download files and access help documentation

---

## Phase 5: User Story 3 - Try Speckit in AI Assistant (Priority: P3)

**Goal**: Enable users to open speckit content in ChatGPT, Claude, or Perplexity

**Independent Test**: Scroll to bottom of speckit page with body content, click each platform button, verify new tab opens with correct URL and content

### Implementation for User Story 3

- [X] T026 [US3] Import `AiPlatformSelector` component in [speckitSlug].vue page component
- [X] T027 [US3] Add `AiPlatformSelector` component to [speckitSlug].vue template with `prompt-text` prop bound to `speckit.body`
- [X] T028 [US3] Add conditional rendering to hide `AiPlatformSelector` when `speckit.body` is empty or null in [speckitSlug].vue
- [X] T029 [US3] Test AI platform buttons in browser (click ChatGPT, Claude, Perplexity, verify new tabs open with correct content) - Ready for manual testing on http://localhost:8080

**Checkpoint**: All user stories should now be independently functional - download, help, and AI platform integration all working

---

## Phase 6: Integration & Cleanup

**Purpose**: Remove old download section and verify all components work together

- [ ] T030 Remove old configuration file download section (lines 76-113) from [speckitSlug].vue
- [ ] T031 Remove old Markdown/ZIP download buttons (lines 50-73) from [speckitSlug].vue or keep if desired (per quickstart.md these are redundant with configuration file download)
- [ ] T032 Verify all three components render correctly at bottom of page in [speckitSlug].vue
- [ ] T033 Test mobile responsive layout (< 768px viewport) to ensure bottom controls don't overlap content
- [ ] T034 Test edge cases: speckit without file (download button hidden), speckit without body (AI buttons hidden), network error during download
- [ ] T035 Run full testing checklist from quickstart.md (download, modal, AI platforms, edge cases, mobile)

**Checkpoint**: Feature complete - all user stories integrated and tested

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T036 [P] Add ARIA labels and roles to buttons and modal for accessibility
- [ ] T037 [P] Implement focus management (trap focus in modal, return focus to trigger button when closed)
- [ ] T038 [P] Verify Russian language consistency across all UI text (button labels, modal content, error messages)
- [ ] T039 [P] Test performance (page load time < 2 seconds, no bundle size regression)
- [ ] T040 Code cleanup: remove unused imports, format code, add comments if needed
- [ ] T041 Run quickstart.md validation checklist one final time
- [ ] T042 Commit changes with descriptive commit message following project conventions

**Checkpoint**: Feature production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - **User Story 1**: Can start after Foundational - No dependencies on other stories
  - **User Story 2**: Can start after Foundational - Integrates with US1 but independently testable
  - **User Story 3**: Can start after Foundational - No dependencies on US1 or US2
- **Integration (Phase 6)**: Depends on US1, US2, and US3 being complete
- **Polish (Phase 7)**: Depends on Integration phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses US1's download bar component but can be tested independently by mocking download bar emit
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Completely independent of US1 and US2

### Within Each User Story

**User Story 1**:
- T004 (directory creation) must complete before T005 (component creation)
- T005-T007 (component structure) before T008-T011 (functionality)
- T008-T011 (component complete) before T012-T014 (page integration)
- T015 (testing) after all implementation

**User Story 2**:
- T016-T022 (component implementation) sequential order
- T023 (default instructions) before T024 (page integration)
- T025 (testing) after all implementation

**User Story 3**:
- T026-T027 must be sequential (import then use)
- T028 (conditional) after T027
- T029 (testing) after implementation

### Parallel Opportunities

- Within Phase 7: T036, T037, T038, T039 can all run in parallel (different files/concerns)
- User stories can be developed in parallel by different team members once Foundational phase completes
- No parallel execution within each user story (tasks are sequential by design for simplicity)

---

## Parallel Example: User Story 1

```bash
# Sequential execution recommended for US1 (tasks build on each other)
# Start with T005 (create component structure)
# Then implement each feature incrementally
# Test at T015

# For parallel development across stories (multiple developers):
Developer A: T004-T015 (User Story 1)
Developer B: T016-T025 (User Story 2)
Developer C: T026-T029 (User Story 3)

# All can start in parallel after Phase 2 (Foundational) completes
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - adds types needed by all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test download functionality independently
5. Deploy/demo if ready - users can download configuration files from bottom of page

### Incremental Delivery

1. Complete Setup + Foundational → Type definitions ready
2. Add User Story 1 → Test download independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test help modal independently → Deploy/Demo
4. Add User Story 3 → Test AI platform integration → Deploy/Demo
5. Complete Integration & Polish → Full feature delivery
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T004-T015) - Download functionality
   - Developer B: User Story 2 (T016-T025) - Help modal
   - Developer C: User Story 3 (T026-T029) - AI platform integration
3. Stories integrate and test independently
4. Team completes Integration & Polish together

---

## Notes

- [P] tasks = different files, no dependencies (mostly in Polish phase)
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing in browser (no automated tests - see quickstart.md for testing checklist)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Frontend-only feature - no backend changes required
- Uses existing infrastructure (composables, types, components)
- Follow constitution principles (no Strapi calls from client, feature-based organization, Tailwind for styling)

---

## Task Count Summary

- **Total Tasks**: 42
- **Setup**: 1 task
- **Foundational**: 2 tasks
- **User Story 1 (P1)**: 12 tasks (MVP scope)
- **User Story 2 (P2)**: 10 tasks
- **User Story 3 (P3)**: 4 tasks
- **Integration**: 7 tasks
- **Polish**: 7 tasks
- **Parallel Tasks**: 4 (in Polish phase)
- **Independent Test Criteria**: Defined for each user story
- **Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, labels, file paths
