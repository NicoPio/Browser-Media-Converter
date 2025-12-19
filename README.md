# MediaBunny Applications

Browser-based media conversion tools powered by [mediabunny](https://www.npmjs.com/package/mediabunny).

## Applications

### Browser Media Converter

A web application for converting media files directly in your browser using the WebCodecs API.

**Location:** `app/browser-media-converter/`

**Features:**
- Convert between MP4, MOV, WebM, MKV, WAV, MP3, Ogg, ADTS, FLAC formats
- Browser-based processing (no server uploads)
- Hardware-accelerated encoding/decoding
- Real-time conversion progress
- Quality presets for different use cases
- Batch conversion support

**Quick Start:**

```bash
cd app/browser-media-converter
npm install
npm run dev
```

Visit http://localhost:5173

**Documentation:** See [app/browser-media-converter/README.md](app/browser-media-converter/README.md)

## Development

### Technology Stack
- React 18 + TypeScript 5.9.3
- Vite 6.3.5
- Tailwind CSS v4 + DaisyUI 5
- [mediabunny](https://www.npmjs.com/package/mediabunny) ^1.27.0
- [@mediabunny/mp3-encoder](https://www.npmjs.com/package/@mediabunny/mp3-encoder) ^1.27.0

### Project Structure

```
mediabunny/
├── app/
│   └── browser-media-converter/    # Main application
├── specs/                           # Feature specifications
└── .specify/                        # Speckit configuration
```

### About mediabunny

This project uses the [mediabunny](https://www.npmjs.com/package/mediabunny) npm package, a pure TypeScript media toolkit for reading, writing, and converting media files directly in the browser.

**Links:**
- NPM Package: https://www.npmjs.com/package/mediabunny
- Documentation: https://mediabunny.dev/
- Source Code: https://github.com/Vanilagy/mediabunny

## License

MIT
