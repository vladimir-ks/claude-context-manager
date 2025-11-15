---
title: AI Agent CLI Implementation Guide
metadata:
  status: APPROVED
  version: 0.2.0
  modules: [cli, implementation, testing]
  tldr: "Complete specification for implementing Claude Context Manager CLI commands - includes input/output formats, error handling, testing strategies, and development workflow"
  dependencies: [claude-context-manager-architecture.md, artifact-manager-system.md]
  code_refs: [src/, bin/, scripts/]
author: Vladimir K.S.
date: 2025-01-15
---

# AI Agent CLI Implementation Guide

**Purpose**: This guide provides AI agents with complete specifications for implementing all Claude Context Manager CLI commands, utilities, and library modules.

**Target Audience**: AI agents assisting with v0.2.0 implementation

**Scope**: Full command specifications, implementation examples, testing strategies, debugging approaches

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Repository Structure](#repository-structure)
3. [Development Workflow](#development-workflow)
4. [Core Utilities Specification](#core-utilities-specification)
5. [Library Modules Specification](#library-modules-specification)
6. [Command Specifications](#command-specifications)
7. [Testing Strategies](#testing-strategies)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Debugging Guide](#debugging-guide)
10. [Code Examples](#code-examples)

---

## Current Implementation Status

### ✅ Completed (v0.1.0)

**Distribution Infrastructure:**
- NPM package published: `@vladimir-ks/claude-context-manager@0.1.0`
- Global installation working: `npm install -g @vladimir-ks/claude-context-manager`
- Binary commands available: `ccm`, `claude-context-manager`, `ai-log-*`
- Home directory auto-created: `~/.claude-context-manager/`

**Files Working:**
- `bin/claude-context-manager.js:1-205` - CLI router with help/version (commands stubbed)
- `scripts/postinstall.js:1-259` - Home directory setup script
- `package.json` - NPM manifest with correct metadata
- `.github/workflows/` - CI/CD pipelines (dev, staging, production)

**Home Directory Structure Created:**
```
~/.claude-context-manager/
├── config.json              # ✅ Created with default config
├── registry.json            # ✅ Created with empty registry
├── cache/                   # ✅ Empty directory
├── backups/                 # ✅ Empty directory
└── library/                 # ✅ Metadata directories
    ├── free/
    │   ├── skills.json      # ✅ Has managing-claude-context metadata
    │   └── packages.json    # ✅ Has core-essentials metadata
    └── premium/
        └── skills.json      # ✅ Has locked premium placeholders
```

**Bundled Artifacts:**
- `.claude/skills/managing-claude-context/` - ✅ Complete skill included in package
- `.claude/commands/managing-claude-context/` - ✅ All 14+ commands included
- `scripts/logging/` - ✅ AI logging tools included

### ❌ Not Implemented (v0.2.0 Scope)

**Source Directories (ALL EMPTY):**
- `src/utils/` - 0 files (need: logger.js, config.js, file-ops.js)
- `src/lib/` - 0 files (need: registry.js, catalog.js, package-manager.js, license.js, api-client.js)
- `src/commands/` - 0 files (need: list.js, install.js, update.js, status.js, activate.js, init.js, remove.js, search.js)

**Missing Package Definitions:**
- `packages/` directory doesn't exist
- `packages/core-essentials.json` needed to reference bundled artifacts

**Stubbed Commands:**
All commands in `bin/claude-context-manager.js:172-186` route to `notImplemented()` function

### ⏳ In Progress (This Guide)

**Phase 0 - Documentation:**
- AI Agent CLI Guide (this file)
- /load-code-cli command (next)
- README developer section (pending)

---

## Repository Structure

### Complete Directory Tree

```
claude-skills-builder-vladks/
├── 00_DOCS/                           # ✅ Documentation and specs
│   ├── guides/
│   │   └── ai-agent-cli-guide.md      # ⏳ This file
│   ├── specs/
│   │   ├── claude-context-manager-architecture.md    # ✅ Complete architecture
│   │   ├── artifact-manager-system.md                # ✅ System specification
│   │   └── distribution-monetization-strategy.md     # ✅ Business strategy
│   └── workflow/
│       ├── git-branching-and-cicd.md                 # ✅ Git workflow
│       └── SETUP_CHECKLIST.md                        # ✅ CI/CD setup guide
│
├── .claude/                           # ✅ Bundled artifacts
│   ├── skills/
│   │   └── managing-claude-context/   # ✅ Complete skill (~5,500 lines)
│   └── commands/
│       ├── managing-claude-context/   # ✅ 14+ commands
│       └── load-code-cli.md           # ❌ Need to create
│
├── .github/workflows/                 # ✅ CI/CD pipelines
│   ├── ci-dev.yml                     # ✅ Development validation
│   ├── ci-staging.yml                 # ✅ Alpha release publishing
│   └── ci-production.yml              # ✅ Production release publishing
│
├── bin/
│   └── claude-context-manager.js      # ✅ CLI router (commands stubbed)
│
├── scripts/
│   ├── postinstall.js                 # ✅ Home directory setup
│   └── logging/                       # ✅ AI logging tools
│       ├── ai-log-start
│       ├── ai-log-progress
│       └── ai-log-end
│
├── src/                               # ❌ ALL NEED TO CREATE
│   ├── utils/                         # ❌ Empty (need 3 files)
│   │   ├── logger.js                  # ❌ Colored output, progress indicators
│   │   ├── config.js                  # ❌ Read/write config.json and registry.json
│   │   └── file-ops.js                # ❌ Copy files, checksums, backups
│   │
│   ├── lib/                           # ❌ Empty (need 5 files)
│   │   ├── registry.js                # ❌ Track installations
│   │   ├── catalog.js                 # ❌ Load artifact metadata
│   │   ├── package-manager.js         # ❌ Install/uninstall artifacts
│   │   ├── license.js                 # ❌ Stub for premium validation
│   │   └── api-client.js              # ❌ Stub for premium server
│   │
│   └── commands/                      # ❌ Empty (need 8 files)
│       ├── list.js                    # ❌ Show available artifacts
│       ├── install.js                 # ❌ Install artifacts (HIGH PRIORITY)
│       ├── update.js                  # ❌ Update with backups
│       ├── status.js                  # ❌ Show installed artifacts
│       ├── activate.js                # ❌ Premium stub
│       ├── init.js                    # ❌ Quick project setup (HIGH PRIORITY)
│       ├── remove.js                  # ❌ Uninstall artifacts
│       └── search.js                  # ❌ Search catalog
│
├── packages/                          # ❌ Need to create directory
│   └── core-essentials.json           # ❌ Package definition
│
├── package.json                       # ✅ NPM manifest
├── .gitattributes                     # ✅ Export-ignore for symlinks
├── .claude-plugin/
│   └── marketplace.json               # ✅ Plugin manifest
├── README.md                          # ✅ User documentation (needs dev section)
├── CONTRIBUTING.md                    # ✅ Donation info, contribution guide
├── CHANGELOG.md                       # ✅ Version history
├── ARTIFACT_CATALOG.md                # ✅ Artifact index
└── LICENSE                            # ✅ MIT License
```

### Key File Locations

**Read these files before implementing:**
- Architecture: `00_DOCS/specs/claude-context-manager-architecture.md:1-815`
- System spec: `00_DOCS/specs/artifact-manager-system.md:1-1002`
- Existing CLI router: `bin/claude-context-manager.js:1-205`
- Postinstall script: `scripts/postinstall.js:1-259`

**Home directory (created on install):**
- Config: `~/.claude-context-manager/config.json`
- Registry: `~/.claude-context-manager/registry.json`
- Free catalog: `~/.claude-context-manager/library/free/*.json`
- Premium catalog: `~/.claude-context-manager/library/premium/*.json`

---

## Development Workflow

### Phase-Based Implementation

**Implementation Order (CRITICAL - FOLLOW SEQUENTIALLY):**

1. **Phase 1: Core Utilities** (Foundation - Do First)
   - `src/utils/logger.js` (standalone)
   - `src/utils/config.js` (uses: fs, path, os)
   - `src/utils/file-ops.js` (uses: fs, path, crypto)

2. **Phase 2: Library Modules** (Depends on Phase 1)
   - `src/lib/registry.js` (depends on: config.js)
   - `src/lib/catalog.js` (depends on: config.js)
   - `src/lib/package-manager.js` (depends on: file-ops.js, registry.js)
   - `src/lib/license.js` (depends on: config.js) - STUB ONLY
   - `src/lib/api-client.js` (standalone) - STUB ONLY

3. **Phase 3: Package Definitions** (Depends on Phase 1-2)
   - Create `packages/` directory
   - Create `packages/core-essentials.json`
   - Update `scripts/postinstall.js` with package paths

4. **Phase 4: Commands** (Depends on Phase 1-3)
   - **Priority 1:** `src/commands/install.js`, `src/commands/init.js`
   - **Priority 2:** `src/commands/list.js`, `src/commands/status.js`, `src/commands/search.js`
   - **Priority 3:** `src/commands/update.js`, `src/commands/remove.js`
   - **Priority 4:** `src/commands/activate.js` (stub)

5. **Phase 5: Router Integration** (After all commands done)
   - Update `bin/claude-context-manager.js:170-186` to require and call actual command modules

6. **Phase 6: Testing** (After each phase)
   - Manual testing of each module
   - End-to-end workflow testing

### Testing Approach

**Manual Testing (No Automated Tests for v0.2.0):**

1. **Unit Testing (Per Module)**
   - Create test script: `node -e "const mod = require('./src/utils/logger.js'); mod.success('Test')"`
   - Verify output matches expected format
   - Test edge cases (null inputs, missing files, etc.)

2. **Integration Testing (Per Command)**
   - Run command: `ccm list`
   - Verify output format
   - Check registry updates (if applicable)
   - Verify files copied correctly (if applicable)

3. **End-to-End Testing (Full Workflows)**
   - Fresh install: `npm install -g @vladimir-ks/claude-context-manager`
   - Install package: `ccm install --package core-essentials --global`
   - Verify artifacts in `~/.claude/skills/managing-claude-context/`
   - Check registry: `cat ~/.claude-context-manager/registry.json`
   - Update: `ccm update --global`
   - Verify backups created: `ls ~/.claude-context-manager/backups/`

### Local Development Testing

**Test without publishing to NPM:**

```bash
# In repository directory
cd /Users/vmks/_dev_tools/claude-skills-builder-vladks

# Install locally with symlink
npm link

# Now 'ccm' command uses local development version
ccm --version
# Should show: Claude Context Manager v0.2.0

# Make changes to src/ files
# Changes immediately reflected (no reinstall needed)

# Test command
ccm list

# Unlink when done
npm unlink -g @vladimir-ks/claude-context-manager
```

### Debugging Process

**1. Check file exists and is readable:**
```bash
ls -la src/utils/logger.js
node -e "console.log(require.resolve('./src/utils/logger.js'))"
```

**2. Test module in isolation:**
```bash
node -e "const logger = require('./src/utils/logger'); logger.success('Test message')"
```

**3. Check home directory structure:**
```bash
ls -la ~/.claude-context-manager/
cat ~/.claude-context-manager/config.json | jq
cat ~/.claude-context-manager/registry.json | jq
```

**4. Trace command execution:**
Add debug logs to `bin/claude-context-manager.js`:
```javascript
console.error('[DEBUG] Command:', command);
console.error('[DEBUG] Args:', args);
console.error('[DEBUG] Calling:', commandModule);
```

**5. Check permissions:**
```bash
ls -la ~/.claude-context-manager/
# Should be: drwxr-xr-x (755 for dirs, 644 for files, 600 for config.json)
```

---

## Core Utilities Specification

### src/utils/logger.js

**Purpose**: Provide colored console output with consistent formatting

**Dependencies**: None (pure JavaScript)

**Functions:**

```javascript
/**
 * Log message with color
 * @param {string} message - Message to display
 * @param {string} color - Color name: 'reset', 'bright', 'dim', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'red'
 */
function log(message, color = 'reset')

/**
 * Success message (green with checkmark)
 * @param {string} message - Success message
 */
function success(message)

/**
 * Error message (red with X)
 * @param {string} message - Error message
 */
function error(message)

/**
 * Warning message (yellow with warning triangle)
 * @param {string} message - Warning message
 */
function warn(message)

/**
 * Info message (cyan with info icon)
 * @param {string} message - Info message
 */
function info(message)

/**
 * Progress indicator (dim with spinner or progress text)
 * @param {string} message - Progress message
 */
function progress(message)
```

**Expected Output:**

```
logger.success('Installation complete')
// Output: ✓ Installation complete (in green)

logger.error('File not found')
// Output: ✗ File not found (in red)

logger.warn('Backup recommended')
// Output: ⚠ Backup recommended (in yellow)

logger.info('Loading catalog...')
// Output: ℹ Loading catalog... (in cyan)
```

**Implementation Example:**

```javascript
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

function progress(message) {
  log(`⏳ ${message}`, 'dim');
}

module.exports = { log, success, error, warn, info, progress };
```

**Edge Cases:**
- Null/undefined message → Use empty string
- Non-string message → Convert to string with `String(message)`
- Invalid color → Default to 'reset'

---

### src/utils/config.js

**Purpose**: Read and write configuration and registry files

**Dependencies**: Node.js `fs`, `path`, `os`

**Functions:**

```javascript
/**
 * Get home directory path
 * @returns {string} ~/.claude-context-manager/
 */
function getHomeDir()

/**
 * Read config.json
 * @returns {Object} Configuration object
 * @throws {Error} If file doesn't exist or invalid JSON
 */
function readConfig()

/**
 * Write config.json
 * @param {Object} config - Configuration object
 * @throws {Error} If write fails
 */
function writeConfig(config)

/**
 * Read registry.json
 * @returns {Object} Registry object
 * @throws {Error} If file doesn't exist or invalid JSON
 */
function readRegistry()

/**
 * Write registry.json
 * @param {Object} registry - Registry object
 * @throws {Error} If write fails
 */
function writeRegistry(registry)

/**
 * Get global Claude directory path
 * @returns {string} ~/.claude/
 */
function getGlobalClaudeDir()

/**
 * Get project Claude directory path
 * @param {string} projectPath - Project root (defaults to process.cwd())
 * @returns {string} <project>/.claude/
 */
function getProjectClaudeDir(projectPath = process.cwd())
```

**Expected Behavior:**

```javascript
const config = readConfig();
// Returns: { version: '0.1.0', license: {...}, api: {...}, preferences: {...} }

config.license.key = 'NEW_LICENSE_KEY';
writeConfig(config);
// Saves updated config with mode 0o600 (user-only read/write)

const registry = readRegistry();
// Returns: { version: '0.1.0', source_repository: '...', installations: {...} }

registry.installations.global.artifacts.push({ name: 'pdf', version: '1.0', ... });
writeRegistry(registry);
// Saves updated registry with mode 0o644 (user read/write, others read)
```

**Implementation Example:**

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const CONFIG_FILE = path.join(HOME_DIR, 'config.json');
const REGISTRY_FILE = path.join(HOME_DIR, 'registry.json');

function getHomeDir() {
  return HOME_DIR;
}

function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error(`Config file not found: ${CONFIG_FILE}`);
  }
  const data = fs.readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(data);
}

function writeConfig(config) {
  config.updated = new Date().toISOString();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function readRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    throw new Error(`Registry file not found: ${REGISTRY_FILE}`);
  }
  const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
  return JSON.parse(data);
}

function writeRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), { mode: 0o644 });
}

function getGlobalClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

function getProjectClaudeDir(projectPath = process.cwd()) {
  return path.join(projectPath, '.claude');
}

module.exports = {
  getHomeDir,
  readConfig,
  writeConfig,
  readRegistry,
  writeRegistry,
  getGlobalClaudeDir,
  getProjectClaudeDir
};
```

**Edge Cases:**
- File doesn't exist → Throw descriptive error
- Invalid JSON → Catch and throw with helpful message
- Write permission denied → Throw error with suggestion to check permissions
- Null/undefined input to writeConfig/writeRegistry → Throw error

---

### src/utils/file-ops.js

**Purpose**: File operations for copying artifacts, creating backups, calculating checksums

**Dependencies**: Node.js `fs`, `path`, `crypto`

**Functions:**

```javascript
/**
 * Copy single file with permissions preserved
 * @param {string} source - Source file path
 * @param {string} dest - Destination file path
 * @throws {Error} If source doesn't exist or copy fails
 */
function copyFile(source, dest)

/**
 * Copy directory recursively
 * @param {string} source - Source directory path
 * @param {string} dest - Destination directory path
 * @throws {Error} If source doesn't exist or copy fails
 */
function copyDirectory(source, dest)

/**
 * Calculate SHA256 checksum of file
 * @param {string} filePath - File to hash
 * @returns {string} Hex-encoded SHA256 hash
 * @throws {Error} If file doesn't exist or read fails
 */
function calculateChecksum(filePath)

/**
 * Calculate SHA256 checksum of directory (hash of all file hashes concatenated)
 * @param {string} dirPath - Directory to hash
 * @returns {string} Hex-encoded SHA256 hash
 * @throws {Error} If directory doesn't exist
 */
function calculateDirectoryChecksum(dirPath)

/**
 * Create timestamped backup of file or directory
 * @param {string} sourcePath - File or directory to backup
 * @param {string} backupDir - Backup storage directory (usually ~/.claude-context-manager/backups/)
 * @returns {string} Path to created backup
 * @throws {Error} If backup creation fails
 */
function createBackup(sourcePath, backupDir)

/**
 * Validate checksum matches expected value
 * @param {string} filePath - File to validate
 * @param {string} expectedChecksum - Expected SHA256 hash
 * @returns {boolean} True if matches, false otherwise
 */
function validateChecksum(filePath, expectedChecksum)
```

**Expected Behavior:**

```javascript
copyFile('/source/file.txt', '/dest/file.txt');
// Copies file with same permissions

copyDirectory('.claude/skills/managing-claude-context/', '~/.claude/skills/managing-claude-context/');
// Recursively copies entire directory tree

const checksum = calculateChecksum('/path/to/file.txt');
// Returns: "a3c7f8e2d1b9..." (64-character hex string)

const dirChecksum = calculateDirectoryChecksum('.claude/skills/managing-claude-context/');
// Returns: "b4d8e9f3c2a1..." (hash of all files combined)

const backupPath = createBackup('~/.claude/skills/pdf/', '~/.claude-context-manager/backups/');
// Returns: "~/.claude-context-manager/backups/pdf/2025-01-15_143022/"

const isValid = validateChecksum('/path/to/file.txt', 'a3c7f8e2d1b9...');
// Returns: true or false
```

**Implementation Example:**

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function copyFile(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source file not found: ${source}`);
  }

  // Ensure destination directory exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy file preserving permissions
  fs.copyFileSync(source, dest);

  // Copy permissions (mode)
  const stats = fs.statSync(source);
  fs.chmodSync(dest, stats.mode);
}

