/**
 * Cleanup Command
 *
 * Manage and clean up old backups based on retention policies
 *
 * Author: Vladimir K.S.
 */

const registry = require('../lib/registry');
const logger = require('../utils/logger');
const backupManager = require('../lib/backup-manager');
const menu = require('../lib/interactive-menu');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    artifact: null,
    hasFlags: false,
    showStats: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--artifact') {
      flags.artifact = args[++i];
      flags.hasFlags = true;
    } else if (args[i] === '--stats') {
      flags.showStats = true;
      flags.hasFlags = true;
    } else if (args[i] === '--dry-run') {
      flags.dryRun = true;
      flags.hasFlags = true;
    }
  }

  return flags;
}

/**
 * Show backup statistics
 */
function showBackupStatistics() {
  logger.log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  logger.log('║  Backup Statistics                                     ║', 'bright');
  logger.log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  const stats = backupManager.getBackupStatistics();

  if (stats.total_artifacts === 0) {
    logger.warn('No backups found.');
    return;
  }

  logger.log('Overall Statistics:\n', 'bright');
  console.log(`  Total artifacts with backups: ${stats.total_artifacts}`);
  console.log(`  Total backups: ${stats.total_backups}`);
  console.log(`  Total size: ${stats.total_size_mb} MB`);

  if (stats.oldest_backup) {
    console.log(`  Oldest backup: ${new Date(stats.oldest_backup).toLocaleString()}`);
  }

  if (stats.newest_backup) {
    console.log(`  Newest backup: ${new Date(stats.newest_backup).toLocaleString()}`);
  }

  console.log('');

  // Show per-artifact breakdown
  logger.log('Per-Artifact Breakdown:\n', 'bright');

  const allArtifacts = backupManager.getAllBackupArtifacts();
  allArtifacts.forEach(artifactName => {
    const backups = backupManager.listBackups(artifactName);
    const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0);

    console.log(`  ${artifactName}:`);
    console.log(`    Backups: ${backups.length}`);
    console.log(`    Size: ${(totalSize / 1024).toFixed(1)} KB`);
  });

  console.log('');

  // Show retention policy
  const backupConfig = registry.getBackupConfig();
  logger.log('Retention Policy:\n', 'bright');
  console.log(`  Max backups per artifact: ${backupConfig.max_backups_per_artifact}`);
  console.log(`  Max age (days): ${backupConfig.retention_days}`);
  console.log(`  Cleanup schedule: ${backupConfig.cleanup_schedule}`);
  console.log('');
}

/**
 * Interactive cleanup flow
 */
