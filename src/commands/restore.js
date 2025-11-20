/**
 * Restore Command
 *
 * Restore artifacts from backups
 * Supports both interactive mode and flag-based mode
 *
 * Author: Vladimir K.S.
 */

const path = require('path');
const fs = require('fs');
const registry = require('../lib/registry');
const config = require('../utils/config');
const logger = require('../utils/logger');
const menu = require('../lib/interactive-menu');
const backupManager = require('../lib/backup-manager');
const conflictDetector = require('../lib/conflict-detector');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    artifactName: null,
    location: null,
    timestamp: null,
    hasFlags: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--artifact') {
      flags.artifactName = args[++i];
      flags.hasFlags = true;
    } else if (args[i] === '--global' || args[i] === '-g') {
      flags.location = 'global';
      flags.hasFlags = true;
    } else if (args[i] === '--project' || args[i] === '-p') {
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        flags.location = args[++i];
      } else {
        flags.location = process.cwd();
      }
      flags.hasFlags = true;
    } else if (args[i] === '--timestamp' || args[i] === '-t') {
      flags.timestamp = args[++i];
      flags.hasFlags = true;
    }
  }

  return flags;
}

/**
 * Interactive restore flow
 */
async function interactiveRestore() {
  try {
    logger.log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    logger.log('║  Claude Context Manager - Restore from Backup         ║', 'bright');
    logger.log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    // Step 1: Get all artifacts with backups
    const allArtifacts = backupManager.getAllBackupArtifacts();

    if (allArtifacts.length === 0) {
      logger.warn('No backups found.');
      logger.info('Backups are created automatically during updates and uninstalls.');
      return;
    }

    // Step 1: Select artifact to restore
    logger.log('Step 1/3: Select artifact to restore\n', 'bright');

    const artifactChoices = allArtifacts.map(name => ({
      name: name,
      value: name
    }));

    const select = require('@inquirer/select').default;
    const selectedArtifact = await select({
      message: 'Select artifact:',
      choices: artifactChoices
    });
    console.log('');

    // Step 2: List backups for selected artifact
    logger.log('Step 2/3: Select backup to restore\n', 'bright');

    const backups = backupManager.listBackups(selectedArtifact);

    if (backups.length === 0) {
      logger.warn(`No backups found for ${selectedArtifact}.`);
      return;
    }

    const selectedBackup = await menu.selectBackup(backups);
    console.log('');

    if (!selectedBackup) {
      logger.warn('No backup selected. Exiting.');
      return;
    }

    // Load backup metadata
    const backup = backups.find(b => b.timestamp === selectedBackup);
    const backupDir = backup.path;
    const metadataPath = path.join(backupDir, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Show backup details
    logger.log('Backup Details:\n', 'bright');
    console.log(`  Artifact: ${metadata.artifact_name}`);
    console.log(`  Type: ${metadata.artifact_type}`);
    console.log(`  Version: ${metadata.version_before}`);
    console.log(`  Created: ${new Date(metadata.backup_timestamp).toLocaleString()}`);
    console.log(`  Reason: ${metadata.backup_reason}`);
    console.log(`  Source: ${metadata.source_location === 'global' ? 'Global (~/.claude)' : metadata.source_location}`);
    console.log(`  Files: ${metadata.file_count}, Size: ${(metadata.total_size_bytes / 1024).toFixed(1)}KB`);
    console.log('');

    // Step 3: Select target location
    logger.log('Step 3/3: Select restore location\n', 'bright');

    const restoreLocationChoices = [
      { name: 'Original location (from backup)', value: 'original' },
      { name: 'Global (~/.claude)', value: 'global' },
      { name: 'Current project', value: 'project', disabled: !menu.isGitRepo() ? 'Not a git repository' : false }
    ];

    const restoreChoice = await select({
      message: 'Where would you like to restore?',
      choices: restoreLocationChoices,
      default: 'original'
    });
    console.log('');

    // Determine target location
    let targetLocation;
    if (restoreChoice === 'original') {
      targetLocation = metadata.source_location;
    } else if (restoreChoice === 'global') {
      targetLocation = 'global';
    } else if (restoreChoice === 'project') {
      targetLocation = process.cwd();
    }

    // Confirm restore
    const locationLabel = targetLocation === 'global' ? 'Global (~/.claude)' : targetLocation;
    const confirmed = await menu.confirmAction(
      `Restore ${metadata.artifact_name} v${metadata.version_before} to ${locationLabel}?`,
      true
    );
    console.log('');

    if (!confirmed) {
      logger.warn('Restore cancelled by user.');
      return;
    }

    // Perform restore
    logger.progress('Restoring from backup...');

    // Determine target path
    let targetPath;
    if (targetLocation === 'global') {
      const homeDir = config.getHomeDir();
      if (metadata.artifact_type === 'skill') {
        targetPath = path.join(homeDir, 'skills', metadata.artifact_name);
      } else if (metadata.artifact_type === 'command') {
        targetPath = path.join(homeDir, 'commands', metadata.artifact_name);
      }
    } else {
      if (metadata.artifact_type === 'skill') {
        targetPath = path.join(targetLocation, '.claude', 'skills', metadata.artifact_name);
      } else if (metadata.artifact_type === 'command') {
        targetPath = path.join(targetLocation, '.claude', 'commands', metadata.artifact_name);
      }
    }

    // Restore using backup manager
    const result = backupManager.restoreBackup(
      metadata.artifact_name,
      selectedBackup,
      targetLocation,
      targetPath
    );

    logger.clearLine();

    if (result.success) {
      logger.success(`✓ Restore complete!`);
      console.log(`  Restored: ${metadata.artifact_name} v${result.version}`);
      console.log(`  Location: ${locationLabel}`);
      console.log('');

      // Update registry
      const newChecksum = conflictDetector.calculateArtifactChecksum(targetPath);

      registry.addArtifact(targetLocation, {
        name: metadata.artifact_name,
        type: metadata.artifact_type,
        version: metadata.version_before,
        checksum: newChecksum,
        installed_at: new Date().toISOString(),
        updated_at: null,
        source_path: metadata.source_path,
        user_modified: false,
        modification_checksum: null,
        installed_locations: [targetLocation]
      });

      logger.info('Registry updated with restored artifact.');
      logger.info('Restart Claude Code if currently running.');
      console.log('');
    }

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      logger.warn('\nRestore cancelled by user.');
      return;
    }
    throw error;
  }
}

