# Browser Media Converter

[![CI](https://github.com/NicoPio/Browser-Media-Converter/actions/workflows/ci.yml/badge.svg)](https://github.com/NicoPio/Browser-Media-Converter/actions/workflows/ci.yml)
[![Deploy](https://github.com/NicoPio/Browser-Media-Converter/actions/workflows/deploy.yml/badge.svg)](https://github.com/NicoPio/Browser-Media-Converter/actions/workflows/deploy.yml)

A privacy-focused, client-side media conversion tool powered by [mediabunny](https://github.com/Vanilagy/mediabunny). Convert video and audio files entirely in your browser without uploading anything to a server.

## Features

### Core Functionality

- **Single File Conversion** (MVP)
  - Convert individual video or audio files between formats
  - Real-time progress tracking
  - Instant preview of file metadata
  - Downloadable results with no server upload

- **Batch Processing**
  - Convert multiple files at once
  - Queue management with per-file progress
  - Download all as ZIP or individually
  - Continue on failure (robust error handling)

- **Format Support**
  - **Video Formats**: MP4, MOV, WebM, MKV
  - **Audio Formats**: WAV, MP3, Ogg, AAC (ADTS), FLAC
  - Smart format compatibility detection
  - Automatic codec selection

- **Quality Control**
  - Preset quality levels (High, Balanced, Small)
  - Custom settings for advanced users:
    - Video: resolution, bitrate, frame rate
    - Audio: sample rate, bitrate, channels
  - Real-time output size estimation
  - Automatic validation with warnings for extreme settings

- **Metadata Preview**
  - Format, codec, duration
  - Resolution, frame rate, bitrate
  - File size and compression ratio
  - Audio properties (sample rate, channels)

### Privacy & Performance

- **100% Client-Side Processing**
  - Files never leave your browser
  - No server uploads or storage
  - All processing happens locally

- **Hardware Acceleration**
  - Powered by WebCodecs API
  - GPU-accelerated encoding/decoding
  - Efficient memory management

- **Modern Architecture**
  - React 18 with TypeScript
  - Tailwind CSS v4 + DaisyUI 5
  - Vite 5 for fast builds
  - Zero runtime dependencies except mediabunny

## Browser Compatibility

| Browser | Status | Min Version | Notes |
|---------|--------|-------------|-------|
| Chrome  | ✅ Full | 94+ | Recommended |
| Edge    | ✅ Full | 94+ | Chromium-based |
| Firefox | ✅ Full | 130+ | Recent versions |
| Safari  | ⚠️ Limited | 16.4+ | iOS limited support |
| Safari  | ✅ Full | 26+ | macOS full support |

**Requirements:**
- WebCodecs API support (for hardware acceleration)
- HTTPS connection (secure context required)
- Modern JavaScript (ES2020+)

**Global Coverage:** ~94% of web users

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Type checking
npm run check

# Linting
npm run lint

# Run tests (if configured)
npm test
```

### Project Structure

```
browser-media-converter/
├── src/
│   ├── components/          # React components
│   │   ├── FileDropZone.tsx
│   │   ├── FormatSelector.tsx
│   │   ├── QualitySettings.tsx
│   │   ├── ConversionQueue.tsx
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── conversionService.ts
│   │   ├── metadataService.ts
│   │   ├── fileService.ts
│   │   └── downloadService.ts
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── types/               # TypeScript types
│   ├── constants/           # Constants and presets
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Usage Guide

### Basic Conversion (Single File)

1. **Select File**: Drag and drop a video/audio file or click to browse
2. **Choose Format**: Select your desired output format from the dropdown
3. **Adjust Quality** (optional): Choose from presets or use custom settings
4. **Convert**: Click the "Convert" button and wait for processing
5. **Download**: Save the converted file to your device

### Batch Conversion

1. **Select Multiple Files**: Drag and drop or select multiple files
2. **Choose Format**: Select one output format for all files
3. **Adjust Quality** (optional): Settings apply to all files
4. **Convert All**: Click "Convert All" to process the queue
5. **Download**: Download individually or as a ZIP file

### Quality Settings

**Presets:**
- **High Quality**: 8 Mbps video, 256 kbps audio (larger files, best quality)
- **Balanced**: 2.5 Mbps video, 128 kbps audio (recommended for most use cases)
- **Small File Size**: 1 Mbps video, 96 kbps audio (smaller files, lower quality)
- **Custom**: Manually configure video and audio parameters

**Custom Settings:**
- Video: Width, Height, Bitrate, Frame Rate
- Audio: Sample Rate, Bitrate, Channels (Mono/Stereo)
- Leave fields blank to preserve source settings

## Technical Details

### Architecture

The application uses a modular architecture:

- **Services**: Handle business logic (conversion, validation, metadata extraction)
- **Hooks**: Encapsulate stateful logic (conversion queue, file validation)
- **Components**: Pure UI components with minimal logic
- **Contexts**: Global state management (conversion queue)

### Data Flow

```
User drops file
    ↓
Validate & create MediaFile
    ↓
Extract metadata (async)
    ↓
User selects format & quality
    ↓
Create ConversionJob
    ↓
Add to Queue (or convert immediately)
    ↓
mediabunny processes with WebCodecs
    ↓
Generate downloadable Blob
    ↓
User downloads result
```

### Memory Management

**File Size Guidelines:**
- **< 100MB**: Processed in-memory (fast)
- **100-500MB**: Streaming recommended
- **500MB-1GB**: Streaming required (may show warnings)
- **> 1GB**: May fail on low-memory devices

**Best Practices:**
- Close other browser tabs during large conversions
- Process large files individually, not in batches
- Use lower quality settings for very large files

### Known Limitations

1. **Browser Memory Limits**
   - Desktop: ~4GB per tab
   - Mobile: 645MB-2GB (device-dependent)
   - Very large files (>1GB) may fail on some devices

2. **Processing Speed**
   - Runs on main thread (may cause UI to feel less responsive)
   - Hardware acceleration helps but is CPU/GPU-dependent
   - Large files or high-quality settings take longer

3. **Format/Codec Support**
   - Limited to what WebCodecs API supports
   - Some advanced codecs (e.g., AV1) may not be available on all browsers
   - Format compatibility varies by browser

4. **No Resume Capability**
   - Conversions can't be resumed after page refresh
   - All state is lost on navigation

5. **HTTPS Required**
   - Must be served over secure connection
   - WebCodecs API requires secure context

## Performance Tips

1. **For Best Performance:**
   - Use Chrome or Edge (best WebCodecs support)
   - Close unnecessary tabs
   - Use "Balanced" quality preset
   - Convert files individually if > 500MB

2. **For Smallest Files:**
   - Use "Small File Size" preset
   - Select MP4 or WebM containers
   - Lower the resolution if acceptable

3. **For Best Quality:**
   - Use "High Quality" preset
   - Keep original resolution
   - Use lossless formats (FLAC for audio, higher bitrates for video)

## Troubleshooting

### "Browser Not Supported" Error
- Update to a modern browser (Chrome 94+, Firefox 130+, Safari 16.4+)
- Ensure you're using HTTPS (not HTTP)

### "Out of Memory" Error
- Close other tabs and applications
- Try a smaller file or lower quality settings
- Use streaming mode (automatic for large files)

### Conversion Fails or Hangs
- Check file isn't corrupted
- Try a different output format
- Refresh the page and try again
- Use lower quality settings

### Slow Conversion
- This is normal for large files
- Hardware acceleration depends on your device
- Try using a different browser
- Lower quality settings process faster

### Download Doesn't Work
- Check browser's download settings
- Ensure popup blocker isn't interfering
- Try downloading individual files instead of ZIP

## Contributing

This is part of the mediabunny project. For bugs or feature requests, please open an issue on the main mediabunny repository.

## License

This project uses mediabunny which is licensed under the Mozilla Public License 2.0 (MPL-2.0).

## Credits

- **mediabunny**: Core media processing library by [@Vanilagy](https://github.com/Vanilagy)
- **WebCodecs API**: Browser standard for media encoding/decoding
- **React**: UI framework
- **Tailwind CSS + DaisyUI**: Styling and components
- **Vite**: Build tool

## Support

For issues related to:
- **This application**: Open issue on mediabunny repo
- **mediabunny library**: See main mediabunny documentation
- **WebCodecs API**: See [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)

---

**Made with ❤️ using mediabunny**