function copyDirectory(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source directory not found: ${source}`);
  }

  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath); // Recursive
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

function calculateChecksum(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

function calculateDirectoryChecksum(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = [];

  // Recursively collect all file paths
  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  collectFiles(dirPath);

  // Sort for consistent ordering
  files.sort();

  // Calculate combined hash
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    const fileHash = calculateChecksum(file);
    hash.update(fileHash);
  }

  return hash.digest('hex');
}

function createBackup(sourcePath, backupDir) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source not found: ${sourcePath}`);
  }

  // Create timestamped backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sourceName = path.basename(sourcePath);
  const backupPath = path.join(backupDir, sourceName, timestamp);

  // Ensure backup directory exists
  fs.mkdirSync(backupPath, { recursive: true });

  // Copy source to backup
  const stats = fs.statSync(sourcePath);
  if (stats.isDirectory()) {
    copyDirectory(sourcePath, backupPath);
  } else {
    copyFile(sourcePath, path.join(backupPath, sourceName));
  }

  return backupPath;
}

function validateChecksum(filePath, expectedChecksum) {
  try {
    const actualChecksum = calculateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  } catch (error) {
    return false;
  }
}

module.exports = {
  copyFile,
  copyDirectory,
  calculateChecksum,
  calculateDirectoryChecksum,
  createBackup,
  validateChecksum
};
```

**Edge Cases:**
- Source doesn't exist → Throw descriptive error
- Destination directory doesn't exist → Create recursively
- Permission denied → Throw error with suggestion
- Disk full during copy → Throw error, suggest checking space
- Symlinks in source → Follow symlinks and copy actual files
- Hidden files (starting with `.`) → Include in copy

---

## Library Modules Specification

### src/lib/registry.js

**Purpose**: Manage installation registry (track what's installed where)

**Dependencies**: `utils/config.js`

**Functions:**

```javascript
/**
 * Get all installed artifacts for target (global or project)
 * @param {string} target - 'global' or project path
 * @returns {Array} List of installed artifacts
 */
