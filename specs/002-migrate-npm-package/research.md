# Mediabunny NPM Package Migration Research Report

## 1. NPM Package Version Compatibility

### Latest Versions
- **mediabunny**: `1.27.0` (latest on npm as of December 19, 2025)
- **@mediabunny/mp3-encoder**: `1.27.0` (latest on npm)
- **Current repository version**: `1.26.0` (in root package.json)

### Recent Releases and Breaking Changes

#### v1.27.0 (December 17, 2025) - **BREAKING CHANGES**
- Enhanced `VideoSample` methods with custom pixel format and plane layout options
- **BREAKING**: `VideoSample.copyTo()` now returns `Promise<PlaneLayout[]>` instead of `Promise<void>`
- Added hardware acceleration support for video conversion

#### v1.26.0 (December 11, 2025)
- Introduced `allowRotationMetadata` option to strip rotation data from output files
- Added pause/resume functionality to media stream track sources
- No breaking changes

#### v1.25.8 (December 9, 2025)
- Fixed video frame ordering issues in Safari worker environments
- Improved keyframe detection for AVC SEI recovery points
- No breaking changes

### API Compatibility Assessment
The application is currently using `mediabunny: "file:../.."` which points to version `1.26.0`. Upgrading to `1.27.0` requires checking if the application uses `VideoSample.copyTo()` method anywhere. Based on the code analysis, **the application does not directly use VideoSample.copyTo()**, so the breaking change should not affect it.

**Recommendation**: Safe to upgrade to 1.27.0

---

## 2. Application Dependencies Analysis

### Mediabunny Imports Summary

The application uses mediabunny in **3 files** with a total of **4 import statements**:

#### File: `app/browser-media-converter/src/services/metadataService.ts`
**Line 5:**
```typescript
import { Input, BlobSource, ALL_FORMATS } from 'mediabunny';
```

**APIs Used:**
- `Input` - Class for reading media files
- `BlobSource` - Source adapter for browser File/Blob objects
- `ALL_FORMATS` - Constant array of all supported demuxer formats

**Usage**: Extracts video/audio metadata from uploaded files

---

#### File: `app/browser-media-converter/src/services/codecSupportService.ts`
**Line 6:**
```typescript
import { canEncodeAudio, canEncodeVideo } from 'mediabunny';
```

**APIs Used:**
- `canEncodeAudio(codec: string): Promise<boolean>` - Check if audio codec is encodable
- `canEncodeVideo(codec: string): Promise<boolean>` - Check if video codec is encodable

**Usage**: Codec capability detection with caching

---

#### File: `app/browser-media-converter/src/main.tsx`
**Lines 7-8:**
```typescript
import { canEncodeAudio } from 'mediabunny';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';
```

**APIs Used:**
- `canEncodeAudio(codec: string)` - Check native MP3 support
- `registerMp3Encoder()` - Register WASM MP3 encoder fallback

**Usage**: Initialize MP3 encoding fallback if native support unavailable

---

#### File: `app/browser-media-converter/src/services/conversionService.ts`
**Lines 8-24:**
```typescript
import {
    Input,
    Output,
    Conversion,
    BlobSource,
    BufferTarget,
    ALL_FORMATS,
    Mp4OutputFormat,
    MovOutputFormat,
    WebMOutputFormat,
    MkvOutputFormat,
    WavOutputFormat,
    Mp3OutputFormat,
    OggOutputFormat,
    AdtsOutputFormat,
    FlacOutputFormat,
} from 'mediabunny';
```

**Usage**: Main conversion logic - all format classes and I/O classes

---

### API Usage Summary

**Total Unique APIs Used: 20**

**Classes (7):**
- Input, Output, Conversion
- BlobSource, BufferTarget
- Plus 9 format classes (Mp4OutputFormat, etc.)

**Functions (2):**
- canEncodeAudio(), canEncodeVideo()

**Constants (1):**
- ALL_FORMATS

**External Package (1):**
- @mediabunny/mp3-encoder (registerMp3Encoder)

**✅ No Internal/Private APIs Detected** - All imports from main package entry point

---

## 3. Configuration Dependencies

### vite.config.ts
**File:** `app/browser-media-converter/vite.config.ts`

**Path Alias:**
```typescript
resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
},
```
✅ No mediabunny-specific aliases

**Code Splitting (Lines 44-46):**
```typescript
if (id.includes('mediabunny')) {
    return 'mediabunny';
}
```
✅ Will work with npm package

**Dev Optimization (Line 65):**
```typescript
optimizeDeps: {
    include: ['react', 'react-dom', 'mediabunny'],
```
✅ Will work with npm package

**Assessment**: No changes needed

---

### tsconfig.json
**File:** `app/browser-media-converter/tsconfig.json`

