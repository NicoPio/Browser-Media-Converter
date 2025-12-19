# Migration Quickstart: From Local Repository to NPM Package

**Feature**: 002-migrate-npm-package
**Goal**: Migrate browser-media-converter from using local mediabunny source to npm package
**Duration**: ~30 minutes
**Risk Level**: Low (reversible via git)

---

## Prerequisites

Before starting the migration:

- ✅ Git working directory is clean (or changes are committed/stashed)
- ✅ Current application is working and tests pass
- ✅ You have npm access and can install packages from registry
- ✅ Node.js 18+ installed

---

## Step 1: Pre-Migration Verification

### 1.1 Test Current Application

```bash
cd /Volumes/ExternalMac/Dev/mediabunny/app/browser-media-converter

# Run all tests to establish baseline
npm run test:unit
npm run test:e2e

# Start dev server and manually test
npm run dev
# Visit http://localhost:5173 and test media conversion
```

**Verify:**
- All tests pass
- Application loads without errors
- Can convert at least one media file successfully

### 1.2 Document Current State

```bash
# Note current package versions
cat package.json | grep -A2 '"dependencies"'

# Note repository size (excluding node_modules)
cd /Volumes/ExternalMac/Dev/mediabunny
du -sh --exclude=node_modules .
```

### 1.3 Create Migration Branch

```bash
# Current branch should be: 002-migrate-npm-package
git status
git branch

# If not on migration branch:
# git checkout 002-migrate-npm-package
```

---

## Step 2: Update Package Dependencies

### 2.1 Update app/browser-media-converter/package.json

**File:** `app/browser-media-converter/package.json`

**Change the dependencies section:**

```json
"dependencies": {
    "@mediabunny/mp3-encoder": "^1.27.0",
    "@types/dom-mediacapture-transform": "^0.1.11",
    "@types/dom-webcodecs": "0.1.13",
    "jszip": "^3.10.1",
    "mediabunny": "^1.27.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
}
```

**Key Changes:**
1. `"mediabunny": "file:../.."` → `"mediabunny": "^1.27.0"`
2. Added `@types/dom-mediacapture-transform` and `@types/dom-webcodecs` (peer dependencies)

### 2.2 Install NPM Package

```bash
cd /Volumes/ExternalMac/Dev/mediabunny/app/browser-media-converter

# Remove node_modules and package-lock.json to ensure clean install
rm -rf node_modules package-lock.json

# Install from npm registry
npm install

# Verify mediabunny is from npm (not symlink)
ls -la node_modules/mediabunny
cat node_modules/mediabunny/package.json | grep '"version"'
```

**Expected Result:**
- `node_modules/mediabunny` is a real directory (not symlink)
- Version shows `1.27.0`
- No errors during installation

---

## Step 3: Test Application with NPM Package

### 3.1 Type Check

```bash
npm run type-check
```

**Expected:** No TypeScript errors

**If errors occur:**
- Check if TypeScript version needs upgrade (5.7+ may be required)
- Verify all type imports resolve correctly

### 3.2 Build Application

```bash
npm run build
```

**Expected:** Build completes successfully, no import errors

**Check:**
- `dist/` directory created
- Bundle size similar to before (~2-3MB)

### 3.3 Run Development Server

```bash
npm run dev
```

**Expected:** Dev server starts on http://localhost:5173

**Manual Tests:**
1. Upload a video file
2. Select output format (e.g., MP4)
3. Click Convert
4. Verify conversion completes
5. Download and play converted file

### 3.4 Run All Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Coverage (optional)
npm run test:coverage
```

**Expected:** All tests pass with same results as baseline

---

## Step 4: Clean Up Library Code

⚠️ **WARNING**: This step deletes library source code. Ensure Step 3 passed before proceeding.

### 4.1 Remove Library Source Directories

```bash
cd /Volumes/ExternalMac/Dev/mediabunny

