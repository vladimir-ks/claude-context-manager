/**
 * Uninstall Command
 *
 * Remove artifacts from target locations with multi-location support
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
const multiLocation = require('../lib/multi-location-tracker');
const backupManager = require('../lib/backup-manager');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    type: null, // 'skill', 'command', 'package'
    name: null, // artifact name
    target: null, // 'global', project path, or 'all'
    hasFlags: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skill') {
      flags.type = 'skill';
      flags.name = args[++i];
      flags.hasFlags = true;
    } else if (args[i] === '--command') {
      flags.type = 'command';
      flags.name = args[++i];
      flags.hasFlags = true;
    } else if (args[i] === '--package') {
      flags.type = 'package';
      flags.name = args[++i];
      flags.hasFlags = true;
    } else if (args[i] === '--global' || args[i] === '-g') {
      flags.target = 'global';
      flags.hasFlags = true;
    } else if (args[i] === '--project' || args[i] === '-p') {
      // Next arg might be project path, or use cwd
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        flags.target = args[++i];
      } else {
        flags.target = process.cwd();
      }
      flags.hasFlags = true;
    } else if (args[i] === '--all') {
      flags.target = 'all';
      flags.hasFlags = true;
    }
  }

  return flags;
}

/**
 * Interactive uninstall flow
 */