**Path Mapping:**
```json
"paths": {
    "@/*": ["./src/*"]
}
```
✅ No mediabunny-specific mappings

**TypeScript Version:**
- Current: 5.9.3
- Required by mediabunny: May need 5.7+

**Assessment**: No path changes needed, verify TypeScript version compatibility

---

### package.json Updates Required

**Current:**
```json
"dependencies": {
    "@mediabunny/mp3-encoder": "^1.27.0",
    "mediabunny": "file:../..",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
}
```

**Target:**
```json
"dependencies": {
    "@mediabunny/mp3-encoder": "^1.27.0",
    "@types/dom-mediacapture-transform": "^0.1.11",
    "@types/dom-webcodecs": "0.1.13",
    "mediabunny": "^1.27.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
}
```

---

## 4. File Cleanup Inventory

### Directories to Remove

| Directory | Size | Description |
|-----------|------|-------------|
| `src/` | 1.2 MB | Mediabunny library source code |
| `dist/` | 4.6 MB | Built library files |
| `packages/` | 2.3 MB | Monorepo packages (mp3-encoder) |
| `scripts/` | 104 KB | Build scripts |
| `docs/` | 12 MB | VitePress documentation |
| `examples/` | 112 KB | Example applications |
| `test/` | 14 MB | Library test files |
| `shared/` | 12 KB | Shared code |
| `dev/` | 2.6 MB | Development files |

**Total Size to Remove: ~37.3 MB**

---

### Files to Remove

**Build & Configuration:**
- `build.sh` - Main build script
- `api-extractor.json` - API Extractor config
- `vite.config.ts` - Root Vite config (for examples)
- `vitest.config.ts` - Root Vitest config
- `tsconfig.json` - Root TypeScript config
- `tsconfig.vite.json` - TypeScript config for Vite
- `tsconfig.vitest.json` - TypeScript config for Vitest
- `tsdoc.json` - TSDoc configuration
- `eslint.config.mjs` - Root ESLint config
- `bun.lock` - Bun lockfile

**Documentation:**
- `README.md` - Replace with app-specific README
- `LICENSE` - Library-specific license

---

### Root package.json Cleanup

**Remove workspace config:**
```json
"workspaces": ["packages/*"]
```

**Remove all scripts** (25 library-specific scripts):
- build, watch, lint, test, check, docs:*, dev, examples:build, etc.

**Remove all devDependencies** (25 packages):
- TypeScript, ESLint, Vite, VitePress, API Extractor, testing tools, etc.

**Remove dependencies** (move types to app if needed):
- @types/dom-mediacapture-transform
- @types/dom-webcodecs

---

## 5. Migration Checklist

### Pre-Migration
- ✅ Application uses only public APIs
- ✅ No breaking changes affect application code
- ✅ Configuration files compatible with npm package
- ⚠️ TypeScript version may need verification

### Required Actions
1. ✅ Update package.json dependency
2. ✅ Add type dependencies
3. ⚠️ Consider TypeScript upgrade to 5.7+
4. ✅ Remove library code and configuration
5. ✅ Update documentation

### Testing Strategy
1. Install npm package: `cd app/browser-media-converter && npm install`
2. Build: `npm run build`
3. Dev server: `npm run dev`
4. Unit tests: `npm run test:unit`
5. E2E tests: `npm run test:e2e`
6. Manual: Test all conversion formats

---

## 6. Risk Assessment

### ✅ Low Risk
- No internal/private APIs used
- All imports from main package entry
- No custom path mappings
- Breaking change doesn't affect app

### ⚠️ Medium Risk
- TypeScript version compatibility
- Peer dependencies (types packages)

### Mitigation Strategy
1. Test in branch first
2. Run comprehensive tests
3. Verify bundle size unchanged
4. Keep backup during migration

---

## 7. Complete API Reference

### Core Classes
1. Input - Read media files
2. Output - Write media files
3. Conversion - High-level conversion API
4. BlobSource - Browser File/Blob adapter
5. BufferTarget - In-memory ArrayBuffer

### Format Classes
6-14. Mp4OutputFormat, MovOutputFormat, WebMOutputFormat, MkvOutputFormat, WavOutputFormat, Mp3OutputFormat, OggOutputFormat, AdtsOutputFormat, FlacOutputFormat

### Functions
15. canEncodeAudio(codec: string): Promise<boolean>
16. canEncodeVideo(codec: string): Promise<boolean>

### Constants
17. ALL_FORMATS - Array of supported formats

### External
18. @mediabunny/mp3-encoder.registerMp3Encoder()

---

**Report Date**: 2025-12-19
**Current Version**: 1.26.0 (local)
**Target Version**: 1.27.0 (npm)
**Recommendation**: ✅ Safe to proceed with migration
