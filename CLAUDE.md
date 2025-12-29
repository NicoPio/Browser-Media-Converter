# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mediabunny is a pure TypeScript media toolkit for reading, writing, and converting media files directly in the browser. It's built from scratch with zero dependencies and supports MP4, MOV, WebM, MKV, WAVE, MP3, Ogg, ADTS, and FLAC formats. The library uses the WebCodecs API for hardware-accelerated encoding/decoding and is designed to be highly tree-shakable.

## Architecture

### Core Abstractions

The library is organized around several key abstractions that work together in a pipeline:

- **Input/Output**: `Input` and `Output` classes are the main entry points for reading and writing media files
- **Sources/Targets**: Abstract data I/O
  - Sources (`BlobSource`, `BufferSource`, `FilePathSource`, `StreamSource`, etc.) provide data for reading
  - Targets (`BufferTarget`, `FilePathTarget`, `StreamTarget`, `NullTarget`) receive written data
- **Demuxers/Muxers**: Container format handlers
  - Each format has a demuxer (reads) and muxer (writes) in its own directory (e.g., `src/isobmff/`, `src/matroska/`, `src/ogg/`)
  - All demuxers extend `Demuxer` abstract class, all muxers extend `Muxer`
- **MediaSource/MediaSink**: Connect inputs/outputs with encoding/decoding
  - Sources (`CanvasSource`, `AudioBufferSource`, `MediaStreamVideoTrackSource`, etc.) provide media to encode
  - Sinks (`CanvasSink`, `AudioBufferSink`, `VideoSampleSink`, etc.) receive decoded media
- **Tracks**: Represent individual video/audio/subtitle streams
  - `InputTrack` (and `InputVideoTrack`, `InputAudioTrack`) for reading
  - `OutputTrack` (and `OutputVideoTrack`, `OutputAudioTrack`) for writing
- **Samples/Packets**: Raw data containers
  - `VideoSample` and `AudioSample` are wrappers around WebCodecs `VideoFrame` and `AudioData`
  - `EncodedPacket` represents encoded data chunks
- **Conversion**: High-level API (`Conversion` class) that connects Input → Output with automatic codec handling

### Format Support

Each container format is implemented in its own directory:
- `src/isobmff/` - ISO Base Media File Format (MP4, MOV, fragmented MP4)
- `src/matroska/` - Matroska/WebM
- `src/wave/` - WAVE
- `src/mp3/` - MP3
- `src/ogg/` - Ogg
- `src/adts/` - ADTS (AAC)
- `src/flac/` - FLAC

Each format directory typically contains:
- `*-demuxer.ts` - Reads the format
- `*-muxer.ts` - Writes the format
- `*-reader.ts` - Low-level reading utilities
- `*-misc.ts` - Format-specific utilities and constants
- `*-boxes.ts` or similar - Format-specific structure definitions

### Codec Handling

Codec support is centralized in:
- `src/codec.ts` - Codec definitions and constants
- `src/codec-data.ts` - Codec configuration data structures
- `src/encode.ts` - Encoding utilities and quality presets
- `src/custom-coder.ts` - Custom encoder/decoder registration

## Development Commands

### Building
```bash
npm run build              # Full production build (types, bundles, checks)
npm run watch              # Build bundles in watch mode
```

### Testing
```bash
npm test                   # Run all tests (Node + browser)
npm run test-node          # Run Node.js tests only
npm run test-browser       # Run browser tests only
```

Tests are in `test/` directory with separate `node/` and `browser/` subdirectories. Browser tests use Vitest with WebDriverIO and require Chrome.

### Type Checking & Linting
```bash
npm run check              # Type check all TypeScript files
npm run lint               # Run ESLint
```

### Documentation
```bash
npm run docs:dev           # Start docs dev server
npm run docs:build         # Build docs and examples
npm run docs:generate      # Generate API docs from TSDoc comments
npm run dev                # Start examples dev server (http://localhost:5173/examples/[name]/)
```

Examples are in the `examples/` directory and include file-compression, live-recording, media-player, metadata-extraction, procedural-generation, and thumbnail-generation.

## Build System

The build process (`build.sh`) does the following in order:
1. Ensures license headers on all source files
2. Type checks and generates `.js` and `.d.ts` files with `tsc`
3. Fixes ESM import paths (adds `.js` extensions)
4. Creates bundles using esbuild
5. Rolls up declaration files using API Extractor
6. Checks that all exported symbols have TSDoc documentation
7. Validates API docs can be generated
8. Appends namespace declarations to `.d.ts` files

## Code Style

- **Indentation**: Tabs
- **Quotes**: Single quotes
- **Line length**: 120 characters max
- **Brace style**: 1tbs (one true brace style)
- **License headers**: All source files must have the MPL-2.0 license header (enforced by `scripts/ensure-license-headers.ts`)
- **Documentation**: All public APIs must have TSDoc comments

## Important Implementation Notes

- The library is **zero-dependency** - never add external dependencies to the main package
- The library must work in both **browser and Node.js** environments
  - Node-specific code goes in `src/node.ts`
  - Browser checks use `./src/node.ts` field in package.json to exclude Node code
- **Tree-shakability** is critical - the library uses ESM and is designed to bundle only what's used
- All I/O operations are **streaming-capable** to handle large files efficiently
- The library uses **WebCodecs API** for encoding/decoding - hardware acceleration is leveraged when available
- Timestamps are tracked with **microsecond precision** throughout the pipeline
- The `Reader` and `Writer` classes handle low-level buffering and seeking

## Monorepo Structure

This is a workspace with packages in `packages/`:
- `packages/mp3-encoder/` - Native MP3 encoder (built separately with its own build process)

## Key Files

- `src/index.ts` - Main entry point, exports all public APIs
- `src/conversion.ts` - High-level conversion API
- `src/misc.ts` - Shared utilities, types, and helpers
- `src/metadata.ts` - Metadata tags and attached files
- `src/id3.ts` - ID3 tag parsing/writing

## Active Technologies
- JavaScript/TypeScript (ES2020+), React 18+ + mediabunny (already installed), React 18, Tailwind CSS v4, DaisyUI 5+ (001-browser-media-converter)
- Browser localStorage for preferences and conversion history (optional), no backend database required (001-browser-media-converter)
- TypeScript 5.9.3, JavaScript ES2020+ + React 18.3.1, mediabunny ^1.26.0 (npm), @mediabunny/mp3-encoder ^1.27.0, Vite 6.3.5, Tailwind CSS v4, DaisyUI 5+ (002-migrate-npm-package)
- Browser localStorage for preferences and conversion history (no database) (002-migrate-npm-package)
- YAML (GitHub Actions workflow syntax), Node.js 18 and 20 (test matrix) + GitHub Actions runners, GitHub Pages hosting service (003-github-cicd)
- N/A (stateless CI/CD pipelines, artifacts stored by GitHub) (003-github-cicd)

## Recent Changes
- 001-browser-media-converter: Added JavaScript/TypeScript (ES2020+), React 18+ + mediabunny (already installed), React 18, Tailwind CSS v4, DaisyUI 5+
