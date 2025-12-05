# Sprint 5: CI/CD & Automation

## Goal

Establish **automated quality gates** and continuous integration/deployment workflows to ensure code quality, prevent regressions, and streamline the development process. Target: professional-grade automation and zero-friction deployment.

## Prerequisites

- Sprint 1-4 completed (85%+ test coverage, refactored architecture, comprehensive documentation)
- All tests passing (`npm run test` - 96/96)
- TypeScript + ESLint clean
- Coverage thresholds met (85/85/80/85)
- GitHub repository set up

## Overview

Sprint 5 focuses on automation and quality enforcement:

1. **GitHub Actions CI Pipeline** - Automated testing, linting, type checking
2. **Pre-commit Hooks** - Local quality gates with Husky + lint-staged
3. **Automated Dependency Updates** - Dependabot configuration
4. **Code Quality Badges** - Visual quality indicators in README
5. **Deployment Automation** - Streamlined GitHub Pages deployment

After this sprint, the project will have professional-grade automation that catches issues early, maintains quality standards, and simplifies deployment.

---

## Part 1: GitHub Actions CI Workflow

### 1.1 Create Main CI Pipeline

**File**: `.github/workflows/ci.yml`

**Purpose**: Run on every push/PR to verify code quality, tests, and build

**Workflow Jobs**:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          npx bundlesize || echo "::warning::Bundle size check failed"
```

**Key Features**:
- ✅ Runs on push to main/develop and all PRs
- ✅ Caches npm dependencies for speed
- ✅ Runs type checking, linting, tests, and build
- ✅ Uploads coverage to Codecov
- ✅ Checks bundle size (with warning on failure)

### 1.2 Add Deployment Workflow

**File**: `.github/workflows/deploy.yml`

**Purpose**: Auto-deploy to GitHub Pages on main branch updates

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key Features**:
- ✅ Triggers on push to main or manual dispatch
- ✅ Uses official GitHub Pages deployment action
- ✅ Proper permissions for Pages deployment
- ✅ Concurrency control to prevent simultaneous deploys

### 1.3 Add Performance Workflow (Optional but Recommended)

**File**: `.github/workflows/performance.yml`

**Purpose**: Run Lighthouse CI on PRs to catch performance regressions

```yaml
name: Performance

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Serve build
        run: npx serve -s dist -l 4173 &

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:4173
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: ./lighthouse-budget.json
```

### 1.4 Create Lighthouse Budget File

**File**: `lighthouse-budget.json`

**Purpose**: Define performance budgets for bundle size and metrics

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 200
      },
      {
        "resourceType": "stylesheet",
        "budget": 20
      },
      {
        "resourceType": "total",
        "budget": 500
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "third-party",
        "budget": 0
      }
    ],
    "timings": [
      {
        "metric": "interactive",
        "budget": 3000
      },
      {
        "metric": "first-contentful-paint",
        "budget": 1000
      }
    ]
  }
]
```

---

## Part 2: Pre-commit Hooks with Husky

### 2.1 Install Husky and lint-staged

**Commands**:
```bash
npm install -D husky lint-staged
npx husky init
```

**Creates**: `.husky/` directory with Git hooks

### 2.2 Configure Pre-commit Hook

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Make executable** (Git Bash/Linux/Mac):
```bash
chmod +x .husky/pre-commit
```

### 2.3 Configure lint-staged

**File**: `package.json` (add to root object)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run --reporter=verbose"
    ],
    "*.{ts,tsx,json,md}": [
      "prettier --write"
    ]
  }
}
```

**Key Features**:
- ✅ Auto-fixes ESLint issues on staged TypeScript files
- ✅ Runs tests related to changed files
- ✅ Auto-formats with Prettier
- ✅ Only processes staged files (fast!)

### 2.4 Add Commit Message Linting (Optional)

**Install commitlint**:
```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**File**: `.commitlintrc.json`

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert"
      ]
    ]
  }
}
```

**File**: `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

**Enforces conventional commits**:
- `feat: add new powerup type`
- `fix: resolve collision detection bug`
- `docs: update DEVELOPER_GUIDE.md`

