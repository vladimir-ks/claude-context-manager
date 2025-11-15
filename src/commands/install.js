/**
 * Install Command
 *
 * Install artifacts to target location (global or project)
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const path = require('path');
const catalog = require('../lib/catalog');
const packageManager = require('../lib/package-manager');
const registry = require('../lib/registry');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    type: null,        // 'skill', 'command', 'package'
    name: null,        // artifact name
    target: null       // 'global' or project path
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
      // Next arg might be project path, or use cwd
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        flags.target = args[++i];
      } else {
        flags.target = process.cwd();
      }
    }
  }

  return flags;
}

/**
 * Validate command flags
 * @param {Object} flags - Parsed flags
 */
function validateFlags(flags) {
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
    logger.info('See: ccm help install');
    process.exit(1);
  }
}

/**
 * Install command handler
 * @param {Array} args - Command line arguments
 */
async function install(args) {
  try {
    // 1. Parse and validate arguments
    const flags = parseFlags(args);
    validateFlags(flags);

    // 2. Determine target paths
    const targetBase = flags.target === 'global'
      ? config.getGlobalClaudeDir()
      : config.getProjectClaudeDir(flags.target);

    const targetLabel = flags.target === 'global' ? 'global' : 'project';

    logger.log(`\nInstalling to ${targetLabel} (${targetBase}):\n`, 'bright');

    // 3. Load catalog
    logger.progress('Loading catalog...');
    const cat = catalog.loadCatalog();

    // 4. Find artifact or package
    const artifact = catalog.getArtifact(flags.type, flags.name);

    if (!artifact) {
      logger.error(`${flags.type} not found: ${flags.name}`);
      logger.info('Run "ccm list" to see available artifacts');
      process.exit(1);
    }

    logger.success(`Found: ${artifact.name} (v${artifact.version})`);
    console.log(`  ${artifact.description}`);
    console.log('');

    // 5. Check if premium and locked
    if (artifact.tier === 'premium' && artifact.locked) {
      logger.error('This is a premium artifact');
      logger.info('Activate your license: ccm activate LICENSE_KEY');
      logger.info('Or upgrade: $9/month for premium access');
      console.log('');
      logger.info('Contact: vlad@vladks.com');
      process.exit(1);
    }

    // 6. If package, get all included artifacts
    let artifactsToInstall = [];

    if (flags.type === 'package') {
      logger.info(`Package includes:`);

      // Read package definition if available
      if (artifact.definition_path) {
        const fs = require('fs');
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
        source_path: artifact.source_path
      }];
    }

    // 7. Check for conflicts
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

    // 8. Install each artifact
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
          source_path: art.source_path
        });

        if (result.backup_path) {
          logger.info(`  Backup: ${result.backup_path}`);
        }
      }
    }

    // 9. If package, update package registry
    if (flags.type === 'package') {
      registry.addPackage(flags.target, {
        name: artifact.name,
        version: artifact.version,
        installed_at: new Date().toISOString(),
        artifacts: artifactsToInstall.map(a => a.name)
      });
    }

    // 10. Show completion message
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

// Export
module.exports = { install };
