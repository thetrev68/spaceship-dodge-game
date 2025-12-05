import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    clearMocks: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Note: 'all' option was removed in Vitest 4.0
      // Use 'include' to specify patterns for coverage reporting
      include: [
        'src/core/**/*.ts',
        'src/game/**/*.ts',
        'src/entities/**/*.ts',
        'src/systems/**/*.ts',
        'src/utils/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'dist/',
        'docs/',
        '**/*.config.{js,ts}',
        '**/vite-env.d.ts',
        'src/main.ts', // Entry point - minimal logic
        'src/core/main.ts', // DOM-heavy entry orchestration
        'src/entities/asteroid.ts', // Render-heavy, covered by integration
        'src/entities/player.ts', // Render-heavy, covered by integration
        'src/entities/bullet.ts', // Covered by integration/unit but branch-heavy visuals
        'src/ui/**', // Sprint 3: UI components
        'src/input/**', // Sprint 3: Input handling
        'src/effects/**', // Non-critical visual effects
        'src/types/**', // Type definitions only
        'src/utils/errors.ts', // Error handling utilities - low priority
        'src/utils/validation.ts', // Validation utilities - low priority
        '.claude/**', // Documentation
        'build/**', // Build artifacts
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@game': path.resolve(__dirname, './src/game'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@input': path.resolve(__dirname, './src/input'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@effects': path.resolve(__dirname, './src/effects'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
