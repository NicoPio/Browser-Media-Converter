# Research: Browser Media Converter

**Date**: 2025-12-17
**Branch**: `001-browser-media-converter`
**Phase**: 0 - Technical Research

This document captures research findings for technical unknowns identified during planning.

---

## 1. mediabunny API Integration with React

### Decision
Use custom React hooks to wrap mediabunny's async conversion API, managing state for progress tracking, error handling, and cancellation.

### Rationale
- mediabunny provides `BlobSource` for browser File objects - perfect for drag-and-drop
- `Conversion` class has `onProgress` callback that fits React state updates
- `BufferTarget` provides in-memory results suitable for creating download Blobs
- Custom hooks encapsulate async operations and provide clean component interfaces

### API Patterns

**Creating Input from Files:**
```typescript
const source = new BlobSource(file);  // browser File object
const input = new Input({
  source,
  formats: ALL_FORMATS
});
```

**Creating Output for Results:**
```typescript
const target = new BufferTarget();  // in-memory result
const output = new Output({
  target,
  format: new Mp4OutputFormat()
});
```

**Conversion with Progress:**
```typescript
const conversion = await Conversion.init({ input, output, video, audio });
conversion.onProgress = (p) => setProgress(p * 100);
await conversion.execute();
const result = output.target.buffer;
```

### React Hook Pattern

```typescript
function useMediaConversion() {
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const conversionRef = useRef<Conversion | null>(null);

  const convert = useCallback(async (file: File, options) => {
    const input = new Input({ source: new BlobSource(file) });
    const output = new Output({ target: new BufferTarget() });
    const conversion = await Conversion.init({ input, output, ...options });

    conversion.onProgress = setProgress;
    conversionRef.current = conversion;

    await conversion.execute();
    return output.target.buffer;
  }, []);

  const cancel = () => conversionRef.current?.cancel();

  return { convert, cancel, progress, converting };
}
```

### Performance Concerns
- Conversions run on **main thread** (not Web Workers)
- WebCodecs API provides **hardware acceleration** (GPU)
- Long conversions can block UI intermittently
- Mitigation: Show loading UI, use `StreamTarget` for very large files

### Alternatives Considered
- Web Worker implementation: Rejected due to complexity and mediabunny not being worker-ready
- Direct WebCodecs API: Rejected because mediabunny already provides higher-level abstractions

---

## 2. Tailwind CSS v4 + Vite Setup

### Decision
Use Tailwind CSS v4 with `@tailwindcss/vite` plugin and DaisyUI 5 for components via CSS `@plugin` directive.

### Rationale
- Tailwind v4 is CSS-first, eliminating PostCSS config overhead
- Vite plugin provides optimal DX with HMR
- DaisyUI 5 integrates directly via CSS without tailwind.config.js
- Oxide engine (Rust) delivers 3.78x faster builds
- Auto content detection eliminates manual configuration

### Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

**src/index.css:**
```css
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --color-primary: oklch(0.7 0.15 240);
  --radius-md: 8px;
}
```

### Dependencies
```json
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "daisyui": "^5.0.0"
  }
}
```

### Key Differences from v3
- No `tailwind.config.js` - use CSS `@theme` directive
- Single `@import` replaces `@tailwind` directives
- Utility changes: `shadow-sm` → `shadow-xs`, `!flex` → `flex!`
- Modern CSS required: Safari 16.4+, Chrome 111+, Firefox 128+

### Alternatives Considered
- Tailwind v3: Rejected because v4 offers better performance and simpler config
- Plain CSS: Rejected due to development speed and maintainability concerns
- Other UI libraries (MUI, Chakra): Rejected in favor of utility-first approach with DaisyUI

---

## 3. WebCodecs API Browser Support Detection

### Decision
Implement feature detection with graceful degradation and clear error messages for unsupported browsers.

### Rationale
- WebCodecs has 93.88% global browser coverage but requires modern browsers
- Feature detection prevents runtime errors in unsupported environments
- Secure context (HTTPS) is mandatory - must check first
- Clear messaging helps users understand requirements

### Detection Code

