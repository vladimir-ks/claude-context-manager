/**
 * Update Command
 *
 * Update installed artifacts to latest versions
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const catalog = require('../lib/catalog');
const registry = require('../lib/registry');
const packageManager = require('../lib/package-manager');
const config = require('../utils/config');
const fileOps = require('../utils/file-ops');
const logger = require('../utils/logger');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    target: null,       // 'global' or project path
    name: null,         // artifact name to update
    type: null,         // 'skill', 'command', 'package'
    all: false,         // update all installed artifacts
    skipBackup: false   // skip backup creation
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--global') {
      flags.target = 'global';
    } else if (args[i] === '--project') {
      flags.target = args[++i] || process.cwd();
    } else if (args[i] === '--skill') {
      flags.type = 'skill';
      flags.name = args[++i];
    } else if (args[i] === '--command') {
      flags.type = 'command';
      flags.name = args[++i];
    } else if (args[i] === '--package') {
      flags.type = 'package';
      flags.name = args[++i];
    } else if (args[i] === '--all') {
      flags.all = true;
    } else if (args[i] === '--skip-backup') {
      flags.skipBackup = true;
    }
  }

  return flags;
}

/**
 * Validate flags
 * @param {Object} flags - Parsed flags
 */
function validateFlags(flags) {
  // Must specify target
  if (!flags.target) {
    logger.error('Missing target: use --global or --project <path>');
    console.log('');
    logger.info('Usage: ccm update [--skill|--command|--package <name>] [--global|--project <path>] [--all] [--skip-backup]');
    logger.info('Example: ccm update --skill managing-claude-context --global');
    logger.info('Example: ccm update --all --global');
    console.log('');
    process.exit(1);
  }

  // Must specify either a specific artifact or --all
  if (!flags.all && !flags.name) {
    logger.error('Missing artifact name or --all flag');
    console.log('');
    logger.info('Usage: ccm update [--skill|--command|--package <name>] [--global|--project <path>] [--all] [--skip-backup]');
    logger.info('Example: ccm update --skill managing-claude-context --global');
    logger.info('Example: ccm update --all --global');
    console.log('');
    process.exit(1);
  }

  // If name specified, type is required
  if (flags.name && !flags.type) {
    logger.error('Missing artifact type: use --skill, --command, or --package');
    console.log('');
    process.exit(1);
  }
}

/**
 * Prompt user for confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} User's answer
 */
function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes' || normalized === '');
    });
  });
}

/**
 * Check if artifact has available update
 * @param {Object} installed - Installed artifact from registry
 * @param {Object} available - Available artifact from catalog
 * @returns {boolean} True if update available
 */
function hasUpdate(installed, available) {
  if (!available) return false;

  // Compare versions (simple string comparison for now)
  // In production, use semver library
  return available.version !== installed.version;
}

/**
 * Update a single artifact
 * @param {Object} artifact - Artifact to update
 * @param {string} target - Target location ('global' or project path)
 * @param {Object} flags - Command flags
 * @returns {Promise<Object>} Update result
 */
async function updateArtifact(artifact, target, flags) {
  const cat = catalog.loadCatalog();
  const available = catalog.getArtifact(artifact.type, artifact.name);

  if (!available) {
    logger.warn(`${artifact.name}: Not found in catalog (may have been removed)`);
    return { updated: false, reason: 'not_in_catalog' };
  }

  // Check if update needed
  if (!hasUpdate(artifact, available)) {
    logger.log(`✓ ${artifact.name}: Already up to date (v${artifact.version})`, 'green');
    return { updated: false, reason: 'up_to_date' };
  }

  logger.log(`\nUpdating ${artifact.name}...`, 'bright');
  logger.log(`  Current: v${artifact.version}`, 'reset');
  logger.log(`  Latest:  v${available.version}`, 'green');

  // Determine source and target paths
  const sourceBasePath = path.join(__dirname, '..', '..');
  let sourcePath;

  if (artifact.type === 'skill') {
    sourcePath = path.join(sourceBasePath, '.claude', 'skills', artifact.name);
  } else if (artifact.type === 'command') {
    sourcePath = path.join(sourceBasePath, '.claude', 'commands', `${artifact.name}.md`);
  } else {
    logger.error(`Unsupported artifact type for update: ${artifact.type}`);
    return { updated: false, reason: 'unsupported_type' };
  }

  // Verify source exists
  if (!fs.existsSync(sourcePath)) {
    logger.error(`Source not found: ${sourcePath}`);
    return { updated: false, reason: 'source_not_found' };
  }

  // Determine target path
  const targetBase = target === 'global'
    ? config.getGlobalClaudeDir()
    : config.getProjectClaudeDir(target);

  let targetPath;
  if (artifact.type === 'skill') {
    targetPath = path.join(targetBase, 'skills', artifact.name);
  } else if (artifact.type === 'command') {
    targetPath = path.join(targetBase, 'commands', `${artifact.name}.md`);
  }

  // Create backup unless skipped
  let backupPath = null;
  if (!flags.skipBackup && fs.existsSync(targetPath)) {
    logger.progress('Creating backup...');
    const backupDir = path.join(config.getHomeDir(), 'backups');
    backupPath = fileOps.createBackup(targetPath, backupDir);
    logger.log(`  Backup: ${path.basename(backupPath)}`, 'reset');
  }

  // Install updated version
  logger.progress('Installing update...');
  const result = await packageManager.installArtifact(sourcePath, targetPath, {
    name: artifact.name,
    type: artifact.type,
    version: available.version
  });

  if (!result.success) {
    logger.error(`Failed to install update: ${result.error || 'Unknown error'}`);
    return { updated: false, reason: 'install_failed' };
  }

  // Update registry
  const updatedArtifact = {
    ...artifact,
    version: available.version,
    checksum: result.checksum,
    updated_at: new Date().toISOString()
  };

  registry.updateArtifact(target, updatedArtifact);

  logger.success(`${artifact.name} updated to v${available.version}`);
  if (backupPath) {
    logger.log(`  Backup: ${backupPath}`, 'reset');
  }

  return { updated: true, version: available.version, backup: backupPath };
}

