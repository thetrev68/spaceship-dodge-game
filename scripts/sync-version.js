#!/usr/bin/env node
/**
 * Syncs version from package.json to src/core/version.ts
 * Called automatically by npm version hooks
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version = packageJson.version;

// Read current version.ts content
const versionFilePath = join(rootDir, 'src', 'core', 'version.ts');
const versionFileContent = readFileSync(versionFilePath, 'utf-8');

// Replace the version string
const updatedContent = versionFileContent.replace(
  /export const APP_VERSION = '[^']+';/,
  `export const APP_VERSION = '${version}';`
);

// Write updated content
writeFileSync(versionFilePath, updatedContent, 'utf-8');

console.log(`✅ Version synced: ${version}`);
console.log(`   - package.json: ${version}`);
console.log(`   - src/core/version.ts: ${version}`);