# Remove mediabunny library source
rm -rf src/
rm -rf dist/
rm -rf packages/
rm -rf scripts/
rm -rf docs/
rm -rf examples/
rm -rf test/
rm -rf shared/
rm -rf dev/
```

### 4.2 Remove Library Configuration Files

```bash
# Build scripts and configs
rm build.sh
rm api-extractor.json
rm vite.config.ts
rm vitest.config.ts
rm tsconfig.json
rm tsconfig.vite.json
rm tsconfig.vitest.json
rm tsdoc.json
rm eslint.config.mjs
rm bun.lock
rm .editorconfig
```

### 4.3 Clean Up Root package.json

**File:** `/Volumes/ExternalMac/Dev/mediabunny/package.json`

**Option A: Minimal Changes (Keep root package.json for workspace if needed)**

Remove workspace configuration and scripts:

```json
{
  "name": "mediabunny-workspace",
  "version": "1.0.0",
  "description": "Browser-based media conversion applications",
  "private": true,
  "type": "module",
  "scripts": {},
  "license": "MIT"
}
```

**Option B: Remove Entirely (If moving app to root later)**

```bash
rm package.json package-lock.json
```

Then update `.gitignore` to exclude app-specific node_modules:

```gitignore
node_modules/
app/*/node_modules/
```

### 4.4 Update Root README.md

**File:** `/Volumes/ExternalMac/Dev/mediabunny/README.md`

Replace library documentation with application-focused README:

```markdown
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
- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4 + DaisyUI 5
- [mediabunny](https://www.npmjs.com/package/mediabunny) ^1.27.0

### Project Structure

```
mediabunny/
├── app/
│   └── browser-media-converter/    # Main application
├── specs/                           # Feature specifications
└── .specify/                        # Speckit configuration
```

## License

MIT
```

---

## Step 5: Final Verification

### 5.1 Verify Application Still Works

```bash
cd /Volumes/ExternalMac/Dev/mediabunny/app/browser-media-converter

# Clean install to verify package.json is correct
rm -rf node_modules package-lock.json
npm install

# Run all tests
npm run test:unit
npm run test:e2e

# Build
npm run build

# Dev server
npm run dev
```

### 5.2 Measure Repository Size Reduction

```bash
cd /Volumes/ExternalMac/Dev/mediabunny

# Check new size (excluding node_modules and .git)
du -sh --exclude=node_modules --exclude=.git .

# Check git status
git status
```

**Expected:**
- Repository size reduced by ~37 MB (70%+ reduction)
- Git shows deletions for library files
- App functionality unchanged

### 5.3 Run Full Test Suite One More Time

```bash
cd app/browser-media-converter
npm test
npm run test:e2e
npm run build
```

---

## Step 6: Commit Changes

### 6.1 Review Changes

```bash
git status
git diff app/browser-media-converter/package.json
```

### 6.2 Commit Migration

```bash
# Stage application changes
git add app/browser-media-converter/package.json
git add app/browser-media-converter/package-lock.json

# Stage deletions
git add -u

# Stage new README
git add README.md

# Commit
git commit -m "feat: migrate from local mediabunny to npm package

- Update mediabunny dependency from 'file:../..' to '^1.27.0'
- Add @types/dom-mediacapture-transform and @types/dom-webcodecs
- Remove library source code (src/, dist/, packages/)
- Remove build scripts and configuration files
- Update root README for application-focused repository

BREAKING CHANGE: Repository no longer contains mediabunny library source.
Use npm package instead: https://www.npmjs.com/package/mediabunny

Repository size reduced by ~37 MB (70% reduction).
All tests passing. Zero functional changes to application."
```

---

## Rollback Procedure

If issues occur during migration:

### Quick Rollback

```bash
# Discard all changes and return to previous state
git reset --hard HEAD

# Reinstall with local package
cd app/browser-media-converter
rm -rf node_modules package-lock.json
npm install
```

### Partial Rollback (Keep some changes)

```bash
# Restore specific files
git checkout HEAD -- package.json
git checkout HEAD -- app/browser-media-converter/package.json

# Reinstall
cd app/browser-media-converter
npm install
```

---

## Troubleshooting

### Issue: TypeScript errors after npm install

**Cause:** TypeScript version incompatibility

**Solution:**
```bash
cd app/browser-media-converter
npm install -D typescript@^5.7.0
npm run type-check
```

### Issue: Build fails with import errors

**Cause:** Missing type dependencies

**Solution:**
```bash
npm install --save @types/dom-mediacapture-transform @types/dom-webcodecs
```

### Issue: Tests fail with npm package

**Cause:** Potential API differences (unlikely based on research)

**Solution:**
1. Check error messages for specific API calls
2. Compare with mediabunny CHANGELOG: https://github.com/Vanilagy/mediabunny/releases
3. Adjust code if necessary (should be rare)

### Issue: Bundle size increased significantly

**Cause:** vite.config.ts code splitting not working

**Solution:**
Verify vite.config.ts still has:
```typescript
manualChunks(id) {
    if (id.includes('mediabunny')) {
        return 'mediabunny';
    }
}
```

---

## Success Criteria Checklist

After completing all steps, verify:

- ✅ **SC-001**: `npm install && npm run dev` completes in <3 minutes
- ✅ **SC-002**: Zero build or import errors
- ✅ **SC-003**: Repository size reduced by ≥70%
- ✅ **SC-004**: All media conversion features work identically
- ✅ **SC-005**: Only standard npm commands needed (no custom build scripts)

---

## Next Steps

After successful migration:

1. **Push to remote:**
   ```bash
   git push origin 002-migrate-npm-package
   ```

2. **Create pull request** with migration summary

3. **Update CI/CD** if needed (should work automatically with npm package)

4. **Update team documentation** about new repository structure

5. **Consider repository rename** from "mediabunny" to "mediabunny-apps" or "browser-media-converter"

---

## Additional Notes

- The migration is **reversible** - git history preserves all deleted files
- mediabunny library is still available at: https://github.com/Vanilagy/mediabunny
- npm package documentation: https://mediabunny.dev/
- For library development, clone the official mediabunny repository separately

---

**Migration Guide Version:** 1.0
**Last Updated:** 2025-12-19
**Tested On:** macOS with Node.js 18+
