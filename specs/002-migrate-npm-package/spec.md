# Feature Specification: Migrate from Local Repository to NPM Package

**Feature Branch**: `002-migrate-npm-package`
**Created**: 2025-12-19
**Status**: Draft
**Input**: User description: "for the moment mediabunny has been cloned for github repository. I'd prefer use it from npm package. do this migration and clean old code"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Installs Application Dependencies (Priority: P1)

A developer clones the browser-media-converter application and runs `npm install` to set up the project. The mediabunny library should be installed from the npm registry instead of referencing the local cloned repository.

**Why this priority**: This is the foundation of the migration - without proper npm package installation, the application cannot function correctly. This enables standard npm workflows and proper dependency management.

**Independent Test**: Can be fully tested by removing node_modules, running `npm install`, and verifying the mediabunny package is installed from npm registry (check node_modules/mediabunny/.package.json for npm metadata).

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a developer runs `npm install` in the app/browser-media-converter directory, **Then** mediabunny is installed from the npm registry at the published version
2. **Given** the application is installed, **When** the developer inspects node_modules/mediabunny, **Then** it contains the official npm package (not a symlink to local source)
3. **Given** the dependencies are installed, **When** the developer runs the build command, **Then** the application builds successfully using the npm package

---

### User Story 2 - Application Runs with NPM Package (Priority: P1)

The browser-media-converter application starts in development mode and production builds work correctly using the mediabunny npm package instead of the local repository code.

**Why this priority**: Ensures runtime compatibility with the npm package. If the application doesn't run or has import errors, the migration is not complete.

**Independent Test**: Can be tested by running `npm run dev` and `npm run build`, then verifying all mediabunny imports resolve correctly and no console errors occur.

**Acceptance Scenarios**:

1. **Given** the application is installed with npm dependencies, **When** a developer runs `npm run dev`, **Then** the development server starts without errors and all mediabunny features work
2. **Given** the application is running, **When** a user converts a media file, **Then** the conversion completes successfully using the npm package
3. **Given** the application dependencies, **When** a developer runs `npm run build`, **Then** the production build completes without import or type errors

---

### User Story 3 - Codebase Cleanup Complete (Priority: P2)

The monorepo structure is cleaned up, removing unnecessary mediabunny source code, build scripts, and development files that are no longer needed since the library is consumed as an npm package.

**Why this priority**: Reduces repository size, eliminates confusion about which code is being used, and simplifies maintenance. This is secondary to functionality but improves developer experience.

**Independent Test**: Can be tested by reviewing the repository structure and verifying that only application code remains, with no mediabunny library source or build artifacts (except in node_modules).

**Acceptance Scenarios**:

1. **Given** the npm migration is complete, **When** reviewing the repository root, **Then** mediabunny source code directories (src/, dist/, packages/mp3-encoder/) are removed
2. **Given** the cleanup, **When** reviewing build scripts, **Then** mediabunny-specific build scripts (build.sh, scripts for bundling, API docs) are removed
3. **Given** the cleaned codebase, **When** running `git status`, **Then** the repository size is significantly reduced and workspace configuration is removed from root package.json

---

### Edge Cases

- What happens when the npm registry version doesn't match the previously used local version (potential API breaking changes)?
- How does the system handle if the @mediabunny/mp3-encoder package version is incompatible with the main mediabunny package?
- What happens if TypeScript types from the npm package differ from the local version previously used?
- How does the build handle if vite.config.ts or tsconfig.json has path aliases pointing to the local mediabunny source?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update app/browser-media-converter/package.json to reference mediabunny from npm registry with a semantic version (e.g., "^1.26.0") instead of "file:../.."
- **FR-002**: System MUST install the mediabunny package from the official npm registry during `npm install`
- **FR-003**: Application MUST successfully import all mediabunny modules using the npm package
- **FR-004**: Application MUST build and run without errors after migration to npm package
- **FR-005**: System MUST remove mediabunny source code directories (src/, dist/, packages/) from repository root
- **FR-006**: System MUST remove mediabunny-specific build scripts and configuration files (build.sh, api-extractor.json, vitepress docs, examples/)
- **FR-007**: System MUST remove workspace configuration from root package.json
- **FR-008**: System MUST remove mediabunny-specific devDependencies from root package.json
- **FR-009**: System MUST update or remove the root README.md if it contains mediabunny library documentation
- **FR-010**: System MUST ensure TypeScript compilation works with types from the npm package

### Key Entities

- **Package Dependency**: Reference to mediabunny package in package.json, changes from local file path to npm registry version
- **Application Code**: Browser-media-converter application that imports and uses mediabunny, must work with npm package
- **Repository Structure**: Monorepo layout transitioning from library + application to application-only

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can complete `npm install` and `npm run dev` in under 3 minutes without any manual configuration steps
- **SC-002**: Application builds successfully with zero errors related to mediabunny imports or types
- **SC-003**: Repository size reduces by at least 70% (measured by excluding node_modules)
- **SC-004**: All existing media conversion features work identically to before the migration
- **SC-005**: Development setup requires only standard npm commands (no custom build scripts for mediabunny)

## Assumptions *(optional)*

- The latest published version of mediabunny on npm (1.26.0 or later) is compatible with the current application code
- The @mediabunny/mp3-encoder package on npm is compatible with the browser-media-converter application
- The application does not use any private/unpublished APIs from the local mediabunny source
- TypeScript types exported by the npm package match those previously used from local source
- No custom modifications have been made to the local mediabunny source that aren't in the published package