function getInstalledArtifacts(target)

/**
 * Add artifact to registry
 * @param {string} target - 'global' or project path
 * @param {Object} artifact - Artifact metadata { name, type, version, checksum, installed_at, source_path }
 */
function addArtifact(target, artifact)

/**
 * Remove artifact from registry
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to remove
 */
function removeArtifact(target, artifactName)

/**
 * Update artifact metadata in registry
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to update
 * @param {Object} updates - Fields to update { checksum, version, updated_at }
 */
function updateArtifact(target, artifactName, updates)

/**
 * Check if artifact is installed
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to check
 * @returns {boolean} True if installed, false otherwise
 */
function isInstalled(target, artifactName)

/**
 * Get specific artifact metadata
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name
 * @returns {Object|null} Artifact metadata or null if not found
 */
function getArtifact(target, artifactName)
```

**Expected Behavior:**

```javascript
// Get all global installations
const artifacts = getInstalledArtifacts('global');
// Returns: [{ name: 'managing-claude-context', type: 'skill', version: '0.1.0', ... }, ...]

// Add new installation
addArtifact('global', {
  name: 'pdf',
  type: 'skill',
  version: '1.0.0',
  checksum: 'a3c7f8e2d1b9...',
  installed_at: '2025-01-15T14:30:22Z',
  source_path: '/Users/vmks/_dev_tools/claude-skills-builder-vladks/.claude/skills/pdf/'
});
// Updates registry.json with new entry

// Check if installed
const installed = isInstalled('global', 'pdf');
// Returns: true

// Get specific artifact
const artifact = getArtifact('global', 'pdf');
// Returns: { name: 'pdf', type: 'skill', version: '1.0.0', checksum: '...', ... }

// Update artifact
updateArtifact('global', 'pdf', {
  version: '1.1.0',
  checksum: 'b4d8e9f3c2a1...',
  updated_at: '2025-01-16T10:15:00Z'
});
// Updates existing entry in registry

// Remove artifact
removeArtifact('global', 'pdf');
// Removes entry from registry
```

**Registry Structure:**

```json
{
  "version": "0.1.0",
  "source_repository": "/Users/vmks/_dev_tools/claude-skills-builder-vladks",
  "installations": {
    "global": {
      "location": "/Users/vmks/.claude",
      "artifacts": [
        {
          "name": "managing-claude-context",
          "type": "skill",
          "version": "0.1.0",
          "checksum": "a3c7f8e2d1b9...",
          "installed_at": "2025-01-15T14:30:22Z",
          "updated_at": null,
          "source_path": ".claude/skills/managing-claude-context/"
        }
      ],
      "packages": [
        {
          "name": "core-essentials",
          "version": "0.1.0",
          "installed_at": "2025-01-15T14:30:22Z",
          "artifacts": ["managing-claude-context"]
        }
      ]
    },
    "projects": [
      {
        "path": "/Users/vmks/my-project",
        "location": "/Users/vmks/my-project/.claude",
        "artifacts": [],
        "packages": []
      }
    ]
  }
}
```

**Implementation Notes:**
- For `target='global'`: Use `registry.installations.global`
- For `target='/path/to/project'`: Find or create entry in `registry.installations.projects[]`
- Always update `registry.updated` timestamp when writing
- Validate artifact object has required fields before adding

**Edge Cases:**
- Target project not in registry → Create new project entry
- Artifact already installed → Throw error or update (configurable)
- Registry file corrupted → Backup and recreate with warning
- Concurrent writes → Use atomic write (write to temp, then rename)

---

### src/lib/catalog.js

**Purpose**: Load and search artifact metadata from library

**Dependencies**: `utils/config.js`

**Functions:**

```javascript
/**
 * Load free tier catalog
 * @returns {Object} { skills: [...], commands: [...], packages: [...] }
 */
function loadFreeCatalog()

/**
 * Load premium tier catalog (requires active license)
 * @returns {Object} { skills: [...], commands: [...], packages: [...] }
 * @throws {Error} If no active license
 */
function loadPremiumCatalog()

/**
 * Load complete catalog (free + premium if licensed)
 * @returns {Object} { skills: [...], commands: [...], packages: [...], tier: 'free'|'premium' }
 */
function loadCatalog()

/**
 * Search artifacts by query (name, description, category)
 * @param {string} query - Search query
 * @param {Object} options - { tier: 'free'|'premium'|'all', type: 'skill'|'command'|'package'|'all' }
 * @returns {Array} Matching artifacts
 */
function searchArtifacts(query, options = {})

/**
 * Get specific artifact by type and name
 * @param {string} type - 'skill', 'command', or 'package'
 * @param {string} name - Artifact name
 * @returns {Object|null} Artifact metadata or null if not found
 */
function getArtifact(type, name)

/**
 * List artifacts by category
 * @param {string} category - Category name (e.g., 'document-processing', 'development')
 * @returns {Array} Artifacts in category
 */
function listByCategory(category)
```

**Expected Behavior:**

```javascript
const freeCatalog = loadFreeCatalog();
// Returns: { skills: [{ name: 'managing-claude-context', ... }], commands: [], packages: [{ name: 'core-essentials', ... }] }

const catalog = loadCatalog();
// Returns: { skills: [...free + premium...], commands: [...], packages: [...], tier: 'premium' }

const results = searchArtifacts('pdf', { tier: 'all', type: 'all' });
// Returns: [{ type: 'skill', name: 'pdf', description: '...', tier: 'free' }, { type: 'skill', name: 'advanced-pdf', description: '...', tier: 'premium', locked: true }]

const artifact = getArtifact('skill', 'managing-claude-context');
// Returns: { name: 'managing-claude-context', version: '0.1.0', description: '...', tier: 'free', ... }

const docArtifacts = listByCategory('document-processing');
// Returns: [{ name: 'pdf', ... }, { name: 'docx', ... }, { name: 'xlsx', ... }]
```

**Catalog File Structure:**

`~/.claude-context-manager/library/free/skills.json`:
```json
{
  "skills": [
    {
      "name": "managing-claude-context",
      "version": "0.1.0",
      "description": "Master skill for AI context engineering",
      "tier": "free",
      "category": "development",
      "size_bytes": null,
      "dependencies": [],
      "source_path": ".claude/skills/managing-claude-context/"
    }
  ]
}
```

`~/.claude-context-manager/library/free/packages.json`:
```json
{
  "packages": [
    {
      "name": "core-essentials",
      "version": "0.1.0",
      "description": "Managing-claude-context skill + essential commands",
      "tier": "free",
      "artifacts": [
        { "type": "skill", "name": "managing-claude-context" }
      ],
      "definition_path": "packages/core-essentials.json"
    }
  ]
}
```

**Implementation Notes:**
- Read from `~/.claude-context-manager/library/free/*.json`
- Premium requires checking license in config.json first
- Search should be case-insensitive
- Match against name, description, category fields
- Return results sorted by relevance (exact match > partial match > description match)

**Edge Cases:**
- Library files don't exist → Return empty catalog with warning
- Invalid JSON in library → Skip invalid file, log warning
- No license but requesting premium → Return free tier only with message
- Empty search query → Return all artifacts

---

### src/lib/package-manager.js

**Purpose**: Install, update, and remove artifacts

**Dependencies**: `utils/file-ops.js`, `lib/registry.js`, `utils/logger.js`

**Functions:**

```javascript
/**
 * Install artifact to target location
 * @param {string} sourcePath - Source artifact path (in repository or cache)
 * @param {string} targetPath - Destination path (~/.claude/skills/... or project/.claude/skills/...)
 * @param {Object} metadata - Artifact metadata { name, type, version, ... }
 * @returns {Object} Installation result { success: true, checksum: '...', backup_path: '...' }
 */
