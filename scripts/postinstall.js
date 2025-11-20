#!/usr/bin/env node

/**
 * Claude Context Manager - Post-Install Script
 *
 * Sets up ~/.claude-context-manager/ directory structure on first install
 * Initializes configuration and registry files
 * Displays welcome message with getting started instructions
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const CONFIG_FILE = path.join(HOME_DIR, 'config.json');
const REGISTRY_FILE = path.join(HOME_DIR, 'registry.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    return true;
  }
  return false;
}

function createConfig() {
  const config = {
    version: '0.1.0',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    license: {
      key: null,
      tier: 'free',
      activated: null,
      expires: null,
      last_validated: null
    },
    api: {
      endpoint: 'https://api.claude-context-manager.com/v1',
      timeout: 10000,
      retry_attempts: 3
    },
    preferences: {
      check_updates_on_list: true,
      auto_backup_on_update: true,
      confirm_premium_installs: false,
      cache_ttl_hours: 24
    },
    analytics: {
      enabled: false,
      anonymous_usage: false
    }
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function createRegistry() {
  const registry = {
    version: '0.1.0',
    source_repository: process.cwd(),
    installations: {
      global: {
        location: path.join(os.homedir(), '.claude'),
        artifacts: [],
        packages: []
      },
      projects: []
    }
  };

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), { mode: 0o644 });
}

function createLibraryMetadata() {
  const libraryDir = path.join(HOME_DIR, 'library');
  const freeDir = path.join(libraryDir, 'free');
  const premiumDir = path.join(libraryDir, 'premium');

  createDirectory(freeDir);
  createDirectory(premiumDir);

  // Free tier artifacts metadata
  const freeSkills = {
    skills: [
      {
        name: 'managing-claude-context',
        version: '0.1.0',
        description: 'Master skill for AI context engineering',
        tier: 'free',
        category: 'development',
        size_bytes: null,
        dependencies: [],
        source_path: '.claude/skills/managing-claude-context/'
      },
      {
        name: 'doc-refactoring',
        version: '0.1.0',
        description: 'Combat documentation bloat through intelligent refactoring',
        tier: 'free',
        category: 'documentation',
        size_bytes: null,
        dependencies: [],
        source_path: '.claude/skills/doc-refactoring/'
      }
    ]
  };

  const freePackages = {
    packages: [
      {
        name: 'core-essentials',
        version: '0.1.0',
        description: 'Managing-claude-context skill + essential commands',
        tier: 'free',
        category: 'development',
        artifacts: [
          { type: 'skill', name: 'managing-claude-context' }
        ],
        definition_path: 'packages/core-essentials.json'
      },
      {
        name: 'doc-refactoring',
        version: '0.1.0',
        description: 'Combat documentation bloat through intelligent refactoring',
        tier: 'free',
        category: 'documentation',
        artifacts: [
          { type: 'skill', name: 'doc-refactoring' },
          { type: 'command_group', name: 'doc-refactoring' }
        ],
        definition_path: 'packages/doc-refactoring.json'
      }
    ]
  };

  // Premium tier placeholders (shows what's available after activation)
  const premiumSkills = {
    skills: [
      {
        name: 'advanced-pdf',
        version: '1.0.0',
        description: 'Advanced PDF processing with OCR and security features',
        tier: 'premium',
        category: 'document-processing',
        locked: true
      },
      {
        name: 'enterprise-automation',
        version: '1.2.0',
        description: 'Comprehensive workflow automation suite',
        tier: 'premium',
        category: 'automation',
        locked: true
      }
    ]
  };

  fs.writeFileSync(
    path.join(freeDir, 'skills.json'),
    JSON.stringify(freeSkills, null, 2)
  );

  fs.writeFileSync(
    path.join(freeDir, 'packages.json'),
    JSON.stringify(freePackages, null, 2)
  );

  fs.writeFileSync(
    path.join(premiumDir, 'skills.json'),
    JSON.stringify(premiumSkills, null, 2)
  );
}

function installGlobalCommands() {
  const globalCommands = path.join(os.homedir(), '.claude', 'commands');
  const sourceCommands = path.join(__dirname, '..', '.claude', 'commands');

  // Create global commands directory if doesn't exist
  if (!fs.existsSync(globalCommands)) {
    fs.mkdirSync(globalCommands, { recursive: true, mode: 0o755 });
  }

  // Check if source commands directory exists
  if (!fs.existsSync(sourceCommands)) {
    log('⚠ No commands found in package', 'yellow');
    return;
  }

  // Load file operations utility for recursive copying
  const fileOps = require('../src/utils/file-ops');

  // Copy all commands from package to global directory (files and nested directories)
  const entries = fs.readdirSync(sourceCommands, { withFileTypes: true });

  if (entries.length === 0) {
    log('⚠ No command files found in package', 'yellow');
    return;
  }

  let installedCount = 0;
  let installedDirs = 0;

  entries.forEach(entry => {
    const source = path.join(sourceCommands, entry.name);
    const dest = path.join(globalCommands, entry.name);

    try {
      if (entry.isDirectory()) {
        // Copy nested command directories recursively
        fileOps.copyDirectory(source, dest);
        installedDirs++;
      } else if (entry.name.endsWith('.md')) {
        // Copy individual command files
        fileOps.copyFile(source, dest);
        installedCount++;
      }
    } catch (error) {
      log(`⚠ Failed to install ${entry.name}: ${error.message}`, 'yellow');
    }
  });

  if (installedCount > 0 || installedDirs > 0) {
    const summary = [];
    if (installedCount > 0) summary.push(`${installedCount} command(s)`);
    if (installedDirs > 0) summary.push(`${installedDirs} command group(s)`);
    log(`✓ Installed ${summary.join(' and ')} globally`, 'green');
    log(`  ${globalCommands}/`, 'cyan');
  }
}

function syncClaudeAdditions() {
  try {
    // Load sync engine
    const syncEngine = require('../src/lib/sync-engine');

    // Perform full sync of CCM files
    const report = syncEngine.syncCCMFiles('global');

    // Log changes
    if (report.added.length > 0) {
      log(`✓ Added ${report.added.length} CCM file(s): ${report.added.join(', ')}`, 'green');
    }
    if (report.updated.length > 0) {
      log(`✓ Updated ${report.updated.length} CCM file(s): ${report.updated.join(', ')}`, 'green');
    }
    if (report.removed.length > 0) {
      log(`✓ Removed ${report.removed.length} CCM file(s) to .trash: ${report.removed.join(', ')}`, 'green');
    }
    if (report.unchanged.length > 0 && report.added.length === 0 && report.updated.length === 0) {
      log(`✓ CCM files up to date (${report.unchanged.length} file(s))`, 'green');
    }

    // Log errors if any
    if (report.errors.length > 0) {
      report.errors.forEach(err => {
        log(`⚠ ${err.operation} ${err.file}: ${err.error}`, 'yellow');
      });
    }

    // Always regenerate CLAUDE.md header
    syncEngine.regenerateCLAUDEMdHeader('global');
    log('✓ Regenerated CLAUDE.md header', 'green');

  } catch (error) {
    log(`⚠ Error syncing CCM files: ${error.message}`, 'yellow');
    console.error(error);
  }
}

function autoUpdateArtifacts() {
  try {
    const registry = require('../src/lib/registry');
    const multiLocation = require('../src/lib/multi-location-tracker');
    const conflictDetector = require('../src/lib/conflict-detector');
    const backupManager = require('../src/lib/backup-manager');
    const fileOps = require('../src/utils/file-ops');
    const packageJson = require('../package.json');

    // Load registry
    const reg = registry.load();

    // Check if this is an update (registry exists and has last_auto_update)
    const lastUpdate = registry.getLastAutoUpdate();
    const currentVersion = packageJson.version;

    // If first install or no tracked artifacts, skip auto-update
    const hasArtifacts = (reg.installations.global.artifacts && reg.installations.global.artifacts.length > 0) ||
                         (reg.installations.projects && reg.installations.projects.length > 0);

    if (!hasArtifacts) {
      return; // Nothing to update
    }

    // Check if package version changed
    const packageRegistry = reg.installations.global.packages || [];
    const ccmPackage = packageRegistry.find(p => p.name === 'ccm-core');

    const isUpdate = lastUpdate !== null || (ccmPackage && ccmPackage.version !== currentVersion);

    if (!isUpdate) {
      // First install, mark timestamp but don't update
      registry.updateAutoUpdateTimestamp();
      return;
    }

    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Auto-Update: Updating tracked installations          ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    // Get all multi-location artifacts
    const multiLocationArtifacts = multiLocation.getMultiLocationArtifacts();

    if (multiLocationArtifacts.length === 0) {
      log('✓ No multi-location artifacts to update', 'green');
      registry.updateAutoUpdateTimestamp();
      return;
    }

    log(`Found ${multiLocationArtifacts.length} artifact(s) in multiple locations\n`, 'bright');

    let updatedCount = 0;
    let skippedCount = 0;
    let backedUpCount = 0;

    // Update each multi-location artifact
    multiLocationArtifacts.forEach(artInfo => {
      const { name, type, locations } = artInfo;

      log(`Updating: ${name}`, 'cyan');

      locations.forEach(location => {
        try {
          const locationLabel = location === 'global' ? '  Global (~/.claude)' : `  ${location}`;

          // Construct paths
          let artifactPath;
          let sourcePath;

          if (location === 'global') {
            const homeDir = path.join(os.homedir(), '.claude');
            if (type === 'skill') {
              artifactPath = path.join(homeDir, 'skills', name);
              sourcePath = path.join(__dirname, '..', '.claude', 'skills', name);
            } else if (type === 'command') {
              artifactPath = path.join(homeDir, 'commands', name);
              sourcePath = path.join(__dirname, '..', '.claude', 'commands', name);
            }
          } else {
            if (type === 'skill') {
              artifactPath = path.join(location, '.claude', 'skills', name);
              sourcePath = path.join(__dirname, '..', '.claude', 'skills', name);
            } else if (type === 'command') {
              artifactPath = path.join(location, '.claude', 'commands', name);
              sourcePath = path.join(__dirname, '..', '.claude', 'commands', name);
            }
          }

          if (!artifactPath || !sourcePath) {
            log(`${locationLabel}: ⚠ Unknown type ${type}`, 'yellow');
            skippedCount++;
            return;
          }

          // Check if source exists
          if (!fs.existsSync(sourcePath)) {
            log(`${locationLabel}: ⚠ Source not found`, 'yellow');
            skippedCount++;
            return;
          }

          // Check if target exists
          if (!fs.existsSync(artifactPath)) {
            log(`${locationLabel}: ⚠ Not installed, skipping`, 'yellow');
            skippedCount++;
            return;
          }

          // Detect user modifications
          const modCheck = conflictDetector.detectUserModification(artifactPath, location, name);

          if (modCheck.modified) {
            // User modified - create backup
            log(`${locationLabel}: Creating backup (user modified)...`, 'yellow');

            const artifact = registry.getArtifact(location, name);
            backupManager.createBackup(
              artifactPath,
              name,
              location,
              {
                backup_reason: 'auto_update_user_modified',
                version_before: artifact ? artifact.version : 'unknown',
                version_after: currentVersion
              }
            );

            backedUpCount++;
          }

          // Update artifact
          const stats = fs.statSync(sourcePath);

          // Remove old version
          if (fs.existsSync(artifactPath)) {
            fs.rmSync(artifactPath, { recursive: true, force: true });
          }

          // Copy new version
          if (stats.isDirectory()) {
            fileOps.copyDirectory(sourcePath, artifactPath);
          } else {
            fileOps.copyFile(sourcePath, artifactPath);
          }

          // Update registry
          const newChecksum = conflictDetector.calculateArtifactChecksum(artifactPath);
          const artifact = registry.getArtifact(location, name);

          if (artifact) {
            artifact.version = currentVersion;
            artifact.checksum = newChecksum;
            artifact.updated_at = new Date().toISOString();
            artifact.user_modified = false;
            artifact.modification_checksum = null;
            registry.save();
          }

          log(`${locationLabel}: ✓ Updated`, 'green');
          updatedCount++;

        } catch (error) {
          const locationLabel = location === 'global' ? '  Global (~/.claude)' : `  ${location}`;
          log(`${locationLabel}: ✗ ${error.message}`, 'red');
          skippedCount++;
        }
      });

      console.log('');
    });

    // Update timestamp
    registry.updateAutoUpdateTimestamp();

    // Summary
    log('═══════════════════════════════════════════════════════', 'cyan');
    if (updatedCount > 0) {
      log(`✓ Auto-Update Complete: ${updatedCount} location(s) updated`, 'green');
    }
    if (backedUpCount > 0) {
      log(`  ${backedUpCount} backup(s) created for user modifications`, 'yellow');
    }
    if (skippedCount > 0) {
      log(`  ${skippedCount} location(s) skipped`, 'yellow');
    }
    console.log('');

  } catch (error) {
    log(`⚠ Auto-update failed: ${error.message}`, 'yellow');
    console.error(error);
  }
}

function showWelcomeMessage() {
  console.log('');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  log('  Claude Context Manager v0.2.1', 'bright');
  log('  Context Engineering Platform for Claude Code', 'blue');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  log('✓ Installation complete!', 'green');
  console.log('');

  log('Home directory created:', 'bright');
  log(`  ${HOME_DIR}`, 'cyan');
  console.log('');

  log('Getting Started:', 'bright');
  log('  1. List available artifacts:', 'yellow');
  log('     ccm list', 'cyan');
  console.log('');
  log('  2. Install core essentials globally:', 'yellow');
  log('     ccm install --package core-essentials --global', 'cyan');
  console.log('');
  log('  3. Check installation status:', 'yellow');
  log('     ccm status --global', 'cyan');
  console.log('');
  log('  4. Initialize a project:', 'yellow');
  log('     cd /path/to/your/project', 'cyan');
  log('     ccm init', 'cyan');
  console.log('');

  log('Premium Tier:', 'bright');
  log('  - Professional-grade skills, commands, and agents', 'yellow');
  log('  - Priority support and regular updates', 'yellow');
  log('  - $9/month individual | $29/month team', 'yellow');
  console.log('');
  log('  Activate premium:', 'bright');
  log('     ccm activate YOUR_LICENSE_KEY', 'cyan');
  console.log('');

  log('Support:', 'bright');
  log('  - Documentation: https://github.com/vladks/claude-context-manager', 'blue');
  log('  - Issues: https://github.com/vladks/claude-context-manager/issues', 'blue');
  log('  - Donations: See CONTRIBUTING.md', 'blue');
  log('  - Email: vlad@vladks.com', 'blue');
  console.log('');

  log('═════════════════════════════════════════════════════════════', 'cyan');
  console.log('');
}

// Path validation helper
function validatePath(filePath, description) {
  const normalized = path.normalize(filePath);

  // Check for path traversal attempts
  if (normalized.includes('..')) {
    throw new Error(`Invalid path (traversal detected): ${description}`);
  }

  // Check if within allowed directories
  const homeDir = os.homedir();
  const allowed = [
    homeDir,
    path.join(__dirname, '..'),  // Package directory
    path.dirname(process.execPath)  // Node directory
  ];

  const isAllowed = allowed.some(dir => normalized.startsWith(path.normalize(dir)));
  if (!isAllowed) {
    throw new Error(`Invalid path (outside allowed directories): ${description}`);
  }

  return normalized;
}

// Rollback helper
function rollbackInstallation(createdPaths) {
  log('\n⚠ Rolling back installation...', 'yellow');

  createdPaths.reverse().forEach(({ path: filePath, type }) => {
    try {
      if (fs.existsSync(filePath)) {
        if (type === 'directory') {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        log(`  Removed: ${filePath}`, 'dim');
      }
    } catch (error) {
      log(`  Failed to remove: ${filePath}`, 'yellow');
    }
  });

  log('✓ Rollback complete', 'green');
}

// Main execution
async function main() {
  const createdPaths = [];  // Track created files/dirs for rollback

  try {
    log('\nSetting up Claude Context Manager...', 'bright');

    // Validate home directory path
    validatePath(HOME_DIR, 'home directory');

    // Create main directory
    const isNewInstall = createDirectory(HOME_DIR);
    if (isNewInstall) {
      createdPaths.push({ path: HOME_DIR, type: 'directory' });
    }

    // Create subdirectories with error handling
    try {
      const cacheDir = path.join(HOME_DIR, 'cache');
      const backupsDir = path.join(HOME_DIR, 'backups');
      const logsDir = path.join(HOME_DIR, 'logs');

      validatePath(cacheDir, 'cache directory');
      validatePath(backupsDir, 'backups directory');
      validatePath(logsDir, 'logs directory');

      createDirectory(cacheDir);
      createDirectory(backupsDir);
      createDirectory(logsDir);
    } catch (error) {
      throw new Error(`Failed to create subdirectories: ${error.message}`);
    }

    // Create config if doesn't exist
    try {
      if (!fs.existsSync(CONFIG_FILE)) {
        validatePath(CONFIG_FILE, 'config file');
        createConfig();
        createdPaths.push({ path: CONFIG_FILE, type: 'file' });
        log('✓ Created configuration file', 'green');
      }
    } catch (error) {
      throw new Error(`Failed to create config: ${error.message}`);
    }

    // Create registry if doesn't exist
    try {
      if (!fs.existsSync(REGISTRY_FILE)) {
        validatePath(REGISTRY_FILE, 'registry file');
        createRegistry();
        createdPaths.push({ path: REGISTRY_FILE, type: 'file' });
        log('✓ Created registry file', 'green');
      }
    } catch (error) {
      throw new Error(`Failed to create registry: ${error.message}`);
    }

    // Create library metadata
    try {
      createLibraryMetadata();
      log('✓ Initialized artifact library', 'green');
    } catch (error) {
      throw new Error(`Failed to create library metadata: ${error.message}`);
    }

    // Install all commands globally
    try {
      installGlobalCommands();
    } catch (error) {
      log(`⚠ Command installation failed: ${error.message}`, 'yellow');
      // Continue - not critical
    }

    // Sync CCM files and regenerate CLAUDE.md header
    try {
      syncClaudeAdditions();
    } catch (error) {
      log(`⚠ CCM file sync failed: ${error.message}`, 'yellow');
      // Continue - not critical
    }

    // Auto-update artifacts in tracked locations
    if (!isNewInstall) {
      try {
        autoUpdateArtifacts();
      } catch (error) {
        log(`⚠ Auto-update failed: ${error.message}`, 'yellow');
        // Continue - not critical
      }
    }

    // Install background update checker service
    try {
      const { execSync } = require('child_process');
      const servicePath = path.join(__dirname, 'background', 'install-service.js');

      if (fs.existsSync(servicePath)) {
        validatePath(servicePath, 'service script');
        log('\n✓ Installing background update checker...', 'cyan');
        execSync(`node "${servicePath}"`, { stdio: 'inherit', timeout: 30000 });
      }
    } catch (error) {
      log('⚠ Background service installation skipped', 'yellow');
      if (process.env.CCM_DEBUG) {
        console.error(error);
      }
    }

    // Show welcome message only on fresh install
    if (isNewInstall) {
      showWelcomeMessage();
    } else {
      log('✓ Updated existing installation', 'green');
      log(`  Home: ${HOME_DIR}\n`, 'cyan');
    }

    process.exit(0);

  } catch (error) {
    log('\n✗ Error during setup:', 'red');
    console.error(error.message);

    if (process.env.CCM_DEBUG) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    // Rollback on critical failure
    if (createdPaths.length > 0) {
      rollbackInstallation(createdPaths);
    }

    console.error('\nPlease report this issue at:');
    console.error('https://github.com/vladks/claude-context-manager/issues\n');
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('\n✗ Fatal postinstall error:');
  console.error(error);
  process.exit(1);
});
