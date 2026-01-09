# Tasks: Fix Nuxt Docker Build Error

**Input**: Design documents from `/specs/005-fix-nuxt-build/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Tests are integrated into user story tasks as verification steps (not separate test tasks)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Repository root**: `/Users/aleksishmanov/projects/aiportal/aiportal_blog/`
- **Docker build context**: Repository root (where Dockerfile is located)
- **Frontend source**: `frontend/` subdirectory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Document current state and prepare for Dockerfile fixes

- [ ] T001 Document current Dockerfile issues in Dockerfile.backup notes
- [ ] T002 [P] Create .dockerignore file at repository root
- [ ] T003 [P] Backup current Dockerfile to Dockerfile.pre-fix

---

## Phase 2: Foundational (Dockerfile Fixes)

**Purpose**: Fix the Dockerfile to resolve #internal/nuxt/paths import error

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Remove incorrect node_modules copy from Dockerfile runner stage (line 35)
- [ ] T005 Remove incorrect package.json copy from Dockerfile runner stage (line 36)
- [ ] T006 Add .nuxt cleanup before build step in Dockerfile (before line 17: `RUN yarn build`)
- [ ] T007 Verify Dockerfile follows official Nuxt Docker pattern (copy only .output to runner stage)

**Checkpoint**: Dockerfile is fixed and ready for testing

---

## Phase 3: User Story 1 - Build Application in Docker (Priority: P1) 🎯 MVP

**Goal**: Successfully build the Nuxt 3 application in Docker without import or dependency errors

**Independent Test**: Run `docker build` and verify it completes without errors about #internal/nuxt/paths or missing dependencies. Build logs should show no warnings about undefined import specifiers.

### Build Verification

- [ ] T008 [P] [US1] Clean any existing Docker build artifacts: `docker system prune -af` and `rm -rf frontend/.nuxt frontend/.output`
- [ ] T009 [US1] Run Docker build with required arguments: `docker build --build-arg STRAPI_URL=http://localhost:1337 -t aiportal-frontend:latest .`
- [ ] T010 [US1] Verify build completes successfully (exit code 0)
- [ ] T011 [US1] Check build logs for #internal/nuxt/paths errors (should be NONE)
- [ ] T012 [US1] Check build logs for missing dependency warnings (should be NONE)
- [ ] T013 [US1] Verify .output/server/index.mjs was created in build stage
- [ ] T014 [US1] Measure build time and verify under 5 minutes

**Checkpoint**: User Story 1 complete - Docker build works without errors

---

## Phase 4: User Story 2 - Run Application Container (Priority: P2)

**Goal**: Container starts successfully and serves HTTP requests without 500 errors

**Independent Test**: Run container and verify it responds to HTTP requests with 2xx/3xx status codes. No import errors in logs.

### Container Runtime Testing

- [ ] T015 [P] [US2] Run container with environment variables: `docker run -d --name aiportal-test -p 8080:8080 -e STRAPI_URL=http://localhost:1337 aiportal-frontend:latest`
- [ ] T016 [US2] Wait for container to start (max 30 seconds): `sleep 30`
- [ ] T017 [US2] Check container startup logs: `docker logs aiportal-test`
- [ ] T018 [US2] Verify no #internal/nuxt/paths errors in startup logs
- [ ] T019 [US2] Verify no module resolution failures in startup logs
- [ ] T020 [US2] Check container is running: `docker ps | grep aiportal-test`

### HTTP Endpoint Testing

- [ ] T021 [P] [US2] Test root endpoint returns HTTP response: `curl -i http://localhost:8080`
- [ ] T022 [US2] Verify response status code is 2xx or 3xx (not 500)
- [ ] T023 [US2] Test API proxy endpoint: `curl -i http://localhost:8080/api/articles`
- [ ] T024 [US2] Verify API responses include data (not empty error responses)
- [ ] T025 [US2] Check container logs for runtime errors: `docker logs aiportal-test 2>&1 | grep -i error`
- [ ] T026 [US2] Verify no 500 errors in application logs

**Checkpoint**: User Story 2 complete - Container runs and serves HTTP successfully

---

## Phase 5: User Story 3 - Reproducible Build Environment (Priority: P3)

**Goal**: Docker build works consistently across different environments

**Independent Test**: Test build on fresh machine or clean environment and verify it succeeds without manual workarounds.

### Cross-Environment Validation

- [ ] T027 [P] [US3] Document exact build command in README.md or DEPLOYMENT.md
- [ ] T028 [P] [US3] Create docker-compose.yml for easy deployment (if not exists)
- [ ] T029 [US3] Test Docker build on clean environment (remove all Docker images first: `docker rmi -f $(docker images -aq)`)
- [ ] T030 [US3] Verify build succeeds without manual intervention
- [ ] T031 [US3] Test with different Node.js base image (node:22-slim vs node:22-alpine)
- [ ] T032 [US3] Verify build works with missing optional build args (e.g., no NUXT_PUBLIC_YANDEX_METRIKA_ID)
- [ ] T033 [US3] Test build with different STRAPI_URL values
- [ ] T034 [US3] Verify consistent .output directory contents across multiple builds
- [ ] T035 [US3] Measure final Docker image size
- [ ] T036 [US3] Verify image size increase <20% compared to previous (document baseline)

