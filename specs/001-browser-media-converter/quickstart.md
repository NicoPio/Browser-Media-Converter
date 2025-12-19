# Quick Start Guide: Browser Media Converter

**Date**: 2025-12-17
**Branch**: `001-browser-media-converter`
**Phase**: 1 - Design

This guide provides instructions for setting up, running, and testing the browser media converter application locally.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18+ (or v20+ recommended)
- **npm**: v9+ (comes with Node.js)
- **Modern browser**: Chrome 94+, Edge 94+, or Firefox 130+ (for WebCodecs API)
- **HTTPS**: Development server with HTTPS (required for WebCodecs - Vite provides this)
- **Git**: For cloning the repository

**Check versions:**
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

---

## Initial Setup

### 1. Clone Repository (if not already done)

```bash
git clone <repository-url>
cd mediabunny
```

### 2. Install Dependencies

```bash
# Install root dependencies (mediabunny library)
npm install

# Navigate to the converter app
cd app/browser-media-converter

# Install converter app dependencies
npm install
```

### 3. Verify mediabunny Build

The converter app depends on the mediabunny library being built:

```bash
# From repository root
npm run build

# This creates dist/ with mediabunny library files
```

---

## Project Structure

```
app/browser-media-converter/
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── index.html             # Main HTML entry
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # Business logic
│   ├── types/             # Type definitions
│   ├── constants/         # App constants
│   └── utils/             # Utility functions
└── tests/                 # Test files
```

---

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
cd app/browser-media-converter
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   https://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Access the app:**
- Open browser to `https://localhost:5173/`
- Accept the self-signed certificate warning (required for WebCodecs in development)

### Build for Production

Create optimized production build:

```bash
npm run build
```

This creates `dist/` directory with static assets ready for deployment.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

Serves the production build at `https://localhost:4173/`

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Keep this running in a terminal - it will auto-reload on file changes.

### 2. Make Code Changes

Edit files in `src/` directory. Changes will hot-reload instantly in the browser.

### 3. Check Types

Run TypeScript type checking:

```bash
npm run type-check
```

### 4. Lint Code

Run ESLint to check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint:fix
```

---

## Testing

### Run All Tests

```bash
npm test
```

This runs unit tests, component tests, and E2E tests.

### Unit Tests (Services & Utils)

```bash
npm run test:unit
```

Uses Vitest to test business logic without UI.

**Watch mode** (re-runs on file changes):
```bash
npm run test:unit:watch
```

### Component Tests (React Components)

```bash
npm run test:component
```

Uses React Testing Library to test component behavior.

### E2E Tests (Full User Flows)

```bash
npm run test:e2e
```

Uses Playwright to test complete user workflows in a real browser.

**Run E2E in headed mode** (see browser):
```bash
npm run test:e2e:headed
```

### Test Coverage

Generate coverage report:

```bash
npm run test:coverage
```

Opens HTML coverage report in browser.

---

## Using the Application

### Basic Workflow

1. **Launch app**: Open `https://localhost:5173/` in Chrome/Edge/Firefox
2. **Upload file**: Drag & drop a video or audio file onto the interface
3. **Select format**: Choose output format from dropdown (e.g., MP4 → WebM)
4. **Choose quality**: Select preset (High, Balanced, Small) or customize
5. **Convert**: Click "Convert" button
6. **Wait**: Watch progress bar during conversion
7. **Download**: Click "Download" when complete

### Batch Conversion

1. Drop multiple files at once
2. Select common output format
3. Click "Convert All"
4. Monitor individual file progress
5. Download files individually or as ZIP

### Testing with Sample Files

Sample media files for testing are available in:
```
test/fixtures/
├── video-samples/
│   ├── sample-h264.mp4      # H.264 video
│   ├── sample-vp9.webm      # VP9 video
│   └── sample-large.mov     # Large file (>500MB)
└── audio-samples/
    ├── sample-aac.m4a       # AAC audio
    ├── sample-opus.webm     # Opus audio
    └── sample-flac.flac     # FLAC audio
```

---

## Debugging

### Browser DevTools

1. Open DevTools: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
2. Check Console tab for errors and logs
3. Use Network tab to monitor file loading
4. Use Performance tab to profile conversions

### Common Issues

#### "WebCodecs API not supported"
- **Cause**: Browser too old or not using HTTPS
- **Fix**: Use Chrome 94+, Edge 94+, or Firefox 130+. Ensure dev server uses `https://` URL.