function installArtifact(sourcePath, targetPath, metadata)

/**
 * Uninstall artifact from target location
 * @param {string} targetPath - Artifact installation path
 * @param {Object} options - { backup: true|false }
 * @returns {Object} Uninstall result { success: true, backup_path: '...' }
 */
function uninstallArtifact(targetPath, options = {})

/**
 * Create backup of artifact before update
 * @param {string} artifactPath - Path to artifact
 * @param {string} artifactName - Artifact name
 * @returns {string} Backup directory path
 */
function backupArtifact(artifactPath, artifactName)

/**
 * Validate installation (check files exist and checksums match)
 * @param {string} targetPath - Installation path
 * @param {string} expectedChecksum - Expected checksum
 * @returns {Object} Validation result { valid: true|false, message: '...' }
 */
function validateInstallation(targetPath, expectedChecksum)
```

**Expected Behavior:**

```javascript
const result = installArtifact(
  '.claude/skills/managing-claude-context/',
  '~/.claude/skills/managing-claude-context/',
  { name: 'managing-claude-context', type: 'skill', version: '0.1.0' }
);
// Copies directory, calculates checksum, returns:
// { success: true, checksum: 'a3c7f8e2d1b9...', backup_path: null }

const backupPath = backupArtifact('~/.claude/skills/pdf/', 'pdf');
// Returns: '~/.claude-context-manager/backups/pdf/2025-01-15_143022/'

const result = uninstallArtifact('~/.claude/skills/pdf/', { backup: true });
// Creates backup, removes directory, returns:
// { success: true, backup_path: '~/.claude-context-manager/backups/pdf/2025-01-15_143500/' }

const validation = validateInstallation('~/.claude/skills/pdf/', 'a3c7f8e2d1b9...');
// Returns: { valid: true, message: 'Installation valid' }
```

**Installation Workflow:**

1. Check if target already exists
   - If exists → Create backup automatically
2. Copy source to target using `file-ops.copyDirectory()`
3. Calculate checksum of installed files
4. Validate checksum matches source (optional)
5. Return success result

**Uninstallation Workflow:**

1. Check if target exists
2. If `options.backup === true` → Create backup
3. Remove target directory
4. Return success result with backup path

**Edge Cases:**
- Source doesn't exist → Throw error
- Target already exists with local modifications → Backup, warn user, proceed
- Insufficient disk space → Throw error before copying
- Permission denied → Throw error with helpful message
- Partial copy failure → Clean up partial installation, restore from backup if available

---

### src/lib/license.js (STUB)

**Purpose**: Validate premium license keys (stubbed for v0.2.0)

**Dependencies**: `utils/config.js`

**Functions:**

```javascript
/**
 * Validate license key via API (STUB - always returns invalid)
 * @param {string} key - License key
 * @returns {Promise<Object>} { valid: false, message: 'Premium tier coming Q1 2025' }
 */
async function validateLicense(key)

/**
 * Check if license is active in config
 * @returns {boolean} True if license key exists in config
 */
function isLicenseActive()

/**
 * Get license tier from config
 * @returns {string} 'free' or 'premium' or 'team' or 'enterprise'
 */
function getLicenseTier()
```

**Expected Behavior (v0.2.0 STUB):**

```javascript
const result = await validateLicense('TEST_KEY');
// Returns: { valid: false, tier: 'free', message: 'Premium tier launching Q1 2025. Stay tuned!' }

const active = isLicenseActive();
// Returns: false (always in v0.2.0)

const tier = getLicenseTier();
// Returns: 'free' (always in v0.2.0)
```

**Implementation Notes:**
- For v0.2.0: Always return invalid with "coming soon" message
- For future: Will make HTTP POST to API endpoint
- Cache validation results in config for 24 hours
- Handle network errors gracefully (assume invalid if API unreachable)

---

### src/lib/api-client.js (STUB)

**Purpose**: HTTP client for premium API (stubbed for v0.2.0)

**Dependencies**: Node.js `https` (for future)

**Functions:**

```javascript
/**
 * Validate license key with API (STUB)
 * @param {string} key - License key
 * @returns {Promise<Object>} { valid: false, message: '...' }
 */
async function validateLicenseKey(key)

/**
 * Download premium artifact (STUB)
 * @param {string} artifactName - Artifact to download
 * @returns {Promise<Object>} { success: false, message: '...' }
 */
async function downloadPremiumArtifact(artifactName)
```

**Expected Behavior (v0.2.0 STUB):**

```javascript
const result = await validateLicenseKey('TEST_KEY');
// Returns: { valid: false, message: 'Premium API not yet available' }

const download = await downloadPremiumArtifact('advanced-pdf');
// Returns: { success: false, message: 'Premium downloads coming Q1 2025' }
```

**Implementation Notes:**
- For v0.2.0: Return stub responses immediately
- For future: Will use `https.request()` to make API calls
- Handle timeouts, retries, network errors
- Validate responses before returning

---

## Command Specifications

### src/commands/list.js

**Purpose**: Display available artifacts (skills, commands, packages)

**Dependencies**: `lib/catalog.js`, `lib/registry.js`, `utils/logger.js`

**Usage:**
```bash
ccm list                    # List all free tier artifacts
ccm list --tier premium     # Show premium artifacts (locked if no license)
ccm list --type skill       # Show only skills
ccm list --type package     # Show only packages
ccm ls                      # Alias for list
```

**Expected Output:**

```
Available Artifacts (Free Tier):

Skills:
  ✓ managing-claude-context (v0.1.0) [INSTALLED globally]
     Master skill for AI context engineering

Packages:
  ✓ core-essentials (v0.1.0) [INSTALLED globally]
     Managing-claude-context skill + essential commands
     Includes: 1 skill, 14 commands

Premium Artifacts: (Locked - Activate license with 'ccm activate LICENSE_KEY')

Skills:
  🔒 advanced-pdf (v1.0.0)
     Advanced PDF processing with OCR and security features
  🔒 enterprise-automation (v1.2.0)
     Comprehensive workflow automation suite

Upgrade to Premium: $9/month
  Run 'ccm activate LICENSE_KEY' to unlock premium artifacts
```

**Implementation Workflow:**

1. Parse command line arguments (`--tier`, `--type`)
2. Load catalog using `catalog.loadCatalog()`
3. Load registry using `registry.getInstalledArtifacts('global')` and all projects
4. Filter artifacts based on `--type` flag
5. For each artifact:
   - Check if installed (show ✓ or nothing)
   - Check if locked (show 🔒 for premium without license)
   - Format output with colors
6. Group by type (Skills, Commands, Packages)
7. Show upgrade message if premium artifacts are locked

**Output Format:**

```javascript
// Use logger for colors
logger.log('Available Artifacts (Free Tier):', 'bright');
console.log('');
logger.log('Skills:', 'bright');
artifacts.forEach(artifact => {
  const installedMark = artifact.installed ? '✓' : ' ';
  const installedText = artifact.installed ? `[INSTALLED ${artifact.installed_target}]` : '';
  logger.log(`  ${installedMark} ${artifact.name} (v${artifact.version}) ${installedText}`, artifact.installed ? 'green' : 'reset');
  console.log(`     ${artifact.description}`);
});
```

**Edge Cases:**
- No artifacts in catalog → Show "No artifacts available" message
- Network error loading premium → Show warning, continue with free tier
- Invalid --type argument → Show error with valid options
- Registry corrupted → Show artifacts without installation status

---

### src/commands/install.js (HIGH PRIORITY)

**Purpose**: Install artifacts to target location (global or project)

**Dependencies**: `lib/catalog.js`, `lib/package-manager.js`, `lib/registry.js`, `utils/logger.js`, `utils/config.js`

**Usage:**
```bash
ccm install --skill managing-claude-context --global
ccm install --package core-essentials --global
ccm install --skill pdf --project
ccm install --skill pdf --project /path/to/project
ccm i --skill pdf -g  # Aliases
```

**Expected Output:**

```
Installing to global (~/.claude/):

Resolving package: core-essentials
  ✓ Found: core-essentials (v0.1.0)
  ℹ Includes:
    - managing-claude-context (skill)
    - /managing-claude-context:create-edit-skill (command)
    - /managing-claude-context:create-edit-command (command)
    - ... (12 more commands)

Checking for conflicts...
  ⚠ managing-claude-context already installed
  ℹ Creating backup: ~/.claude-context-manager/backups/managing-claude-context/2025-01-15_143022/

Installing artifacts:
  ⏳ Copying managing-claude-context...
  ✓ Installed managing-claude-context (skill) [15.2 MB]
  ⏳ Copying commands...
  ✓ Installed 14 commands [128 KB]

Updating registry...
  ✓ Registry updated

Installation complete!