```typescript
function isWebCodecsSupported(): boolean {
  return (
    'VideoEncoder' in window &&
    'VideoDecoder' in window &&
    'AudioEncoder' in window &&
    'AudioDecoder' in window &&
    self.isSecureContext  // HTTPS required
  );
}

async function detectCodecCapabilities() {
  if (!isWebCodecsSupported()) {
    return { supported: false };
  }

  const videoConfig = { codec: 'vp8', width: 640, height: 480 };
  const audioConfig = { codec: 'opus' };

  const [video, audio] = await Promise.all([
    VideoEncoder.isConfigSupported(videoConfig),
    AudioEncoder.isConfigSupported(audioConfig),
  ]);

  return { supported: true, video: video.supported, audio: audio.supported };
}
```

### Browser Support Matrix

| Browser | Status | Min Version | Coverage |
|---------|--------|-------------|----------|
| Chrome  | Full   | v94+        | Primary  |
| Edge    | Full   | v94+        | Primary  |
| Firefox | Full   | v130+       | Recent   |
| Safari  | Partial| v18.4+      | iOS limited |
| Safari  | Full   | v26+        | macOS    |

**Global Coverage**: ~94% of users

### Error Messages

```typescript
if (!self.isSecureContext) {
  showError('HTTPS Required',
    'This app requires a secure connection (HTTPS).');
}

if (!isWebCodecsSupported()) {
  showError('Browser Not Supported',
    'Please upgrade to Chrome 94+, Edge 94+, Firefox 130+, or Safari 26+.');
}
```

### Alternatives Considered
- Polyfills: None available for WebCodecs (hardware-dependent)
- Canvas fallback: Too slow for real-time media conversion
- Server-side processing: Contradicts privacy-first requirement

---

## 4. Large File Handling (1-2GB)

### Decision
Implement tiered approach: in-memory for small files (<100MB), streaming for medium files (100MB-500MB), streaming with warnings for large files (>500MB), and strict streaming with memory monitoring for very large files (1GB+).

### Rationale
- Browser memory limits: 4GB per tab on desktop, 645MB-2GB on mobile
- 1 second of full HD video (25fps) = 200MB decoded in memory
- Peak memory during processing can spike 3-5x file size
- Streaming reduces memory footprint and keeps UI responsive

### Memory Thresholds

| File Size | Approach | User Warning |
|-----------|----------|--------------|
| <100MB    | In-memory | None |
| 100-500MB | Streaming recommended | "Close other tabs for best performance" |
| 500MB-1GB | Streaming required | "Large file - monitor memory usage" |
| 1GB+      | Streaming + monitoring | "Very large file - conversion may fail on low-memory devices" |

### Streaming Pattern

```typescript
// Use mediabunny's streaming capabilities
const source = new StreamSource(fileStream);  // not BlobSource
const target = new StreamTarget(writableStream);  // not BufferTarget

// For large files
if (file.size > 100 * 1024 * 1024) {  // >100MB
  useStreamingApproach();
  warnUserAboutMemory();
}
```

### Memory Management Best Practices

1. **Explicit cleanup**: Call `frame.close()` on VideoFrame/AudioData immediately after use
2. **Backpressure handling**: Monitor encoder/decoder queue sizes
   ```typescript
   if (encoder.encodeQueueSize > 2) {
     frame.close();  // Drop frame
   } else {
     encoder.encode(frame);
   }
   ```
3. **Codec cleanup**: Always call `codec.close()` when done
4. **Chunk size**: Use 1-10MB chunks for reading

### Error Handling

```typescript
catch (e) {
  if (e.name === 'QuotaExceededError') {
    showError('Out of memory. Try a smaller file or close other tabs.');
    cleanupCodecs();
  }
}
```

### Alternatives Considered
- Web Workers: Could help with GC but adds complexity; deferred to future optimization
- Wasm codec: Slower than native WebCodecs; rejected
- File size limits: Too restrictive; better to handle gracefully

---

## 5. Web Workers for Conversion

### Decision
Do NOT use Web Workers for initial implementation. Run conversions on main thread with UI feedback.

### Rationale
- mediabunny doesn't currently support Web Worker context
- WebCodecs API uses hardware acceleration, reducing main thread load
- Added complexity not justified for MVP
- Can be added later if profiling shows significant UI blocking

