# Data Model: Browser Media Converter

**Date**: 2025-12-17
**Branch**: `001-browser-media-converter`
**Phase**: 1 - Design

This document defines the data entities, state machines, and validation rules for the browser media converter application.

---

## Entity Definitions

### 1. MediaFile

Represents an uploaded media file with its metadata.

**Properties**:
- `id`: string (unique identifier, UUID)
- `name`: string (original filename)
- `size`: number (file size in bytes)
- `type`: string (MIME type, e.g., "video/mp4")
- `file`: File (browser File object)
- `metadata`: MediaFileMetadata | null (extracted after analysis)
- `createdAt`: Date (upload timestamp)

**MediaFileMetadata** (extracted from mediabunny):
- `format`: string (container format: "mp4", "webm", etc.)
- `duration`: number (duration in seconds)
- `hasVideo`: boolean
- `hasAudio`: boolean
- `videoCodec`: string | null (e.g., "h264", "vp9")
- `audioCodec`: string | null (e.g., "aac", "opus")
- `width`: number | null (video width in pixels)
- `height`: number | null (video height in pixels)
- `frameRate`: number | null (fps)
- `videoBitrate`: number | null (bits per second)
- `audioBitrate`: number | null (bits per second)
- `sampleRate`: number | null (Hz)
- `channels`: number | null (audio channels)

**Validation Rules**:
- `name`: Must not be empty
- `size`: Must be > 0, warn if > 500MB, error if > 2GB
- `type`: Must match supported MIME types
- `file`: Must be a valid File object

**State**: Immutable after creation (except metadata which is populated async)

---

### 2. ConversionJob

Represents a single file conversion operation.

**Properties**:
- `id`: string (unique identifier, UUID)
- `sourceFile`: MediaFile (input file)
- `targetFormat`: OutputFormat (desired output format)
- `qualityProfile`: QualityProfile (conversion settings)
- `status`: ConversionStatus (current state)
- `progress`: number (0-100, percentage complete)
- `error`: Error | null (error if status is "failed")
- `result`: ConversionResult | null (output if status is "completed")
- `startedAt`: Date | null (when conversion started)
- `completedAt`: Date | null (when conversion finished)
- `estimatedDuration`: number | null (estimated time in seconds)

**ConversionStatus** (enum):
- `"queued"`: Waiting to start
- `"initializing"`: Loading and analyzing file
- `"converting"`: Active conversion in progress
- `"finalizing"`: Writing output and cleanup
- `"completed"`: Successfully finished
- `"failed"`: Conversion failed with error
- `"cancelled"`: User cancelled conversion

**ConversionResult**:
- `blob`: Blob (converted file as Blob)
- `filename`: string (suggested download filename)
- `size`: number (output file size in bytes)
- `url`: string | null (temporary Blob URL for download)

**Validation Rules**:
- `sourceFile`: Must be a valid MediaFile
- `targetFormat`: Must be compatible with source file type
- `qualityProfile`: Must have valid settings for target format
- `progress`: Must be 0-100
- `status` transitions: Must follow state machine (see below)

**State Transitions**:
```
queued → initializing → converting → finalizing → completed
                            ↓            ↓
                          failed      failed
           ↓
       cancelled (from queued, initializing, converting, finalizing)
```

---

### 3. ConversionQueue

Manages multiple conversion jobs and processing order.

**Properties**:
- `jobs`: ConversionJob[] (all jobs in queue)
- `activeJob`: ConversionJob | null (currently processing job)
- `maxConcurrent`: number (default: 1, could support 2-3 with multi-threading)
- `totalJobs`: number (computed: jobs.length)
- `completedCount`: number (computed: jobs with status "completed")
- `failedCount`: number (computed: jobs with status "failed")
- `queuedCount`: number (computed: jobs with status "queued")
- `overallProgress`: number (computed: average progress across all jobs)

**Computed Properties**:
- `isProcessing`: boolean (activeJob !== null)
- `isComplete`: boolean (all jobs completed or failed)
- `nextJob`: ConversionJob | null (next queued job to process)

**Operations**:
- `addJob(job: ConversionJob)`: Add job to queue
- `removeJob(jobId: string)`: Remove job from queue
- `startNext()`: Begin processing next queued job
- `cancelJob(jobId: string)`: Cancel specific job
- `cancelAll()`: Cancel all queued/active jobs
- `clearCompleted()`: Remove completed jobs from queue
- `clearAll()`: Remove all jobs

**Validation Rules**:
- `maxConcurrent`: Must be >= 1, <= 3
- Cannot add duplicate jobs (same source file + same target format)
- Cannot start next job if activeJob exists and maxConcurrent is 1