Installed artifacts are now available in Claude Code.
Restart Claude Code if it's currently running.
```

**Implementation Workflow:**

1. **Parse arguments:**
   - Extract type (`--skill`, `--command`, `--package`)
   - Extract target (`--global`, `--project [path]`)
   - Validate required arguments present

2. **Resolve artifact:**
   - Use `catalog.getArtifact(type, name)` to find artifact
   - If package: resolve all included artifacts
   - Check if artifact exists in catalog
   - If premium and no license: show upgrade message, exit

3. **Check for conflicts:**
   - Use `registry.isInstalled(target, name)` for each artifact
   - If already installed:
     - Detect local modifications (compare checksums)
     - Warn user if modifications exist
     - Offer to create backup

4. **Create backups:**
   - For each existing artifact: `package-manager.backupArtifact()`
   - Show backup locations

5. **Install artifacts:**
   - Determine source path (from bundled artifacts or cache)
   - Determine target path (global ~/.claude/ or project .claude/)
   - For each artifact:
     - `package-manager.installArtifact(source, target, metadata)`
     - Show progress
     - Calculate checksum

6. **Update registry:**
   - `registry.addArtifact(target, artifact)` for each installed artifact
   - Save registry

7. **Show completion message:**
   - List installed artifacts
   - Show next steps (restart Claude Code)

**Argument Parsing:**

```javascript
const args = process.argv.slice(2); // ['install', '--skill', 'pdf', '--global']

const flags = {
  type: null,  // 'skill', 'command', 'package'
  name: null,  // artifact name
  target: null // 'global' or project path
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skill') {
    flags.type = 'skill';
    flags.name = args[++i];
  } else if (args[i] === '--command') {
    flags.type = 'command';
    flags.name = args[++i];
  } else if (args[i] === '--package') {
    flags.type = 'package';
    flags.name = args[++i];
  } else if (args[i] === '--global' || args[i] === '-g') {
    flags.target = 'global';
  } else if (args[i] === '--project' || args[i] === '-p') {
    flags.target = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : process.cwd();
  }
}

// Validate
if (!flags.type || !flags.name) {
  logger.error('Missing required arguments: --skill, --command, or --package <name>');
  process.exit(1);
}
if (!flags.target) {
  logger.error('Missing target: --global or --project [path]');
  process.exit(1);
}
```

**Edge Cases:**
- Artifact not found in catalog → Error with suggestion to run `ccm list`
- Target directory doesn't exist → Create automatically (for project installs)
- Disk space insufficient → Error before starting copy
- Permission denied → Error with suggestion to check permissions
- Source artifact missing → Error with message to reinstall package
- Partial installation failure → Clean up partial files, restore from backup
- Network error downloading premium → Show offline message, fail gracefully

---

### src/commands/init.js (HIGH PRIORITY)

**Purpose**: Initialize project with Claude Code artifacts

**Dependencies**: `commands/install.js`, `utils/logger.js`, `utils/config.js`

**Usage:**
```bash
ccm init                     # Initialize current directory
ccm init /path/to/project    # Initialize specific project
ccm init --package core-essentials  # Use specific package (default: core-essentials)
```

**Expected Output:**

```
Initializing Claude Code in current project...

Project: /Users/vmks/my-project
Creating .claude/ directory...
  ✓ Created /Users/vmks/my-project/.claude/

Recommended package: core-essentials
  ✓ Managing-claude-context skill + 14 commands

Proceed with installation? (Y/n): y

Installing core-essentials to project...
  ⏳ Copying managing-claude-context...
  ✓ Installed managing-claude-context (skill) [15.2 MB]
  ✓ Installed 14 commands [128 KB]

✓ Project initialized successfully!

Next steps:
  1. Open project in Claude Code
  2. Try: /managing-claude-context:create-edit-skill
  3. Check: .claude/skills/managing-claude-context/QUICK_START.md
```

**Implementation Workflow:**

1. **Determine project path:**
   - If argument provided: use that path
   - Otherwise: use `process.cwd()`

2. **Check if .claude/ exists:**
   - If exists: Ask user if they want to proceed (might overwrite)
   - If not exists: Create directory

3. **Recommend package:**
   - Default: `core-essentials`
   - If `--package` flag: use specified package
   - Show package contents

4. **Prompt for confirmation:**
   - Ask: "Proceed with installation? (Y/n): "
   - If no: exit
   - If yes: continue

5. **Install package:**
   - Use `install.js` logic internally
   - Install to project directory (not global)
   - Show progress

6. **Show completion message:**
   - Next steps
   - Link to documentation

**Interactive Prompt:**

```javascript
const readline = require('readline');

function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Usage
const answer = await promptUser('Proceed with installation? (Y/n): ');
if (answer === 'n' || answer === 'no') {
  logger.info('Installation cancelled');
  process.exit(0);
}
```

**Edge Cases:**
- Project path doesn't exist → Create directory (with confirmation)
- .claude/ already exists with artifacts → Warn, ask to proceed
- Not a git repository → Warn that .claude/ should be in .gitignore
- Permission denied creating directory → Error with suggestion
- Installation fails mid-way → Clean up partial installation

---

### src/commands/status.js

**Purpose**: Show installation status (what's installed where)

**Dependencies**: `lib/registry.js`, `lib/catalog.js`, `utils/logger.js`, `utils/config.js`, `utils/file-ops.js`

**Usage:**
```bash
ccm status               # Show all installations
ccm status --global      # Show global installations only
ccm status --project     # Show current project installations only
ccm st                   # Alias
```

**Expected Output:**

```
Installation Status:

Global (~/.claude/):
  ✓ managing-claude-context (skill) v0.1.0
     Installed: 2025-01-15 14:30:22
     Modified: No (checksum matches)
     Source: claude-skills-builder-vladks

  ✓ core-essentials (package) v0.1.0
     Installed: 2025-01-15 14:30:22
     Includes: 1 skill, 14 commands

Project (/Users/vmks/my-project/.claude/):
  ✓ pdf (skill) v1.0.0
     Installed: 2025-01-16 09:15:00
     Modified: Yes (checksum mismatch)
     ⚠ Local changes detected - run 'ccm update' to sync

Total: 2 global installations, 1 project installation
```

**Implementation Workflow:**

1. **Parse arguments:**
   - `--global` → Show global only
   - `--project` → Show current project only
   - No flag → Show all

2. **Load registry:**
   - `registry.getInstalledArtifacts('global')`
   - `registry.getInstalledArtifacts(projectPath)` for each project

3. **For each installation:**
   - Get artifact metadata from registry
   - Check if files still exist
   - Calculate current checksum
   - Compare with registry checksum
   - Detect if modified

4. **Format output:**
   - Group by target (global, then projects)
   - Show artifact details
   - Highlight modifications

5. **Show summary:**
   - Total counts

**Checksum Comparison:**

```javascript
const artifact = registry.getArtifact('global', 'pdf');
const installedPath = path.join(config.getGlobalClaudeDir(), 'skills', 'pdf');

if (fs.existsSync(installedPath)) {
  const currentChecksum = fileOps.calculateDirectoryChecksum(installedPath);
  const modified = currentChecksum !== artifact.checksum;

  if (modified) {
    logger.warn(`    Modified: Yes (checksum mismatch)`);
    logger.warn(`    ⚠ Local changes detected - run 'ccm update' to sync`);
  } else {
    logger.success(`    Modified: No (checksum matches)`);
  }
} else {
  logger.error(`    ✗ Files not found at expected location`);
}
```

**Edge Cases:**
- No installations → Show "No installations found" message
- Registry empty → Show empty status
- Installed files missing → Show warning
- Registry corrupted → Attempt to repair, or show error
- Project not in registry but .claude/ exists → Show warning about untracked installation

---

### src/commands/search.js

**Purpose**: Search available artifacts by query

**Dependencies**: `lib/catalog.js`, `utils/logger.js`

**Usage:**
```bash
ccm search pdf                    # Search for "pdf"
ccm search "context management"   # Multi-word query
ccm search automation --tier premium  # Search premium tier only
ccm search --type skill            # Search skills only
```

**Expected Output:**

```
Search results for "pdf":

Skills:
  ✓ pdf (v0.5.0) - Free
     Comprehensive PDF manipulation toolkit for extracting text and tables
     Category: document-processing

  🔒 advanced-pdf (v1.0.0) - Premium
     Advanced PDF processing with OCR and security features
     Category: document-processing
     Unlock with: ccm activate LICENSE_KEY

Commands:
  ✓ /pdf-extract (v0.5.0) - Free
     Extract text and tables from PDF documents

Packages:
  ✓ document-suite (v1.0.0) - Free
     Complete document processing solution (PDF, DOCX, XLSX)
     Includes: 3 skills, 8 commands

