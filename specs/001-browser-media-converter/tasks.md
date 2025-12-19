# Tasks: Browser Media Converter

**Input**: Design documents from `/specs/001-browser-media-converter/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/types.ts

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. If TDD is desired, add test tasks before implementation tasks in each phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `app/browser-media-converter/` directory (repository: mediabunny).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure at app/browser-media-converter/
- [X] T002 Initialize package.json with React 18, TypeScript, Vite 5, Tailwind CSS v4, DaisyUI 5+, JSZip dependencies
- [X] T003 [P] Create vite.config.ts with HTTPS enabled and Tailwind plugin configured
- [X] T004 [P] Create tsconfig.json with ES2020 target and strict mode enabled
- [X] T005 [P] Create index.html with root div and module script reference
- [X] T006 [P] Create src/index.css with Tailwind CSS v4 imports (@import "tailwindcss", @plugin "daisyui")
- [X] T007 [P] Setup ESLint and Prettier configuration files (.eslintrc.cjs, .prettierrc)
- [X] T008 Install all npm dependencies and verify no conflicts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define all TypeScript types in src/types/media.types.ts (MediaFile, MediaFileMetadata)
- [X] T010 [P] Define conversion types in src/types/conversion.types.ts (ConversionJob, ConversionQueue, ConversionStatus, ConversionResult)
- [X] T011 [P] Define quality types in src/types/quality.types.ts (QualityProfile, QualityPreset, VideoQualitySettings, AudioQualitySettings)
- [X] T012 [P] Define format constants in src/constants/formats.ts (OutputFormat list with 9 formats)
- [X] T013 [P] Define quality presets in src/constants/qualityPresets.ts (high, balanced, small configurations)
- [X] T014 [P] Define error messages in src/constants/messages.ts (user-friendly error messages)
- [X] T015 Create WebCodecs detection utility in src/utils/validation.ts (isWebCodecsSupported, detectCodecCapabilities)
- [X] T016 [P] Create file size formatting utility in src/utils/fileSize.ts (formatBytes function)
- [X] T017 [P] Create duration formatting utility in src/utils/duration.ts (formatDuration function)
- [X] T018 Create React app entry point in src/main.tsx with React root rendering
- [X] T019 Create basic App.tsx shell component with routing structure

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Single File Conversion (Priority: P1) 🎯 MVP

**Goal**: Enable users to convert a single video or audio file from one format to another entirely within their browser

**Independent Test**: Drag a single MP4 file onto the interface, select WebM as output format, click convert, and receive a downloadable WebM file

### Core Services for User Story 1

- [X] T020 [P] [US1] Implement metadata extraction service in src/services/metadataService.ts (uses mediabunny Input to extract MediaFileMetadata)
- [X] T021 [P] [US1] Implement file validation service in src/services/fileService.ts (validateFile, getSupportedOutputFormats, isConversionSupported)
- [X] T022 [US1] Implement conversion service in src/services/conversionService.ts (convert method using mediabunny's Input, Output, Conversion classes with progress callbacks)
- [X] T023 [US1] Implement download service in src/services/downloadService.ts (downloadFile, createBlobUrl, revokeBlobUrl methods)

### React Hooks for User Story 1

- [X] T024 [US1] Create useMediaConverter hook in src/hooks/useMediaConverter.ts (convert, cancel, progress, converting, error state)
- [X] T025 [P] [US1] Create useFileValidator hook in src/hooks/useFileValidator.ts (wraps fileService methods)
- [X] T026 [P] [US1] Create useBeforeUnload hook in src/hooks/useBeforeUnload.ts (warns user before navigating away during active conversion)

### UI Components for User Story 1

- [X] T027 [P] [US1] Create FileDropZone component in src/components/FileDropZone.tsx (drag-and-drop + file picker, accepts single file for US1)
- [X] T028 [P] [US1] Create FormatSelector component in src/components/FormatSelector.tsx (dropdown/select for output format based on compatible formats)
- [X] T029 [P] [US1] Create ProgressBar component in src/components/ProgressBar.tsx (displays 0-100% progress with DaisyUI progress bar)
- [X] T030 [P] [US1] Create DownloadButton component in src/components/DownloadButton.tsx (enabled when conversion complete, triggers download)
- [X] T031 [P] [US1] Create ErrorMessage component in src/components/ErrorMessage.tsx (displays user-friendly error messages with actionable guidance)
- [X] T032 [US1] Integrate all US1 components into App.tsx (single file conversion flow: drop → select format → convert → download)

### Integration and Polish for User Story 1

- [X] T033 [US1] Add WebCodecs feature detection and error messaging in App.tsx (show error if API not supported)
- [X] T034 [US1] Implement Blob URL cleanup on download and component unmount
- [X] T035 [US1] Add loading states and disable interactions during conversion
- [X] T036 [US1] Test single file conversion flow end-to-end (MP4 → WebM, MP3 → WAV)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can convert single files with progress tracking and download

---

## Phase 4: User Story 3 - Format Selection and Preview (Priority: P2)

**Goal**: Help users understand available formats and preview file information before and after conversion

**Independent Test**: Load a file and view its metadata (duration, resolution, codec, file size), select different output formats from a clear list, and see estimated output characteristics

**Note**: Implementing US3 before US2 because it enhances US1 with metadata display without adding queue complexity

### Components for User Story 3

- [X] T037 [P] [US3] Create FileMetadata component in src/components/FileMetadata.tsx (displays format, codec, duration, resolution, bitrate, file size)
- [X] T038 [US3] Enhance FormatSelector component to show format descriptions and compatibility info (update src/components/FormatSelector.tsx)
- [X] T039 [US3] Add output file size estimation to conversionService (estimateOutputSize method in src/services/conversionService.ts)
- [X] T040 [US3] Integrate FileMetadata component into App.tsx showing source file details after file drop
- [X] T041 [US3] Add estimated output size display below FormatSelector in App.tsx
- [X] T042 [US3] Add format info tooltips/help text to FormatSelector with use case descriptions

**Checkpoint**: Users can now see detailed file information and make informed format choices

---

## Phase 5: User Story 5 - Error Handling and User Feedback (Priority: P2)

**Goal**: Provide clear feedback when something goes wrong so users can take corrective action

**Independent Test**: Attempt to convert an unsupported file format, interrupt a conversion, or load a corrupted file, and verify clear error messages are displayed

**Note**: Implementing US5 before US2/US4 to ensure robust error handling is in place before adding complexity

### Error Handling Infrastructure

- [X] T043 [P] [US5] Define ConversionError class in src/types/conversion.types.ts (extends Error with ConversionErrorType enum)
- [X] T044 [P] [US5] Add error boundary component in src/components/ErrorBoundary.tsx (catches React errors)
- [X] T045 [US5] Enhance ErrorMessage component with different error type styling and recovery actions (update src/components/ErrorMessage.tsx)
- [X] T046 [US5] Add comprehensive error mapping in conversionService (map mediabunny errors to user-friendly ConversionError)
- [X] T047 [US5] Add file validation errors with specific messages (unsupported format, corrupted file, file too large)
- [X] T048 [US5] Implement browser capability warnings (WebCodecs support, memory estimates)
- [X] T049 [US5] Add beforeunload warning when conversion is active (integrate useBeforeUnload hook in App.tsx)
- [X] T050 [US5] Test error scenarios: unsupported format, corrupted file, large file warning, browser compatibility, conversion failures

**Checkpoint**: Application now handles all error cases gracefully with clear user guidance

---

## Phase 6: User Story 2 - Batch File Conversion (Priority: P2)

**Goal**: Allow users to convert multiple media files at once to save time and effort

**Independent Test**: Drop 5 different video files onto the interface, select a common output format, and verify all 5 files are converted and downloadable

**Note**: Implementing US2 after US1, US3, US5 ensures core functionality and error handling are solid before adding queue complexity

### Queue Management

- [X] T051 [US2] Create useConversionQueue hook in src/hooks/useConversionQueue.ts (manages ConversionQueue state, addJob, removeJob, startQueue, cancelJob, cancelAll)
- [X] T052 [US2] Add queue processing logic to useConversionQueue (sequential processing, continue on failure, compute statistics)
- [X] T053 [P] [US2] Create ConversionQueue context provider in src/contexts/ConversionQueueContext.tsx (wrap App with queue state)

### UI Components for Batch Processing

- [X] T054 [P] [US2] Update FileDropZone to accept multiple files (update src/components/FileDropZone.tsx with multiple={true})
- [X] T055 [P] [US2] Create FileList component in src/components/FileList.tsx (displays all uploaded files with status badges)
- [X] T056 [P] [US2] Create ConversionQueue component in src/components/ConversionQueue.tsx (shows all jobs with individual progress bars and overall progress)
- [X] T057 [US2] Enhance App.tsx for batch mode (multiple files → batch format selection → batch conversion → individual/ZIP download)
- [X] T058 [P] [US2] Add "Convert All" button functionality in App.tsx (starts queue processing)

### Batch Download

- [X] T059 [US2] Implement downloadAsZip method in downloadService using JSZip (src/services/downloadService.ts)
- [X] T060 [US2] Add "Download All as ZIP" button in App.tsx (shown when 2+ files converted successfully)
- [X] T061 [US2] Add individual file download buttons in ConversionQueue component

### Batch Error Handling

- [X] T062 [US2] Ensure queue continues processing when one file fails (update useConversionQueue logic)
- [X] T063 [US2] Display per-file error messages in ConversionQueue component
- [X] T064 [US2] Add "Clear Completed" and "Clear All" buttons to ConversionQueue component
- [X] T065 [US2] Test batch scenarios: 5 files all succeed, 1 file fails in middle, cancel during batch, download as ZIP

**Checkpoint**: Users can now convert multiple files at once with robust queue management

---

## Phase 7: User Story 4 - Conversion Quality Settings (Priority: P3)

**Goal**: Provide advanced users with fine-grained control over output quality while maintaining sensible defaults

**Independent Test**: Load a video file, adjust quality settings (resolution, bitrate, frame rate), convert, and verify the output file matches the specified settings

**Note**: Implementing US4 last as it's P3 and builds on all previous stories with optional advanced features

### Quality Settings UI

- [X] T066 [P] [US4] Create QualitySettings component in src/components/QualitySettings.tsx (preset selector + manual controls for video/audio)
- [X] T067 [US4] Add quality preset selection UI (High Quality, Balanced, Small File Size radio buttons or dropdown)
- [X] T068 [US4] Add manual video quality controls (width, height, bitrate, frame rate, codec inputs - shown when "Custom" selected)
- [X] T069 [US4] Add manual audio quality controls (sample rate, bitrate, channels, codec inputs - shown when "Custom" selected)
- [X] T070 [US4] Implement preset-to-settings mapping (when preset selected, populate manual fields with preset values)

### Quality Integration

- [X] T071 [US4] Update conversionService to accept QualityProfile parameter (modify convert method in src/services/conversionService.ts)
- [X] T072 [US4] Pass quality settings to mediabunny Conversion.init (video and audio configuration objects)
- [X] T073 [US4] Update estimateOutputSize to use QualityProfile (modify src/services/conversionService.ts)
- [X] T074 [US4] Integrate QualitySettings component into App.tsx (shown between FormatSelector and Convert button)
- [X] T075 [US4] Add quality settings state management (default to "Balanced" preset)
- [X] T076 [US4] Update estimated output size display to reflect quality changes in real-time

### Quality Validation

- [X] T077 [US4] Add quality setting validation (bitrates > 0, dimensions > 0, frame rate > 0)
- [X] T078 [US4] Add warning for extreme settings (very high bitrate, very low quality)
- [X] T079 [US4] Test quality presets: High Quality (8Mbps video, 256kbps audio), Balanced (2.5Mbps video, 128kbps audio), Small (1Mbps video, 96kbps audio)
- [X] T080 [US4] Test custom settings: manual resolution change, manual bitrate adjustment, codec selection

**Checkpoint**: Advanced users can now fine-tune conversion quality with full control over output parameters

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [X] T081 [P] Add responsive design breakpoints for mobile/tablet (update all components with Tailwind responsive classes)
- [X] T082 [P] Add loading skeletons for metadata extraction (FileMetadata component)
- [X] T083 [P] Add smooth transitions and animations (progress bars, file uploads, conversions)
- [X] T084 [P] Add accessibility attributes (ARIA labels, keyboard navigation, focus management)
- [ ] T085 [P] Implement dark mode theme toggle (optional enhancement, DaisyUI themes)
- [ ] T086 [P] Add conversion time estimation display (calculate based on file size and historical data)
- [ ] T087 Add memory usage monitoring for large files (warn when file > 500MB)
- [X] T088 Add "Clear Completed" auto-cleanup option (after successful download)
- [X] T089 Optimize bundle size (code splitting, lazy loading for JSZip and large components)
- [X] T090 [P] Add helpful tooltips and onboarding hints (first-time user experience)
- [X] T091 [P] Create README.md in app/browser-media-converter/ with comprehensive usage instructions
- [ ] T092 Test cross-browser compatibility (Chrome 94+, Edge 94+, Firefox 130+, Safari 16.4+)
- [ ] T093 Test with various file sizes (10MB, 100MB, 500MB, 1GB) and formats
- [ ] T094 Profile and optimize conversion performance (Chrome DevTools Performance tab)
- [X] T095 Run ESLint and fix all errors (reduced from 47 to 0 errors - 100% clean!)
- [X] T096 Run TypeScript type check and fix all errors
- [X] T097 [P] Document known limitations and browser-specific issues in README.md
- [ ] T098 Verify quickstart.md instructions work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3 (US1 - MVP)**: Depends on Phase 2 completion - Can start after foundation ready
- **Phase 4 (US3)**: Depends on Phase 2 and Phase 3 completion - Enhances US1 with metadata
- **Phase 5 (US5)**: Depends on Phase 2 and Phase 3 completion - Adds error handling to US1
- **Phase 6 (US2)**: Depends on Phase 2, 3, and 5 completion - Builds on solid US1 + error handling
- **Phase 7 (US4)**: Depends on Phase 2 and Phase 3 completion - Can be done in parallel with US2/US3/US5 if desired
- **Phase 8 (Polish)**: Depends on completion of all desired user stories

### User Story Dependencies

- **US1 (P1)**: Foundation only - no other story dependencies - MVP!
- **US3 (P2)**: US1 complete - enhances single file conversion with metadata display
- **US5 (P2)**: US1 complete - adds robust error handling to single file conversion
- **US2 (P2)**: US1, US5 complete - requires solid single file + error handling before batch
- **US4 (P3)**: US1 complete - independent advanced feature, can be built in parallel with US2/US3/US5

### Recommended Implementation Order

**MVP Path (fastest to working demo)**:
1. Phase 1 → Phase 2 → Phase 3 (US1) → Demo MVP!

**Full Feature Path (priority order)**:
1. Phase 1 (Setup)
2. Phase 2 (Foundation)
3. Phase 3 (US1 - MVP) ✅ Deploy/Demo
4. Phase 4 (US3 - Metadata) ✅ Deploy/Demo
5. Phase 5 (US5 - Error Handling) ✅ Deploy/Demo
6. Phase 6 (US2 - Batch) ✅ Deploy/Demo
7. Phase 7 (US4 - Quality) ✅ Deploy/Demo
8. Phase 8 (Polish) ✅ Final Release

### Within Each Phase

**Phase 2 (Foundational)**: All tasks can run in parallel except T018/T019 (app entry) depend on types/constants being defined first

**Phase 3 (US1)**:
- Services (T020-T023) can run in parallel
- Hooks (T024-T026) depend on services complete
- Components (T027-T031) can run in parallel after hooks
- Integration (T032-T036) depends on all components

**Phase 4 (US3)**:
- Components (T037-T038) can run in parallel
- Service updates (T039) can run in parallel with components
- Integration (T040-T042) depends on components complete

**Phase 5 (US5)**:
- Infrastructure (T043-T045) can run in parallel
- Service enhancements (T046-T048) can run in parallel after infrastructure
- Integration and testing (T049-T050) depends on all enhancements

**Phase 6 (US2)**:
- Queue management (T051-T053) must complete first
- UI components (T054-T058) can run in parallel after queue logic
- Batch download (T059-T061) can run in parallel with UI components
- Error handling (T062-T065) depends on all components

**Phase 7 (US4)**:
- Quality UI (T066-T070) can run in parallel
- Integration (T071-T076) depends on UI complete
- Validation (T077-T080) depends on integration

**Phase 8 (Polish)**: All tasks marked [P] can run in parallel

### Parallel Opportunities

**Setup Phase**: T003, T004, T005, T006, T007 can all run simultaneously

**Foundational Phase**: T009/T010/T011, T012/T013/T014, T016/T017 can run in parallel

**User Story 1**:
- Services: T020, T021, T023 together (T022 depends on T020/T021)
- Hooks: T025, T026 together (T024 depends on services)
- Components: T027, T028, T029, T030, T031 all together

**Multiple Stories in Parallel** (if team capacity):
- After Phase 2, developers can work on US1, US3, US4, US5 simultaneously
- US2 should wait for US1 + US5 to be solid

---

## Parallel Example: User Story 1 Implementation

```bash
# Step 1: Launch all services in parallel
Task T020: "Implement metadata extraction service in src/services/metadataService.ts"
Task T021: "Implement file validation service in src/services/fileService.ts"
Task T023: "Implement download service in src/services/downloadService.ts"