/**
 * Update command handler
 * @param {Array} args - Command line arguments
 */
async function update(args) {
  try {
    const flags = parseFlags(args);
    validateFlags(flags);

    // Get installed artifacts
    const installed = registry.getInstalledArtifacts(flags.target);

    if (installed.length === 0) {
      logger.warn('No artifacts installed at this location');
      console.log('');
      logger.info('Run "ccm status" to see all installations');
      console.log('');
      process.exit(0);
    }

    // Determine which artifacts to update
    let artifactsToUpdate = [];

    if (flags.all) {
      artifactsToUpdate = installed;
      logger.log(`\nChecking ${installed.length} installed artifact(s) for updates...\n`, 'bright');
    } else {
      // Find specific artifact
      const artifact = installed.find(a => a.name === flags.name && a.type === flags.type);
      if (!artifact) {
        logger.error(`${flags.type} not installed: ${flags.name}`);
        console.log('');
        logger.info('Run "ccm status" to see installed artifacts');
        console.log('');
        process.exit(1);
      }
      artifactsToUpdate = [artifact];
    }

    // Check for available updates
    const cat = catalog.loadCatalog();
    const updatesAvailable = [];

    for (const artifact of artifactsToUpdate) {
      const available = catalog.getArtifact(artifact.type, artifact.name);
      if (available && hasUpdate(artifact, available)) {
        updatesAvailable.push({
          artifact,
          available,
          current: artifact.version,
          latest: available.version
        });
      }
    }

    if (updatesAvailable.length === 0) {
      logger.success('All artifacts are up to date!');
      console.log('');
      process.exit(0);
    }

    // Show available updates
    logger.log(`Found ${updatesAvailable.length} update(s):\n`, 'bright');
    updatesAvailable.forEach(u => {
      logger.log(`  ${u.artifact.name} (${u.artifact.type})`, 'reset');
      logger.log(`    ${u.current} → ${u.latest}`, 'green');
    });
    console.log('');

    // Confirm update
    const proceed = await promptUser(`Update ${updatesAvailable.length} artifact(s)? (Y/n): `);
    if (!proceed) {
      logger.log('Update cancelled', 'reset');
      process.exit(0);
    }

    // Perform updates
    logger.log('', 'reset');
    const results = {
      updated: 0,
      failed: 0,
      skipped: 0
    };

    for (const u of updatesAvailable) {
      const result = await updateArtifact(u.artifact, flags.target, flags);
      if (result.updated) {
        results.updated++;
      } else if (result.reason === 'up_to_date') {
        results.skipped++;
      } else {
        results.failed++;
      }
    }

    // Summary
    console.log('');
    logger.log('Update Summary:', 'bright');
    logger.log(`  Updated: ${results.updated}`, results.updated > 0 ? 'green' : 'reset');
    if (results.skipped > 0) {
      logger.log(`  Skipped: ${results.skipped}`, 'reset');
    }
    if (results.failed > 0) {
      logger.log(`  Failed: ${results.failed}`, 'red');
    }
    console.log('');

    if (results.updated > 0) {
      logger.success('Update complete!');
      console.log('');
    }

  } catch (error) {
    logger.error(`Update failed: ${error.message}`);
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { update };