---

## Part 3: Automated Dependency Updates

### 3.1 Configure Dependabot

**File**: `.github/dependabot.yml`

**Purpose**: Auto-create PRs for dependency updates

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    assignees:
      - "thetrev68"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
    groups:
      development-dependencies:
        dependency-type: "development"
        patterns:
          - "@types/*"
          - "@typescript-eslint/*"
          - "vitest"
          - "eslint"
          - "prettier"
      production-dependencies:
        dependency-type: "production"
```

**Key Features**:
- ✅ Weekly updates (Mondays at 9 AM)
- ✅ Groups related dependencies (dev vs prod)
- ✅ Auto-assigns to maintainer
- ✅ Proper labels for filtering
- ✅ Conventional commit messages

### 3.2 Add Dependabot Auto-merge Workflow (Optional)

**File**: `.github/workflows/dependabot-automerge.yml`

**Purpose**: Auto-merge minor/patch updates after CI passes

```yaml
name: Dependabot Auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Enable auto-merge for Dependabot PRs
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Only auto-merges**:
- Patch updates (1.2.3 → 1.2.4)
- Minor updates (1.2.3 → 1.3.0)
- After CI passes ✅

---

## Part 4: Code Quality Badges

### 4.1 Set Up Codecov

1. Go to [codecov.io](https://codecov.io)
2. Connect GitHub account
3. Enable for `spaceship-dodge-game` repo
4. Copy the token to GitHub Secrets (`CODECOV_TOKEN`)

### 4.2 Add Bundle Size Monitoring (Optional)

**File**: `package.json`

```json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "200 kB"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "20 kB"
    }
  ]
}
```

**Install**:
```bash
npm install -D bundlesize
```

### 4.3 Update README.md with Badges

**File**: `README.md` (add at top, after title)

```markdown
# Spaceship Dodge Game

[![CI](https://github.com/thetrev68/spaceship-dodge-game/workflows/CI/badge.svg)](https://github.com/thetrev68/spaceship-dodge-game/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/thetrev68/spaceship-dodge-game/branch/main/graph/badge.svg)](https://codecov.io/gh/thetrev68/spaceship-dodge-game)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg)](https://vitest.dev/)

> A TypeScript-based arcade game with world-class architecture and 85%+ test coverage
```

**Badges show**:
- ✅ CI/CD status
- ✅ Code coverage percentage
- ✅ TypeScript version
- ✅ License type
- ✅ Code style (Prettier)
- ✅ Test framework (Vitest)

---

## Part 5: Enhanced npm Scripts

### 5.1 Add CI/CD Helper Scripts

**File**: `package.json` - Update `scripts` section

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",

    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",

    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:repeat": "vitest run --repeat=3",
    "test:ci": "vitest run --coverage --repeat=2",
    "test:watch": "vitest",

    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",

    "docs": "typedoc",

    "validate": "npm run typecheck && npm run lint && npm run test:ci",
    "prepare": "husky",

    "clean": "rimraf dist coverage .vitest node_modules/.vite",
    "reinstall": "npm run clean && npm install"
  }
}
```

**New scripts**:
- `test:ci` - Runs coverage + flake detection for CI
- `validate` - One command to check everything
- `prepare` - Auto-sets up Husky on install
- `format` / `format:check` - Prettier commands
- `clean` / `reinstall` - Cleanup utilities

### 5.2 Install Missing Dependencies

```bash
npm install -D rimraf gh-pages
```

---

## Part 6: Documentation Updates

### 6.1 Update CONTRIBUTING.md

Add section on **Local Development Workflow**:

```markdown
## Local Development Workflow

### Before Committing

Our pre-commit hooks will automatically:
- Fix ESLint issues
- Run tests for changed files
- Format code with Prettier

If hooks fail:
1. Review the errors
2. Fix any failing tests
3. Commit again

### Manual Quality Checks

Run full validation suite:
```bash
npm run validate
```