**Checkpoint**: User Story 3 complete - Build is reproducible across environments

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and cleanup

- [ ] T037 [P] Create deployment checklist in README.md or docs/deployment.md
- [ ] T038 [P] Document Docker build troubleshooting in docs/docker-troubleshooting.md
- [ ] T039 [P] Update CI/CD pipeline configuration with fixed Dockerfile (if applicable)
- [ ] T040 [P] Add healthcheck to Dockerfile (if not present)
- [ ] T041 Run all quickstart.md validation steps
- [ ] T042 Verify all success criteria from spec.md are met
- [ ] T043 Update feature spec status from "Draft" to "Complete"
- [ ] T044 Create git commit with all changes
- [ ] T045 Clean up test containers: `docker rm -f aiportal-test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Dockerfile must be fixed first)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (need working build to test runtime)
- **User Story 3 (Phase 5)**: Can proceed in parallel with US1 and US2 after Foundational, or after for more thorough testing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (Dockerfile fix) - No dependencies on other user stories
- **User Story 2 (P2)**: Depends on User Story 1 (must have working build to test container runtime)
- **User Story 3 (P3)**: Depends on User Story 1 (needs working build for reproducibility testing) - Can overlap with US2

### Within Each User Story

- Tasks within a story follow logical order (setup → execution → verification)
- Tasks marked [P] within a story can run in parallel
- Each story should be validated independently before moving to next story

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 3 (US1)**: T008 can run in parallel while preparing build
- **Phase 4 (US2)**: T015 and T021 can be prepared in parallel (but T021 depends on container running)
- **Phase 5 (US3)**: T027, T028, T031 can run in parallel
- **Phase 6**: All tasks marked [P] can run in parallel after user stories complete

---

## Parallel Example: User Story 1 & 2

```bash
# After Phase 2 (Dockerfile fix) is complete, run these in parallel:

# Terminal 1: User Story 1 - Build verification
Task T009: "Run Docker build with required arguments"
# (Wait for build to complete)
# Then run T010-T014 sequentially to verify build success

# Terminal 2: User Story 2 - Prepare container tests (once US1 build succeeds)
Task T015: "Run container with environment variables"
# (Wait for container to start)
# Then run T016-T026 for runtime verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~15 minutes)
2. Complete Phase 2: Foundational Dockerfile fix (~30 minutes)
3. Complete Phase 3: User Story 1 - Build verification (~15 minutes)
4. **STOP and VALIDATE**: Confirm Docker build works without errors
5. Document success and proceed to US2 if ready

**MVP Deliverable**: Working Docker build that produces a runnable image

### Incremental Delivery

1. **MVP (User Story 1)**: Docker build works → Can deploy container
2. **+ User Story 2**: Container runs and serves HTTP → Can demo working application
3. **+ User Story 3**: Reproducible builds → Can deploy to production
4. **+ Polish**: Documentation and CI/CD → Production-ready

### Sequential Approach (Recommended for This Feature)

Since this is a single-developer infrastructure fix:

1. Phase 1: Setup → .dockerignore created, Dockerfile backed up
2. Phase 2: Foundational → Dockerfile fixed (core fix)
3. Phase 3: US1 → Verify build works
4. Phase 4: US2 → Verify container runs
5. Phase 5: US3 → Test reproducibility
6. Phase 6: Polish → Documentation and cleanup

---

## Success Criteria Validation

After completing all phases, verify the following from spec.md:

- **SC-001**: ✅ Docker build completes 100% without #internal/nuxt/paths errors (validated in T010-T012)
- **SC-002**: ✅ Container serves HTTP with 99%+ success rate (validated in T021-T026)
- **SC-003**: ✅ Build time under 5 minutes (validated in T014)
- **SC-004**: ✅ Image size increase <20% (validated in T035-T036)
- **SC-005**: ✅ Internal framework dependencies resolved (validated in T010-T012, T018-T019)
- **SC-006**: ✅ Dynamic content rendering works (validated in T023-T024)
- **SC-007**: ✅ Standard Docker build works out of box (validated in T029-T034)

---

## Notes

- **[P] tasks** = different files or operations, no blocking dependencies
- **[Story] label** = maps task to specific user story for traceability
- Each user story should be independently verifiable
- Commit after each phase or logical group of tasks
- Stop at any checkpoint to validate story independently
- **Critical path**: Phase 2 (Dockerfile fix) → Phase 3 (US1 build test) → Phase 4 (US2 runtime test)
- **Avoid**: Skipping build verification before container runtime testing (US2 depends on US1)

---

## Task Summary

- **Total Tasks**: 45
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 4 tasks (CRITICAL - blocks all user stories)
- **User Story 1 (P1)**: 7 tasks
- **User Story 2 (P2)**: 12 tasks
- **User Story 3 (P3)**: 10 tasks
- **Polish Phase**: 9 tasks
- **Parallel Opportunities**: 11 tasks marked [P]

**Estimated Completion Time**: 3-4 hours (assuming familiarity with Docker and Nuxt)