async function interactiveCleanup() {
  try {
    logger.log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    logger.log('║  Claude Context Manager - Backup Cleanup              ║', 'bright');
    logger.log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    // Show current statistics
    showBackupStatistics();

    // Ask what to do
    const select = require('@inquirer/select').default;
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Clean up old backups (auto - based on retention policy)', value: 'auto' },
        { name: 'Delete specific artifact backups', value: 'specific' },
        { name: 'Update retention policy', value: 'policy' },
        { name: 'Exit', value: 'exit' }
      ]
    });
    console.log('');

    if (action === 'exit') {
      return;
    }

    if (action === 'auto') {
      // Auto cleanup based on retention policy
      const backupConfig = registry.getBackupConfig();

      logger.log('Retention Policy:\n', 'yellow');
      console.log(`  Max backups per artifact: ${backupConfig.max_backups_per_artifact}`);
      console.log(`  Max age: ${backupConfig.retention_days} days`);
      console.log('');

      const confirmed = await menu.confirmAction('Proceed with automatic cleanup?', true);
      console.log('');

      if (!confirmed) {
        logger.warn('Cleanup cancelled.');
        return;
      }

      logger.progress('Running cleanup...');

      const deleted = backupManager.cleanupOldBackups(null, backupConfig);

      logger.clearLine();

      if (deleted.length === 0) {
        logger.success('✓ No backups need cleanup');
      } else {
        logger.success(`✓ Cleanup complete: ${deleted.length} backup(s) deleted`);

        // Show what was deleted
        deleted.forEach(d => {
          console.log(`  - ${d.artifact} (${d.timestamp}) - ${d.reason}`);
        });
      }

      console.log('');
    } else if (action === 'specific') {
      // Delete specific artifact backups
      const allArtifacts = backupManager.getAllBackupArtifacts();

      if (allArtifacts.length === 0) {
        logger.warn('No artifacts with backups found.');
        return;
      }

      const artifactName = await select({
        message: 'Select artifact:',
        choices: allArtifacts.map(name => ({ name, value: name }))
      });
      console.log('');

      const backups = backupManager.listBackups(artifactName);

      logger.log(`Backups for ${artifactName}:\n`, 'bright');
      backups.forEach((backup, index) => {
        const date = new Date(
          backup.timestamp.replace(/_/g, ':').replace(/-/g, '-')
        ).toLocaleString();
        const size = backup.size ? `${(backup.size / 1024).toFixed(1)}KB` : 'unknown';
        console.log(`  ${index + 1}. ${date} - v${backup.version} (${size})`);
      });
      console.log('');

      const deleteChoice = await select({
        message: 'What would you like to delete?',
        choices: [
          { name: 'Delete all backups for this artifact', value: 'all' },
          { name: 'Delete oldest backup only', value: 'oldest' },
          { name: 'Cancel', value: 'cancel' }
        ]
      });
      console.log('');

      if (deleteChoice === 'cancel') {
        logger.warn('Deletion cancelled.');
        return;
      }

      const confirmed = await menu.confirmAction('Are you sure? This cannot be undone.', false);
      console.log('');

      if (!confirmed) {
        logger.warn('Deletion cancelled.');
        return;
      }

      if (deleteChoice === 'all') {
        backupManager.deleteAllBackups(artifactName);
        logger.success(`✓ Deleted all backups for ${artifactName}`);
      } else if (deleteChoice === 'oldest') {
        const oldest = backups[backups.length - 1];
        backupManager.deleteBackup(artifactName, oldest.timestamp);
        logger.success(`✓ Deleted oldest backup (${oldest.timestamp})`);
      }

      console.log('');
    } else if (action === 'policy') {
      // Update retention policy
      const input = require('@inquirer/input').default;

      logger.log('Current Retention Policy:\n', 'bright');
      const currentConfig = registry.getBackupConfig();
      console.log(`  Max backups per artifact: ${currentConfig.max_backups_per_artifact}`);
      console.log(`  Max age: ${currentConfig.retention_days} days`);
      console.log('');

      const maxBackups = await input({
        message: 'Max backups per artifact (5-50):',
        default: currentConfig.max_backups_per_artifact.toString(),
        validate: value => {
          const num = parseInt(value);
          if (isNaN(num) || num < 5 || num > 50) {
            return 'Please enter a number between 5 and 50';
          }
          return true;
        }
      });

      const maxAge = await input({
        message: 'Max age in days (7-365):',
        default: currentConfig.retention_days.toString(),
        validate: value => {
          const num = parseInt(value);
          if (isNaN(num) || num < 7 || num > 365) {
            return 'Please enter a number between 7 and 365';
          }
          return true;
        }
      });

      console.log('');

      // Update config
      registry.updateBackupConfig({
        max_backups_per_artifact: parseInt(maxBackups),
        retention_days: parseInt(maxAge),
        cleanup_schedule: currentConfig.cleanup_schedule
      });

      logger.success('✓ Retention policy updated');
      logger.log('\nNew Policy:\n', 'bright');
      console.log(`  Max backups per artifact: ${maxBackups}`);
      console.log(`  Max age: ${maxAge} days`);
      console.log('');
    }
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      logger.warn('\nCleanup cancelled by user.');
      return;
    }
    throw error;
  }
}

/**
 * Flag-based cleanup
 */
async function flagBasedCleanup(flags) {
  try {
    if (flags.showStats) {
      showBackupStatistics();
      return;
    }

    const backupConfig = registry.getBackupConfig();

    logger.log(
      `\nCleaning up old backups${flags.artifact ? ` for ${flags.artifact}` : ''}:\n`,
      'bright'
    );

    if (flags.dryRun) {
      logger.warn('DRY RUN MODE - No files will be deleted\n');
    }

    logger.log('Retention Policy:\n', 'bright');
    console.log(`  Max backups per artifact: ${backupConfig.max_backups_per_artifact}`);
    console.log(`  Max age: ${backupConfig.retention_days} days`);
    console.log('');

    if (flags.dryRun) {
      logger.info('This is what would be deleted:');
    }

    const deleted = backupManager.cleanupOldBackups(flags.artifact, backupConfig, flags.dryRun);

    if (deleted.length === 0) {
      logger.success('✓ No backups need cleanup');
    } else {
      logger.success(`✓ ${flags.dryRun ? 'Would delete' : 'Deleted'} ${deleted.length} backup(s):`);

      deleted.forEach(d => {
        console.log(`  - ${d.artifact} (${d.timestamp}) - ${d.reason}`);
      });
    }

    console.log('');
  } catch (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Cleanup command handler
 * @param {Array} args - Command line arguments
 */
async function cleanup(args) {
  try {
    const flags = parseFlags(args);

    if (!flags.hasFlags) {
      // No flags provided - enter interactive mode
      await interactiveCleanup();
    } else {
      // Flags provided - use flag-based mode
      await flagBasedCleanup(flags);
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
module.exports = { cleanup };