This runs:
- TypeScript type checking
- ESLint linting
- Full test suite with coverage
- Flake detection (3x repeat)

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new powerup type` - New features
- `fix: resolve collision bug` - Bug fixes
- `docs: update README` - Documentation
- `test: add asteroid tests` - Tests
- `refactor: extract collision logic` - Code improvements
- `chore: update dependencies` - Maintenance

### Pull Requests

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit
3. Push: `git push origin feat/my-feature`
4. Open PR on GitHub
5. Wait for CI to pass ✅
6. Request review
```

### 6.2 Update README.md

Add **Development** section:

```markdown
## Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
git clone https://github.com/thetrev68/spaceship-dodge-game.git
cd spaceship-dodge-game
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Quality Checks

```bash
npm run validate    # Run all checks
npm run typecheck   # TypeScript only
npm run lint        # ESLint only
npm run test        # Tests only
```

### Pre-commit Hooks

Husky runs automatically on `git commit`:
- Fixes ESLint issues
- Runs related tests
- Formats with Prettier

To bypass (not recommended):
```bash
git commit --no-verify
```

### Continuous Integration

All PRs run:
- ✅ Type checking
- ✅ Linting
- ✅ Full test suite with coverage
- ✅ Build verification
- ✅ Bundle size check

See [CI status](.github/workflows/ci.yml)
```

### 6.3 Update CLAUDE.md

Add **CI/CD** section:

```markdown
## CI/CD & Automation

### GitHub Actions Workflows

- **CI** (`.github/workflows/ci.yml`) - Runs on all pushes/PRs
  - Type checking, linting, tests with coverage
  - Build verification and bundle size check
  - Codecov upload

- **Deploy** (`.github/workflows/deploy.yml`) - Runs on main branch
  - Auto-builds and deploys to GitHub Pages
  - Uses official GitHub Pages action

- **Performance** (`.github/workflows/performance.yml`) - Runs on PRs
  - Lighthouse CI with budget enforcement
  - Performance regression detection

### Pre-commit Hooks

Husky + lint-staged runs on every commit:
- Auto-fixes ESLint issues
- Runs tests for changed files
- Formats code with Prettier

Bypass with `--no-verify` (not recommended)

### Dependabot

Auto-creates PRs for dependency updates:
- Weekly schedule (Mondays)
- Groups dev/prod dependencies
- Auto-merges patch/minor updates after CI passes

### Quality Badges

README displays:
- CI status
- Code coverage
- TypeScript version
- License
- Code style

See [README.md](./README.md) for current status
```

---

## Part 7: Testing the CI/CD Pipeline

### 7.1 Local Pre-commit Hook Test

```bash
# Make a small change
echo "// test" >> src/core/logger.ts

# Stage it
git add src/core/logger.ts

# Commit (hooks will run)
git commit -m "test: verify pre-commit hooks"

# If successful, reset
git reset --soft HEAD~1
git checkout src/core/logger.ts
```

### 7.2 Validate npm Scripts

```bash
npm run validate
```

Should run:
1. TypeScript type checking ✅
2. ESLint ✅
3. Full test suite with coverage ✅
4. Flake detection (2x repeat) ✅

### 7.3 GitHub Actions Test

1. Push a small change to a feature branch
2. Open a PR to main
3. Verify CI workflow runs
4. Check all jobs pass ✅
5. Verify coverage report uploads to Codecov

---

## Validation Checklist

### GitHub Actions ✅
- [ ] `.github/workflows/ci.yml` created and working
- [ ] `.github/workflows/deploy.yml` created and working
- [ ] `.github/workflows/performance.yml` created (optional)
- [ ] All workflows pass on test PR
- [ ] Codecov integration working
- [ ] GitHub Pages deployment successful

### Pre-commit Hooks ✅
- [ ] Husky installed and initialized
- [ ] `.husky/pre-commit` created and executable
- [ ] lint-staged configured in package.json
- [ ] Pre-commit hook runs on local commits
- [ ] Hook blocks commit if tests fail
- [ ] commitlint configured (optional)

### Dependency Management ✅
- [ ] `.github/dependabot.yml` created
- [ ] Dependabot creating PRs weekly
- [ ] Auto-merge workflow configured (optional)
- [ ] Dependencies grouped properly

