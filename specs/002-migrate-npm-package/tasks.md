# Tasks: Migrate from Local Repository to NPM Package

**Input**: Design documents from `/specs/002-migrate-npm-package/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not applicable - this is a migration task focused on dependency management and code cleanup

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each migration phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Pre-Migration Setup

**Purpose**: Verify current state and prepare for migration

- [X] T001 Create backup of current working state with `git status` and verify clean or committed
- [X] T002 Document baseline: Run tests in app/browser-media-converter/ and capture results
- [X] T003 [P] Measure current repository size with `du -sh --exclude=node_modules --exclude=.git .`
- [X] T004 [P] Verify mediabunny npm package version 1.27.0 exists on registry

---

## Phase 2: User Story 1 - Developer Installs Application Dependencies (Priority: P1) 🎯 MVP

**Goal**: Update package.json to use mediabunny from npm registry and verify installation works correctly

**Independent Test**: Remove node_modules, run `npm install`, verify mediabunny is from npm registry (not symlink)

### Implementation for User Story 1

- [X] T005 [US1] Update app/browser-media-converter/package.json - change `"mediabunny": "file:../.."` to `"mediabunny": "^1.27.0"`
- [X] T006 [US1] Add `"@types/dom-mediacapture-transform": "^0.1.11"` to dependencies in app/browser-media-converter/package.json
- [X] T007 [US1] Add `"@types/dom-webcodecs": "0.1.13"` to dependencies in app/browser-media-converter/package.json
- [X] T008 [US1] Remove node_modules and package-lock.json from app/browser-media-converter/
- [X] T009 [US1] Run `npm install` in app/browser-media-converter/ directory
- [X] T010 [US1] Verify node_modules/mediabunny is real directory (not symlink) with `ls -la app/browser-media-converter/node_modules/mediabunny`
- [X] T011 [US1] Verify mediabunny version is 1.27.0 with `cat app/browser-media-converter/node_modules/mediabunny/package.json | grep version`

**Checkpoint**: npm install should complete successfully with mediabunny@1.27.0 from registry

---

## Phase 3: User Story 2 - Application Runs with NPM Package (Priority: P1)

**Goal**: Verify application builds, runs, and functions correctly with npm package

**Independent Test**: Run dev server and production build, test media conversion functionality

### Implementation for User Story 2

- [X] T012 [US2] Run TypeScript type check in app/browser-media-converter/ with `npm run type-check`
- [X] T013 [US2] Fix any TypeScript errors if they occur (research shows none expected)
- [X] T014 [US2] Run production build in app/browser-media-converter/ with `npm run build`
- [X] T015 [US2] Verify build output in app/browser-media-converter/dist/ exists and size is similar to baseline
- [X] T016 [US2] Start development server in app/browser-media-converter/ with `npm run dev`
- [X] T017 [US2] Manual test: Open browser to http://localhost:5173 and verify app loads without errors
- [X] T018 [US2] Manual test: Upload a video file and convert to MP4 format
- [X] T019 [US2] Manual test: Verify conversion completes successfully and download works
- [X] T020 [US2] Run unit tests in app/browser-media-converter/ with `npm run test:unit`
- [X] T021 [US2] Run E2E tests in app/browser-media-converter/ with `npm run test:e2e`
- [X] T022 [US2] Compare test results with baseline from T002 - all should pass

**Checkpoint**: Application should work identically to before migration, all tests passing

---

## Phase 4: User Story 3 - Codebase Cleanup Complete (Priority: P2)

**Goal**: Remove library source code, build scripts, and configuration files

**Independent Test**: Verify only application code remains, repository size reduced by ~70%

### Implementation for User Story 3 - Directory Cleanup

- [X] T023 [P] [US3] Remove src/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/src/`
- [X] T024 [P] [US3] Remove dist/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/dist/`
- [X] T025 [P] [US3] Remove packages/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/packages/`
- [X] T026 [P] [US3] Remove scripts/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/scripts/`
- [X] T027 [P] [US3] Remove docs/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/docs/`
- [X] T028 [P] [US3] Remove examples/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/examples/`
- [X] T029 [P] [US3] Remove test/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/test/`
- [X] T030 [P] [US3] Remove shared/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/shared/`
- [X] T031 [P] [US3] Remove dev/ directory from repository root with `rm -rf /Volumes/ExternalMac/Dev/mediabunny/dev/`

### Implementation for User Story 3 - File Cleanup

- [X] T032 [P] [US3] Remove build.sh from repository root
- [X] T033 [P] [US3] Remove api-extractor.json from repository root
- [X] T034 [P] [US3] Remove vite.config.ts from repository root (examples server)
- [X] T035 [P] [US3] Remove vitest.config.ts from repository root (library tests)
- [X] T036 [P] [US3] Remove tsconfig.json from repository root (library config)
- [X] T037 [P] [US3] Remove tsconfig.vite.json from repository root
- [X] T038 [P] [US3] Remove tsconfig.vitest.json from repository root
- [X] T039 [P] [US3] Remove tsdoc.json from repository root
- [X] T040 [P] [US3] Remove eslint.config.mjs from repository root
- [X] T041 [P] [US3] Remove bun.lock from repository root
- [X] T042 [P] [US3] Remove .editorconfig from repository root
- [X] T043 [P] [US3] Remove LICENSE from repository root (library-specific)

### Implementation for User Story 3 - Root package.json Cleanup

- [X] T044 [US3] Read current /Volumes/ExternalMac/Dev/mediabunny/package.json content
- [X] T045 [US3] Create minimal root package.json with name, version, description, private:true, and empty scripts
- [X] T046 [US3] Remove workspaces configuration from root package.json
- [X] T047 [US3] Remove all library-specific scripts from root package.json
- [X] T048 [US3] Remove all devDependencies from root package.json
- [X] T049 [US3] Remove dependencies (@types/dom-*) from root package.json (moved to app)
- [X] T050 [US3] Write updated minimal package.json to /Volumes/ExternalMac/Dev/mediabunny/package.json

### Implementation for User Story 3 - Documentation Update

- [X] T051 [US3] Create new README.md for /Volumes/ExternalMac/Dev/mediabunny/ focused on application (not library)
- [X] T052 [US3] Update README to include: Project description, Quick Start, Development instructions, License
- [X] T053 [US3] Reference mediabunny npm package with link to https://www.npmjs.com/package/mediabunny

**Checkpoint**: Repository should only contain app/, specs/, .specify/, and minimal root files

---

## Phase 5: Final Verification & Validation

**Purpose**: Comprehensive verification that migration is complete and successful

- [X] T054 Measure final repository size with `du -sh --exclude=node_modules --exclude=.git .`
- [X] T055 Calculate size reduction percentage and verify ≥70% reduction
- [X] T056 Run `git status` to review all changes (should show deletions of library code)
- [X] T057 Verify .gitignore is properly configured with `git check-ignore -v node_modules`
- [X] T058 Final test: Clean install in app/browser-media-converter/ - remove node_modules, run `npm install`
- [X] T059 Final test: Run full test suite - `npm run test:unit && npm run test:e2e`
- [X] T060 Final test: Run production build - `npm run build`
- [X] T061 Final test: Start dev server and manually test all conversion formats (MP4, WebM, MP3, WAV)
- [X] T062 Compare bundle size in app/browser-media-converter/dist/ with baseline (should be similar)
- [X] T063 Verify success criteria SC-001: npm install + npm run dev completes in <3 minutes
- [X] T064 Verify success criteria SC-002: Zero build/import errors
- [X] T065 Verify success criteria SC-003: Repository size reduced ≥70%
- [X] T066 Verify success criteria SC-004: All conversion features work identically
- [X] T067 Verify success criteria SC-005: Only standard npm commands needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Pre-Migration Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion - CRITICAL for migration
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion - verify npm package works
- **User Story 3 (Phase 4)**: Depends on User Story 2 completion - only clean up after verification
- **Final Verification (Phase 5)**: Depends on all user stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Pre-Migration Setup - No dependencies on other stories
- **User Story 2 (P1)**: MUST complete User Story 1 first - depends on npm package installation
- **User Story 3 (P2)**: MUST complete User Story 2 first - only remove code after app verified working

### Within Each User Story

- **User Story 1**: Sequential dependency - update package.json → install → verify
- **User Story 2**: Sequential dependency - type check → build → tests → manual verification
- **User Story 3**: Parallel within sections (marked [P]), but sections are sequential:
  1. Directory cleanup (all parallel)
  2. File cleanup (all parallel)
  3. package.json cleanup (sequential)
  4. Documentation update (sequential)

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel
- **Phase 4 - Directory Cleanup**: T023-T031 can all run in parallel (9 tasks)
- **Phase 4 - File Cleanup**: T032-T043 can all run in parallel (12 tasks)
- **Phase 5**: Most verification tasks must run sequentially to ensure proper validation

---

## Parallel Example: User Story 3 - Cleanup

```bash
# Launch all directory removals together:
Task: "Remove src/ directory"
Task: "Remove dist/ directory"
Task: "Remove packages/ directory"
Task: "Remove scripts/ directory"
Task: "Remove docs/ directory"
Task: "Remove examples/ directory"
Task: "Remove test/ directory"
Task: "Remove shared/ directory"
Task: "Remove dev/ directory"

