# Versioning Guide

## How Versioning Works

Your game uses **Semantic Versioning** (semver): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Breaking changes, major features
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, small improvements

## Current Version

**Current version:** `1.0.0` (initial PWA release)

Version is stored in two places:

1. [package.json](package.json#L4) - Source of truth
2. [src/core/version.ts](src/core/version.ts#L15) - Used in code

## How to Update Version

### Method 1: Using npm (Recommended)

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```

This automatically:

- ✅ Updates package.json
- ✅ Creates git commit
- ✅ Creates git tag

**After running npm version:**

1. Update [src/core/version.ts](src/core/version.ts#L15) to match
2. Amend the commit: `git commit --amend --no-edit`
3. Push with tags: `git push && git push --tags`

### Method 2: Manual

1. Update `version` in [package.json](package.json#L4)
2. Update `APP_VERSION` in [src/core/version.ts](src/core/version.ts#L15)
3. Commit changes: `git commit -am "chore: bump version to X.X.X"`
4. Tag release: `git tag vX.X.X`
5. Push: `git push && git push --tags`

## Where Version Appears

### 1. Start Screen

Version appears at bottom of start overlay in small gray text.

### 2. Browser Console

On app startup, console shows:

```
🎮 Spaceship Dodge v1.0.0
📅 PWA enabled - Install for offline play!
```

### 3. GitHub Releases

Create releases on GitHub using git tags:

- Go to: https://github.com/YOUR_USERNAME/spaceship-dodge-game/releases
- Click "Create a new release"
- Select tag (e.g., `v1.0.0`)
- Add release notes

## Version Strategy

### When to Bump PATCH (x.x.1)

- Bug fixes
- Performance improvements
- Minor UI tweaks
- Documentation updates

**Example:** `1.0.0 → 1.0.1`

### When to Bump MINOR (x.1.x)

- New features (themes, powerups, levels)
- New game modes
- Significant improvements
- PWA features

**Example:** `1.0.0 → 1.1.0`

### When to Bump MAJOR (2.x.x)

- Complete redesigns
- Breaking API changes
- Fundamental gameplay changes
- Major architecture overhauls

**Example:** `1.0.0 → 2.0.0`

## Release Workflow

### 1. Make Changes

```bash
# Work on feature
git add .
git commit -m "feat: add new theme"
```

### 2. Bump Version

```bash
npm version minor  # or patch/major
```

### 3. Update version.ts

```bash
# Edit src/core/version.ts to match package.json
git add src/core/version.ts
git commit --amend --no-edit
```

### 4. Push

```bash
git push
git push --tags
```

### 5. Deploy

```bash
npm run deploy
```

### 6. Create GitHub Release

- Go to GitHub Releases
- Select your tag (e.g., `v1.1.0`)
- Write release notes
- Publish release

## Example Version History

```
v1.0.0 - Initial PWA release
v1.0.1 - Fix audio loading bug
v1.1.0 - Add medieval theme
v1.2.0 - Add underwater theme
v1.2.1 - Performance improvements
v2.0.0 - Complete UI redesign
```

## Release Notes Template

```markdown
## What's New

- 🎨 Added new underwater theme
- 🐛 Fixed collision detection bug
- ⚡ Improved performance on mobile

## Changes

- Updated service worker cache strategy
- Increased audio cache limit to 5MB

## Bug Fixes

- Fixed theme switching on iOS Safari
- Corrected score popup positioning
```

## Checking Current Version

### In Browser Console

```javascript
// Version appears on startup, or check:
console.log('Current version:', document.getElementById('versionInfo')?.textContent);
```

### In Code

```typescript
import { APP_VERSION, VERSION_STRING } from '@core/version';

console.log(APP_VERSION); // "1.0.0"
console.log(VERSION_STRING); // "v1.0.0"
```

### Via npm

```bash
npm version  # Shows current version
```

### Via git

```bash
git tag -l   # List all version tags
```

## Best Practices

1. ✅ **Always update both files** (package.json and version.ts)
2. ✅ **Tag releases** for easy rollback
3. ✅ **Write release notes** for users
4. ✅ **Test before tagging** to avoid broken releases
5. ✅ **Use conventional commits** for clear history
6. ⚠️ **Never skip versions** (no 1.0.0 → 1.2.0)
7. ⚠️ **Don't reuse version numbers** once deployed

## Automation Ideas

### Future: Automatic Version Updates

You could automate this with a script:

```bash
# scripts/bump-version.sh
#!/bin/bash
npm version $1
VERSION=$(node -p "require('./package.json').version")
sed -i "s/APP_VERSION = '.*'/APP_VERSION = '$VERSION'/" src/core/version.ts
git add src/core/version.ts
git commit --amend --no-edit
```

Usage:

```bash
./scripts/bump-version.sh minor
```

---

**Current Version:** v1.0.0 (Initial PWA Release)
