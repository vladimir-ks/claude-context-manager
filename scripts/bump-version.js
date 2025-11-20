#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * Automates version bumping across package.json, CLI, CHANGELOG, and git tags
 *
 * Usage:
 *   node scripts/bump-version.js patch   # 0.3.7 -> 0.3.8
 *   node scripts/bump-version.js minor   # 0.3.7 -> 0.4.0
 *   node scripts/bump-version.js major   # 0.3.7 -> 1.0.0
 *   node scripts/bump-version.js 1.2.3   # Explicit version
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`\n✗ Error: ${message}`, 'red');
  process.exit(1);
}

function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    error(`Invalid version format: ${versionString}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  };
}

function bumpVersion(currentVersion, bumpType) {
  const version = parseVersion(currentVersion);

  switch (bumpType) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      break;
    case 'patch':
      version.patch++;
      break;
    default:
      // Explicit version provided
      return bumpType;
  }

  return `${version.major}.${version.minor}.${version.patch}`;
}

function updatePackageJson(newVersion) {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageJson.version;

  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

  log(`  ✓ Updated package.json: ${oldVersion} → ${newVersion}`, 'green');
  return oldVersion;
}

function updateCLI(newVersion) {
  const cliPath = path.join(__dirname, '..', 'bin', 'claude-context-manager.js');
  let cliContent = fs.readFileSync(cliPath, 'utf8');

  // Replace VERSION constant
  const versionRegex = /const VERSION = ['"][\d.]+['"];/;
  if (!versionRegex.test(cliContent)) {
    error('Could not find VERSION constant in CLI file');
  }

  cliContent = cliContent.replace(versionRegex, `const VERSION = '${newVersion}';`);
  fs.writeFileSync(cliPath, cliContent, 'utf8');

  log(`  ✓ Updated CLI version constant: ${newVersion}`, 'green');
}

function updateChangelog(newVersion) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  let changelog = fs.readFileSync(changelogPath, 'utf8');

  // Get current date
  const today = new Date().toISOString().split('T')[0];

  // Create new version section
  const newSection = `## [${newVersion}] - ${today}

### Added
-

### Changed
-

### Fixed
-

---

`;

  // Find where to insert (after the # Changelog header)
  const headerRegex = /# Changelog\n\n/;
  if (!headerRegex.test(changelog)) {
    error('Could not find "# Changelog" header in CHANGELOG.md');
  }

  changelog = changelog.replace(headerRegex, `# Changelog\n\n${newSection}`);
  fs.writeFileSync(changelogPath, changelog, 'utf8');

  log(`  ✓ Added new section to CHANGELOG.md`, 'green');
}

function createGitTag(newVersion, oldVersion) {
  try {
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      error('You have uncommitted changes. Please commit or stash them first.');
    }

    // Commit version changes
    execSync('git add package.json bin/claude-context-manager.js CHANGELOG.md', { stdio: 'inherit' });
    execSync(`git commit -m "Update: Bump version to ${newVersion}"`, { stdio: 'inherit' });

    // Create git tag
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });

    log(`  ✓ Created git commit and tag v${newVersion}`, 'green');
    log(`\n${colors.yellow}Remember to push:${colors.reset}`, 'bright');
    log(`  git push origin dev`, 'blue');
    log(`  git push origin v${newVersion}`, 'blue');
  } catch (err) {
    error(`Git operation failed: ${err.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    error('Usage: node bump-version.js [major|minor|patch|X.Y.Z]');
  }

  const bumpType = args[0];

  log('\nVersion Bump Tool', 'bright');
  log('==================\n');

  // Read current version
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;

  log(`Current version: ${currentVersion}`, 'blue');

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType);
  log(`New version:     ${newVersion}\n`, 'green');

  // Confirm
  log('This will:', 'yellow');
  log('  1. Update package.json');
  log('  2. Update bin/claude-context-manager.js');
  log('  3. Add new section to CHANGELOG.md');
  log('  4. Create git commit');
  log('  5. Create git tag\n');

  // Update files
  log('Updating files...', 'bright');
  updatePackageJson(newVersion);
  updateCLI(newVersion);
  updateChangelog(newVersion);

  // Git operations
  log('\nGit operations...', 'bright');
  createGitTag(newVersion, currentVersion);

  log(`\n✅ Version bumped successfully: ${currentVersion} → ${newVersion}\n`, 'green');
}

main();
