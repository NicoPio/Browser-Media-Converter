# Implementation Plan: Migrate from Local Repository to NPM Package

**Branch**: `002-migrate-npm-package` | **Date**: 2025-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-migrate-npm-package/spec.md`

## Summary

This feature migrates the browser-media-converter application from using a local monorepo copy of mediabunny library to consuming it as a standard npm package from the npm registry. The repository will be transformed from a library + application monorepo to a standalone application repository. This involves updating package.json dependencies, cleaning up library source code, removing build scripts, and verifying application functionality with the npm package.

## Technical Context

**Language/Version**: TypeScript 5.9.3, JavaScript ES2020+
**Primary Dependencies**: React 18.3.1, mediabunny ^1.26.0 (npm), @mediabunny/mp3-encoder ^1.27.0, Vite 6.3.5, Tailwind CSS v4, DaisyUI 5+
**Storage**: Browser localStorage for preferences and conversion history (no database)
**Testing**: Vitest 3.2.4, Playwright 1.49.1 (E2E), @testing-library/react 16.1.0
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) supporting WebCodecs API
**Project Type**: Single-page web application (browser-media-converter)
**Performance Goals**: Development server startup <10s, production build <30s, conversion maintains current performance
**Constraints**: Zero breaking changes to application functionality, all existing media conversion features must work identically
**Scale/Scope**: Single application (browser-media-converter), removing ~10MB+ of library source code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No project constitution file found (template only). Proceeding with standard software engineering best practices:

- **Backward Compatibility**: Application functionality must remain unchanged
- **Testing**: All existing tests must pass after migration
- **Documentation**: Update README to reflect new structure
- **Clean Separation**: Remove all library code while preserving application code
- **Dependency Management**: Use semantic versioning for npm packages

**Gate Result**: ✅ PASS - This is a refactoring task with clear scope and no architectural violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-migrate-npm-package/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - version compatibility analysis
├── quickstart.md        # Phase 1 output - migration guide
└── contracts/           # Phase 1 output - N/A for this migration
```

### Current Source Code (before migration)

```text
/Volumes/ExternalMac/Dev/mediabunny/
├── src/                       # mediabunny library source (TO REMOVE)
├── dist/                      # mediabunny library build output (TO REMOVE)
├── packages/                  # mediabunny subpackages (TO REMOVE)
│   └── mp3-encoder/
├── scripts/                   # mediabunny build scripts (TO REMOVE)
├── docs/                      # mediabunny library docs (TO REMOVE)
├── examples/                  # mediabunny library examples (TO REMOVE)
├── test/                      # mediabunny library tests (TO REMOVE)
├── build.sh                   # mediabunny build script (TO REMOVE)
├── api-extractor.json         # mediabunny API docs config (TO REMOVE)
├── vite.config.ts             # mediabunny examples server (TO REMOVE)
├── vitest.config.ts           # mediabunny library tests (TO REMOVE)
├── package.json               # Monorepo root (TO MODIFY)
│   └── workspaces: ["packages/*"]  # Remove workspace config
├── app/                       # Application directory (KEEP)
│   └── browser-media-converter/
│       ├── src/
│       ├── package.json       # Update mediabunny: "file:../.." → "^1.26.0"
│       └── [all app files]
└── .specify/                  # Speckit configuration (KEEP)
```

### Target Source Code (after migration)

```text
/Volumes/ExternalMac/Dev/mediabunny/   # Rename to mediabunny-apps or similar
├── app/
│   └── browser-media-converter/       # OR: Move contents to root
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── utils/
│       │   └── App.tsx
│       ├── public/
│       ├── tests/
│       │   ├── unit/
│       │   ├── component/
│       │   └── e2e/
│       ├── package.json              # mediabunny: "^1.26.0"
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── README.md
├── .specify/                          # Speckit configuration
├── specs/                             # Feature specifications
└── README.md                          # Updated project README
```

**Structure Decision**: Keep the `app/browser-media-converter/` directory structure initially, as it's already working. The application can be moved to the repository root in a future refactoring if desired. The focus is on removing library code and switching to npm package dependency.

