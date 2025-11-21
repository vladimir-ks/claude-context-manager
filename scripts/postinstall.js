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

/**
 * Generate catalog from package.json artifacts section
 */
function generateCatalogFromPackageJson() {
  const packageJson = require('../package.json');

  if (!packageJson.artifacts) {
    log('⚠ No artifacts section in package.json, skipping catalog generation', 'yellow');
    return;
  }

  const libraryDir = path.join(HOME_DIR, 'library');
  const freeDir = path.join(libraryDir, 'free');

  createDirectory(freeDir);

  // Generate skills catalog
  const skills = [];
  if (packageJson.artifacts.skills) {
    Object.entries(packageJson.artifacts.skills).forEach(([name, meta]) => {
      skills.push({
        name,
        version: meta.version,
        description: meta.description || 'Master skill for AI context engineering',
        tier: 'free',
        category: meta.category || 'development',
        size_bytes: null,
        dependencies: [],
        source_path: `.claude/skills/${name}/`
      });
    });
  }

  // Generate commands catalog
  const commands = [];
  if (packageJson.artifacts.commands) {
    Object.entries(packageJson.artifacts.commands).forEach(([name, meta]) => {
      commands.push({
        name,
        version: meta.version,
        description: meta.description || 'Claude Code command',
        tier: 'free',
        category: meta.category || 'development',
        size_bytes: null,
        dependencies: [],
        source_path: `.claude/commands/${name}`
      });
    });
  }

  // Write catalogs
  if (skills.length > 0) {
    fs.writeFileSync(
      path.join(freeDir, 'skills.json'),
      JSON.stringify({ skills }, null, 2)
    );
  }

  if (commands.length > 0) {
    fs.writeFileSync(
      path.join(freeDir, 'commands.json'),
      JSON.stringify({ commands }, null, 2)
    );
  }

  // Generate packages catalog (hardcoded for now - can be enhanced later)
  const packages = [
    {
      name: 'core-essentials',
      version: '0.1.0',
      description: 'Managing-claude-context skill + essential commands',
      tier: 'free',
      category: 'development',
      artifacts: [{ type: 'skill', name: 'managing-claude-context' }],
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
  ];

  fs.writeFileSync(
    path.join(freeDir, 'packages.json'),
    JSON.stringify({ packages }, null, 2)
  );

  // Premium tier placeholders
  const premiumDir = path.join(libraryDir, 'premium');
  createDirectory(premiumDir);

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

  fs.writeFileSync(path.join(premiumDir, 'skills.json'), JSON.stringify(premiumSkills, null, 2));
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
      log(
        `✓ Removed ${report.removed.length} CCM file(s) to .trash: ${report.removed.join(', ')}`,
        'green'
      );
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

/**
 * Check for artifact version updates and notify user
 * Shows what changed and asks for approval before updating
 */
async function checkArtifactVersionUpdates() {
  try {
    const packageJson = require('../package.json');
    const registry = require('../src/lib/registry');

    // Check if package.json has artifacts section
    if (!packageJson.artifacts) {
      return; // No artifact tracking yet
    }

    const reg = registry.load();
    const updates = [];

    // Check skills
    if (packageJson.artifacts.skills) {
      for (const [skillName, metadata] of Object.entries(packageJson.artifacts.skills)) {
        // Find in registry
        const globalArtifacts = reg.installations.global.artifacts || [];
        const installed = globalArtifacts.find(a => a.name === skillName && a.type === 'skill');

        if (installed && installed.version !== metadata.version) {
          updates.push({
            type: 'skill',
            name: skillName,
            oldVersion: installed.version,
            newVersion: metadata.version,
            checksum: metadata.checksum
          });
        }
      }
    }

    // Check commands
    if (packageJson.artifacts.commands) {
      for (const [commandName, metadata] of Object.entries(packageJson.artifacts.commands)) {
        // Find in registry
        const globalArtifacts = reg.installations.global.artifacts || [];
        const installed = globalArtifacts.find(a => a.name === commandName && a.type === 'command');

        if (installed && installed.version !== metadata.version) {
          updates.push({
            type: 'command',
            name: commandName,
            oldVersion: installed.version,
            newVersion: metadata.version,
            checksum: metadata.checksum
          });
        }
      }
    }

    if (updates.length === 0) {
      return; // No updates available
    }

    // Show update notification
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Artifact Updates Available                            ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    log(`${updates.length} artifact(s) have new versions available:\n`, 'bright');

    updates.forEach(update => {
      log(`  ${update.type === 'skill' ? '📦' : '⚡'} ${update.name}`, 'cyan');
      log(`     ${update.oldVersion} → ${update.newVersion}`, 'yellow');
    });

    console.log('');
    log('To see what changed, check ARTIFACT_CHANGELOG.md', 'bright');
    log('To update now: ccm update-artifacts', 'cyan');
    log('To check later: ccm update-check', 'cyan');
    console.log('');
  } catch (error) {
    // Silent fail - not critical
    if (process.env.CCM_DEBUG) {
      console.error('Artifact update check failed:', error);
    }
  }
}

/**
 * Collect all artifacts that need updates
 * @param {Object} reg - Registry object
 * @param {Object} packageJson - package.json object
 * @returns {Array} Artifacts needing updates with location info
 */
function collectArtifactsNeedingUpdate(reg, packageJson) {
  const artifactMap = new Map(); // Use map to deduplicate

  // Helper to add artifact to map
  function addArtifact(artifact, location) {
    const artifactType = `${artifact.type}s`; // 'skill' → 'skills'
    const latestMeta = packageJson.artifacts?.[artifactType]?.[artifact.name];

    if (!latestMeta) {
      return; // Artifact not in package.json (removed)
    }

    if (artifact.version !== latestMeta.version) {
      if (artifactMap.has(artifact.name)) {
        // Already in map, add location
        const existing = artifactMap.get(artifact.name);
        if (!existing.locations.includes(location)) {
          existing.locations.push(location);
        }
      } else {
        // New artifact to update
        artifactMap.set(artifact.name, {
          name: artifact.name,
          type: artifact.type,
          installed_version: artifact.version,
          latest_version: latestMeta.version,
          locations: [location]
        });
      }
    }
  }

  // Check global artifacts
  if (reg.installations.global.artifacts) {
    reg.installations.global.artifacts.forEach(artifact => {
      addArtifact(artifact, 'global');
    });
  }

  // Check project artifacts
  if (reg.installations.projects) {
    reg.installations.projects.forEach(project => {
      if (project.artifacts) {
        project.artifacts.forEach(artifact => {
          addArtifact(artifact, project.path);
        });
      }
    });
  }

  return Array.from(artifactMap.values());
}

function autoUpdateArtifacts() {
  try {
    const registry = require('../src/lib/registry');
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
    const hasArtifacts =
      (reg.installations.global.artifacts && reg.installations.global.artifacts.length > 0) ||
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

    // Collect ALL artifacts needing updates (not just multi-location)
    const artifactsToUpdate = collectArtifactsNeedingUpdate(reg, packageJson);

    if (artifactsToUpdate.length === 0) {
      log('✓ All artifacts are up to date', 'green');
      registry.updateAutoUpdateTimestamp();
      console.log('');
      return;
    }

    log(`Found ${artifactsToUpdate.length} artifact(s) with updates available\n`, 'bright');

    // Show list of artifacts and ask for confirmation
    artifactsToUpdate.forEach((artInfo, index) => {
      const locationsText =
        artInfo.locations.length === 1
          ? artInfo.locations[0] === 'global'
            ? 'global'
            : `project: ${artInfo.locations[0]}`
          : `${artInfo.locations.length} locations`;

      log(
        `  ${index + 1}. ${artInfo.name} (${artInfo.type}): v${artInfo.installed_version} → v${artInfo.latest_version} [${locationsText}]`,
        'cyan'
      );
    });

    console.log('');
    log('Update artifacts? [Y]es / [N]o / [S]elect individually: ', 'bright');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', async answer => {
      const choice = answer.trim().toLowerCase();

      let artifactsToProcess = [];

      if (choice === 'n' || choice === 'no') {
        log('\nSkipping artifact updates', 'yellow');
        rl.close();
        registry.updateAutoUpdateTimestamp();
        console.log('');
        return;
      } else if (choice === 's' || choice === 'select') {
        // Ask for each artifact individually
        log('\n', 'reset');

        for (const artInfo of artifactsToUpdate) {
          const locationsText =
            artInfo.locations.length === 1
              ? artInfo.locations[0] === 'global'
                ? 'global'
                : artInfo.locations[0]
              : `${artInfo.locations.length} locations`;

          await new Promise(resolve => {
            rl.question(
              `Update ${artInfo.name} (${artInfo.type}) v${artInfo.installed_version} → v${artInfo.latest_version} [${locationsText}]? (Y/n): `,
              selectAnswer => {
                if (selectAnswer.trim().toLowerCase() !== 'n' && selectAnswer.trim().toLowerCase() !== 'no') {
                  artifactsToProcess.push(artInfo);
                }
                resolve();
              }
            );
          });
        }

        rl.close();
      } else {
        // Default: update all (Y, yes, or Enter)
        artifactsToProcess = artifactsToUpdate;
        rl.close();
      }

      // Proceed with updates
      if (artifactsToProcess.length === 0) {
        log('\nNo artifacts selected for update', 'yellow');
        registry.updateAutoUpdateTimestamp();
        console.log('');
        return;
      }

      console.log('');
      log(`Updating ${artifactsToProcess.length} artifact(s)...\n`, 'bright');

      let updatedCount = 0;
      let skippedCount = 0;
      let backedUpCount = 0;

      // Update each artifact in all its locations
      artifactsToProcess.forEach(artInfo => {
        const { name, type, locations, installed_version, latest_version } = artInfo;

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
            backupManager.createBackup(artifactPath, name, location, {
              backup_reason: 'auto_update_user_modified',
              version_before: installed_version,
              version_after: latest_version
            });

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
            artifact.version = latest_version;
            artifact.checksum = newChecksum;
            artifact.updated_at = new Date().toISOString();
            artifact.user_modified = false;
            artifact.modification_checksum = null;
            registry.save();
          }

          log(
            `${locationLabel}: ✓ Updated v${installed_version} → v${latest_version}`,
            'green'
          );
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
    });
  } catch (error) {
    log(`⚠ Auto-update failed: ${error.message}`, 'yellow');
    console.error(error);
  }
}

function showWelcomeMessage() {
  console.log('');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  log('  Claude Context Manager v0.4.0', 'bright');
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

// Path validation helper - uses validators.js for consistency
function validatePath(filePath, description) {
  const validators = require('../src/utils/validators');

  const homeDir = os.homedir();
  const allowedDirs = [
    homeDir,
    path.join(__dirname, '..'), // Package directory
    path.dirname(process.execPath) // Node directory
  ];

  if (!validators.isValidFilePath(filePath, allowedDirs)) {
    throw new Error(`Invalid path: ${description}`);
  }

  return path.normalize(filePath);
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
  const createdPaths = []; // Track created files/dirs for rollback

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

    // Generate catalog from package.json
    try {
      generateCatalogFromPackageJson();
      log('✓ Generated catalog from package.json', 'green');
    } catch (error) {
      throw new Error(`Failed to generate catalog: ${error.message}`);
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

      // Check for artifact version updates
      try {
        await checkArtifactVersionUpdates();
      } catch (error) {
        // Silent fail - not critical
        if (process.env.CCM_DEBUG) {
          console.error('Artifact version check failed:', error);
        }
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
main().catch(error => {
  console.error('\n✗ Fatal postinstall error:');
  console.error(error);
  process.exit(1);
});
