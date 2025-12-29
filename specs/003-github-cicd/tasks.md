# Tasks: GitHub CI/CD and Pages Deployment

**Input**: Design documents from `/specs/003-github-cicd/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/ci-workflow-contract.yaml, contracts/deploy-workflow-contract.yaml, quickstart.md

**Tests**: No test tasks included - this feature implements CI/CD infrastructure which itself IS the testing mechanism.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **CI/CD workflows**: `.github/workflows/` (GitHub Actions standard location)
- **Documentation**: `docs/.vitepress/` (VitePress configuration)
- **Repository settings**: Configured via GitHub web UI

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure for GitHub Actions workflows

- [X] T001 Create `.github/workflows/` directory for GitHub Actions workflow files
- [X] T002 Verify VitePress configuration exists at `docs/.vitepress/config.ts` for base path settings (SKIPPED - project uses Vite for app build, not VitePress for docs)

**Notes**:
- T001 creates the standard GitHub Actions directory structure
- T002 ensures documentation build is properly configured (prerequisite for US2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that supports multiple user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Configure VitePress base path to `/mediabunny/` in `docs/.vitepress/config.ts` (SKIPPED - no VitePress)
- [X] T004 Verify existing npm scripts work correctly: `npm test`, `npm run check`, `npm run lint` (all working)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

**Notes**:
- T003 ensures GitHub Pages deployment will have correct asset paths
- T004 validates all npm scripts that CI workflows will call

---

## Phase 3: User Story 1 - Automated Testing on Pull Requests (Priority: P1) 🎯 MVP

**Goal**: Implement CI workflow that runs tests, linting, and type checking on every pull request to catch issues before merge

**Independent Test**: Create a test PR with intentional lint error, verify CI fails and shows error in PR checks. Fix error, verify CI passes and PR shows green checkmark.

### Implementation for User Story 1

- [X] T005 [US1] Create CI workflow file at `.github/workflows/ci.yml` with basic structure (name, triggers on pull_request and push to main)
- [X] T006 [US1] Add Node.js matrix test job to `.github/workflows/ci.yml` for Node.js 18 and 20 with parallel execution
- [X] T007 [P] [US1] Add lint job to `.github/workflows/ci.yml` that runs `npm run lint` on Node.js 20
- [X] T008 [P] [US1] Add typecheck job to `.github/workflows/ci.yml` that runs `npm run check` on Node.js 20
- [X] T009 [US1] Configure npm dependency caching in all jobs using `actions/setup-node@v4` with `cache: 'npm'`
- [X] T010 [US1] Configure workflow permissions in `.github/workflows/ci.yml` with `contents: read`
- [X] T011 [US1] Add concurrency control to `.github/workflows/ci.yml` to cancel in-progress runs on new commits
- [ ] T012 [US1] Test CI workflow by creating a test PR and verifying all jobs run successfully

**Checkpoint**: At this point, User Story 1 should be fully functional - PRs should show automated test results

**Notes**:
- T005 sets up workflow triggers (pull_request, push to main)
- T006 implements matrix strategy: `strategy: { matrix: { node-version: [18, 20] }, fail-fast: false }`
- T007 and T008 run in parallel with test jobs (independent jobs)
- T009 adds caching to all jobs for performance (reduces install time ~15s → ~1s)
- T010 sets minimal permissions following least-privilege principle
- T011 prevents wasted CI minutes on superseded commits
- T012 validates entire workflow end-to-end

---

## Phase 4: User Story 2 - Automated Documentation Deployment (Priority: P2)

**Goal**: Implement deployment workflow that builds and publishes documentation to GitHub Pages when changes are merged to main branch

**Independent Test**: Merge a documentation change to main (e.g., update README), verify GitHub Pages site updates within 5 minutes with the new content.

### Implementation for User Story 2

- [ ] T013 [US2] Create deployment workflow file at `.github/workflows/deploy.yml` with basic structure (name, triggers on push to main and workflow_dispatch)
- [ ] T014 [US2] Add build job to `.github/workflows/deploy.yml` that runs `npm run docs:build` on Node.js 20
- [ ] T015 [US2] Configure GitHub Pages setup in build job using `actions/configure-pages@v5`
- [ ] T016 [US2] Add step to create `.nojekyll` file in `docs/.vitepress/dist/` to disable Jekyll processing
- [ ] T017 [US2] Add step to upload Pages artifact using `actions/upload-pages-artifact@v3` with path `docs/.vitepress/dist`
- [ ] T018 [US2] Add deploy job to `.github/workflows/deploy.yml` that depends on build job (uses `needs: build`)
- [ ] T019 [US2] Configure deploy job with GitHub Pages environment and `actions/deploy-pages@v4`
- [ ] T020 [US2] Configure workflow permissions in `.github/workflows/deploy.yml` with `contents: read`, `pages: write`, `id-token: write`
- [ ] T021 [US2] Add concurrency control for Pages deployment (group: pages, cancel-in-progress: false)
- [ ] T022 [US2] Configure repository Settings > Pages to use "GitHub Actions" as deployment source
- [ ] T023 [US2] Test deployment workflow by merging a documentation change to main and verifying site updates

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - CI tests PRs, deployment publishes docs

**Notes**:
- T013 sets up triggers (push to main, manual workflow_dispatch)
- T014-T017 implement build job that prepares documentation for deployment
- T016 prevents GitHub Pages from processing files with Jekyll (which ignores files starting with `_` or `.`)
- T018-T019 implement deployment using official GitHub Pages actions
- T020 grants minimal permissions needed for Pages deployment (OIDC token authentication)
- T021 prevents concurrent deployments (queues sequential deploys to avoid race conditions)
- T022 is a manual GitHub UI configuration step (cannot be automated in workflow file)
- T023 validates entire deployment pipeline end-to-end

---

## Phase 5: User Story 3 - Multi-Node Version Testing (Priority: P2)

**Goal**: Extend CI to test across Node.js 18 and 20 in parallel to catch version-specific compatibility issues

**Independent Test**: Introduce code using a Node.js 20-specific API, verify CI fails on Node 18 but passes on Node 20, showing version-specific failure.

### Implementation for User Story 3

- [ ] T024 [US3] Verify test matrix in `.github/workflows/ci.yml` includes Node.js 18 and 20 (already implemented in T006)
- [ ] T025 [US3] Verify matrix strategy uses `fail-fast: false` to run all versions even if one fails (already configured in T006)
- [ ] T026 [US3] Add matrix job names in CI workflow output to clearly identify which Node version is running
- [ ] T027 [US3] Test multi-version behavior by creating PR with Node-version-specific code and verifying both versions are tested

**Checkpoint**: All user stories 1-3 should now be independently functional - CI tests on multiple Node versions

**Notes**:
- T024-T025 validate configuration already set up in User Story 1 (T006)
- T026 improves CI output clarity: `name: Test (Node ${{ matrix.node-version }})`
- T027 validates version-specific failure detection works correctly
- This story enhances User Story 1 but is kept separate for independent validation

---

## Phase 6: User Story 4 - Build Artifact Validation (Priority: P3)

**Goal**: Add build validation job to CI workflow to catch build failures before release

**Independent Test**: Introduce a TypeScript compilation error, verify CI build job fails and reports the specific build error.

### Implementation for User Story 4

- [ ] T028 [P] [US4] Add build job to `.github/workflows/ci.yml` that runs `npm run build` on Node.js 20
- [ ] T029 [US4] Configure build job to run in parallel with test, lint, and typecheck jobs (no `needs:` dependency)
- [ ] T030 [US4] Test build validation by creating PR with build-breaking change and verifying build job catches it

**Checkpoint**: All user stories should now be independently functional - complete CI/CD pipeline operational

**Notes**:
- T028 adds production build validation to catch bundling issues early
- T029 ensures build runs in parallel with other checks for fast feedback
- T030 validates build failure detection works correctly
- Build job uses Node.js 20 (same as deployment) to ensure consistency

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation across all workflows

- [ ] T031 [P] Verify quickstart.md accurately describes all workflows at `specs/003-github-cicd/quickstart.md`
- [ ] T032 [P] Update repository README.md with CI/CD status badges and documentation links
- [ ] T033 Test complete CI/CD pipeline by creating PR with multiple changes (code, tests, docs) and verifying all workflows execute correctly
- [ ] T034 Configure branch protection rules in repository Settings to require CI workflow to pass before merge

**Notes**:
- T031 ensures user documentation matches implementation
- T032 adds visibility to CI status in repository README
- T033 end-to-end validation of complete system
- T034 enforces CI requirements (manual GitHub UI configuration step)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Automated Testing - MUST complete first (MVP)
  - User Story 2 (P2): Documentation Deployment - Can start after US1 OR in parallel
  - User Story 3 (P2): Multi-Node Testing - Extends US1, can integrate during or after US1
  - User Story 4 (P3): Build Validation - Can start after US1 OR in parallel
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
    ├─→ US1: Automated Testing (P1) [BLOCKS NONE] 🎯 MVP
    ├─→ US2: Documentation Deployment (P2) [Independent]
    ├─→ US3: Multi-Node Testing (P2) [Enhances US1, but independent]
    └─→ US4: Build Validation (P3) [Independent]
    ↓
Polish (Phase 7)
```

