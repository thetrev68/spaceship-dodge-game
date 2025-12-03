# Vitest 4.0 Migration Notes

## Critical Issue: Windows Drive Letter Casing Bug

### Problem
Vitest 4.0.15 has a **critical bug on Windows** where it fails to find test suites if the working directory path starts with a lowercase drive letter (e.g., `c:/Repos/...` instead of `C:/Repos/...`).

**Error symptoms:**
```
Error: No test suite found in file c:/Repos/spaceship-dodge-game/tests/...
Error: Vitest failed to find the runner. This is a bug in Vitest.
```

### Solution
**Always navigate to your project using an uppercase drive letter in your terminal/IDE:**

```bash
# ❌ WRONG - will fail
cd /c/Repos/spaceship-dodge-game
npm run test

# ✅ CORRECT - works properly
cd /C/Repos/spaceship-dodge-game
npm run test
```

### Root Cause
This is a known issue in Vitest 4.0.x where the module resolution system doesn't properly handle case-insensitive drive letters on Windows. The issue was previously fixed in PR #6779 but appears to have regressed in version 4.0.

**Related GitHub Issues:**
- [Issue #5772](https://github.com/vitest-dev/vitest/issues/5772) - Original drive letter bug
- [Issue #7465](https://github.com/vitest-dev/vitest/issues/7465) - Test suite detection issues

---

## Breaking Changes from Vitest 2.x to 4.0

### 1. Coverage `all` Option Removed

**Before (Vitest 2.x):**
```typescript
coverage: {
  provider: 'v8',
  all: false,
  include: ['src/**/*.ts'],
}
```

**After (Vitest 4.0):**
```typescript
coverage: {
  provider: 'v8',
  // 'all' option no longer exists
  // Use 'include' to specify coverage patterns
  include: ['src/**/*.ts'],
}
```

**Reason:** The `coverage.all` option was removed because it was difficult to maintain and caused performance issues when coverage providers processed unexpected files like minified JavaScript.

**Migration:**
- Remove the `all: false` line from your config
- Define `coverage.include` patterns explicitly
- By default, Vitest 4 only shows files imported during test runs

### 2. Vite Version Requirement

Vitest 4.0 requires **Vite 6 or higher**.

**Current versions in this project:**
- ✅ Vite: 7.2.4 (compatible)
- ✅ Vitest: 4.0.15

### 3. Other Breaking Changes

From the [official migration guide](https://vitest.dev/guide/migration.html):

- **Removed APIs:**
  - `poolMatchGlobs` → use `projects` instead
  - `environmentMatchGlobs` → use `projects` instead
  - `deps.external` → use `server.deps.external`
  - `deps.inline` → use `server.deps.inline`
  - `browser.testerScripts` → use `browser.testerHtmlPath`
  - `minWorkers` → only `maxWorkers` has effect now

- **Test Options:** Test options object as third argument to `test()`/`describe()` is no longer supported - use second argument instead

- **Browser Mode:** Built-in by default, no need for `@vitest/browser` package

- **Module Runner:** Vitest 4.0 uses `module-runner` instead of `vite-node` for better performance

---

## Configuration Changes Made

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // REMOVED: all: false (no longer supported in Vitest 4)
      // Use 'include' patterns instead to specify coverage scope
      include: [
        'src/core/**/*.ts',
        'src/game/**/*.ts',
        'src/entities/**/*.ts',
        'src/systems/**/*.ts',
        'src/utils/**/*.ts'
      ],
      // ... rest of config
    }
  }
});
```

---

## Test Results After Migration

### Status: ✅ Tests Running Successfully

After fixing the drive letter issue and updating the configuration:

- **Test Files:** 9 passed, 3 with test failures (not config issues)
- **Tests:** 32 passed, 5 failed (legitimate test logic issues)

The 5 failing tests are **not** due to Vitest 4 incompatibility - they are actual test implementation issues that need to be fixed:

1. **soundManager.test.ts** (3 failures):
   - Audio mocking needs improvement
   - Volume validation tests need adjustment

2. **powerup.test.ts** (1 failure):
   - Random powerup type test needs better mocking

3. **gameLoop.test.ts** (1 failure):
   - `cancelAnimationFrame` mock missing in setup

---

## Recommendations

### For Development

1. **Always use uppercase drive letters** when navigating to the project:
   ```bash
   cd /C/Repos/spaceship-dodge-game
   ```

2. **Update your IDE/terminal** to use uppercase drive letters in workspace paths

3. **Consider adding a note to package.json scripts** or README about this Windows-specific issue

### For CI/CD

This issue should not affect CI/CD pipelines running on Linux, but if using Windows runners:
- Ensure the checkout path uses uppercase drive letters
- Set working directory explicitly with uppercase drive letter

### Future Vitest Updates

Monitor these issues for fixes:
- Check release notes for drive letter casing fix
- Consider upgrading to Vitest 4.1+ when available with the fix

---

## Resources

- [Vitest 4.0 Release Announcement](https://vitest.dev/blog/vitest-4)
- [Vitest 4.0 Migration Guide](https://vitest.dev/guide/migration.html)
- [Coverage Configuration](https://vitest.dev/guide/coverage)
- [Vitest 4.0 Breaking Changes Issue](https://github.com/vitest-dev/vitest/issues/6956)
