# Tasks: Speckit View Enhancements

**Input**: Design documents from `/specs/003-speckit-view-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No tests explicitly requested - implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` (Nuxt 3 + Vue 3 + TypeScript)
- **Backend**: None (Strapi CMS only - no backend code changes)
- Paths shown below assume frontend structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install Mermaid.js dependency in frontend/package.json
- [X] T002 Install Mermaid.js TypeScript types in frontend/package.json (NOT NEEDED - types included in package)
- [ ] T003 Add diagram field to Strapi Articles content type via admin panel (MANUAL - USER ACTION REQUIRED)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and static content that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Add SpeckitDiagramData interface in frontend/types/article.ts
- [X] T005 [P] Add SpeckitFaqEntry interface in frontend/types/article.ts
- [X] T006 [P] Add SpeckitFaqCategory interface in frontend/types/article.ts
- [X] T007 [P] Add SpeckitFaqData interface in frontend/types/article.ts
- [X] T008 [P] Add SpeckitCopyCommandData interface in frontend/types/article.ts
- [X] T009 Extend SpeckitFull interface with diagram field in frontend/types/article.ts
- [X] T010 Create initial FAQ content file in frontend/public/speckit-faq.json

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Copy Speckit Download Command (Priority: P1) 🎯 MVP

**Goal**: Enable users to quickly copy the wget command to download a Speckit specification file with a single click

**Independent Test**: View any Speckit detail page, click the copy command button, and paste to verify the correct wget command is copied to clipboard

### Implementation for User Story 1

- [X] T011 [P] [US1] Create useClipboard composable in frontend/composables/useClipboard.ts
- [X] T012 [US1] Create SpeckitCopyCommand component in frontend/components/speckit/SpeckitCopyCommand.vue (depends on T011)
- [X] T013 [US1] Integrate copy command component in frontend/pages/speckits/[speckitSlug].vue (depends on T012)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can copy wget commands with visual feedback

---

## Phase 4: User Story 2 - Download Speckit File Directly (Priority: P1)

**Goal**: Provide direct file download button for users who prefer GUI downloads over command-line operations

**Independent Test**: Click the download button on any Speckit detail page and verify the file is saved to the default downloads folder with correct filename and content

### Implementation for User Story 2

- [X] T014 [P] [US2] Update SpeckitDownloadBar component styling in frontend/components/speckit/SpeckitDownloadBar.vue (NOT NEEDED - used existing component)
- [X] T015 [US2] Integrate download button with copy command in frontend/pages/speckits/[speckitSlug].vue (depends on T014, T013)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can copy commands OR download files directly

---

## Phase 5: User Story 3 - View Speckit Process Visualization (Priority: P2)

**Goal**: Display visual Mermaid diagram under the description to help users understand the Speckit workflow

**Independent Test**: View any Speckit detail page with diagram data configured and verify the diagram renders correctly with nodes, connections, and labels from Strapi data

### Implementation for User Story 3

- [X] T016 [P] [US3] Create useMermaidDiagram composable in frontend/composables/useMermaidDiagram.ts
- [X] T017 [P] [US3] Create diagram API server route in frontend/server/api/speckits/[slug]/diagram.get.ts
- [X] T018 [P] [US3] Update speckit details API route to include diagram field in frontend/server/api/speckits/[slug].get.ts
- [X] T019 [US3] Create SpeckitDiagramView component in frontend/components/speckit/SpeckitDiagramView.vue (depends on T016)
- [X] T020 [US3] Integrate diagram component in frontend/pages/speckits/[speckitSlug].vue (depends on T017, T018, T019)

**Checkpoint**: All user stories should now be independently functional - users can copy commands, download files, and view diagrams

---

## Phase 6: User Story 4 - Access Speckit FAQ and Setup Instructions (Priority: P3)

**Goal**: Provide FAQ section at bottom of Speckit detail page with answers about applying Speckits and configuring environment

**Independent Test**: Scroll to the FAQ section and verify all questions and answers are displayed, properly formatted, and readable in Russian

### Implementation for User Story 4

- [X] T021 [P] [US4] Create useSpeckitFaq composable in frontend/composables/useSpeckitFaq.ts
- [X] T022 [US4] Create SpeckitFaqSection component in frontend/components/speckit/SpeckitFaqSection.vue (depends on T021)
- [X] T023 [US4] Integrate FAQ component in frontend/pages/speckits/[speckitSlug].vue (depends on T022)