/**
 * Flag-based restore (backward compatibility)
 */
async function flagBasedRestore(flags) {
  try {
    // Validate flags
    const errors = [];

    if (!flags.artifactName) {
      errors.push('Missing required flag: --artifact <name>');
    }

    if (!flags.location) {
      errors.push('Missing target: --global or --project [path]');
    }

    if (errors.length > 0) {
      logger.error('Invalid arguments:');
      errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
      logger.info('Usage: ccm restore --artifact <name> --global');
      logger.info('       ccm restore --artifact <name> --project [path] --timestamp <timestamp>');
      logger.info('       ccm restore (interactive mode - recommended)');
      logger.info('See: ccm help restore');
      process.exit(1);
    }

    logger.log(`\nRestoring ${flags.artifactName}:\n`, 'bright');

    // List backups
    const backups = backupManager.listBackups(flags.artifactName);

    if (backups.length === 0) {
      logger.error(`No backups found for ${flags.artifactName}`);
      logger.info('Use interactive mode to browse available backups: ccm restore');
      process.exit(1);
    }

    // Select backup
    let selectedBackup;
    if (flags.timestamp) {
      // Use specified timestamp
      selectedBackup = backups.find(b => b.timestamp === flags.timestamp);

      if (!selectedBackup) {
        logger.error(`Backup not found with timestamp: ${flags.timestamp}`);
        logger.info('Available backups:');
        backups.forEach(b => {
          console.log(`  ${b.timestamp} - v${b.version}`);
        });
        process.exit(1);
      }
    } else {
      // Use most recent backup
      selectedBackup = backups[0]; // Already sorted newest first
      logger.info(`Using most recent backup: ${selectedBackup.timestamp}`);
    }

    // Load metadata
    const metadataPath = path.join(selectedBackup.path, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Determine target path
    let targetPath;
    if (flags.location === 'global') {
      const homeDir = config.getHomeDir();
      if (metadata.artifact_type === 'skill') {
        targetPath = path.join(homeDir, 'skills', flags.artifactName);
      } else if (metadata.artifact_type === 'command') {
        targetPath = path.join(homeDir, 'commands', flags.artifactName);
      }
    } else {
      if (metadata.artifact_type === 'skill') {
        targetPath = path.join(flags.location, '.claude', 'skills', flags.artifactName);
      } else if (metadata.artifact_type === 'command') {
        targetPath = path.join(flags.location, '.claude', 'commands', flags.artifactName);
      }
    }

    // Perform restore
    logger.progress('Restoring from backup...');

    const result = backupManager.restoreBackup(
      flags.artifactName,
      selectedBackup.timestamp,
      flags.location,
      targetPath
    );

    logger.clearLine();

    if (result.success) {
      logger.success(`✓ Restore complete!`);
      console.log(`  Restored: ${flags.artifactName} v${result.version}`);
      console.log(`  From: ${selectedBackup.timestamp}`);
      console.log('');

      // Update registry
      const newChecksum = conflictDetector.calculateArtifactChecksum(targetPath);

      registry.addArtifact(flags.location, {
        name: flags.artifactName,
        type: metadata.artifact_type,
        version: metadata.version_before,
        checksum: newChecksum,
        installed_at: new Date().toISOString(),
        updated_at: null,
        source_path: metadata.source_path,
        user_modified: false,
        modification_checksum: null,
        installed_locations: [flags.location]
      });

      logger.info('Registry updated with restored artifact.');
      console.log('');
    }

  } catch (error) {
    logger.error(`Restore failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Restore command handler
 * @param {Array} args - Command line arguments
 */
async function restore(args) {
  try {
    const flags = parseFlags(args);

    if (!flags.hasFlags) {
      // No flags provided - enter interactive mode
      await interactiveRestore();
    } else {
      // Flags provided - use flag-based mode
      await flagBasedRestore(flags);
    }

  } catch (error) {
    if (error.name !== 'ExitPromptError') {
      logger.error(`Unexpected error: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
  }
}

// Export
module.exports = { restore };