---

### 4. QualityProfile

Defines conversion quality parameters.

**Properties**:
- `preset`: QualityPreset | null (predefined quality level)
- `video`: VideoQualitySettings | null (video-specific settings)
- `audio`: AudioQualitySettings | null (audio-specific settings)

**QualityPreset** (enum):
- `"high"`: High quality, larger file size
- `"balanced"`: Balanced quality and size (default)
- `"small"`: Smaller file size, lower quality
- `"custom"`: User-defined settings

**VideoQualitySettings**:
- `width`: number | null (output width, null = preserve)
- `height`: number | null (output height, null = preserve)
- `bitrate`: number | null (video bitrate in bps, null = auto)
- `frameRate`: number | null (fps, null = preserve)
- `codec`: string | null (e.g., "h264", "vp9", null = auto)

**AudioQualitySettings**:
- `sampleRate`: number | null (Hz, null = preserve)
- `bitrate`: number | null (audio bitrate in bps, null = auto)
- `channels`: number | null (1=mono, 2=stereo, null = preserve)
- `codec`: string | null (e.g., "aac", "opus", null = auto)

**Preset Configurations**:
```typescript
const QUALITY_PRESETS = {
  high: {
    video: { bitrate: 8_000_000, codec: 'h264' },
    audio: { bitrate: 256_000, codec: 'aac' }
  },
  balanced: {
    video: { bitrate: 2_500_000, codec: 'h264' },
    audio: { bitrate: 128_000, codec: 'aac' }
  },
  small: {
    video: { bitrate: 1_000_000, codec: 'h264' },
    audio: { bitrate: 96_000, codec: 'aac' }
  }
};
```

**Validation Rules**:
- If `preset` is not "custom", `video`/`audio` settings should match preset
- Video width/height must be > 0 if specified
- Bitrates must be > 0 if specified
- Frame rate must be > 0 if specified
- Codec strings must be valid mediabunny-supported codecs

---

### 5. OutputFormat

Defines supported output container formats.

**Properties**:
- `format`: FormatType (container format identifier)
- `extension`: string (file extension, e.g., ".mp4")
- `mimeType`: string (MIME type, e.g., "video/mp4")
- `displayName`: string (user-friendly name, e.g., "MP4 Video")
- `description`: string (format description and use cases)
- `supportsVideo`: boolean
- `supportsAudio`: boolean
- `recommendedCodecs`: RecommendedCodecs

**FormatType** (enum):
- `"mp4"`: MPEG-4 Part 14
- `"mov"`: QuickTime Movie
- `"webm"`: WebM
- `"mkv"`: Matroska
- `"wav"`: WAVE Audio
- `"mp3"`: MP3 Audio
- `"ogg"`: Ogg Container
- `"aac"`: ADTS AAC
- `"flac"`: FLAC Audio

**RecommendedCodecs**:
- `video`: string[] (e.g., ["h264", "h265"])
- `audio`: string[] (e.g., ["aac", "opus"])

**Format Compatibility Matrix**:
```
Video formats: mp4, mov, webm, mkv
Audio formats: wav, mp3, ogg, aac, flac

Video → Video: All combinations supported
Video → Audio: Extract audio track to audio format
Audio → Video: Not supported
Audio → Audio: All combinations supported
```

---

## State Machine Diagrams

### ConversionJob State Machine

```
┌─────────┐
│ queued  │ (initial state)
└────┬────┘
     │ startConversion()
     ▼
┌─────────────┐
│initializing │ (loading file, analyzing)
└──────┬──────┘
       │ analysisComplete()
       ▼
┌───────────┐
│converting │ (active conversion)
└─────┬─────┘
      │ conversionComplete()
      ▼
┌────────────┐
│finalizing  │ (writing output, cleanup)
└──────┬─────┘
       │ finalized()
       ▼
┌───────────┐
│completed  │ (terminal state - success)
└───────────┘

At any point before completion:
├─ error() → failed (terminal state - error)
└─ cancel() → cancelled (terminal state - user action)
```

### ConversionQueue Processing

```
Queue: [Job1, Job2, Job3, ...]

Step 1: Select next queued job
Step 2: Set as activeJob
Step 3: Process job (state machine above)
Step 4: On completion/failure:
        - Clear activeJob
        - If more queued jobs, go to Step 1
        - Else, idle
```

---

## Relationships

### Entity Relationship Diagram