# Step 2: Once services done, launch conversion service (depends on T020/T021)
Task T022: "Implement conversion service in src/services/conversionService.ts"

# Step 3: Launch hooks in parallel (depends on services)
Task T025: "Create useFileValidator hook in src/hooks/useFileValidator.ts"
Task T026: "Create useBeforeUnload hook in src/hooks/useBeforeUnload.ts"
# And separately:
Task T024: "Create useMediaConverter hook in src/hooks/useMediaConverter.ts" (depends on T022)

# Step 4: Launch all UI components in parallel (depends on hooks)
Task T027: "Create FileDropZone component"
Task T028: "Create FormatSelector component"
Task T029: "Create ProgressBar component"
Task T030: "Create DownloadButton component"
Task T031: "Create ErrorMessage component"

# Step 5: Integration (depends on all components)
Task T032-T036: Sequential integration and testing
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (8 tasks, ~1-2 hours)
2. Complete Phase 2: Foundational (11 tasks, ~3-4 hours)
3. Complete Phase 3: User Story 1 (17 tasks, ~6-8 hours)
4. **STOP and VALIDATE**: Test single file conversion end-to-end
5. Deploy/demo MVP (basic file conversion works!)

**Total MVP Effort**: ~10-14 hours for core functionality

### Incremental Delivery