# Then launch all file removals together:
Task: "Remove build.sh"
Task: "Remove api-extractor.json"
Task: "Remove vite.config.ts"
Task: "Remove vitest.config.ts"
Task: "Remove tsconfig.json"
Task: "Remove tsconfig.vite.json"
Task: "Remove tsconfig.vitest.json"
Task: "Remove tsdoc.json"
Task: "Remove eslint.config.mjs"
Task: "Remove bun.lock"
Task: "Remove .editorconfig"
Task: "Remove LICENSE"
```

---

## Implementation Strategy

### Sequential Execution (Recommended for Migration)

1. **Phase 1: Pre-Migration Setup** → Establish baseline
2. **Phase 2: User Story 1** → Update dependencies and install npm package
3. **STOP and VALIDATE**: Verify npm package installs correctly
4. **Phase 3: User Story 2** → Test application with npm package
5. **STOP and VALIDATE**: Verify all functionality works (CRITICAL CHECKPOINT)
6. **Phase 4: User Story 3** → Clean up library code (ONLY after Phase 3 passes)
7. **Phase 5: Final Verification** → Comprehensive validation

### Rollback Strategy

- After Phase 1: Can rollback with `git reset --hard`
- After Phase 2: Can rollback package.json changes and reinstall
- After Phase 3: Last safe checkpoint before deletion
- After Phase 4: Requires `git checkout` to restore deleted files
- After Phase 5: Commit or rollback based on validation results

### Critical Checkpoints

1. **After T011 (User Story 1)**: Verify npm package installation successful
2. **After T022 (User Story 2)**: Verify application works - DO NOT PROCEED to cleanup if tests fail
3. **After T053 (User Story 3)**: Review git status before final verification
4. **After T067 (Final Verification)**: All success criteria met - ready to commit

---

## Notes

- **IMPORTANT**: Do not proceed to Phase 4 (cleanup) unless Phase 3 (verification) fully passes
- All tests must pass before deleting library source code
- The migration is reversible via git until committed
- Manual testing in T017-T019 and T061 is critical - automated tests don't cover all conversion formats
- Success criteria verification (T063-T067) gates the final commit decision
- Repository rename from "mediabunny" to "mediabunny-apps" is optional (not included in tasks)
- Root package.json could be deleted entirely instead of minimal version (T045-T050) - choose based on preference

---

## Task Summary

- **Total Tasks**: 67
- **Phase 1 (Pre-Migration)**: 4 tasks
- **Phase 2 (User Story 1 - P1)**: 7 tasks
- **Phase 3 (User Story 2 - P1)**: 11 tasks
- **Phase 4 (User Story 3 - P2)**: 31 tasks (21 parallel, 10 sequential)
- **Phase 5 (Final Verification)**: 14 tasks

**Parallel Opportunities**: 23 tasks can run in parallel (all in Phase 1 and Phase 4)

**MVP Scope**: Phases 1-3 (22 tasks) deliver working application with npm package

**Full Migration**: All 67 tasks complete the migration with cleanup and verification
