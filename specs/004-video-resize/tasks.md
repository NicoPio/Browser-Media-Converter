# Tasks: Video Resize

**Input**: Design documents from `/specs/004-video-resize/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Unit tests included (referenced in plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Tech stack: TypeScript 5.9.3, React 18.3.1, Vitest, Tailwind CSS v4, DaisyUI 5

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational types and constants needed by all user stories

- [ ] T001 [P] Create resize types in `src/types/resize.types.ts` with ResolutionPresetId, ResolutionPreset, ResizeConfiguration, DimensionValidationResult interfaces
- [ ] T002 [P] Create resolution presets constants in `src/constants/resolutionPresets.ts` with RESOLUTION_PRESETS array and DEFAULT_RESIZE_CONFIG

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create dimension calculation utilities in `src/utils/dimensions.ts` with toEvenNumber, calculateAspectRatio, calculateTargetDimensions, isUpscaling functions
- [ ] T004 Add unit tests for dimension utilities in `tests/unit/dimensions.test.ts`
- [ ] T005 Verify tests pass with `npm run test:unit`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Quick Resize with Preset Resolution (Priority: P1) 🎯 MVP

**Goal**: Allow users to quickly resize a video to a standard resolution (720p, 1080p, 480p, etc.)

**Independent Test**: Load a 4K video, select "720p" preset, convert, verify output is 1280x720

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create ResizeControls component skeleton in `src/components/ResizeControls.tsx` with preset selector dropdown
- [ ] T007 [P] [US1] Create useResizeCalculator hook in `src/hooks/useResizeCalculator.ts` for real-time dimension calculations
- [ ] T008 [US1] Implement preset selection logic in `src/components/ResizeControls.tsx` with preset radio/select UI
- [ ] T009 [US1] Add upscaling warning display when target resolution > source in `src/components/ResizeControls.tsx`
- [ ] T010 [US1] Integrate ResizeControls into QualitySettings in `src/components/QualitySettings.tsx` as new section
- [ ] T011 [US1] Connect resize configuration to conversion flow - update quality profile with target dimensions

**Checkpoint**: Users can select presets and convert videos with resized output

---

## Phase 4: User Story 2 - Preserve Aspect Ratio by Default (Priority: P1)

**Goal**: Automatically preserve aspect ratio when resizing to avoid image distortion

**Independent Test**: Load a 16:9 video, modify width only, verify height auto-adjusts to maintain ratio

### Implementation for User Story 2

- [ ] T012 [US2] Add aspect ratio lock toggle to `src/components/ResizeControls.tsx` with lock/unlock icon
- [ ] T013 [US2] Implement aspect ratio preservation logic in `src/hooks/useResizeCalculator.ts` for auto-height/width calculation
- [ ] T014 [US2] Add support for vertical videos (9:16) in dimension calculations in `src/utils/dimensions.ts`
- [ ] T015 [US2] Add support for non-standard ratios (4:3, 21:9, 2.35:1) in dimension calculations
- [ ] T016 [US2] Implement even number adjustment (codec compatibility) in `src/utils/dimensions.ts`

**Checkpoint**: Aspect ratio is preserved by default for all video types

---

## Phase 5: User Story 3 - Custom Dimensions Input (Priority: P2)

**Goal**: Allow advanced users to specify exact custom dimensions

**Independent Test**: Load a video, enter 640x480 manually, verify output matches

### Implementation for User Story 3

- [ ] T017 [US3] Add custom mode toggle to `src/components/ResizeControls.tsx` when preset is 'custom'
- [ ] T018 [US3] Implement width/height input fields in `src/components/ResizeControls.tsx` with number validation
- [ ] T019 [US3] Add input validation (positive, numeric, min/max range) in `src/utils/dimensions.ts` with validateDimensions function
- [ ] T020 [US3] Display validation error messages in `src/components/ResizeControls.tsx`
- [ ] T021 [US3] Auto-calculate missing dimension when only one is provided

**Checkpoint**: Advanced users can enter any valid custom dimensions

---

## Phase 6: User Story 4 - Visual Preview of Output Dimensions (Priority: P2)

**Goal**: Show source and target dimensions side by side before conversion

**Independent Test**: Load 1920x1080 video, select 720p, verify display shows "1920×1080 → 1280×720"

### Implementation for User Story 4

- [ ] T022 [US4] Create DimensionPreview sub-component in `src/components/ResizeControls.tsx`
- [ ] T023 [US4] Display source dimensions from MediaFile.metadata in preview
- [ ] T024 [US4] Display target dimensions with real-time updates in preview
- [ ] T025 [US4] Add percentage reduction/increase indicator
- [ ] T026 [US4] Add ARIA labels for accessibility in dimension preview

**Checkpoint**: Users see clear "before → after" dimension preview

---

## Phase 7: User Story 5 - Combine Resize with Quality Settings (Priority: P3)

**Goal**: Allow resize to work alongside existing quality settings (bitrate, codec)

**Independent Test**: Select "high" quality preset + 720p resolution, verify both are applied

### Implementation for User Story 5

- [ ] T027 [US5] Ensure resize config is independent of quality preset in `src/components/QualitySettings.tsx`
- [ ] T028 [US5] Update quality profile type to include resize configuration in `src/types/quality.types.ts`
- [ ] T029 [US5] Verify conversionService applies both resize and quality settings correctly

**Checkpoint**: Resize and quality settings work together seamlessly

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, and final polish

- [ ] T030 [P] Add component tests for ResizeControls in `tests/component/ResizeControls.test.tsx`
- [ ] T031 [P] Disable resize controls for audio-only files in `src/components/ResizeControls.tsx`
- [ ] T032 Handle edge case: very small videos (< 320px) with warning message
- [ ] T033 Handle edge case: very large videos (> 4K) with performance warning
- [ ] T034 Ensure full keyboard navigation in ResizeControls
- [ ] T035 Add screen reader support with proper ARIA labels throughout
- [ ] T036 Run full test suite: `npm test`
- [ ] T037 Manual validation with `src/fixtures/sample-video.mp4` test file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but can be worked sequentially
  - US3 and US4 are P2, can start after US1+US2
  - US5 is P3, integrates all previous work
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - Core preset functionality
- **User Story 2 (P1)**: Can start after Phase 2 - Enhances US1 with ratio preservation
- **User Story 3 (P2)**: Can start after Phase 2 - Adds custom dimension mode
- **User Story 4 (P2)**: Can start after Phase 2 - Visual enhancement, no code dependencies
- **User Story 5 (P3)**: Should start after US1 - Integration task

### Within Each User Story

- Types and utilities before components
- Hook before component that uses it
- Component implementation before integration
- Integration before polish

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T006 and T007 can run in parallel (component skeleton + hook)
- T030 and T031 can run in parallel (tests + edge case)

---

## Parallel Example: Setup Phase

```bash
# Launch setup tasks in parallel:
Task: "Create resize types in src/types/resize.types.ts"
Task: "Create resolution presets in src/constants/resolutionPresets.ts"
```

## Parallel Example: User Story 1

```bash
# Launch initial US1 tasks in parallel:
Task: "Create ResizeControls component skeleton in src/components/ResizeControls.tsx"
Task: "Create useResizeCalculator hook in src/hooks/useResizeCalculator.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Presets)
4. Complete Phase 4: User Story 2 (Aspect Ratio)
5. **STOP and VALIDATE**: Test with sample-video.mp4
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Core utilities ready
2. Add User Story 1 → Basic preset resize works (MVP!)
3. Add User Story 2 → Aspect ratio preservation
4. Add User Story 3 → Custom dimensions for power users
5. Add User Story 4 → Visual polish with preview
6. Add User Story 5 → Full integration with quality settings
7. Polish → Edge cases and accessibility

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Test file available: `src/fixtures/sample-video.mp4`
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
