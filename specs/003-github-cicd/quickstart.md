# GitHub CI/CD Quickstart Guide

This guide explains how to use and modify the GitHub Actions workflows for automated testing and documentation deployment in the mediabunny repository.

---

## Table of Contents

1. [Overview](#overview)
2. [CI Workflow (Testing)](#ci-workflow-testing)
3. [Deploy Workflow (Documentation)](#deploy-workflow-documentation)
4. [Interpreting CI Results](#interpreting-ci-results)
5. [Manual Deployment](#manual-deployment)
6. [Modifying Workflows](#modifying-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## Overview

The repository uses two GitHub Actions workflows:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Pull requests, pushes to main | Run tests, linting, type checking |
| **Deploy** | `.github/workflows/deploy.yml` | Pushes to main | Build and deploy docs to GitHub Pages |

**Key Benefits**:
- Automated testing catches issues before merge
- Documentation stays in sync with code
- Tests run across multiple Node.js versions
- Fast feedback (~5 minutes for CI, ~5 minutes for deployment)

---

## CI Workflow (Testing)

### What It Does

The CI workflow runs on every pull request and validates code quality through:

1. **Tests** (Node.js 18 and 20)
   - Unit tests (`test/node/`)
   - Browser tests (`test/browser/`)
   - Runs in parallel across both Node versions

2. **Linting** (ESLint)
   - Checks code style and quality
   - Ensures consistent formatting

3. **Type Checking** (TypeScript)
   - Validates all TypeScript types
   - Ensures no type errors

4. **Build Validation**
   - Runs full production build
   - Validates bundles and declarations are generated

### How It Works

```yaml
# Simplified workflow structure
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:           # Runs on Node 18 and 20 in parallel
  lint:           # Runs in parallel with tests
  typecheck:      # Runs in parallel with tests
  build:          # Runs in parallel with tests
```

All jobs run in parallel for fastest feedback.

### Viewing Results

**On Pull Request Page**:
1. Scroll to "Checks" section at bottom of PR
2. See status for each job:
   - ✅ Green checkmark = passed
   - ❌ Red X = failed
   - 🟡 Yellow circle = running
3. Click "Details" to view logs

**In GitHub Actions Tab**:
1. Navigate to repository → Actions tab
2. Click workflow run to see all jobs
3. Click individual job to see step-by-step logs

---

## Deploy Workflow (Documentation)

### What It Does

The deploy workflow automatically publishes documentation and examples to GitHub Pages when changes are merged to main:

1. **Build Documentation**
   - Runs `npm run docs:build`
   - Generates static site from VitePress
   - Outputs to `docs/.vitepress/dist/`

2. **Deploy to GitHub Pages**
   - Uploads build artifact
   - Publishes to GitHub Pages
   - Site available at `https://<username>.github.io/mediabunny/`

### How It Works

```yaml
# Simplified workflow structure
on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  build:    # Build docs first
  deploy:   # Then deploy (waits for build)
```

Build and deploy run sequentially (deploy waits for build to finish).

### Deployment Timeline

1. **Commit merged to main** → Workflow triggers
2. **Build job runs** (~3 minutes)
3. **Deploy job runs** (~2 minutes)
4. **Site updates** (~1-2 minutes for GitHub Pages propagation)

**Total time**: ~5-7 minutes from merge to visible changes

---

## Interpreting CI Results

### All Checks Passed ✅

```
✅ test (18)     All tests passed on Node.js 18
✅ test (20)     All tests passed on Node.js 20
✅ lint          No linting errors
✅ typecheck     No type errors
✅ build         Build succeeded
```

**Action**: Your PR is ready to merge!

### One or More Checks Failed ❌

**Example**:
```
✅ test (18)     Passed
❌ test (20)     3 tests failed
✅ lint          Passed
✅ typecheck     Passed
```

**Action**:
1. Click "Details" next to failed check
2. Review error messages in logs
3. Fix issues locally
4. Push new commits
5. CI automatically re-runs

### Common Failure Scenarios

| Failure | Likely Cause | How to Fix |
|---------|--------------|------------|
| **Tests fail on Node 20 but pass on 18** | Node version incompatibility | Check for version-specific APIs or dependencies |
| **Lint errors** | Code style violations | Run `npm run lint` locally, fix issues |
| **Type errors** | TypeScript type mismatches | Run `npm run check` locally, fix types |
| **Build fails** | Compilation errors | Run `npm run build` locally, check for errors |
| **All jobs fail immediately** | npm install error | Check `package-lock.json` or dependencies |

---

## Manual Deployment

You can manually trigger documentation deployment without pushing new commits:

### Steps

1. Navigate to repository → **Actions** tab
2. Click **Deploy Documentation** workflow (left sidebar)
3. Click **Run workflow** button (top right)
4. Select branch: **main**
5. Click **Run workflow** (green button)

### When to Use Manual Deployment

- Re-deploy after GitHub Pages configuration changes
- Deploy after fixing a broken deployment
- Test deployment without committing changes to main

---

## Modifying Workflows

### Adding a New Test Step

To add a new test command to CI:

1. **Edit** `.github/workflows/ci.yml`
2. **Add new step** to the `test` job:

```yaml
jobs:
  test:
    steps:
      # ... existing steps ...
      - name: Run integration tests
        run: npm run test:integration
```

3. **Commit and push** to see changes in action

### Updating Node.js Versions

To change which Node.js versions are tested:

1. **Edit** `.github/workflows/ci.yml`
2. **Update matrix**:

```yaml
strategy:
  matrix:
    node-version: [20, 22]  # Changed from [18, 20]
```

3. **Update deployment** to use newer version (`.github/workflows/deploy.yml`):

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'  # Changed from '20'
```

### Modifying Caching Behavior

Current caching uses `actions/setup-node` with built-in npm cache:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # Caches ~/.npm directory
```

**To disable caching** (not recommended):
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    # Remove 'cache: npm' line
```

**To clear cache**:
1. Navigate to repository → Actions → Caches
2. Delete relevant cache entries

### Adding PR Comments

To make CI post test results as PR comments:

1. **Add PR write permission** to `.github/workflows/ci.yml`:

```yaml
permissions:
  contents: read
  pull-requests: write  # Add this
```

2. **Add comment step** after tests:

```yaml
- name: Comment test results
  uses: actions/github-script@v7
  if: always()
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Test results: ...'
      })
```

---

## Troubleshooting

### CI Times Out

**Symptoms**: Jobs fail after 6 hours (GitHub Actions limit)

**Solutions**:
- Increase `testTimeout` in `vitest.config.ts` if browser tests timeout
- Check for infinite loops or hanging tests
- Consider splitting large test suites across multiple jobs

### Browser Tests Fail in CI But Pass Locally

**Symptoms**: Browser tests work on your machine but fail on GitHub Actions

**Solutions**:
1. **Check Chrome flags** in `vitest.config.ts`:
   ```typescript
   'goog:chromeOptions': {
     args: ['headless', 'no-sandbox', 'disable-gpu']
   }
   ```

2. **Increase timeout** for slower CI runners:
   ```typescript
   test: {
     testTimeout: 30000  // 30 seconds
   }
   ```

3. **Check logs** for specific error messages

### npm install Fails

**Symptoms**: CI fails at dependency installation step

**Solutions**:
- Verify `package-lock.json` is committed and up-to-date
- Check for npm registry connectivity issues (temporary)
- Ensure dependencies are compatible with Node versions in matrix

### GitHub Pages Deployment Fails

**Symptoms**: Deploy job fails or site doesn't update

**Solutions**:
1. **Check repository settings**:
   - Settings → Pages → Source = "GitHub Actions"

2. **Verify permissions** in `.github/workflows/deploy.yml`:
   ```yaml
   permissions:
     pages: write
     id-token: write
   ```

3. **Check build output**:
   - Ensure `docs/.vitepress/dist/` exists after build
   - Verify `.nojekyll` file is created

4. **Check base path** in `docs/.vitepress/config.ts`:
   ```typescript
   export default {
     base: '/mediabunny/'  // Must match repo name
   }
   ```

### Cache Not Speeding Up CI

**Symptoms**: CI runs still slow despite caching

**Solutions**:
- Verify cache is enabled: `cache: 'npm'` in `setup-node` step
- Check cache hit rate in workflow logs (look for "Cache restored successfully")
- Consider cache might be invalidated frequently (check `package-lock.json` change frequency)
- Clear old caches: Actions → Caches → Delete unused caches

---

## Advanced Configuration

### Conditional Job Execution

Run jobs only for specific file changes:

```yaml
jobs:
  lint:
    if: contains(github.event.head_commit.modified, 'src/')
    # Only run if src/ files changed
```

### Workflow Dependencies

Make deploy wait for CI to pass:

```yaml
# In deploy.yml
jobs:
  build:
    needs: ci  # Wait for CI workflow to complete
```

*Note*: Cross-workflow dependencies require `workflow_run` event.

### Matrix Expansion

Test across multiple operating systems:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node-version: [18, 20]
runs-on: ${{ matrix.os }}
```

This creates 6 parallel jobs (3 OS × 2 Node versions).

### Custom Timeouts

Set job-level timeouts:

```yaml
jobs:
  test:
    timeout-minutes: 30  # Fail if job runs longer than 30 minutes
```

### Secrets and Environment Variables

For workflows needing secrets:

```yaml
steps:
  - name: Use secret
    env:
      MY_SECRET: ${{ secrets.MY_SECRET }}
    run: echo "Secret is hidden in logs"
```

Add secrets in: Settings → Secrets and variables → Actions → New repository secret

---

## Best Practices

1. **Keep workflows simple**: Avoid complex bash scripts in YAML; use npm scripts instead
2. **Pin action versions**: Use `@v4` not `@latest` for stability
3. **Test locally first**: Run `npm test`, `npm run lint`, `npm run build` before pushing
4. **Monitor CI time**: If workflows slow down, investigate caching and parallelization
5. **Use branch protection**: Require CI to pass before merging (Settings → Branches)
6. **Document custom steps**: Add comments in YAML for non-obvious configurations

---

## Getting Help

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vitest Docs**: https://vitest.dev/guide/browser
- **VitePress Docs**: https://vitepress.dev/guide/deploy#github-pages
- **Repository Issues**: File an issue for CI problems specific to this project

---

## Summary

| Task | Location | Action |
|------|----------|--------|
| View CI results | PR page → Checks section | Click "Details" for logs |
| Trigger manual deploy | Actions tab → Deploy Documentation | Click "Run workflow" |
| Update Node versions | `.github/workflows/ci.yml` | Edit matrix.node-version |
| Add test step | `.github/workflows/ci.yml` | Add step to test job |
| Fix failing tests | Local machine | Run npm test, fix, push |
| Check deployment URL | Actions → Deploy → deploy job | See `page_url` output |

This guide covers the most common use cases. For advanced scenarios, refer to the workflow contract files in `specs/003-github-cicd/contracts/`.