#### "File conversion fails immediately"
- **Cause**: Corrupted file or unsupported codec
- **Fix**: Try a different file. Check browser console for specific error.

#### "Out of memory" error
- **Cause**: File too large for browser memory
- **Fix**: Close other tabs. Try smaller file or restart browser.

#### Dev server won't start
- **Cause**: Port 5173 already in use
- **Fix**: Kill process using port or change port in `vite.config.ts`

### Enable Verbose Logging

Set environment variable for detailed logs:

```bash
DEBUG=mediabunny:* npm run dev
```

---

## Configuration

### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: true,  // Required for WebCodecs
    port: 5173,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'mediabunny': ['mediabunny'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### Tailwind Configuration (`tailwind.config.js`)

**Note**: Tailwind CSS v4 uses CSS-first configuration. Main config is in `src/index.css`:

```css
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --color-primary: oklch(0.7 0.15 240);
  --radius-md: 8px;
}
```

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Deployment

### Build Production Assets

```bash
npm run build
```

This creates `dist/` directory with:
- `index.html`: Entry point
- `assets/`: JS, CSS, and other static files
- All files are minified and optimized

### Deploy to Static Hosting

The app is a static SPA - deploy `dist/` to any static host:

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
# Configure base URL in vite.config.ts
# Then run:
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

**Important**: Ensure hosting serves over HTTPS (required for WebCodecs API).

---

## Environment Variables

No environment variables required for basic operation.

**Optional** (create `.env` file):
```
VITE_MAX_FILE_SIZE=2147483648  # 2GB in bytes
VITE_ENABLE_DEBUG_LOGS=false
```

Access in code:
```typescript
const maxSize = import.meta.env.VITE_MAX_FILE_SIZE;
```

---

## Performance Optimization

### For Development

- Use `npm run dev` for fast HMR
- Keep browser DevTools Performance tab open to monitor conversions
- Test with small files (<10MB) for quick iteration

### For Production

- Minification and tree-shaking enabled by default
- Code splitting configured for optimal loading
- mediabunny loaded as separate chunk (caching)

### Tips

1. **Large files**: Test with realistic file sizes (100MB+) before production
2. **Memory monitoring**: Use Chrome Task Manager (Shift+Esc) to track memory usage
3. **Browser testing**: Test in Chrome, Edge, and Firefox (different WebCodecs implementations)

---

## Troubleshooting

### Development Server Issues

**Problem**: Port already in use
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

**Problem**: HTTPS certificate error
```
Solution: Accept the self-signed certificate in browser.
Chrome: Click "Advanced" → "Proceed to localhost (unsafe)"
```

### Build Issues

**Problem**: TypeScript errors during build
```bash
# Run type check to see all errors
npm run type-check

# Fix errors before running build
npm run build
```

**Problem**: mediabunny not found
```bash
# Ensure mediabunny is built
cd ../..  # Go to repo root
npm run build
cd app/browser-media-converter
```

### Runtime Issues

**Problem**: Conversion fails silently
```
Check browser console (F12) for errors.
Enable verbose logging: DEBUG=mediabunny:* npm run dev
```

**Problem**: Memory leak / tab crashes
```
1. Close other tabs
2. Use smaller test files
3. Clear browser cache
4. Restart browser
```

---

## Additional Resources

### Documentation

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Type Contracts**: [contracts/types.ts](./contracts/types.ts)
- **Research Findings**: [research.md](./research.md)

### External Links

- [mediabunny Documentation](../../README.md)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [WebCodecs API Spec](https://w3c.github.io/webcodecs/)

### Getting Help

- Check existing issues in repository
- Review browser console for error messages
- Consult mediabunny examples for API usage patterns
- Test with sample files from `test/fixtures/`

---

## Next Steps

After setting up the development environment:

1. Read [spec.md](./spec.md) for feature requirements
2. Review [data-model.md](./data-model.md) for entity definitions
3. Check [contracts/types.ts](./contracts/types.ts) for type contracts
4. Run `/speckit.tasks` to generate implementation task breakdown
5. Begin implementation with P1 user story (Basic Single File Conversion)

**Development workflow:**
1. Write tests first (TDD approach)
2. Implement feature to pass tests
3. Run type check and linting
4. Commit changes with descriptive messages
5. Repeat for next user story

---

**Ready to start?** Run `npm run dev` and begin building! 🚀