### Mitigation for Main Thread
- Show prominent loading UI during conversion
- Disable interactions during conversion
- Use `requestAnimationFrame` for smooth progress updates
- Implement cancellation to give users control

### Future Consideration
If profiling shows >100ms jank during conversions:
1. Investigate mediabunny Web Worker compatibility
2. Use Comlink for easy Worker communication
3. Transfer ArrayBuffers with zero-copy

### Alternatives Considered
- Immediate Web Worker implementation: Rejected due to complexity vs. benefit
- Service Worker: Wrong use case (not for compute)

---

## 6. Batch Download as ZIP

### Decision
Use JSZip library for client-side ZIP creation when users download multiple converted files.

### Rationale
- JSZip is mature, well-maintained, and widely used
- Works entirely client-side (no server needed)
- Supports streaming for memory efficiency
- Simple API integrates well with React

### Implementation Pattern

```typescript
import JSZip from 'jszip';

async function downloadBatch(files: ConvertedFile[]) {
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.name, file.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  downloadLink(url, 'converted-files.zip');
  URL.revokeObjectURL(url);
}
```

### Dependencies
```json
{
  "dependencies": {
    "jszip": "^3.10.1"
  }
}
```

### User Experience
- Individual download buttons for each file
- "Download All as ZIP" button when 2+ files converted
- Progress indicator during ZIP creation
- Clear file size estimate before download

### Alternatives Considered
- fflate: Lighter weight but less feature-complete
- Manual ZIP implementation: Too complex and error-prone
- Multiple individual downloads: Poor UX, browser may block

---

## 7. Progress Tracking with React

### Decision
Wire mediabunny's `onProgress` callback directly to React state using `useState` setter.

### Rationale
- mediabunny provides `onProgress` callback that returns 0-1 progress value
- React state updates trigger re-renders automatically
- Simple pattern, no additional libraries needed
- Smooth updates with requestAnimationFrame if needed

### Implementation Pattern

```typescript
function ConversionComponent() {
  const [progress, setProgress] = useState(0);

  const startConversion = async () => {
    const conversion = await Conversion.init({ input, output });

    // Wire progress directly to state
    conversion.onProgress = (p) => setProgress(p * 100);

    await conversion.execute();
  };

  return <ProgressBar value={progress} />;
}
```

### Smooth Updates (if needed)

```typescript
// For smoother visual updates
let currentProgress = 0;
let displayProgress = 0;

conversion.onProgress = (p) => {
  currentProgress = p;
};

function animateProgress() {
  displayProgress += (currentProgress - displayProgress) * 0.1;
  setProgress(displayProgress * 100);

  if (converting) {
    requestAnimationFrame(animateProgress);
  }
}
```

### Progress States

1. **Idle**: 0% - waiting to start
2. **Initializing**: 0% - loading file, analyzing
3. **Converting**: 1-99% - active conversion
4. **Finalizing**: 100% - writing output, cleanup
5. **Complete**: Done - show download button

### Alternatives Considered
- RxJS observables: Overkill for simple progress tracking
- Polling-based: Rejected because mediabunny provides callbacks
- Global state (Redux/Zustand): Not needed for component-local progress

---

## 8. Additional Decisions

### TypeScript Configuration
- Strict mode enabled
- Target ES2020 for modern features
- Module resolution: bundler (for Vite)

### File Validation
- MIME type checking before processing
- File extension validation
- Maximum file size soft limits with warnings

### Error Boundaries
- React error boundaries for component failures
- Try-catch around async operations
- User-friendly error messages mapped from technical errors

### Testing Strategy
- Unit tests: Services and utilities (Vitest)
- Component tests: React Testing Library
- E2E tests: Playwright for full user flows
- Test files alongside media samples in test fixtures

---

## Summary of Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| mediabunny | Current | Media conversion library |
| React      | 18+     | UI framework |
| TypeScript | 5+      | Type safety |
| Vite       | 5+      | Build tool |
| Tailwind CSS | 4.0   | Styling |
| DaisyUI    | 5+      | UI components |
| JSZip      | 3.10+   | Batch downloads |
| Vitest     | 1+      | Unit testing |
| Playwright | 1.40+   | E2E testing |

**Total Bundle Size Estimate**: ~150-200KB (gzipped) excluding mediabunny
