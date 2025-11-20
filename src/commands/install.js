/**
 * Install Command
 *
 * Install artifacts to target location (global or project)
 * Supports both interactive mode and flag-based mode
 *
 * Author: Vladimir K.S.
 */

const path = require('path');
const fs = require('fs');
const catalog = require('../lib/catalog');
const packageManager = require('../lib/package-manager');
const registry = require('../lib/registry');
const config = require('../utils/config');
const logger = require('../utils/logger');
const menu = require('../lib/interactive-menu');
const multiLocation = require('../lib/multi-location-tracker');
const conflictDetector = require('../lib/conflict-detector');
const backupManager = require('../lib/backup-manager');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    type: null,        // 'skill', 'command', 'package'
    name: null,        // artifact name
    target: null,      // 'global' or project path
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
    }
  }

  return flags;
}

/**
 * Interactive installation flow
 */
async function interactiveInstall() {
  try {
    logger.log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    logger.log('║  Claude Context Manager - Interactive Installation    ║', 'bright');
    logger.log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    // Step 1: Select package type
    logger.log('Step 1/4: What would you like to install?\n', 'bright');
    const packageType = await menu.selectPackageType();
    console.log('');

    // Step 2: Load catalog and get available items
    logger.progress('Loading catalog...');
    const cat = catalog.loadCatalog();
    logger.clearLine();

    let selectedItems = [];
    let artifactsToInstall = [];

    if (packageType === 'solutions') {
      // Get available packages
      const availablePackages = [];

      if (cat.free && cat.free.packages) {
        cat.free.packages.forEach(pkg => {
          availablePackages.push({
            name: pkg.name,
            description: pkg.description,
            locked: false
          });
        });
      }

      if (cat.premium && cat.premium.packages) {
        cat.premium.packages.forEach(pkg => {
          availablePackages.push({
            name: pkg.name,
            description: pkg.description,
            locked: pkg.locked || false
          });
        });
      }

      logger.log('Step 2/4: Select packages to install\n', 'bright');
      selectedItems = await menu.selectPackages(availablePackages);
      console.log('');

      // Expand packages to artifacts
      for (const pkgName of selectedItems) {
        const pkg = catalog.getArtifact('package', pkgName);

        if (pkg && pkg.definition_path) {
          const packageDefPath = path.join(__dirname, '..', '..', pkg.definition_path);

          if (fs.existsSync(packageDefPath)) {
            const packageDef = JSON.parse(fs.readFileSync(packageDefPath, 'utf8'));
            artifactsToInstall.push(...(packageDef.artifacts || []));
          }
        }
      }

    } else {
      // Individual artifacts
      const availableArtifacts = [];

      if (cat.free && cat.free.skills) {
        cat.free.skills.forEach(skill => {
          availableArtifacts.push({
            name: skill.name,
            type: 'skill',
            description: skill.description,
            locked: false
          });
        });
      }

      if (cat.premium && cat.premium.skills) {
        cat.premium.skills.forEach(skill => {
          availableArtifacts.push({
            name: skill.name,
            type: 'skill',
            description: skill.description,
            locked: skill.locked || false
          });
        });
      }

      logger.log('Step 2/4: Select artifacts to install\n', 'bright');
      selectedItems = await menu.selectArtifacts(availableArtifacts);
      console.log('');

      // Convert to artifacts format
      selectedItems.forEach(name => {
        const artifact = catalog.getArtifact('skill', name);
        if (artifact) {
          artifactsToInstall.push({
            type: 'skill',
            name: artifact.name,
            source_path: artifact.source_path,
            version: artifact.version
          });
        } else {
          logger.warn(`Warning: Artifact not found in catalog: ${name}`);
        }
      });
    }

    if (artifactsToInstall.length === 0) {
      logger.warn('No items selected. Exiting.');
      return;
    }

    // Step 3: Select installation location
    logger.log('Step 3/4: Where would you like to install?\n', 'bright');
    const installType = await menu.selectInstallType();
    console.log('');

    // Determine target locations
    const targetLocations = [];
    if (installType === 'global' || installType === 'both') {
      targetLocations.push('global');
    }
    if (installType === 'project' || installType === 'both') {
      targetLocations.push(process.cwd());
    }

    // Step 4: Detect conflicts
    logger.progress('Checking for conflicts...');
    const artifactNames = artifactsToInstall.map(a => a.name);
    const artifactMetadata = {};
    artifactsToInstall.forEach(a => {
      artifactMetadata[a.name] = { version: a.version };
    });

    const conflicts = conflictDetector.detectConflicts(
      artifactNames,
      targetLocations,
      artifactMetadata
    );

    logger.clearLine();

    // Ask about backup if conflicts exist
    let backupChoice = 'no-backup';
    if (conflicts.length > 0) {
      const conflictList = conflicts.map(c => ({
        name: c.name,
        location: c.location === 'global' ? 'Global (~/.claude)' : c.location
      }));

      backupChoice = await menu.confirmBackup(conflictList);
      console.log('');

      if (backupChoice === 'cancel') {
        logger.warn('Installation cancelled by user.');
        return;
      }
    }

    // Step 5: Install artifacts
    logger.log('\nStep 4/4: Installing artifacts\n', 'bright');

    let installedCount = 0;
    let failedCount = 0;

    for (const location of targetLocations) {
      const locationLabel = location === 'global' ? 'Global (~/.claude)' : location;
      logger.log(`\nInstalling to: ${locationLabel}\n`, 'cyan');

      const targetBase = location === 'global'
        ? config.getGlobalClaudeDir()
        : config.getProjectClaudeDir(location);

      for (const art of artifactsToInstall) {
        try {
          // Check if artifact exists and needs backup
          const artifactConflict = conflicts.find(c =>
            c.name === art.name && c.location === location
          );

          if (artifactConflict && backupChoice === 'backup') {
            // Determine current artifact path
            let artifactPath;
            if (location === 'global') {
              const homeDir = config.getHomeDir();
              if (art.type === 'skill') {
                artifactPath = path.join(homeDir, 'skills', art.name);
              } else if (art.type === 'command' || art.type === 'command_group') {
                artifactPath = path.join(homeDir, 'commands', art.name);
              }
            } else {
              if (art.type === 'skill') {
                artifactPath = path.join(location, '.claude', 'skills', art.name);
              } else if (art.type === 'command' || art.type === 'command_group') {
                artifactPath = path.join(location, '.claude', 'commands', art.name);
              }
            }

            if (artifactPath && fs.existsSync(artifactPath)) {
              logger.progress(`  Creating backup: ${art.name}...`);

              backupManager.createBackup(
                artifactPath,
                art.name,
                location,
                {
                  backup_reason: 'pre_install',
                  version_before: artifactConflict.details.current_version,
                  version_after: art.version
                }
              );

              logger.clearLine();
            }
          }

          // Determine source and target paths
          let sourcePath;
          if (art.source_path) {
            sourcePath = path.join(__dirname, '..', '..', art.source_path);
          } else {
            // Fallback pattern
            const typeDir = art.type === 'skill' ? 'skills' : 'commands';
            sourcePath = path.join(__dirname, '..', '..', '.claude', typeDir, art.name);
          }

          let targetPath;
          if (art.type === 'skill') {
            targetPath = path.join(targetBase, 'skills', art.name);
          } else if (art.type === 'command' || art.type === 'command_group') {
            targetPath = path.join(targetBase, 'commands', art.name);
          } else {
            throw new Error(`Unknown artifact type: ${art.type}`);
          }

          logger.progress(`  Installing ${art.name}...`);

          // Install using package manager
          const result = await packageManager.installArtifact(sourcePath, targetPath, {
            name: art.name,
            type: art.type,
            version: art.version
          });

          if (result.success) {
            logger.clearLine();
            logger.success(`  ✓ ${art.name}`);

            // Add to registry
            registry.addArtifact(location, {
              name: art.name,
              type: art.type,
              version: art.version,
              checksum: result.checksum,
              installed_at: new Date().toISOString(),
              updated_at: null,
              source_path: art.source_path,
              user_modified: false,
              modification_checksum: null,
              installed_locations: [location]
            });

            // Track installation location
            multiLocation.addInstallationLocation(art.name, location);

            installedCount++;
          }

        } catch (error) {
          logger.clearLine();
          logger.error(`  ✗ ${art.name}: ${error.message}`);
          failedCount++;
        }
      }
    }

    // Show completion summary
    console.log('');
    logger.log('═══════════════════════════════════════════════════════', 'cyan');

    if (installedCount > 0) {
      logger.log(`✓ Installation Complete!`, 'green');
      logger.log(`  ${installedCount} artifact(s) installed successfully`, 'green');
    }

    if (failedCount > 0) {
      logger.warn(`  ${failedCount} artifact(s) failed`);
    }

    console.log('');
    logger.info('Installed artifacts are now available in Claude Code.');
    logger.info('Restart Claude Code if currently running.');
    console.log('');

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      // User cancelled with Ctrl+C
      logger.warn('\nInstallation cancelled by user.');
      return;
    }
    throw error;
  }
}