1. **Phase 1-2**: Setup + Foundation → ~4-6 hours
2. **Phase 3 (US1)**: MVP ready → Test independently → Deploy/Demo ✅
3. **Phase 4 (US3)**: Add metadata display → Test independently → Deploy/Demo ✅
4. **Phase 5 (US5)**: Add error handling → Test independently → Deploy/Demo ✅
5. **Phase 6 (US2)**: Add batch processing → Test independently → Deploy/Demo ✅
6. **Phase 7 (US4)**: Add quality controls → Test independently → Deploy/Demo ✅
7. **Phase 8**: Polish → Final release ✅

Each story adds value without breaking previous stories!

### Parallel Team Strategy

With 2-3 developers:

1. **All together**: Complete Phase 1-2 (Setup + Foundation)
2. **Once Foundational complete**:
   - Dev A: Phase 3 (US1) - Core MVP
   - Dev B: Phase 4 (US3) + Phase 5 (US5) - Enhancements to US1
   - Dev C: Phase 7 (US4) - Quality settings (independent)
3. **After US1 + US5 stable**:
   - Dev A + Dev B: Phase 6 (US2) - Batch processing
4. **Finally**: All together on Phase 8 (Polish)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 11 tasks
- **Phase 3 (US1 - MVP)**: 17 tasks
- **Phase 4 (US3)**: 6 tasks
- **Phase 5 (US5)**: 8 tasks
- **Phase 6 (US2)**: 15 tasks
- **Phase 7 (US4)**: 15 tasks
- **Phase 8 (Polish)**: 18 tasks

**Total**: 98 tasks

**MVP Scope**: Tasks T001-T036 (36 tasks for basic single file conversion)

**Full Feature Scope**: All 98 tasks for complete application with all user stories

---

## Notes

- **[P] tasks**: Different files, can run in parallel with no dependencies
- **[Story] labels**: Map task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each logical task group (e.g., all services, all components)
- Stop at any checkpoint to validate story independently
- Focus on US1 (MVP) first for fastest time to demo
- Tests not included but can be added before each implementation task if TDD is desired
- All file paths are relative to `app/browser-media-converter/` directory