Found 4 results (2 free, 2 premium)
```

**Implementation Workflow:**

1. **Parse arguments:**
   - Extract query string
   - Extract `--tier` flag (free, premium, all)
   - Extract `--type` flag (skill, command, package, all)

2. **Search catalog:**
   - `catalog.searchArtifacts(query, { tier, type })`
   - Returns matching artifacts

3. **Format results:**
   - Group by type
   - Show tier (free/premium)
   - Show lock icon for premium without license
   - Show description and category
   - Highlight matching terms (optional)

4. **Show summary:**
   - Total count
   - Free vs premium count

**Search Algorithm (in catalog.js):**

```javascript
function searchArtifacts(query, options = {}) {
  const { tier = 'all', type = 'all' } = options;

  const catalog = tier === 'premium' ? loadPremiumCatalog() :
                  tier === 'free' ? loadFreeCatalog() :
                  loadCatalog();

  const allArtifacts = [
    ...catalog.skills.map(s => ({ ...s, type: 'skill' })),
    ...catalog.commands.map(c => ({ ...c, type: 'command' })),
    ...catalog.packages.map(p => ({ ...p, type: 'package' }))
  ];

  const queryLower = query.toLowerCase();

  return allArtifacts.filter(artifact => {
    // Filter by type
    if (type !== 'all' && artifact.type !== type) return false;

    // Match query
    const nameMatch = artifact.name.toLowerCase().includes(queryLower);
    const descMatch = artifact.description.toLowerCase().includes(queryLower);
    const catMatch = artifact.category && artifact.category.toLowerCase().includes(queryLower);

    return nameMatch || descMatch || catMatch;
  });
}
```

**Edge Cases:**
- Empty query → Show all artifacts (or error asking for query)
- No results → Show "No results found" message with suggestion
- Invalid tier/type → Show error with valid options
- Network error loading premium → Search free tier only with warning

---

### src/commands/update.js

**Purpose**: Update installed artifacts with backup support

**Dependencies**: `lib/registry.js`, `lib/package-manager.js`, `lib/catalog.js`, `utils/logger.js`, `utils/file-ops.js`

**Usage:**
```bash
ccm update                        # Update all global + project installations
ccm update --global               # Update global installations only
ccm update --project              # Update current project only
ccm update --skill pdf --global   # Update specific artifact
ccm up                            # Alias
```

**Expected Output:**

```
Checking for updates...

Global (~/.claude/):
  ℹ managing-claude-context (skill)
    Current: v0.1.0
    Available: v0.2.0
    Modified: Yes (local changes detected)

    ⚠ Local changes will be backed up before updating
    Backup location: ~/.claude-context-manager/backups/managing-claude-context/2025-01-15_143500/

    Proceed with update? (Y/n): y

    ⏳ Creating backup...
    ✓ Backup created: managing-claude-context/2025-01-15_143500/

    ⏳ Updating managing-claude-context...
    ✓ Updated to v0.2.0 [15.4 MB]

    ✓ Registry updated

Project (/Users/vmks/my-project/.claude/):
  ✓ pdf (skill) - Already up to date (v1.0.0)

Update complete!
  Updated: 1 artifact
  Backed up: 1 artifact
  Backups stored in: ~/.claude-context-manager/backups/
```

**Implementation Workflow:**

1. **Parse arguments:**
   - Determine target (global, project, specific artifact)

2. **Load registry and catalog:**
   - `registry.getInstalledArtifacts(target)`
   - `catalog.loadCatalog()`

3. **Check each installed artifact:**
   - Compare installed version with catalog version
   - If versions differ → Update available
   - Calculate checksums to detect local modifications

4. **For each update:**
   - If local modifications detected:
     - Warn user
     - Show backup location
     - Prompt for confirmation
   - Create backup: `package-manager.backupArtifact()`
   - Install new version: `package-manager.installArtifact()`
   - Update registry: `registry.updateArtifact()`

5. **Show summary:**
   - How many updated
   - How many backed up
   - Backup locations

**Version Comparison:**

```javascript
const installedArtifacts = registry.getInstalledArtifacts('global');
const catalog = catalog.loadCatalog();

for (const installed of installedArtifacts) {
  const latest = catalog.getArtifact(installed.type, installed.name);

  if (!latest) {
    logger.warn(`  ⚠ ${installed.name} not found in catalog`);
    continue;
  }

  if (latest.version !== installed.version) {
    logger.info(`  ℹ ${installed.name} (${installed.type})`);
    logger.info(`    Current: v${installed.version}`);
    logger.info(`    Available: v${latest.version}`);

    // Check for local modifications
    const installedPath = getInstalledPath(installed);
    const currentChecksum = fileOps.calculateDirectoryChecksum(installedPath);
    const modified = currentChecksum !== installed.checksum;

    if (modified) {
      logger.warn(`    Modified: Yes (local changes detected)`);
      logger.warn(`    ⚠ Local changes will be backed up before updating`);
    }

    // Perform update (with confirmation if modified)
    await updateArtifact(installed, latest, modified);
  } else {
    logger.success(`  ✓ ${installed.name} - Already up to date (v${installed.version})`);
  }
}
```

**Edge Cases:**
- No updates available → Show "All up to date" message
- Artifact removed from catalog → Warn, ask if should uninstall
- Update fails mid-way → Restore from backup automatically
- Disk space insufficient → Error before starting update
- Permission denied → Error with suggestion
- User cancels update with local modifications → Skip that artifact, continue with others

---

### src/commands/remove.js

**Purpose**: Uninstall artifacts

**Dependencies**: `lib/registry.js`, `lib/package-manager.js`, `utils/logger.js`

**Usage:**
```bash
ccm remove --skill pdf --global
ccm remove --package core-essentials --project
ccm rm --skill pdf -g   # Alias
```

**Expected Output:**

```
Removing from global (~/.claude/):

  ⚠ This will remove:
    - pdf (skill) v1.0.0
    - /pdf-extract (command)
    - /pdf-merge (command)

  ⚠ A backup will be created before removal

  Proceed with removal? (Y/n): y

  ⏳ Creating backup...
  ✓ Backup created: ~/.claude-context-manager/backups/pdf/2025-01-15_144000/

  ⏳ Removing pdf...
  ✓ Removed pdf (skill)
  ✓ Removed 2 commands

  ✓ Registry updated

Removal complete!
  Backup location: ~/.claude-context-manager/backups/pdf/2025-01-15_144000/
  Restore with: cp -r ~/.claude-context-manager/backups/pdf/2025-01-15_144000/ ~/.claude/skills/pdf/
```

**Implementation Workflow:**

1. **Parse arguments:**
   - Extract type, name, target
   - Validate required arguments

2. **Check if installed:**
   - `registry.isInstalled(target, name)`
   - If not installed → Error

3. **Determine what will be removed:**
   - If package: list all included artifacts
   - Show list to user

4. **Prompt for confirmation:**
   - Ask: "Proceed with removal? (Y/n): "
   - If no: exit

5. **Create backup:**
   - `package-manager.backupArtifact()`
   - Show backup location

6. **Remove artifacts:**
   - `package-manager.uninstallArtifact()`
   - Remove files from target location

7. **Update registry:**
   - `registry.removeArtifact()`

8. **Show completion:**
   - Backup location
   - Restore instructions

**Edge Cases:**
- Artifact not installed → Error
- Permission denied removing files → Error with suggestion
- Artifact is dependency of other installed artifact → Warn, ask for confirmation
- Removal fails mid-way → Restore from backup automatically
- User cancels → Exit without changes

---

### src/commands/activate.js (STUB)

**Purpose**: Activate premium license (stubbed for v0.2.0)

**Dependencies**: `lib/license.js`, `utils/config.js`, `utils/logger.js`

**Usage:**
```bash
ccm activate LICENSE_KEY
```

**Expected Output (v0.2.0 STUB):**

```
Premium Tier Activation

License key: LICENSE_KEY

⏳ Validating license...

✗ Premium tier not yet available

Premium features are launching in Q1 2025!

What's coming:
  ✓ Professional-grade skills and commands
  ✓ Advanced automation agents
  ✓ Priority support
  ✓ Regular updates with new packages

Pricing:
  - Individual: $9/month
  - Team (5 users): $29/month
  - Enterprise: Custom pricing

Stay updated:
  - Newsletter: https://vladks.com/newsletter
  - GitHub: https://github.com/vladks/claude-context-manager/releases
  - Email: vlad@vladks.com

Thank you for your interest!
```

**Implementation Workflow (v0.2.0):**

1. **Parse license key from arguments**
2. **Call `license.validateLicense(key)`** (returns stub response)
3. **Show "coming soon" message**
4. **Show premium features preview**
5. **Show pricing and signup links**

**Future Implementation (v0.3.0+):**

1. Parse license key
2. Validate with API: `license.validateLicense(key)`
3. If valid:
   - Save to config: `config.license.key = key`
   - Update tier: `config.license.tier = result.tier`
   - Refresh premium catalog
   - Show success message
4. If invalid:
   - Show error message
   - Show signup link

**Edge Cases:**
- No license key provided → Error asking for key
- Network error during validation → Show offline message
- Invalid key format → Validate format before API call
- License expired → Show renewal message with link

---

## Testing Strategies

### Manual Testing Checklist

**Phase 1 - Core Utilities:**

```bash
# Test logger.js
node -e "const l = require('./src/utils/logger'); l.success('Success'); l.error('Error'); l.warn('Warning'); l.info('Info')"
# Expected: Colored output with icons

# Test config.js
node -e "const c = require('./src/utils/config'); console.log(c.readConfig())"
# Expected: Config object printed

node -e "const c = require('./src/utils/config'); const cfg = c.readConfig(); cfg.test = true; c.writeConfig(cfg); console.log(c.readConfig())"
# Expected: Config updated with test=true

# Test file-ops.js
mkdir -p /tmp/test-source /tmp/test-dest
echo "test content" > /tmp/test-source/file.txt
node -e "const f = require('./src/utils/file-ops'); f.copyFile('/tmp/test-source/file.txt', '/tmp/test-dest/file.txt'); console.log('Copied')"
cat /tmp/test-dest/file.txt
# Expected: "test content"