```
┌──────────────┐
│  MediaFile   │
└──────┬───────┘
       │ 1
       │
       │ n
┌──────▼────────┐      ┌─────────────────┐
│ConversionJob  ├──────►  OutputFormat   │
└──────┬────────┘  n:1  └─────────────────┘
       │
       │ n:1
┌──────▼───────────┐
│ QualityProfile   │
└──────────────────┘

┌──────────────────┐
│ConversionQueue   │
└────────┬─────────┘
         │ contains
         │ 1:n
┌────────▼──────────┐
│  ConversionJob    │
└───────────────────┘
```

**Relationships**:
- Each **ConversionJob** has exactly one **MediaFile** (source)
- Each **ConversionJob** has exactly one **OutputFormat** (target)
- Each **ConversionJob** has exactly one **QualityProfile** (settings)
- A **ConversionQueue** contains multiple **ConversionJobs**
- One **MediaFile** can be used in multiple **ConversionJobs** (different formats)

---

## Data Flow

### File Upload → Conversion → Download

```
1. User drops file
   ↓
2. Create MediaFile entity
   ↓
3. Extract metadata (async)
   ↓
4. User selects OutputFormat + QualityProfile
   ↓
5. Create ConversionJob
   ↓
6. Add to ConversionQueue
   ↓
7. Queue starts processing
   ↓
8. Job state: queued → initializing → converting → finalizing → completed
   ↓
9. ConversionResult available
   ↓
10. User downloads file
    ↓
11. Cleanup: revoke Blob URL, optionally remove from queue
```

---

## Validation Summary

### Pre-Conversion Validation Checklist

Before starting a conversion, validate:
- [ ] Source file size is reasonable (< 2GB)
- [ ] Source file format is supported
- [ ] Target format is compatible with source
- [ ] WebCodecs API is available
- [ ] Quality settings are valid for target format
- [ ] Browser has sufficient memory (estimate based on file size)
- [ ] No duplicate job exists in queue

### Runtime Validation

During conversion:
- [ ] Monitor progress updates (should increase monotonically)
- [ ] Check for errors from mediabunny
- [ ] Monitor memory usage for large files
- [ ] Validate output size is reasonable

### Post-Conversion Validation

After conversion:
- [ ] Result blob is valid (size > 0)
- [ ] Result is downloadable
- [ ] Original file remains unchanged
- [ ] Blob URL is properly managed (created and revoked)

---

## Storage Considerations

### Browser State (React Context)
- **ConversionQueue**: In-memory only, cleared on page refresh
- **MediaFiles**: Temporary, references to File objects (not persisted)
- **ConversionJobs**: Transient state, not persisted

### Optional LocalStorage (Future Enhancement)
Could persist:
- User preferences (default quality preset)
- Conversion history (metadata only, not files)
- Recently used formats

**Not Stored**:
- Actual file contents (too large)
- Blob URLs (session-specific)
- Active conversions (can't resume after refresh)

---

## Performance Considerations

### Memory Estimates

For a typical video file conversion:
- **Input file in memory**: 1x file size (via BlobSource, streamed)
- **Decoded frames buffer**: ~200MB per second of video (transient)
- **Encoded output buffer**: 1x output size (via BufferTarget)
- **Peak memory**: ~2-3x largest file size during active conversion

### Optimization Strategies

1. **Process sequentially**: maxConcurrent = 1 to avoid memory exhaustion
2. **Stream large files**: Use StreamTarget for files > 500MB
3. **Cleanup eagerly**: Revoke Blob URLs immediately after download
4. **Limit queue size**: Warn users if > 10 files queued

---

## Error Handling

### Error Types

1. **Validation Errors**: Pre-conversion checks failed
2. **mediabunny Errors**: Library-level failures
3. **WebCodecs Errors**: Codec or browser issues
4. **Memory Errors**: Out of memory during processing
5. **User Cancellation**: Not an error, but handled as terminal state

### Error Recovery

- **Validation errors**: Show message, prevent conversion start
- **Conversion errors**: Mark job as failed, continue with next job
- **Critical errors**: Clear queue, show global error message
- **Cancellation**: Clean up resources, mark as cancelled

---

## Type Definitions Location

All TypeScript interfaces and types are defined in:
- `contracts/types.ts`: Complete type definitions
- `src/types/`: Runtime type implementations
  - `media.types.ts`: MediaFile, MediaFileMetadata
  - `conversion.types.ts`: ConversionJob, ConversionQueue, ConversionStatus
  - `quality.types.ts`: QualityProfile, QualityPreset, VideoQualitySettings, AudioQualitySettings

See [contracts/types.ts](./contracts/types.ts) for the complete TypeScript interface definitions.
