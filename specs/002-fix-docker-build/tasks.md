# Tasks: Fix Build Process - Missing Page Route Error

**Input**: Design documents from `/specs/002-fix-docker-build/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Tests are NOT requested in the feature specification. Build process itself serves as the test.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `frontend/`, `backend/`, repository root
- This is a frontend configuration fix only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the environment and understand the issue

- [X] T001 Verify build error exists by running `yarn build` in frontend/ directory
- [X] T002 [P] Review current Nuxt configuration in frontend/nuxt.config.js
- [X] T003 [P] Review page files in frontend/pages/ directory to confirm about.vue doesn't exist
- [X] T004 [P] Review research.md for root cause analysis and solution approach

**Checkpoint**: ✅ Issue confirmed, solution approach understood

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare for the fix

- [X] T005 Create git branch `002-fix-docker-build` from master
- [X] T006 [P] Review quickstart.md implementation steps
- [X] T007 Clean build cache by running `rm -rf frontend/.nuxt`

**Checkpoint**: ✅ Environment ready, branch created, cache cleared

---

## Phase 3: User Story 1 - Application Deployment Succeeds (Priority: P1) 🎯 MVP

**Goal**: Fix the Docker build by removing the `/about` route from prerender configuration

**Independent Test**: Run `yarn build` in frontend directory and verify it completes with exit code 0, no prerender errors, and generates `.output/public/` directory

### Implementation for User Story 1

- [X] T008 [US1] Open frontend/nuxt.config.js in editor and locate routeRules section (lines 5-14)
- [X] T009 [US1] Remove line 9: `'/about': { prerender: true },` from routeRules in frontend/nuxt.config.js
- [X] T010 [US1] Verify routeRules section only contains routes with existing pages: `/` and `/speckits`
- [X] T011 [US1] Save frontend/nuxt.config.js
- [X] T012 [US1] Run `yarn build` in frontend/ directory and verify build completes successfully
- [X] T013 [US1] Verify build output shows no `[404] Page not found: /about` error
- [X] T014 [US1] Verify `.output/public/` directory contains index.html and speckits/index.html
- [ ] T015 [US1] Run `yarn preview` to test application locally (optional)
- [ ] T016 [US1] Test home page at http://localhost:8080/ loads correctly
- [ ] T017 [US1] Test speckits page at http://localhost:8080/speckits loads correctly
- [X] T018 [US1] Stage changes with `git add frontend/nuxt.config.js`
- [X] T019 [US1] Commit changes with descriptive commit message explaining the fix
- [ ] T020 [US1] [P] Test Docker build locally by running `docker build -t test-build .` from repository root (optional)

**Checkpoint**: ✅ User Story 1 complete - Docker build succeeds, application works, changes committed

---

## Phase 4: User Story 2 - Configuration Matches Implementation (Priority: P2)

**Goal**: Document the fix to prevent similar configuration drift issues in the future

**Independent Test**: Review the documentation and verify it clearly explains the issue and solution

### Implementation for User Story 2

- [ ] T021 [P] [US2] Update project documentation (if needed) to explain prerender configuration process
- [ ] T022 [P] [US2] Consider adding comments in frontend/nuxt.config.js to document route rules (optional)
- [ ] T023 [P] [US2] Document lessons learned in project notes or CLAUDE.md (optional)

**Checkpoint**: User Story 2 complete - Documentation updated to prevent future issues

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and deployment preparation

- [ ] T024 [P] Verify all tasks in User Story 1 are complete
- [ ] T025 [P] Run final validation from quickstart.md verification checklist
- [ ] T026 [P] Push branch to remote: `git push origin 002-fix-docker-build`
- [ ] T027 [P] Create pull request to merge into master with description referencing issue #002-fix-docker-build
- [ ] T028 [P] Monitor CI/CD pipeline to ensure Docker build succeeds
- [ ] T029 [P] Deploy to staging/production and verify application works correctly
- [ ] T030 [P] Monitor production logs for any new errors after deployment

**Checkpoint**: Feature deployed and verified in production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - prepares environment
- **User Story 1 (Phase 3)**: Depends on Foundational phase - MUST complete for MVP
- **User Story 2 (Phase 4)**: Can run in parallel with User Story 1 (documentation only)
- **Polish (Phase 5)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can run in parallel with User Story 1 (optional documentation)

### Within Each User Story

- User Story 1: Tasks are sequential (T008 → T009 → ... → T020)
  - T020 is optional and can run in parallel after commit
- User Story 2: All tasks can run in parallel (optional documentation)

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel (all review tasks)
- **Phase 2**: T006 can run in parallel while T005 creates branch
- **Phase 4**: T021, T022, T023 can all run in parallel (optional documentation)
- **Phase 5**: T024-T030 can run in parallel after User Story 1 is complete

---

## Parallel Example: User Story 1

```bash
# Review tasks (Setup Phase 1):
Task: "Review current Nuxt configuration in frontend/nuxt.config.js"
Task: "Review page files in frontend/pages/ directory"
Task: "Review research.md for root cause analysis"

# Documentation tasks (User Story 2 Phase 4):
Task: "Update project documentation to explain prerender configuration"
Task: "Consider adding comments in frontend/nuxt.config.js"
Task: "Document lessons learned in project notes"

# Polish tasks (Phase 5):
Task: "Verify all tasks in User Story 1 are complete"
Task: "Run final validation from quickstart.md"
Task: "Push branch to remote"
Task: "Create pull request"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify issue)
2. Complete Phase 2: Foundational (prepare environment)
3. Complete Phase 3: User Story 1 (fix the build)
4. **STOP and VALIDATE**: Run `yarn build` to verify fix works
5. Commit and push changes
6. Deploy and verify in production

**Timeline**: ~15-30 minutes total

### Incremental Delivery

1. Complete Setup + Foundational → Issue confirmed
2. Add User Story 1 → Build fixed → Deploy (MVP!)
3. Add User Story 2 (optional) → Documentation updated → Deploy
4. Polish → Production monitoring

### Parallel Team Strategy

With multiple developers:

1. Developer A: User Story 1 (fix the build)
2. Developer B: User Story 2 (documentation, optional)
3. Both work in parallel after Setup phase
4. Merge and deploy together

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2] labels map tasks to user stories
- User Story 1 is the MVP and MUST complete for unblocking deployments
- User Story 2 is optional preventive documentation
- Build process itself serves as the test (no unit/integration tests needed)
- Stop at checkpoint after User Story 1 to validate independently
- Avoid: changing other routes, creating new pages, performance optimizations