/**
 * Flag-based installation (backward compatibility)
 */
async function flagBasedInstall(flags) {
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
      errors.push('Missing target: --global or --project [path]');
    }

    if (errors.length > 0) {
      logger.error('Invalid arguments:');
      errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
      logger.info('Usage: ccm install --skill <name> --global');
      logger.info('       ccm install --package <name> --project');
      logger.info('       ccm install (interactive mode)');
      logger.info('See: ccm help install');
      process.exit(1);
    }

    // Determine target paths
    const targetBase = flags.target === 'global'
      ? config.getGlobalClaudeDir()
      : config.getProjectClaudeDir(flags.target);

    const targetLabel = flags.target === 'global' ? 'global' : 'project';

    logger.log(`\nInstalling to ${targetLabel} (${targetBase}):\n`, 'bright');

    // Load catalog
    logger.progress('Loading catalog...');
    const cat = catalog.loadCatalog();

    // Find artifact or package
    const artifact = catalog.getArtifact(flags.type, flags.name);

    if (!artifact) {
      logger.error(`${flags.type} not found: ${flags.name}`);
      logger.info('Run "ccm list" to see available artifacts');
      process.exit(1);
    }

    logger.success(`Found: ${artifact.name} (v${artifact.version})`);
    console.log(`  ${artifact.description}`);
    console.log('');

    // Check if premium and locked
    if (artifact.tier === 'premium' && artifact.locked) {
      logger.error('This is a premium artifact');
      logger.info('Activate your license: ccm activate LICENSE_KEY');
      logger.info('Or upgrade: $9/month for premium access');
      console.log('');
      logger.info('Contact: vlad@vladks.com');
      process.exit(1);
    }

    // If package, get all included artifacts
    let artifactsToInstall = [];

    if (flags.type === 'package') {
      logger.info(`Package includes:`);

      // Read package definition if available
      if (artifact.definition_path) {
        const packageDefPath = path.join(__dirname, '..', '..', artifact.definition_path);

        if (fs.existsSync(packageDefPath)) {
          const packageDef = JSON.parse(fs.readFileSync(packageDefPath, 'utf8'));
          artifactsToInstall = packageDef.artifacts || [];

          artifactsToInstall.forEach(a => {
            console.log(`  - ${a.name} (${a.type})`);
          });
        }
      }

      if (artifactsToInstall.length === 0) {
        // Fallback to artifacts list in metadata
        artifactsToInstall = artifact.artifacts || [];
        artifactsToInstall.forEach(a => {
          console.log(`  - ${a.name} (${a.type})`);
        });
      }

      console.log('');
    } else {
      // Single artifact
      artifactsToInstall = [{
        type: flags.type,
        name: artifact.name,
        source_path: artifact.source_path,
        version: artifact.version
      }];
    }

    // Check for conflicts
    logger.progress('Checking for conflicts...');
    const conflicts = [];

    for (const art of artifactsToInstall) {
      if (registry.isInstalled(flags.target, art.name)) {
        conflicts.push(art.name);
      }
    }

    if (conflicts.length > 0) {
      logger.warn(`${conflicts.length} artifact(s) already installed:`);
      conflicts.forEach(name => console.log(`  - ${name}`));
      logger.info('Backups will be created before overwriting');
      console.log('');
    }

    // Install each artifact
    logger.log('Installing artifacts:\n', 'bright');

    for (const art of artifactsToInstall) {
      // Determine source path
      const sourcePath = path.join(__dirname, '..', '..', art.source_path || `.claude/${art.type}s/${art.name}/`);

      // Determine target path
      const targetPath = path.join(targetBase, `${art.type}s`, art.name);

      logger.progress(`Installing ${art.name}...`);

      // Install using package manager
      const result = await packageManager.installArtifact(sourcePath, targetPath, {
        name: art.name,
        type: art.type,
        version: artifact.version
      });

      if (result.success) {
        logger.success(`Installed ${art.name} (${art.type})`);

        // Update registry
        registry.addArtifact(flags.target, {
          name: art.name,
          type: art.type,
          version: artifact.version,
          checksum: result.checksum,
          installed_at: new Date().toISOString(),
          updated_at: null,
          source_path: art.source_path,
          user_modified: false,
          modification_checksum: null,
          installed_locations: [flags.target]
        });

        // Track location
        multiLocation.addInstallationLocation(art.name, flags.target);

        if (result.backup_path) {
          logger.info(`  Backup: ${result.backup_path}`);
        }
      }
    }

    // If package, update package registry
    if (flags.type === 'package') {
      registry.addPackage(flags.target, {
        name: artifact.name,
        version: artifact.version,
        installed_at: new Date().toISOString(),
        artifacts: artifactsToInstall.map(a => a.name)
      });
    }

    // Show completion message
    console.log('');
    logger.log('✓ Installation complete!\n', 'green');
    logger.info('Installed artifacts are now available in Claude Code.');

    if (targetLabel === 'project') {
      logger.info(`Restart Claude Code if currently working in this project.`);
    } else {
      logger.info('Restart Claude Code if currently running.');
    }

    console.log('');

  } catch (error) {
    logger.error(`Installation failed: ${error.message}`);

    if (error.code === 'ENOENT') {
      logger.info('Source artifact not found');
      logger.info('Try reinstalling: npm install -g @vladimir-ks/claude-context-manager --force');
    } else if (error.code === 'EACCES') {
      logger.info('Permission denied');
      logger.info('Check directory permissions or try with sudo');
    }

    console.log('');
    process.exit(1);
  }
}

/**
 * Install command handler
 * @param {Array} args - Command line arguments
 */
async function install(args) {
  try {
    const flags = parseFlags(args);

    if (!flags.hasFlags) {
      // No flags provided - enter interactive mode
      await interactiveInstall();
    } else {
      // Flags provided - use flag-based mode
      await flagBasedInstall(flags);
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
module.exports = { install };