**Key Insights**:
- **All user stories are independent** - they can be implemented in parallel after Foundational phase
- **US1 is MVP** - provides core value (automated testing on PRs)
- **US2-US4 are enhancements** - add value but don't block each other
- **US3 actually extends US1** - but is kept separate for independent testing and validation

### Within Each User Story

**User Story 1** (T005-T012):
- T005 (workflow structure) → T006, T007, T008 (add jobs) → T009 (caching) → T010, T011 (config) → T012 (test)
- T006, T007, T008 can run in parallel (marked [P]) - different jobs in same file

**User Story 2** (T013-T023):
- T013 (workflow structure) → T014-T017 (build job steps) → T018-T019 (deploy job) → T020, T021 (config) → T022 (settings) → T023 (test)
- Sequential implementation due to job dependencies (deploy depends on build)

**User Story 3** (T024-T027):
- Validates existing configuration from US1
- T024-T026 are verification tasks, T027 is validation

**User Story 4** (T028-T030):
- T028, T029 (add build job) → T030 (test)
- T028 can run in parallel with other jobs ([P])

### Parallel Opportunities

**Setup Phase**:
- T001 and T002 can run in parallel ([P] not marked because they're quick and sequential is fine)

**Foundational Phase**:
- T003 and T004 can run in parallel (different files/operations)

**User Story 1**:
```bash
# These jobs in ci.yml can be added in parallel:
Task T007: "Add lint job to .github/workflows/ci.yml"
Task T008: "Add typecheck job to .github/workflows/ci.yml"
Task T006: "Add Node.js matrix test job to .github/workflows/ci.yml"
```

**After Foundational Phase Completes**:
```bash
# All user stories can start in parallel:
Task: "Implement User Story 1 (T005-T012)"
Task: "Implement User Story 2 (T013-T023)"
Task: "Implement User Story 3 (T024-T027)" # Or integrate into US1
Task: "Implement User Story 4 (T028-T030)"
```

**User Story 4**:
```bash
# Build job can be added in parallel with other enhancements:
Task T028: "Add build job to .github/workflows/ci.yml"
```

---

## Parallel Example: User Story 1 (Jobs)

When implementing User Story 1, after creating the workflow file (T005), these jobs can be added in parallel:

```bash
# Launch in parallel - different jobs in same workflow:
Task: "Add lint job to .github/workflows/ci.yml (T007)"
Task: "Add typecheck job to .github/workflows/ci.yml (T008)"

# Then add after:
Task: "Add Node.js matrix test job to .github/workflows/ci.yml (T006)"
Task: "Configure npm dependency caching in all jobs (T009)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T004)
3. Complete Phase 3: User Story 1 (T005-T012)
4. **STOP and VALIDATE**: Create test PR, verify all CI jobs pass
5. Merge to main and deploy

**Outcome**: Automated testing on all PRs - immediate value, prevents regressions

### Incremental Delivery

1. **Foundation** (T001-T004) → Directory structure and configuration ready
2. **US1: Automated Testing** (T005-T012) → Test independently → **Deploy** (MVP!)
   - Value: PRs show test results, prevents breaking changes
3. **US2: Documentation Deployment** (T013-T023) → Test independently → **Deploy**
   - Value: Docs stay in sync with code automatically
4. **US3: Multi-Node Testing** (T024-T027) → Test independently → **Deploy**
   - Value: Cross-version compatibility validated
5. **US4: Build Validation** (T028-T030) → Test independently → **Deploy**
   - Value: Build failures caught before release
6. **Polish** (T031-T034) → Complete documentation and enforcement

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T004)
2. **Once Foundational is done, split work**:
   - Developer A: User Story 1 - Automated Testing (T005-T012)
   - Developer B: User Story 2 - Documentation Deployment (T013-T023)
   - Developer C: User Story 4 - Build Validation (T028-T030)
   - User Story 3 can be integrated into US1 or done after
3. **Stories complete and test independently**
4. **Merge when ready** - no cross-story blocking

---

## Task Summary

**Total Tasks**: 34

**Tasks by User Story**:
- Setup (Phase 1): 2 tasks
- Foundational (Phase 2): 2 tasks
- User Story 1 (P1 - MVP): 8 tasks (T005-T012)
- User Story 2 (P2): 11 tasks (T013-T023)
- User Story 3 (P2): 4 tasks (T024-T027)
- User Story 4 (P3): 3 tasks (T028-T030)
- Polish (Phase 7): 4 tasks (T031-T034)

**Parallel Opportunities**: 6 tasks marked [P] can run in parallel
- T007, T008 (CI jobs - different jobs in workflow)
- T028 (Build job - different job in workflow)
- T031, T032 (Documentation tasks - different files)

**Independent Test Criteria**:
- **US1**: Create test PR with lint error → CI fails → Fix error → CI passes
- **US2**: Merge doc change to main → Site updates within 5 minutes
- **US3**: Create PR with Node 20-specific code → Fails on Node 18, passes on Node 20
- **US4**: Create PR with build error → Build job fails with error message

**Suggested MVP Scope**: Phases 1-3 (T001-T012)
- Provides core value: automated testing on PRs
- 12 tasks total (Setup + Foundational + US1)
- Estimated time: 2-4 hours for experienced developer
- Immediate ROI: prevents broken code from merging

---

## Notes

- **[P] tasks**: Different files/jobs, no dependencies - can parallelize
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story is independently testable**: Can validate US1 without US2, etc.
- **No test tasks included**: CI/CD workflows ARE the testing infrastructure
- **Commit frequently**: After each task or logical group
- **Stop at checkpoints**: Validate each story independently before proceeding
- **GitHub UI tasks**: T022 and T034 require manual configuration in repository settings
- **Workflow files are small**: Each workflow is ~50-80 lines of YAML, easy to manage

---

## Validation Checklist

Before marking this feature complete, verify:

- [ ] CI workflow file exists at `.github/workflows/ci.yml`
- [ ] Deploy workflow file exists at `.github/workflows/deploy.yml`
- [ ] All jobs in CI workflow run in parallel (test matrix, lint, typecheck, build)
- [ ] Test matrix includes Node.js 18 and 20
- [ ] npm caching is configured in all jobs
- [ ] VitePress base path is set to `/mediabunny/`
- [ ] GitHub Pages source is set to "GitHub Actions"
- [ ] Branch protection requires CI to pass
- [ ] Test PR shows all CI checks (test×2, lint, typecheck, build)
- [ ] Documentation deployment works and site is accessible
- [ ] Quickstart guide is accurate and complete
- [ ] README includes CI badges and links to documentation