### Code Quality ✅
- [ ] Codecov account set up and token added
- [ ] Coverage badge in README
- [ ] CI status badge in README
- [ ] All badges displaying correctly
- [ ] bundlesize configured (optional)

### Documentation ✅
- [ ] CONTRIBUTING.md updated with workflow
- [ ] README.md updated with development section
- [ ] CLAUDE.md updated with CI/CD section
- [ ] All documentation accurate and complete

### npm Scripts ✅
- [ ] `npm run validate` works
- [ ] `npm run test:ci` works
- [ ] `npm run format` works
- [ ] All scripts documented in README

---

## Files to Create/Update

```
.github/
├── workflows/
│   ├── ci.yml                        # NEW - Main CI pipeline
│   ├── deploy.yml                    # NEW - GitHub Pages deployment
│   ├── performance.yml               # NEW - Lighthouse CI
│   └── dependabot-automerge.yml      # NEW - Auto-merge workflow
├── dependabot.yml                    # NEW - Dependency updates
└── PULL_REQUEST_TEMPLATE.md          # UPDATE - Add CI checklist

.husky/
├── _/                                # AUTO-GENERATED by husky init
├── pre-commit                        # NEW - Pre-commit hook
└── commit-msg                        # NEW - Commit message linting (optional)

lighthouse-budget.json                # NEW - Performance budgets

package.json                          # UPDATE - Scripts + lint-staged
.commitlintrc.json                    # NEW - Commit message rules (optional)

README.md                             # UPDATE - Badges + development section
CONTRIBUTING.md                       # UPDATE - Workflow documentation
CLAUDE.md                             # UPDATE - CI/CD section
```

---

## Common Issues & Solutions

### Issue: Pre-commit hook not running

**Solution**:
```bash
# Re-initialize Husky
npx husky init

# Make hook executable
chmod +x .husky/pre-commit

# Verify Git hooks path
git config core.hooksPath
```

### Issue: CI failing on Windows line endings

**Solution**: Already handled by `.gitattributes`:
```
* text=auto eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
```

### Issue: Codecov upload failing

**Solution**:
1. Verify `CODECOV_TOKEN` in GitHub Secrets
2. Check repository is enabled on codecov.io
3. Verify `coverage/lcov.info` exists after test run

### Issue: GitHub Pages 404 after deploy

**Solution**:
1. Check `vite.config.ts` has correct `base` path
2. Verify `dist/` folder structure
3. Check GitHub Pages settings (Settings → Pages)

---

## Success Metrics

After Sprint 5 completion:

- ✅ CI pipeline runs on all PRs and passes
- ✅ Pre-commit hooks prevent bad commits locally
- ✅ Automated deployment to GitHub Pages works
- ✅ Code coverage tracked and displayed
- ✅ Dependencies auto-update weekly
- ✅ All quality badges green in README
- ✅ Bundle size monitored and within budget
- ✅ No manual deployment needed

---

## Sprint 5 Timeline

**Estimated Time**: 1-2 weeks part-time

### Week 1: Core Automation
- Day 1-2: GitHub Actions CI/Deploy workflows
- Day 3: Pre-commit hooks setup
- Day 4: Codecov integration
- Day 5: Testing and validation

### Week 2: Polish & Documentation
- Day 1: Dependabot setup
- Day 2: Performance workflow (optional)
- Day 3: Documentation updates
- Day 4: Badge setup and README polish
- Day 5: Final testing and sign-off

---

## Next Steps After Sprint 5

With CI/CD complete, you'll have:
- Professional automation infrastructure
- Quality gates enforced automatically
- Streamlined deployment process
- Real-time quality metrics

**Optional Sprint 6 topics**:
- Storybook for UI components
- Web Vitals monitoring
- Advanced accessibility testing
- Cross-browser E2E tests with Playwright
- Security scanning (Snyk, CodeQL)

---

## Sign-off

**Sprint 5 Status**: Ready to begin

**Prerequisites**: Sprint 4 completion verified (see `sprint-4-completion-checklist.md`)

**Deliverable**: World-class CI/CD pipeline with automated quality enforcement
