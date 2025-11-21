/**
 * Remove Command
 *
 * Uninstall artifacts from global or project locations
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
    target: null, // 'global' or project path
    name: null, // artifact name to remove
    type: null, // 'skill', 'command', 'package'
    skipBackup: false, // skip backup creation
    force: false // skip confirmation
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
    } else if (args[i] === '--skip-backup') {
      flags.skipBackup = true;
    } else if (args[i] === '--force') {
      flags.force = true;
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
    logger.info(
      'Usage: ccm remove [--skill|--command|--package <name>] [--global|--project <path>] [--skip-backup] [--force]'
    );
    logger.info('Example: ccm remove --skill managing-claude-context --global');
    console.log('');
    process.exit(1);
  }

  // Must specify artifact name
  if (!flags.name) {
    logger.error('Missing artifact name');
    console.log('');
    logger.info(
      'Usage: ccm remove [--skill|--command|--package <name>] [--global|--project <path>] [--skip-backup] [--force]'
    );
    logger.info('Example: ccm remove --skill managing-claude-context --global');
    console.log('');
    process.exit(1);
  }

  // Must specify type
  if (!flags.type) {
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

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Remove a single artifact
 * @param {Object} artifact - Artifact to remove
 * @param {string} target - Target location ('global' or project path)
 * @param {Object} flags - Command flags
 * @returns {Promise<Object>} Removal result
 */
async function removeArtifact(artifact, target, flags) {
  logger.log(`\nRemoving ${artifact.name} (${artifact.type})...`, 'bright');

  // Determine target path
  const targetBase =
    target === 'global' ? config.getGlobalClaudeDir() : config.getProjectClaudeDir(target);

  let targetPath;
  if (artifact.type === 'skill') {
    targetPath = path.join(targetBase, 'skills', artifact.name);
  } else if (artifact.type === 'command') {
    targetPath = path.join(targetBase, 'commands', `${artifact.name}.md`);
  } else {
    logger.error(`Unsupported artifact type for removal: ${artifact.type}`);
    return { removed: false, reason: 'unsupported_type' };
  }

  // Check if exists
  if (!fs.existsSync(targetPath)) {
    logger.warn(`Not found on disk: ${targetPath}`);
    logger.log('  Removing from registry only...', 'reset');
    registry.removeArtifact(target, artifact.name, artifact.type);
    return { removed: true, registry_only: true };
  }

  // Create backup unless skipped
  let backupPath = null;
  if (!flags.skipBackup) {
    logger.progress('Creating backup...');
    const backupDir = path.join(config.getHomeDir(), 'backups');
    backupPath = fileOps.createBackup(targetPath, backupDir);
    logger.log(`  Backup: ${path.basename(backupPath)}`, 'reset');
  }

  // Uninstall artifact
  logger.progress('Removing files...');
  const result = await packageManager.uninstallArtifact(targetPath, {
    name: artifact.name,
    type: artifact.type
  });

  if (!result.success) {
    logger.error(`Failed to remove: ${result.error || 'Unknown error'}`);
    return { removed: false, reason: 'uninstall_failed' };
  }

  // Update registry
  registry.removeArtifact(target, artifact.name, artifact.type);

  logger.success(`${artifact.name} removed`);
  if (backupPath) {
    logger.log(`  Backup: ${backupPath}`, 'reset');
  }

  return { removed: true, backup: backupPath };
}

/**
 * Remove a package (uninstalls all included artifacts)
 * @param {Object} pkg - Package to remove
 * @param {string} target - Target location
 * @param {Object} flags - Command flags
 * @returns {Promise<Object>} Removal result
 */
async function removePackage(pkg, target, flags) {
  logger.log(`\nRemoving package: ${pkg.name}`, 'bright');
  logger.log(`  This will remove ${pkg.artifacts.length} artifact(s)\n`, 'reset');

  // Get all artifacts in package
  const installed = registry.getInstalledArtifacts(target);
  const artifactsToRemove = [];

  for (const pkgArtifact of pkg.artifacts) {
    const artifact = installed.find(
      a => a.name === pkgArtifact.name && a.type === pkgArtifact.type
    );
    if (artifact) {
      artifactsToRemove.push(artifact);
      logger.log(`  - ${artifact.name} (${artifact.type})`, 'reset');
    }
  }

  if (artifactsToRemove.length === 0) {
    logger.warn('No artifacts from this package are currently installed');
    logger.log('  Removing package from registry only...', 'reset');
    registry.removePackage(target, pkg.name);
    return { removed: true, artifacts_removed: 0 };
  }

  console.log('');

  // Confirm removal
  if (!flags.force) {
    const proceed = await promptUser(`Remove ${artifactsToRemove.length} artifact(s)? (y/N): `);
    if (!proceed) {
      logger.log('Removal cancelled', 'reset');
      process.exit(0);
    }
  }

  // Remove each artifact
  const results = {
    removed: 0,
    failed: 0
  };

  for (const artifact of artifactsToRemove) {
    const result = await removeArtifact(artifact, target, flags);
    if (result.removed) {
      results.removed++;
    } else {
      results.failed++;
    }
  }

  // Remove package from registry
  registry.removePackage(target, pkg.name);

  // Summary
  console.log('');
  logger.log('Removal Summary:', 'bright');
  logger.log(`  Removed: ${results.removed}`, results.removed > 0 ? 'green' : 'reset');
  if (results.failed > 0) {
    logger.log(`  Failed: ${results.failed}`, 'red');
  }
  console.log('');

  return { removed: true, artifacts_removed: results.removed };
}

/**
 * Remove command handler
 * @param {Array} args - Command line arguments
 */
async function remove(args) {
  try {
    const flags = parseFlags(args);
    validateFlags(flags);

    // Check if artifact/package is installed
    const installed = registry.getInstalledArtifacts(flags.target);
    const packages = registry.getInstalledPackages(flags.target);

    // Handle package removal
    if (flags.type === 'package') {
      const pkg = packages.find(p => p.name === flags.name);
      if (!pkg) {
        logger.error(`Package not installed: ${flags.name}`);
        console.log('');
        logger.info('Run "ccm status" to see installed packages');
        console.log('');
        process.exit(1);
      }

      await removePackage(pkg, flags.target, flags);
      logger.success('Package removed successfully!');
      console.log('');
      process.exit(0);
    }

    // Handle single artifact removal
    const artifact = installed.find(a => a.name === flags.name && a.type === flags.type);
    if (!artifact) {
      logger.error(`${flags.type} not installed: ${flags.name}`);
      console.log('');
      logger.info('Run "ccm status" to see installed artifacts');
      console.log('');
      process.exit(1);
    }

    // Show artifact info
    logger.log('\nArtifact to remove:', 'bright');
    logger.log(`  Name: ${artifact.name}`, 'reset');
    logger.log(`  Type: ${artifact.type}`, 'reset');
    logger.log(`  Version: ${artifact.version}`, 'reset');
    logger.log(`  Installed: ${new Date(artifact.installed_at).toLocaleString()}`, 'reset');
    console.log('');

    // Confirm removal
    if (!flags.force) {
      const proceed = await promptUser('Remove this artifact? (y/N): ');
      if (!proceed) {
        logger.log('Removal cancelled', 'reset');
        process.exit(0);
      }
    }

    // Remove artifact
    const result = await removeArtifact(artifact, flags.target, flags);

    if (result.removed) {
      console.log('');
      logger.success('Artifact removed successfully!');
      console.log('');
    } else {
      console.log('');
      logger.error('Failed to remove artifact');
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Removal failed: ${error.message}`);
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { remove };