node -e "const f = require('./src/utils/file-ops'); console.log(f.calculateChecksum('/tmp/test-source/file.txt'))"
# Expected: SHA256 hash printed
```

**Phase 2 - Library Modules:**

```bash
# Test registry.js
node -e "const r = require('./src/lib/registry'); console.log(r.getInstalledArtifacts('global'))"
# Expected: Array of installed artifacts (may be empty)

node -e "const r = require('./src/lib/registry'); r.addArtifact('global', { name: 'test', type: 'skill', version: '1.0.0', checksum: 'abc123', installed_at: new Date().toISOString(), source_path: '/test' }); console.log('Added')"
cat ~/.claude-context-manager/registry.json | jq
# Expected: Test artifact in global.artifacts[]

# Test catalog.js
node -e "const c = require('./src/lib/catalog'); console.log(c.loadFreeCatalog())"
# Expected: Free catalog object

node -e "const c = require('./src/lib/catalog'); console.log(c.searchArtifacts('managing'))"
# Expected: managing-claude-context in results
```

**Phase 4 - Commands:**

```bash
# Test list command
ccm list
# Expected: Formatted list of artifacts

ccm list --type skill
# Expected: Only skills listed

# Test install command (most critical)
ccm install --package core-essentials --global
# Expected: Installation workflow with progress

ls ~/.claude/skills/managing-claude-context/
# Expected: Skill files present

cat ~/.claude-context-manager/registry.json | jq
# Expected: core-essentials in global.packages[]

# Test status command
ccm status
# Expected: Show installed artifacts

# Test update command
# First, modify installed file
echo "# Modified" >> ~/.claude/skills/managing-claude-context/SKILL.md

ccm update --global
# Expected: Detect modification, prompt for backup, update

# Test remove command
ccm remove --skill managing-claude-context --global
# Expected: Prompt, backup, remove

ls ~/.claude/skills/
# Expected: managing-claude-context/ gone

ls ~/.claude-context-manager/backups/managing-claude-context/
# Expected: Backup directory present

# Test init command
mkdir -p /tmp/test-project
cd /tmp/test-project

ccm init
# Expected: Create .claude/, prompt for installation

ls .claude/skills/
# Expected: Installed artifacts

# Test search command
ccm search pdf
# Expected: Matching artifacts displayed

# Test activate command (stub)
ccm activate TEST_KEY
# Expected: "Coming soon" message
```

### End-to-End Testing Scenarios

**Scenario 1: Fresh Global Installation**

```bash
# Start fresh
rm -rf ~/.claude-context-manager/
rm -rf ~/.claude/skills/managing-claude-context/

# Reinstall package
npm install -g @vladimir-ks/claude-context-manager --force

# Verify home directory created
ls ~/.claude-context-manager/
# Expected: config.json, registry.json, cache/, backups/, library/

# List available
ccm list
# Expected: core-essentials package listed

# Install
ccm install --package core-essentials --global
# Expected: Installation success

# Verify files
ls ~/.claude/skills/managing-claude-context/
# Expected: Skill files present

# Check status
ccm status
# Expected: Show managing-claude-context installed
```

**Scenario 2: Project Initialization**

```bash
# Create test project
mkdir -p /tmp/test-project
cd /tmp/test-project

# Initialize
ccm init

# Verify .claude/ created
ls .claude/skills/
# Expected: managing-claude-context/

# Check status
ccm status --project
# Expected: Show project installation
```

**Scenario 3: Update with Local Modifications**

```bash
# Install artifact
ccm install --skill managing-claude-context --global

# Modify file
echo "# My modification" >> ~/.claude/skills/managing-claude-context/SKILL.md

# Update
ccm update --global
# Expected: Detect modification, create backup, prompt, update

# Verify backup
ls ~/.claude-context-manager/backups/managing-claude-context/
# Expected: Timestamped backup directory

