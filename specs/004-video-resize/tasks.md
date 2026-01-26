# Tasks: Video Resize

**Input**: Design documents from `/specs/004-video-resize/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Unit tests included (referenced in plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: ✅ **FEATURE COMPLETE** - All user stories implemented and tested (165 tests passing)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Tech stack: TypeScript 5.9.3, React 18.3.1, Vitest, Tailwind CSS v4, DaisyUI 5

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Create foundational types and constants needed by all user stories

- [X] T001 [P] Create resize types in `src/types/resize.types.ts` with ResolutionPresetId, ResolutionPreset, ResizeConfiguration, DimensionValidationResult interfaces
- [X] T002 [P] Create resolution presets constants in `src/constants/resolutionPresets.ts` with RESOLUTION_PRESETS array and DEFAULT_RESIZE_CONFIG

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

- [X] T003 Create dimension calculation utilities in `src/utils/dimensions.ts` with toEvenNumber, calculateAspectRatio, calculateTargetDimensions, isUpscaling functions
- [X] T004 Add unit tests for dimension utilities in `tests/unit/dimensions.test.ts` (36 tests)
- [X] T005 Verify tests pass with `npm run test:unit` (165 tests passing)

**Checkpoint**: ✅ Foundation ready

---

## Phase 3: User Story 1 - Quick Resize with Preset Resolution (Priority: P1) ✅ COMPLETE

**Goal**: Allow users to quickly resize a video to a standard resolution (720p, 1080p, 480p, etc.)

**Independent Test**: Load a 4K video, select "720p" preset, convert, verify output is 1280x720

### Implementation for User Story 1

- [X] T006 [P] [US1] Create ResizeControls component skeleton in `src/components/ResizeControls.tsx` with preset selector dropdown
- [X] T007 [P] [US1] Create useResizeCalculator hook in `src/hooks/useResizeCalculator.ts` for real-time dimension calculations
- [X] T008 [US1] Implement preset selection logic in `src/components/ResizeControls.tsx` with preset radio/select UI
- [X] T009 [US1] Add upscaling warning display when target resolution > source in `src/components/ResizeControls.tsx`
- [X] T010 [US1] Integrate ResizeControls into QualitySettings in `src/components/QualitySettings.tsx` as new section
- [X] T011 [US1] Connect resize configuration to conversion flow - update quality profile with target dimensions

**Checkpoint**: ✅ Users can select presets and convert videos with resized output

---

## Phase 4: User Story 2 - Preserve Aspect Ratio by Default (Priority: P1) ✅ COMPLETE

**Goal**: Automatically preserve aspect ratio when resizing to avoid image distortion

**Independent Test**: Load a 16:9 video, modify width only, verify height auto-adjusts to maintain ratio

### Implementation for User Story 2

- [X] T012 [US2] Add aspect ratio lock toggle to `src/components/ResizeControls.tsx` with lock/unlock icon
- [X] T013 [US2] Implement aspect ratio preservation logic in `src/hooks/useResizeCalculator.ts` for auto-height/width calculation
- [X] T014 [US2] Add support for vertical videos (9:16) in dimension calculations in `src/utils/dimensions.ts`
- [X] T015 [US2] Add support for non-standard ratios (4:3, 21:9, 2.35:1) in dimension calculations
- [X] T016 [US2] Implement even number adjustment (codec compatibility) in `src/utils/dimensions.ts`

**Checkpoint**: ✅ Aspect ratio is preserved by default for all video types

---

## Phase 5: User Story 3 - Custom Dimensions Input (Priority: P2) ✅ COMPLETE

**Goal**: Allow advanced users to specify exact custom dimensions

**Independent Test**: Load a video, enter 640x480 manually, verify output matches

### Implementation for User Story 3

- [X] T017 [US3] Add custom mode toggle to `src/components/ResizeControls.tsx` when preset is 'custom'
- [X] T018 [US3] Implement width/height input fields in `src/components/ResizeControls.tsx` with number validation
- [X] T019 [US3] Add input validation (positive, numeric, min/max range) in `src/utils/dimensions.ts` with validateDimensions function
- [X] T020 [US3] Display validation error messages in `src/components/ResizeControls.tsx`
- [X] T021 [US3] Auto-calculate missing dimension when only one is provided

**Checkpoint**: ✅ Advanced users can enter any valid custom dimensions

---

## Phase 6: User Story 4 - Visual Preview of Output Dimensions (Priority: P2) ✅ COMPLETE

**Goal**: Show source and target dimensions side by side before conversion

**Independent Test**: Load 1920x1080 video, select 720p, verify display shows "1920×1080 → 1280×720"

### Implementation for User Story 4

- [X] T022 [US4] Create DimensionPreview sub-component in `src/components/ResizeControls.tsx`
- [X] T023 [US4] Display source dimensions from MediaFile.metadata in preview
- [X] T024 [US4] Display target dimensions with real-time updates in preview
- [X] T025 [US4] Add percentage reduction/increase indicator
- [X] T026 [US4] Add ARIA labels for accessibility in dimension preview

**Checkpoint**: ✅ Users see clear "before → after" dimension preview

---

## Phase 7: User Story 5 - Combine Resize with Quality Settings (Priority: P3) ✅ COMPLETE

**Goal**: Allow resize to work alongside existing quality settings (bitrate, codec)

**Independent Test**: Select "high" quality preset + 720p resolution, verify both are applied

### Implementation for User Story 5

- [X] T027 [US5] Ensure resize config is independent of quality preset in `src/components/QualitySettings.tsx`
- [X] T028 [US5] Update quality profile type to include resize configuration in `src/types/quality.types.ts`
- [X] T029 [US5] Verify conversionService applies both resize and quality settings correctly

**Checkpoint**: ✅ Resize and quality settings work together seamlessly

---

## Phase 8: Polish & Cross-Cutting Concerns ✅ MOSTLY COMPLETE

**Purpose**: Edge cases, accessibility, and final polish

- [ ] T030 [P] Add component tests for ResizeControls in `tests/component/ResizeControls.test.tsx` (OPTIONAL - unit tests cover logic)
- [X] T031 [P] Disable resize controls for audio-only files in `src/components/ResizeControls.tsx`
- [X] T032 Handle edge case: very small videos (< 320px) with warning message
- [X] T033 Handle edge case: very large videos (> 4K) with performance warning
- [X] T034 Ensure full keyboard navigation in ResizeControls
- [X] T035 Add screen reader support with proper ARIA labels throughout
- [X] T036 Run full test suite: `npm test` (165 tests passing)
- [ ] T037 Manual validation with `src/fixtures/sample-video.mp4` test file (user validation)

---

## Summary

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 1: Setup | ✅ Complete | 2/2 |
| Phase 2: Foundational | ✅ Complete | 3/3 |
| Phase 3: US1 (MVP) | ✅ Complete | 6/6 |
| Phase 4: US2 | ✅ Complete | 5/5 |
| Phase 5: US3 | ✅ Complete | 5/5 |
| Phase 6: US4 | ✅ Complete | 5/5 |
| Phase 7: US5 | ✅ Complete | 3/3 |
| Phase 8: Polish | ✅ Mostly Complete | 6/8 |

**Total**: 35/37 tasks complete (95%)

**Remaining optional tasks**:
- T030: Component tests (optional - unit tests provide coverage)
- T037: Manual validation (requires user testing)

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/types/resize.types.ts` | TypeScript interfaces for resize feature |
| `src/constants/resolutionPresets.ts` | Resolution presets (4K, 1080p, 720p, etc.) |
| `src/utils/dimensions.ts` | Dimension calculation utilities |
| `src/hooks/useResizeCalculator.ts` | React hook for real-time calculations |
| `src/components/ResizeControls.tsx` | UI component for resize controls |
| `src/components/QualitySettings.tsx` | Integration point (includes ResizeControls) |
| `src/services/conversionService.ts` | Conversion service (uses resize config) |
| `tests/unit/dimensions.test.ts` | 36 unit tests for dimensions |
| `tests/unit/resolutionPresets.test.ts` | 20 unit tests for presets |