async function interactiveUninstall() {
  try {
    logger.log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    logger.log('║  Claude Context Manager - Interactive Uninstall       ║', 'bright');
    logger.log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    // Step 1: Select uninstall scope
    logger.log('Step 1/3: Select uninstall scope\n', 'bright');
    const scope = await menu.selectUninstallScope();
    console.log('');

    // Determine target locations
    let targetLocations = [];
    if (scope === 'global') {
      targetLocations = ['global'];
    } else if (scope === 'project') {
      targetLocations = [process.cwd()];
    } else if (scope === 'all') {
      targetLocations = ['global'];
      // Add all registered projects
      const reg = registry.load();
      if (reg.installations.projects) {
        reg.installations.projects.forEach(proj => {
          targetLocations.push(proj.project_path);
        });
      }
    }

    // Step 2: Collect installed artifacts from target locations
    const installedMap = new Map(); // artifact name -> locations[]

    targetLocations.forEach(location => {
      const artifacts =
        location === 'global'
          ? registry.getGlobalArtifacts()
          : registry.getProjectArtifacts(location);

      artifacts.forEach(art => {
        if (!installedMap.has(art.name)) {
          installedMap.set(art.name, {
            name: art.name,
            type: art.type,
            locations: []
          });
        }
        installedMap.get(art.name).locations.push(location);
      });
    });

    const installedArtifacts = Array.from(installedMap.values());

    if (installedArtifacts.length === 0) {
      logger.warn('No artifacts installed in selected scope.');
      return;
    }

    // Step 2: Select artifacts to uninstall
    logger.log('Step 2/3: Select artifacts to uninstall\n', 'bright');
    const selectedArtifacts = await menu.selectItemsToUninstall(installedArtifacts);
    console.log('');

    if (selectedArtifacts.length === 0) {
      logger.warn('No artifacts selected. Exiting.');
      return;
    }

    // Step 3: For artifacts in multiple locations, let user select locations
    const uninstallPlan = []; // { name, locations: [] }

    for (const artifactName of selectedArtifacts) {
      const artifactInfo = installedMap.get(artifactName);

      if (artifactInfo.locations.length > 1) {
        logger.log(
          `\nArtifact '${artifactName}' is installed in ${artifactInfo.locations.length} locations`,
          'bright'
        );
        logger.log('Select locations to remove from:\n', 'bright');

        const selectedLocations = await menu.selectLocations(artifactName, artifactInfo.locations);
        console.log('');

        if (selectedLocations.length > 0) {
          uninstallPlan.push({
            name: artifactName,
            type: artifactInfo.type,
            locations: selectedLocations
          });
        }
      } else {
        // Single location
        uninstallPlan.push({
          name: artifactName,
          type: artifactInfo.type,
          locations: artifactInfo.locations
        });
      }
    }

    if (uninstallPlan.length === 0) {
      logger.warn('No locations selected for uninstall. Exiting.');
      return;
    }

    // Step 4: Confirm uninstall
    console.log('');
    logger.log('The following will be uninstalled:\n', 'yellow');
    uninstallPlan.forEach(plan => {
      console.log(`  ${plan.name}:`);
      plan.locations.forEach(loc => {
        const locLabel = loc === 'global' ? 'Global (~/.claude)' : loc;
        console.log(`    - ${locLabel}`);
      });
    });
    console.log('');

    const confirmed = await menu.confirmAction('Proceed with uninstall?', false);
    console.log('');

    if (!confirmed) {
      logger.warn('Uninstall cancelled by user.');
      return;
    }

    // Step 5: Uninstall artifacts
    logger.log('Step 3/3: Uninstalling artifacts\n', 'bright');

    let uninstalledCount = 0;
    let failedCount = 0;

    for (const plan of uninstallPlan) {
      logger.log(`\nUninstalling: ${plan.name}\n`, 'cyan');

      for (const location of plan.locations) {
        const locationLabel = location === 'global' ? '  Global (~/.claude)' : `  ${location}`;

        try {
          // Construct artifact path
          let artifactPath;
          if (location === 'global') {
            const homeDir = config.getHomeDir();
            if (plan.type === 'skill') {
              artifactPath = path.join(homeDir, 'skills', plan.name);
            } else if (plan.type === 'command') {
              artifactPath = path.join(homeDir, 'commands', plan.name);
            }
          } else {
            if (plan.type === 'skill') {
              artifactPath = path.join(location, '.claude', 'skills', plan.name);
            } else if (plan.type === 'command') {
              artifactPath = path.join(location, '.claude', 'commands', plan.name);
            }
          }

          if (!artifactPath) {
            logger.error(`${locationLabel}: Unknown type ${plan.type}`);
            failedCount++;
            continue;
          }

          // Check if exists
          if (!fs.existsSync(artifactPath)) {
            logger.warn(`${locationLabel}: Not found, skipping`);
            continue;
          }

          // Create backup before removing
          try {
            const artifact = registry.getArtifact(location, plan.name);
            backupManager.createBackup(artifactPath, plan.name, location, {
              backup_reason: 'pre_uninstall',
              version_before: artifact ? artifact.version : 'unknown'
            });
          } catch (backupError) {
            logger.warn(`${locationLabel}: Backup failed, continuing...`);
          }

          // Remove artifact
          fs.rmSync(artifactPath, { recursive: true, force: true });

          // Remove from registry
          registry.removeArtifact(location, plan.name);

          // Update multi-location tracking
          multiLocation.removeInstallationLocation(plan.name, location);

          logger.success(`${locationLabel}: ✓ Removed`);
          uninstalledCount++;
        } catch (error) {
          logger.error(`${locationLabel}: ✗ ${error.message}`);
          failedCount++;
        }
      }
    }

    // Show completion summary
    console.log('');
    logger.log('═══════════════════════════════════════════════════════', 'cyan');

    if (uninstalledCount > 0) {
      logger.log('✓ Uninstall Complete!', 'green');
      logger.log(`  ${uninstalledCount} artifact(s) removed successfully`, 'green');
      logger.info('  Backups created in ~/.claude-context-manager/backups/');
    }

    if (failedCount > 0) {
      logger.warn(`  ${failedCount} artifact(s) failed`);
    }

    console.log('');
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      logger.warn('\nUninstall cancelled by user.');
      return;
    }
    throw error;
  }
}

/**
 * Flag-based uninstall (backward compatibility)
 */
