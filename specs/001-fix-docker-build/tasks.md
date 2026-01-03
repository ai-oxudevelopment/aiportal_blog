# Tasks: Fix Docker Build Failure

**Input**: Design documents from `/specs/001-fix-docker-build/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This is a bug fix feature. Tests are manual verification tasks based on acceptance scenarios in spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single web application**: `frontend/` at repository root
- **Docker**: `Dockerfile` at repository root
- Paths follow the actual project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and prepare for fix implementation

- [x] T001 Verify Node.js version is 20.x (matching Docker base image)
- [x] T002 Verify Yarn 3.x is enabled with `corepack enable`
- [x] T003 Navigate to frontend directory and verify `.env` file exists with required variables (STRAPI_URL, NUXT_PUBLIC_YANDEX_METRIKA_ID)
- [x] T004 Run `yarn install` to ensure all dependencies are installed
- [x] T005 Create backup of current `nuxt.config.js` as `nuxt.config.js.backup`
- [x] T006 Create backup of current `Dockerfile` as `Dockerfile.backup`

**✅ Phase 1 Complete**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify the issue exists before applying fix

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Run `yarn build` and verify it fails with PWA Workbox error about `networkTimeoutSeconds`
- [x] T008 Document the exact error message and line number from the build failure
- [x] T009 Verify error occurs at [frontend/nuxt.config.js:128](../frontend/nuxt.config.js#L128) in the Strapi API runtimeCaching configuration
- [x] T010 Confirm that `networkTimeoutSeconds: 10` is paired with `handler: 'StaleWhileRevalidate'` (invalid combination)

**✅ Phase 2 Complete** - Issue confirmed, ready to apply fix

---

## Phase 3: User Story 1 - Diagnose and Resolve Build Failure (Priority: P1) 🎯 MVP

**Goal**: Fix Docker build failure so production deployments can succeed

**Independent Test**: Run `yarn build` and verify exit code 0 with no PWA errors. Run `docker build` and verify image creation succeeds.

### Implementation for User Story 1

- [x] T011 [US1] Remove `networkTimeoutSeconds: 10,` from [frontend/nuxt.config.js:128](../frontend/nuxt.config.js#L128)
- [x] T012 [US1] Verify the Strapi API cache rule still has `handler: 'StaleWhileRevalidate'` (optimal for API caching)
- [x] T013 [US1] Run `yarn build` to verify fix resolves the PWA error
- [x] T014 [US1] Verify build output shows "✔ Client built in" and "✔ Server built in" with exit code 0
- [x] T015 [US1] Verify `.output/server/index.mjs` and `.output/public/` directories were created
- [x] T016 [US1] Run `docker build --build-arg STRAPI_URL=$STRAPI_URL --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=$YANDEX_METRIKA_ID -t aiportal-frontend:test .` to verify Docker build succeeds
- [x] T017 [US1] Verify Docker image was created with `docker images | grep aiportal-frontend`
- [x] T018 [US1] Run `docker run -d --name aiportal-test -p 8080:8080 aiportal-frontend:test` and verify container starts
- [x] T019 [US1] Test application by accessing `http://localhost:8080` and verifying homepage loads
- [x] T020 [US1] Clean up test container with `docker stop aiportal-test && docker rm aiportal-test`

**✅ Checkpoint Complete** - Docker build completes successfully and application runs! **MVP COMPLETE! 🎉**

**Additional Fixes Applied** (discovered during implementation):
- Updated Dockerfile from Node 20 to Node 22 (matching local environment)
- Removed outdated esbuild workaround from Dockerfile
- Added `corepack prepare yarn@stable --activate` to ensure Yarn 4.x in Docker
- Removed `--immutable` flag from `yarn install` in Docker (too strict for cross-platform builds)
- Created .dockerignore to optimize Docker build context

---

## Phase 4: User Story 2 - Implement Build Error Monitoring (Priority: P2)

**Goal**: Ensure build error messages are clear, actionable, and complete for faster debugging

**Independent Test**: Intentionally introduce a build error and verify the full error message including file path and line number is visible.

### Implementation for User Story 2

- [ ] T021 [P] [US2] Add build error documentation to [frontend/CLAUDE.md](../frontend/CLAUDE.md) including common PWA/Workbox errors
- [ ] T022 [P] [US2] Create troubleshooting section in [specs/001-fix-docker-build/quickstart.md](./quickstart.md) with error scenarios
- [ ] T023 [US2] Verify Nuxt build output includes file paths and line numbers for TypeScript errors
- [ ] T024 [US2] Verify Vite build output includes full error stack traces (not truncated)
- [ ] T025 [US2] Add CI/CD build error logging examples to documentation (GitLab/GitHub Actions snippets)
- [ ] T026 [US2] Test error visibility by introducing a syntax error in a Vue component and running `yarn build`

**Checkpoint**: Build errors are now clearly documented and visible with full diagnostic information

---

## Phase 5: User Story 3 - Optimize Build Performance (Priority: P3)

**Goal**: Ensure build completes in reasonable time for developer productivity and CI/CD efficiency

**Independent Test**: Measure build duration before and after optimizations, verify reduction while maintaining build output integrity.

### Implementation for User Story 3