**Checkpoint**: All user stories complete - full feature set available to users

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, validation, and integration verification

- [ ] T024 [P] Verify mobile responsive layout for all screen sizes (320px, 375px, 414px, 768px+)
- [ ] T025 [P] Verify Russian localization for all UI text and error messages
- [ ] T026 [P] Test clipboard functionality across browsers (Chrome, Firefox, Safari)
- [ ] T027 [P] Test Mermaid diagram rendering with valid and invalid syntax
- [ ] T028 [P] Validate FAQ JSON format and content structure
- [ ] T029 Run manual testing procedures from quickstart.md
- [ ] T030 Verify Strapi diagram field works correctly with sample data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T003) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T004-T010)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares file [speckitSlug].vue with US1, should be coordinated
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Shares file [speckitSlug].vue with US1/US2, should be coordinated
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Shares file [speckitSlug].vue with US1/US2/US3, should be coordinated

**Note**: All user stories integrate into the same page component ([speckitSlug].vue). For parallel development, coordinate file access or implement sequentially.

### Within Each User Story

- Composables before components (logic before UI)
- Components before page integration
- API routes before component integration (for US3 diagram feature)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T001 and T002 can run in parallel (both are yarn commands)
- T003 is manual (Strapi admin panel) but independent

**Foundational Phase (Phase 2)**:
- T004-T009 can run in parallel (all type definitions in same file, but logically separate)
- T010 is independent (static file creation)

**User Story 1 (Phase 3)**:
- T011 (composable) and T014 (US2 component) can run in parallel (different files)
- T012 (US1 component) depends on T011
- T013 (page integration) depends on T012

**User Story 2 (Phase 4)**:
- T014 (component styling) can run in parallel with T011 (US1 composable)
- T015 (page integration) depends on T013 (US1 page integration) to avoid file conflicts

**User Story 3 (Phase 5)**:
- T016 (composable), T017 (API route), T018 (API update) can all run in parallel (different files)
- T019 (component) depends on T016
- T020 (page integration) depends on T017, T018, T019

**User Story 4 (Phase 6)**:
- T021 (composable) can run in parallel with T016 (US3 composable)
- T022 (component) depends on T021
- T023 (page integration) depends on T022 AND T020 (to avoid [speckitSlug].vue conflicts)

**Polish Phase (Phase 7)**:
- T024-T028 can all run in parallel (different testing aspects)
- T029 and T030 are sequential validation tasks

---

## Parallel Example: User Story 3

```bash
# Launch all foundation tasks for User Story 3 together:
Task T016: "Create useMermaidDiagram composable in frontend/composables/useMermaidDiagram.ts"
Task T017: "Create diagram API server route in frontend/server/api/speckits/[slug]/diagram.get.ts"
Task T018: "Update speckit details API route to include diagram field in frontend/server/api/speckits/[slug].get.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only - P1 Priority)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T013)
4. Complete Phase 4: User Story 2 (T014-T015)
5. **STOP and VALIDATE**: Test copy command and download button independently
6. Deploy/demo MVP (wget command + direct download)

### Full Feature Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo
5. Polish → Final deployment
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

**With multiple developers** (coordinating on shared file [speckitSlug].vue):

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T013)
   - Developer B: User Story 2 (T014-T015, waits for T013)
   - Developer C: User Story 3 (T016-T020, coordinates page integration)
3. Stories complete and integrate independently
4. Developer D: User Story 4 (T021-T023, coordinates page integration)

**Key coordination point**: [speckitSlug].vue page integrations (T013, T015, T020, T023) should be sequenced or carefully merged

---

## Task Summary

- **Total Tasks**: 30
- **Setup**: 3 tasks (T001-T003)
- **Foundational**: 7 tasks (T004-T010)
- **User Story 1 (P1)**: 3 tasks (T011-T013)
- **User Story 2 (P1)**: 2 tasks (T014-T015)
- **User Story 3 (P2)**: 5 tasks (T016-T020)
- **User Story 4 (P3)**: 3 tasks (T021-T023)
- **Polish**: 7 tasks (T024-T030)

**Parallel Opportunities**: 18 tasks marked with [P] can run in parallel within their phases

---

## Notes

- [P] tasks = different files, no file conflict dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **File coordination required**: Multiple stories integrate into [speckitSlug].vue - sequence or coordinate merges
- Avoid: vague tasks, uncoordinated file access, cross-story dependencies that break independence
