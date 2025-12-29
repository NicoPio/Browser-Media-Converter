# Research: GitHub CI/CD and Pages Deployment

**Feature**: GitHub Actions CI/CD workflows for automated testing and documentation deployment
**Date**: 2025-12-29
**Status**: Complete

This document consolidates research findings for all technical decisions required to implement CI/CD pipelines using GitHub Actions.

---

## 1. GitHub Actions Workflow Architecture

**Decision**: Use two separate workflows - CI workflow for testing and deployment workflow for GitHub Pages

**Rationale**:
- **Different triggers**: CI runs on all PRs and pushes; deployment only on main branch merges
- **Security**: GitHub Pages deployment requires elevated permissions (`pages: write`, `id-token: write`) that shouldn't be granted to PR workflows from forks
- **Clarity**: Separate files make triggers and purposes obvious, easier to maintain
- **Branch protection**: GitHub branch protection works best with distinct CI workflows that must pass before merging
- **Parallelization**: Jobs within the same workflow run in parallel by default, maximizing efficiency

**Workflow Structure**:
- **CI Workflow** (`ci.yml`): Runs on `pull_request` events
  - Parallel jobs: Test matrix (Node 18, 20), lint, typecheck, build
  - All jobs run in parallel for fastest feedback
- **Deploy Workflow** (`deploy.yml`): Runs on `push` to main branch
  - Sequential jobs: Build documentation → Deploy to GitHub Pages

**Alternatives Considered**:
- **Single monolithic workflow**: Rejected due to mixing concerns, complex conditional logic, and permission issues
- **Many separate workflows** (one per check): Rejected because it loses parallelization benefits and creates status check clutter
- **Reusable workflows**: Rejected as overkill for single-repo use case with only 2 simple workflows

---

## 2. Dependency Caching Strategy

**Decision**: Use `actions/setup-node@v4` with built-in npm caching

**Implementation**:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