## Complexity Tracking

> **Not applicable** - No constitutional violations. This is a straightforward dependency migration and cleanup task.

## Phase 0: Research & Analysis

### Research Tasks

1. **Verify NPM Package Version Compatibility**
   - Check npm registry for latest mediabunny version
   - Verify @mediabunny/mp3-encoder compatibility
   - Review CHANGELOG for any breaking changes between local and npm versions
   - Document any API differences

2. **Analyze Application Dependencies**
   - Identify all mediabunny imports in browser-media-converter
   - Check for usage of private/internal APIs
   - Verify TypeScript type imports
   - List all mediabunny features used by the application

3. **Identify Configuration Dependencies**
   - Check vite.config.ts for path aliases to mediabunny source
   - Review tsconfig.json for path mappings
   - Identify any build scripts that reference library code
   - Check for test configurations pointing to library

4. **File Cleanup Inventory**
   - List all mediabunny library source directories
   - List all mediabunny build scripts and configuration files
   - List all mediabunny-specific devDependencies
   - Calculate current repository size for comparison

### Research Output Location

Results documented in: `specs/002-migrate-npm-package/research.md`

## Phase 1: Design & Migration Strategy

### Data Model

**Not applicable** - This is a project structure migration, not a data-driven feature. No entities or database schema changes.

### API Contracts

**Not applicable** - This migration does not introduce new APIs or change existing contracts. The application will continue using mediabunny's public API from the npm package.

### Migration Strategy (quickstart.md)

Document step-by-step migration process:

1. **Pre-migration Checklist**
   - Verify current application works with local mediabunny
   - Run all tests and document baseline
   - Commit or stash any uncommitted changes
   - Note current npm package versions

2. **Dependency Update**
   - Update app/browser-media-converter/package.json
   - Remove "file:../.." reference
   - Add semantic version from npm
   - Update @mediabunny/mp3-encoder if needed

3. **Configuration Cleanup**
   - Remove workspace configuration from root package.json
   - Check and update any path aliases
   - Remove references to local mediabunny source

4. **Test & Verify**
   - Install dependencies: `npm install`
   - Run development server: `npm run dev`
   - Run production build: `npm run build`
   - Execute all tests: `npm test`, `npm run test:e2e`
   - Verify media conversion functionality

5. **Source Cleanup**
   - Remove library source directories
   - Remove build scripts and configurations
   - Remove mediabunny-specific devDependencies
   - Update root README.md

6. **Final Verification**
   - Measure repository size reduction
   - Verify git status shows intended deletions
   - Run full test suite again
   - Check bundle size hasn't increased significantly

### Output Location

Migration guide documented in: `specs/002-migrate-npm-package/quickstart.md`

## Phase 2: Task Generation

**Not performed by /speckit.plan** - This phase is handled by the `/speckit.tasks` command, which will break down the migration into atomic, executable tasks based on the plan and research.

## Success Metrics

Following success criteria from spec.md:

- **SC-001**: Developer setup time <3 minutes ✓
- **SC-002**: Zero build/import errors ✓
- **SC-003**: Repository size reduction ≥70% ✓
- **SC-004**: All features work identically ✓
- **SC-005**: Only standard npm commands needed ✓

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NPM package API differs from local version | Low | High | Phase 0 research will identify differences; keep local source until verified |
| TypeScript types incompatible | Low | Medium | Test compilation immediately after package update |
| Build configuration breaks | Low | Medium | Update vite.config.ts and tsconfig.json carefully |
| Tests fail with npm package | Medium | High | Run full test suite before and after; compare results |
| Production bundle size increases | Low | Low | Monitor bundle size; npm package should be similar or smaller |

## Notes

- This migration is reversible - git history preserves the library source code
- The application currently uses `"mediabunny": "file:../.."` which creates a symlink
- After migration, npm will download the published package from registry
- Consider renaming repository from "mediabunny" to "mediabunny-apps" or "browser-media-converter" to avoid confusion
- The .specify/ directory and specs/ should be preserved for future feature development