async function flagBasedUninstall(flags) {
  try {
    // Validate flags
    const errors = [];

    if (!flags.type) {
      errors.push('Missing required flag: --skill, --command, or --package');
    }

    if (!flags.name) {
      errors.push('Missing artifact name');
    }

    if (!flags.target) {
      errors.push('Missing target: --global, --project [path], or --all');
    }

    if (errors.length > 0) {
      logger.error('Invalid arguments:');
      errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
      logger.info('Usage: ccm uninstall --skill <name> --global');
      logger.info('       ccm uninstall --package <name> --project');
      logger.info('       ccm uninstall --skill <name> --all');
      logger.info('       ccm uninstall (interactive mode)');
      logger.info('See: ccm help uninstall');
      process.exit(1);
    }

    // Determine target locations
    let targetLocations = [];
    if (flags.target === 'global') {
      targetLocations = ['global'];
    } else if (flags.target === 'all') {
      targetLocations = ['global'];
      const reg = registry.load();
      if (reg.installations.projects) {
        reg.installations.projects.forEach(proj => {
          targetLocations.push(proj.project_path);
        });
      }
    } else {
      targetLocations = [flags.target];
    }

    logger.log(
      `\nUninstalling ${flags.name} from ${targetLocations.length} location(s):\n`,
      'bright'
    );

    let uninstalledCount = 0;
    let notFoundCount = 0;

    for (const location of targetLocations) {
      const locationLabel = location === 'global' ? 'Global (~/.claude)' : location;

      // Check if installed
      if (!registry.isInstalled(location, flags.name)) {
        logger.warn(`${locationLabel}: Not installed`);
        notFoundCount++;
        continue;
      }

      // Construct artifact path
      let artifactPath;
      if (location === 'global') {
        const homeDir = config.getHomeDir();
        if (flags.type === 'skill') {
          artifactPath = path.join(homeDir, 'skills', flags.name);
        } else if (flags.type === 'command') {
          artifactPath = path.join(homeDir, 'commands', flags.name);
        }
      } else {
        if (flags.type === 'skill') {
          artifactPath = path.join(location, '.claude', 'skills', flags.name);
        } else if (flags.type === 'command') {
          artifactPath = path.join(location, '.claude', 'commands', flags.name);
        }
      }

      if (!artifactPath || !fs.existsSync(artifactPath)) {
        logger.warn(`${locationLabel}: File not found`);
        notFoundCount++;
        continue;
      }

      try {
        // Create backup
        const artifact = registry.getArtifact(location, flags.name);
        backupManager.createBackup(artifactPath, flags.name, location, {
          backup_reason: 'pre_uninstall',
          version_before: artifact ? artifact.version : 'unknown'
        });

        // Remove artifact
        fs.rmSync(artifactPath, { recursive: true, force: true });

        // Remove from registry
        registry.removeArtifact(location, flags.name);

        // Update multi-location tracking
        multiLocation.removeInstallationLocation(flags.name, location);

        logger.success(`${locationLabel}: Removed`);
        uninstalledCount++;
      } catch (error) {
        logger.error(`${locationLabel}: ${error.message}`);
      }
    }

    // Show summary
    console.log('');
    logger.log('✓ Uninstall complete!\n', 'green');
    logger.log(`  Removed from ${uninstalledCount} location(s)`, 'green');

    if (notFoundCount > 0) {
      logger.warn(`  Not found in ${notFoundCount} location(s)`);
    }

    logger.info('  Backups created in ~/.claude-context-manager/backups/');
    console.log('');
  } catch (error) {
    logger.error(`Uninstall failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Uninstall command handler
 * @param {Array} args - Command line arguments
 */
async function uninstall(args) {
  try {
    const flags = parseFlags(args);

    if (!flags.hasFlags) {
      // No flags provided - enter interactive mode
      await interactiveUninstall();
    } else {
      // Flags provided - use flag-based mode
      await flagBasedUninstall(flags);
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
module.exports = { uninstall };