**Cache Details**:
- **Path cached**: `~/.npm` (npm's global cache directory)
- **Cache key**: Automatically generated using `hashFiles('**/package-lock.json')` + OS + package manager
- **Invalidation**: Automatic when `package-lock.json` changes

**Rationale**:
- **Correctness**: Caches `~/.npm` instead of `node_modules/`, avoiding cross-Node.js version incompatibilities
- **Performance**: Install times drop from 10-20s to ~1s with cache hits
- **Compatibility**: Works correctly with `npm ci` (which removes `node_modules/` before installing)
- **Maintenance**: Official GitHub recommendation, zero configuration needed
- **Reliability**: Prevents native module breakage when Node.js versions change

**Alternatives Considered**:
- **Caching `node_modules/` directly**: Rejected due to cross-version incompatibility, breaks with `npm ci`, not recommended by GitHub
- **Manual `actions/cache`**: Rejected as unnecessary complexity; `setup-node` provides identical functionality with better defaults
- **Combined caching** (`~/.npm` + `node_modules/`): Rejected due to cache bloat and same risks as `node_modules/` caching

---

## 3. Browser Testing in GitHub Actions

**Decision**: Use Vitest with WebDriverIO provider in headless Chrome mode

**Implementation**:
```typescript
// vitest.config.ts
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: webdriverio({
        capabilities: {
          browserVersion: 'stable',
          'goog:chromeOptions': {
            args: [
              'headless',
              'disable-gpu',
              'no-sandbox',
              'disable-setuid-sandbox',
              'disable-dev-shm-usage'
            ]
          }
        }
      }),
      instances: [{ browser: 'chrome' }],
      headless: true // Auto-enabled when process.env.CI is set
    },
    testTimeout: 30000 // Increased for CI environment
  }
})
```

**Workflow Step**:
```yaml
- name: Run browser tests
  run: npm test  # No xvfb-run needed with headless mode
```

**Rationale**:
- **No installation required**: GitHub Actions Ubuntu runners come pre-installed with Chrome and ChromeDriver
- **Auto-configuration**: WebDriverIO automatically detects Chrome version and uses matching ChromeDriver
- **Headless by default**: Vitest sets `headless: true` automatically when `process.env.CI` is truthy
- **Chrome flags solve CI issues**:
  - `no-sandbox` / `disable-setuid-sandbox`: Required in containerized environments
  - `disable-gpu`: Prevents GPU crashes in headless mode
  - `disable-dev-shm-usage`: Prevents /dev/shm space issues in containers

**Common Pitfalls to Avoid**:
- Don't use `xvfb-run` with headless Chrome (redundant)
- Always include `no-sandbox` flag for containerized environments
- Increase `testTimeout` to 30000ms for slower CI runners
- Use `goog:chromeOptions` (not older `wdio:devtoolsOptions`)

**Alternatives Considered**:
- **Playwright provider**: Faster due to parallel execution, but adds another dependency
- **Preview provider**: Rejected for CI use; event simulation doesn't work reliably in headless environments
- **Installing Chrome manually**: Rejected; pre-installed Chrome is sufficient and avoids download timeouts

---

## 4. GitHub Pages Deployment

**Decision**: Use official GitHub Actions workflow with `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`

**Implementation**:
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run docs:build
      - run: touch docs/.vitepress/dist/.nojekyll  # Skip Jekyll processing
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Configuration Requirements**:
1. **Repository Settings**: Set "Build and deployment" source to "GitHub Actions" (not "Deploy from a branch")
2. **Permissions**: Deploy job needs `pages: write` and `id-token: write`
3. **Base Path**: Configure VitePress with `base: '/mediabunny/'` to match repository name
4. **Jekyll**: Add `.nojekyll` file to prevent GitHub Pages from running Jekyll processing

**Rationale**:
- **Official solution**: Verified by GitHub, native integration with Pages
- **Security**: Built-in OIDC security with token verification
- **Simplicity**: No need to manage `gh-pages` branch or git operations
- **Deployment tracking**: Integrates with GitHub's environment and deployment API
- **Cleaner workflow**: Artifact upload/download pattern is clearer than git push

**Alternatives Considered**:
- **peaceiris/actions-gh-pages**: Popular third-party action, but uses git push to `gh-pages` branch; rejected in favor of official solution
- **JamesIves/github-pages-deploy-action**: Flexible but more complex; rejected for same reasons
- **git subtree push**: Manual approach, no deployment tracking; rejected as error-prone and lacking CI integration

**Handling Documentation + Examples**:
- Build examples into `docs/.vitepress/dist/examples/` subdirectory
- Deploy the entire `docs/.vitepress/dist` directory containing both docs and examples

---

## 5. Multi-Version Node.js Testing

**Decision**: Use GitHub Actions matrix strategy to test on Node.js 18 and 20 in parallel

**Implementation**:
```yaml
strategy:
  matrix:
    node-version: [18, 20]
  fail-fast: false  # Continue testing other versions if one fails
```

**Rationale**:
- **Parallel execution**: Both versions test simultaneously, no time overhead
- **Version coverage**: Node 18 and 20 are current LTS versions as of 2025
- **Fail-fast disabled**: See all version failures, not just the first one
- **Independent validation**: Each version gets its own complete test run

**Matrix Strategy Benefits**:
- Runs 2 jobs in parallel with different Node.js versions
- Each job has isolated environment (no interference)
- Clear failure reporting per version
- Standard GitHub Actions pattern

**Alternatives Considered**:
- **Testing only one version**: Rejected; library should support multiple Node versions
- **Sequential testing**: Rejected; parallel execution is faster and free
- **More versions** (14, 16, 22): Rejected; 18 and 20 are current LTS, others are EOL or too new

---

## 6. Workflow Permissions

**Decision**: Use minimal permissions following least-privilege principle

**CI Workflow Permissions**:
```yaml
permissions:
  contents: read        # Read repository contents for checkout
  pull-requests: write  # Comment on PRs (if adding PR comments in future)
```

**Deploy Workflow Permissions**:
```yaml
permissions:
  contents: read   # Read repository contents
  pages: write     # Create Pages deployments
  id-token: write  # Request OIDC JWT for deployment verification
```

**Rationale**:
- **Security**: Minimal permissions reduce attack surface
- **OIDC tokens**: `id-token: write` enables secure deployment without long-lived secrets
- **Explicit is better**: Clearly documents what each workflow can do
- **Fork PR safety**: CI workflow has read-only access, safe to run on PRs from forks

**Permission Scopes**:
- `contents: read`: Required for `actions/checkout`
- `pages: write`: Required for `actions/deploy-pages` to create deployments
- `id-token: write`: Required to request OIDC token for GitHub Pages deployment verification
- `pull-requests: write`: Optional, only if CI adds comments to PRs (not in current scope)

**Alternatives Considered**:
- **Default permissions**: Rejected; explicit is clearer and more secure
- **Broader permissions**: Rejected; violates least-privilege principle
- **No permissions declaration**: Rejected; relies on repository defaults which may change

---

## Summary of Technology Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **Workflow Structure** | 2 separate workflows (CI + Deploy) | Clear separation, optimal permissions |
| **Caching** | `actions/setup-node@v4` with `cache: 'npm'` | Fast, correct, zero-config |
| **Browser Testing** | Vitest + WebDriverIO + headless Chrome | Pre-installed, reliable, auto-configured |
| **Pages Deployment** | Official `actions/deploy-pages@v4` | Secure, integrated, simple |
| **Node Versions** | Matrix: [18, 20], parallel | LTS coverage, fast feedback |
| **Permissions** | Minimal, explicit per workflow | Secure, documented, safe for forks |

All decisions prioritize:
1. **Correctness**: Reliable, predictable behavior
2. **Performance**: Fast CI runs, parallel execution
3. **Security**: Minimal permissions, OIDC tokens
4. **Maintainability**: Official actions, simple configuration
5. **Developer Experience**: Clear feedback, easy debugging

---

## Next Steps

With research complete, proceed to Phase 1:
1. Generate workflow contracts (`contracts/ci-workflow-contract.yaml`, `contracts/deploy-workflow-contract.yaml`)
2. Create quickstart guide (`quickstart.md`)
3. Update agent context with GitHub Actions and YAML technologies
4. Generate task breakdown (`/speckit.tasks`)