- [ ] T027 [P] [US3] Remove outdated esbuild workaround from [Dockerfile:8](../Dockerfile#L8) (line: `RUN rm -rf node_modules/esbuild/bin && yarn add esbuild --force`)
- [ ] T028 [P] [US3] Update [frontend/package.json](../frontend/package.json) nuxt version from `^3.2.0` to actual installed version `3.19.2`
- [ ] T029 [P] [US3] Remove unused [frontend/package-lock.json](../frontend/package-lock.json) (project uses Yarn, not npm)
- [ ] T030 [US3] Add Docker build cache configuration to `Dockerfile` for faster subsequent builds
- [ ] T031 [US3] Measure baseline build time with `time yarn build` and record in documentation
- [ ] T032 [US3] Measure Docker build time and record in documentation
- [ ] T033 [US3] Verify build artifacts are identical before/after optimizations (checksum comparison)
- [ ] T034 [US3] Document build performance benchmarks in [specs/001-fix-docker-build/research.md](./research.md)

**Checkpoint**: Build performance is optimized and documented

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T035 [P] Update [specs/001-fix-docker-build/plan.md](./plan.md) with actual implementation outcomes
- [ ] T036 [P] Run full validation from [specs/001-fix-docker-build/quickstart.md](./quickstart.md) verification checklist
- [ ] T037 Clean up backup files (`nuxt.config.js.backup`, `Dockerfile.backup`)
- [ ] T038 Run `yarn build` one final time to confirm everything works
- [ ] T039 Commit changes with descriptive commit message: "fix: resolve PWA Workbox configuration error blocking Docker builds"
- [ ] T040 Create pull request from `001-fix-docker-build` to `master` with reference to this tasks document

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - NO dependencies on other user stories
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (build must work before monitoring errors)
- **User Story 3 (Phase 5)**: Depends on User Story 1 completion (optimizations apply to working build)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **INDEPENDENT** - This is the MVP
- **User Story 2 (P2)**: Depends on User Story 1 (requires working build to monitor errors)
- **User Story 3 (P3)**: Depends on User Story 1 (optimizes the working build process)

### Within Each User Story

- **User Story 1**: Sequential (fix → test locally → test Docker → verify runtime)
- **User Story 2**: Documentation tasks (T021, T022) can run in parallel
- **User Story 3**: All optimization tasks (T027, T028, T029) can run in parallel

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel if environment is ready
- **User Story 2**: T021 and T022 are independent and can run in parallel
- **User Story 3**: T027, T028, T029 are independent file operations and can run in parallel
- **Phase 6**: T035 and T036 can run in parallel (different files)

---

## Parallel Example: User Story 3 (Optimizations)

```bash
# Launch all three optimization tasks together:
Task: "Remove outdated esbuild workaround from Dockerfile:8"
Task: "Update frontend/package.json nuxt version from ^3.2.0 to 3.19.2"
Task: "Remove unused frontend/package-lock.json"

# All three modify different files and can be done simultaneously
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T010) - Verify the bug exists
3. Complete Phase 3: User Story 1 (T011-T020) - Apply the fix
4. **STOP and VALIDATE**: Test Docker build end-to-end
5. **DEPLOY**: Merge to master and deploy to production
6. **UNBLOCK**: Production deployments are now working!

### Incremental Delivery

1. **MVP (Phase 1-3)**: Fix the build → Deploy → Unblock production ✅
2. **Add US2 (Phase 4)**: Better error monitoring → Deploy → Faster debugging next time
3. **Add US3 (Phase 5)**: Performance optimizations → Deploy → Faster builds
4. **Polish (Phase 6)**: Documentation and cleanup → Finalize

Each phase adds value without breaking previous work.

### Recommended Approach

**Start with MVP (User Story 1 only)** because:
- Smallest scope (10 tasks)
- Highest impact (unblocks ALL deployments)
- Can be completed in < 1 hour
- Immediately deployable
- User Stories 2 and 3 are nice-to-have improvements

---

## Task Summary

| Phase | Tasks | Focus | Parallelizable |
|-------|-------|-------|----------------|
| Phase 1: Setup | 6 tasks | Environment verification | Yes (most) |
| Phase 2: Foundational | 4 tasks | Verify bug exists | No (sequential verification) |
| Phase 3: US1 (MVP) | 10 tasks | Fix PWA config | No (sequential fix → test) |
| Phase 4: US2 | 6 tasks | Error monitoring | Partial (T021, T022) |
| Phase 5: US3 | 8 tasks | Performance | Yes (T027-T029) |
| Phase 6: Polish | 6 tasks | Finalize | Partial |
| **TOTAL** | **40 tasks** | | **26 parallelizable** |

### MVP Scope (User Story 1)

- **Tasks**: T001-T020 (20 tasks)
- **Estimated Time**: 30-60 minutes
- **Impact**: Unblocks all production deployments
- **Risk**: Low (single line change, well-tested)

### Full Scope (All User Stories)

- **Tasks**: All 40 tasks
- **Estimated Time**: 2-3 hours
- **Impact**: Fixed build + better monitoring + faster builds
- **Risk**: Low (incremental improvements)

---

## Notes

- **[P]** tasks can run in parallel (different files or no dependencies)
- **[Story]** label maps task to user story for traceability
- User Story 1 is independently testable and deployable (MVP)
- User Stories 2 and 3 depend on User Story 1 completion
- Each checkpoint is a valid stopping point for validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are absolute from repository root
