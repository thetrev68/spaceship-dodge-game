/**
 * @module core/version
 * Application version information
 *
 * Update this file when you bump versions in package.json
 * Or use: npm version patch|minor|major
 */

/**
 * Current application version
 * Format: MAJOR.MINOR.PATCH (semantic versioning)
 *
 * Keep in sync with package.json version
 *
 * @public - Exported for external use (see VERSIONING.md)
 */
export const APP_VERSION = '1.0.3';

/**
 * Full version string for display
 */
export const VERSION_STRING = `v${APP_VERSION}`;

/**
 * Logs version information to console on startup
 */
export function logVersion(): void {
  console.log(`🎮 Spaceship Dodge ${VERSION_STRING}`);
  console.log(`📅 PWA enabled - Install for offline play!`);
}