# Verify modification backed up
grep "My modification" ~/.claude-context-manager/backups/managing-claude-context/*/SKILL.md
# Expected: Found in backup
```

**Scenario 4: Remove with Backup**

```bash
# Install
ccm install --skill managing-claude-context --global

# Remove
ccm remove --skill managing-claude-context --global
# Expected: Prompt, create backup, remove

# Verify removed
ls ~/.claude/skills/
# Expected: managing-claude-context/ not present

# Verify backup exists
ls ~/.claude-context-manager/backups/managing-claude-context/
# Expected: Backup directory present
```

### Regression Testing

**After Each Change:**

1. **Verify basic commands still work:**
   ```bash
   ccm --version
   ccm --help
   ccm list
   ```

2. **Verify home directory intact:**
   ```bash
   cat ~/.claude-context-manager/config.json | jq
   cat ~/.claude-context-manager/registry.json | jq
   ```

3. **Verify registry not corrupted:**
   ```bash
   node -e "const r = require('./src/lib/registry'); console.log(r.getInstalledArtifacts('global'))"
   ```

4. **Verify files not corrupted:**
   ```bash
   node -e "const f = require('./src/utils/file-ops'); console.log(f.calculateDirectoryChecksum('~/.claude/skills/managing-claude-context/'))"
   ```

---

## Error Handling Patterns

### Standard Error Format

All commands should use consistent error handling:

```javascript
try {
  // Command logic
} catch (error) {
  logger.error(`Command failed: ${error.message}`);

  // Show helpful context
  if (error.code === 'ENOENT') {
    logger.info('File or directory not found');
    logger.info(`Path: ${error.path}`);
  } else if (error.code === 'EACCES') {
    logger.error('Permission denied');
    logger.info('Try running with sudo or check file permissions');
  } else if (error.code === 'ENOSPC') {
    logger.error('Insufficient disk space');
    logger.info('Free up space and try again');
  }

  // Show support info
  console.log('');
  logger.info('Need help?');
  logger.info('  Issues: https://github.com/vladks/claude-context-manager/issues');
  logger.info('  Email: vlad@vladks.com');

  process.exit(1);
}
```

### Input Validation

**Validate arguments early:**

```javascript
function validateInstallArgs(flags) {
  const errors = [];

  if (!flags.type) {
    errors.push('Missing required flag: --skill, --command, or --package');
  }

  if (!flags.name) {
    errors.push('Missing artifact name');
  }

  if (!flags.target) {
    errors.push('Missing target: --global or --project [path]');
  }

  if (errors.length > 0) {
    logger.error('Invalid arguments:');
    errors.forEach(err => console.log(`  - ${err}`));
    console.log('');
    logger.info('Usage: ccm install --skill <name> --global');
    logger.info('See: ccm help install');
    process.exit(1);
  }

  return true;
}
```

### Graceful Degradation

**Handle missing optional features:**

```javascript
// Loading premium catalog
try {
  const premiumCatalog = loadPremiumCatalog();
  return { ...freeCatalog, ...premiumCatalog };
} catch (error) {
  logger.warn('Could not load premium catalog (network issue or no license)');
  logger.info('Showing free tier only');
  return freeCatalog;
}
```

### User-Friendly Messages

**Don't just throw errors - explain what happened and what to do:**

```javascript
// Bad
throw new Error('ENOENT');

// Good
if (!fs.existsSync(sourcePath)) {
  logger.error('Source artifact not found');
  logger.info(`Expected location: ${sourcePath}`);
  logger.info('');
  logger.info('This usually means:');
  console.log('  1. The artifact was removed from the package');
  console.log('  2. The package installation is corrupted');
  logger.info('');
  logger.info('Try reinstalling:');
  logger.log('  npm install -g @vladimir-ks/claude-context-manager --force', 'cyan');
  process.exit(1);
}
```

---

## Debugging Guide

### Enable Debug Logging

Add to commands:

```javascript
const DEBUG = process.env.DEBUG === 'true';

function debug(message) {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`);
  }
}

// Usage
debug(`Resolved artifact: ${JSON.stringify(artifact)}`);
debug(`Installing from ${sourcePath} to ${targetPath}`);
```

Run with:
```bash
DEBUG=true ccm install --skill pdf --global
```

### Common Issues and Solutions

**Issue: "Command not found: ccm"**
- **Cause:** Global install didn't work or npm bin not in PATH
- **Debug:**
  ```bash
  which ccm
  npm list -g @vladimir-ks/claude-context-manager
  npm bin -g
  echo $PATH
  ```
- **Fix:**
  ```bash
  npm install -g @vladimir-ks/claude-context-manager --force
  # Or add npm bin to PATH
  export PATH="$(npm bin -g):$PATH"
  ```

**Issue: "Home directory not found"**
- **Cause:** Postinstall script didn't run
- **Debug:**
  ```bash
  ls ~/.claude-context-manager/
  ```
- **Fix:**
  ```bash
  npm install -g @vladimir-ks/claude-context-manager --force
  # Or manually run postinstall
  node scripts/postinstall.js
  ```

**Issue: "Registry file not found"**
- **Cause:** Corrupted home directory or postinstall failed
- **Debug:**
  ```bash
  ls ~/.claude-context-manager/
  cat ~/.claude-context-manager/registry.json
  ```
- **Fix:**
  ```bash
  # Backup existing
  mv ~/.claude-context-manager ~/.claude-context-manager.backup
  # Reinstall
  npm install -g @vladimir-ks/claude-context-manager --force
  ```

**Issue: "Permission denied" during install**
- **Cause:** Insufficient permissions for target directory
- **Debug:**
  ```bash
  ls -la ~/.claude/
  ls -la ~/.claude/skills/
  ```
- **Fix:**
  ```bash
  # Fix permissions
  chmod -R u+rwX ~/.claude/
  # Or use sudo (not recommended for user directories)
  sudo ccm install --skill pdf --global
  ```

**Issue: "Checksum mismatch" during update**
- **Cause:** Local modifications to installed artifact
- **Debug:**
  ```bash
  # Calculate current checksum
  node -e "const f = require('./src/utils/file-ops'); console.log(f.calculateDirectoryChecksum('~/.claude/skills/managing-claude-context/'))"

  # Compare with registry
  cat ~/.claude-context-manager/registry.json | jq '.installations.global.artifacts[] | select(.name=="managing-claude-context") | .checksum'
  ```
- **Fix:**
  ```bash
  # Update will backup automatically
  ccm update --global

  # Or manually backup and update
  cp -r ~/.claude/skills/managing-claude-context ~/.claude/skills/managing-claude-context.backup
  ccm update --global
  ```

### Debugging Workflow

1. **Check environment:**
   ```bash
   node --version  # Should be v18+
   npm --version   # Should be v9+
   which ccm       # Should show path to global bin
   ```

2. **Check installation:**
   ```bash
   npm list -g @vladimir-ks/claude-context-manager
   ls -la ~/.claude-context-manager/
   ```

3. **Check files:**
   ```bash
   cat ~/.claude-context-manager/config.json | jq
   cat ~/.claude-context-manager/registry.json | jq
   ls ~/.claude/skills/
   ```

4. **Test modules:**
   ```bash
   node -e "const c = require('./src/utils/config'); console.log(c.readConfig())"
   node -e "const r = require('./src/lib/registry'); console.log(r.getInstalledArtifacts('global'))"
   ```

5. **Add debug logging:**
   ```bash
   DEBUG=true ccm install --skill pdf --global
   ```

---

## Code Examples

### Complete Example: install.js

```javascript
#!/usr/bin/env node

const path = require('path');
const catalog = require('../lib/catalog');
const packageManager = require('../lib/package-manager');
const registry = require('../lib/registry');
const config = require('../utils/config');
const logger = require('../utils/logger');

async function install(flags) {
  try {
    // 1. Validate arguments
    if (!flags.type || !flags.name || !flags.target) {
      logger.error('Missing required arguments');
      logger.info('Usage: ccm install --skill <name> --global');
      process.exit(1);
    }

    // 2. Resolve target path
    const targetBase = flags.target === 'global'
      ? config.getGlobalClaudeDir()
      : config.getProjectClaudeDir(flags.target);

    logger.log(`\nInstalling to ${flags.target === 'global' ? 'global' : 'project'} (${targetBase}):\n`, 'bright');

    // 3. Load catalog
    const cat = catalog.loadCatalog();

    // 4. Find artifact
    const artifact = catalog.getArtifact(flags.type, flags.name);
    if (!artifact) {
      logger.error(`Artifact not found: ${flags.name}`);
      logger.info('Run "ccm list" to see available artifacts');
      process.exit(1);
    }

    logger.success(`Found: ${artifact.name} (v${artifact.version})`);
    logger.info(`Description: ${artifact.description}`);

    // 5. Check if premium and no license
    if (artifact.tier === 'premium' && artifact.locked) {
      logger.error('This is a premium artifact');
      logger.info('Activate your license: ccm activate LICENSE_KEY');
      logger.info('Or upgrade: $9/month for premium access');
      process.exit(1);
    }

    // 6. Check for conflicts
    logger.progress('Checking for conflicts...');
    const installed = registry.isInstalled(flags.target, artifact.name);

    if (installed) {
      logger.warn(`${artifact.name} already installed`);

      // Create backup
      const backupPath = await packageManager.backupArtifact(
        path.join(targetBase, flags.type + 's', artifact.name),
        artifact.name
      );
      logger.info(`Backup created: ${backupPath}`);
    }

    // 7. Determine source path
    const sourcePath = path.join(__dirname, '..', '..', artifact.source_path || `.claude/${flags.type}s/${artifact.name}`);

    // 8. Determine target path
    const targetPath = path.join(targetBase, `${flags.type}s`, artifact.name);

    // 9. Install
    logger.progress(`Installing ${artifact.name}...`);
    const result = await packageManager.installArtifact(sourcePath, targetPath, artifact);

    if (result.success) {
      logger.success(`Installed ${artifact.name} (${flags.type})`);

      // 10. Update registry
      logger.progress('Updating registry...');
      registry.addArtifact(flags.target, {
        name: artifact.name,
        type: flags.type,
        version: artifact.version,
        checksum: result.checksum,
        installed_at: new Date().toISOString(),
        updated_at: null,
        source_path: artifact.source_path
      });
      logger.success('Registry updated');
    }

    // 11. Show completion message
    logger.log('\n✓ Installation complete!\n', 'green');
    logger.info('Installed artifacts are now available in Claude Code.');
    logger.info('Restart Claude Code if currently running.\n');

  } catch (error) {
    logger.error(`Installation failed: ${error.message}`);

    if (error.code === 'ENOENT') {
      logger.info('Source artifact not found');
      logger.info('Try reinstalling: npm install -g @vladimir-ks/claude-context-manager --force');
    }

    process.exit(1);
  }
}

module.exports = { install };
```

### Complete Example: list.js

```javascript
#!/usr/bin/env node

const catalog = require('../lib/catalog');
const registry = require('../lib/registry');
const logger = require('../utils/logger');

async function list(flags = {}) {
  try {
    const { tier = 'all', type = 'all' } = flags;

    // 1. Load catalog
    logger.progress('Loading catalog...');
    const cat = catalog.loadCatalog();

    // 2. Load registry to check installed
    const globalInstalled = registry.getInstalledArtifacts('global');
    const installedNames = globalInstalled.map(a => a.name);

    // 3. Group artifacts
    const skills = type === 'all' || type === 'skill' ? cat.skills : [];
    const commands = type === 'all' || type === 'command' ? cat.commands : [];
    const packages = type === 'all' || type === 'package' ? cat.packages : [];

    // 4. Show free tier
    if (tier === 'all' || tier === 'free') {
      logger.log('\nAvailable Artifacts (Free Tier):\n', 'bright');

      if (skills.filter(s => s.tier === 'free').length > 0) {
        logger.log('Skills:', 'bright');
        skills.filter(s => s.tier === 'free').forEach(skill => {
          const mark = installedNames.includes(skill.name) ? '✓' : ' ';
          const installed = installedNames.includes(skill.name) ? '[INSTALLED globally]' : '';
          logger.log(`  ${mark} ${skill.name} (v${skill.version}) ${installed}`, mark === '✓' ? 'green' : 'reset');
          console.log(`     ${skill.description}`);
        });
        console.log('');
      }

      if (packages.filter(p => p.tier === 'free').length > 0) {
        logger.log('Packages:', 'bright');
        packages.filter(p => p.tier === 'free').forEach(pkg => {
          const mark = installedNames.includes(pkg.name) ? '✓' : ' ';
          const installed = installedNames.includes(pkg.name) ? '[INSTALLED globally]' : '';
          logger.log(`  ${mark} ${pkg.name} (v${pkg.version}) ${installed}`, mark === '✓' ? 'green' : 'reset');
          console.log(`     ${pkg.description}`);
          console.log(`     Includes: ${pkg.artifacts.length} artifact(s)`);
        });
        console.log('');
      }
    }

    // 5. Show premium tier
    if (tier === 'all' || tier === 'premium') {
      const premiumSkills = skills.filter(s => s.tier === 'premium');

      if (premiumSkills.length > 0) {
        logger.log('Premium Artifacts:', 'bright');
        logger.log('(Locked - Activate license with "ccm activate LICENSE_KEY")\n', 'dim');

        logger.log('Skills:', 'bright');
        premiumSkills.forEach(skill => {
          logger.log(`  🔒 ${skill.name} (v${skill.version})`, 'yellow');
          console.log(`     ${skill.description}`);
        });
        console.log('');
      }

      logger.log('Upgrade to Premium: $9/month', 'bright');
      logger.log('  Run "ccm activate LICENSE_KEY" to unlock premium artifacts\n', 'cyan');
    }

  } catch (error) {
    logger.error(`Failed to load catalog: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { list };
```

---

## Summary

This guide provides complete specifications for implementing Claude Context Manager v0.2.0. All utilities, library modules, and commands are specified with:

- ✅ Input/output formats
- ✅ Error handling patterns
- ✅ Edge cases
- ✅ Implementation examples
- ✅ Testing strategies
- ✅ Debugging approaches

**Next Steps:**

1. ✅ Complete Phase 0 documentation (this file)
2. ⏳ Create `/load-code-cli` command
3. ⏳ Update README with developer section
4. ⏳ Implement Phase 1: Core utilities
5. ⏳ Implement Phase 2: Library modules
6. ⏳ Implement Phase 3: Package definitions
7. ⏳ Implement Phase 4: Commands
8. ⏳ Implement Phase 5: Router integration
9. ⏳ Implement Phase 6: Testing and validation

**Estimated Total Effort:** 25-38 hours (15-25 with AI assistance)

---

**Document Status:** APPROVED for v0.2.0 implementation
**Last Updated:** 2025-01-15
**Author:** Vladimir K.S.
