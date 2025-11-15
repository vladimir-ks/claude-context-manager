/**
 * Search Command
 *
 * Search for artifacts in catalog by name, description, or category
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const catalog = require('../lib/catalog');
const registry = require('../lib/registry');
const logger = require('../utils/logger');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    query: null,
    tier: 'all',    // 'free', 'premium', 'all'
    type: 'all'     // 'skill', 'command', 'package', 'all'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tier') {
      flags.tier = args[++i];
    } else if (args[i] === '--type') {
      flags.type = args[++i];
    } else if (!args[i].startsWith('--')) {
      // First non-flag argument is the query
      if (!flags.query) {
        flags.query = args[i];
      }
    }
  }

  return flags;
}

/**
 * Search command handler
 * @param {Array} args - Command line arguments
 */
async function search(args) {
  try {
    const flags = parseFlags(args);

    // Validate query
    if (!flags.query) {
      logger.error('Missing search query');
      console.log('');
      logger.info('Usage: ccm search <query> [--tier <free|premium|all>] [--type <skill|command|package|all>]');
      logger.info('Example: ccm search pdf --type skill');
      console.log('');
      process.exit(1);
    }

    logger.log(`\nSearching for: "${flags.query}"\n`, 'bright');

    // Load catalog and search
    logger.progress('Searching catalog...');
    const results = catalog.searchArtifacts(flags.query, {
      tier: flags.tier,
      type: flags.type
    });

    if (results.length === 0) {
      logger.warn('No artifacts found matching your search');
      console.log('');
      logger.info('Try:');
      logger.info('  - Different search terms');
      logger.info('  - Removing filters (--tier, --type)');
      logger.info('  - Running "ccm list" to see all available artifacts');
      console.log('');
      process.exit(0);
    }

    // Load registry to check installed status
    const globalInstalled = registry.getInstalledArtifacts('global');
    const globalInstalledNames = globalInstalled.map(a => a.name);

    // Get all project installations
    const projects = registry.getAllProjects();
    const projectInstalledNames = [];
    projects.forEach(project => {
      const artifacts = project.artifacts || [];
      artifacts.forEach(a => projectInstalledNames.push(a.name));
    });

    logger.log(`Found ${results.length} result(s):\n`, 'bright');

    // Group by type
    const skills = results.filter(r => r.type === 'skill');
    const commands = results.filter(r => r.type === 'command');
    const packages = results.filter(r => r.type === 'package');

    // Show skills
    if (skills.length > 0) {
      logger.log('Skills:', 'bright');
      skills.forEach(skill => {
        const globalMark = globalInstalledNames.includes(skill.name) ? '✓ global' : '';
        const projectMark = projectInstalledNames.includes(skill.name) ? '✓ project' : '';
        const installedText = [globalMark, projectMark].filter(Boolean).join(', ');

        if (skill.locked) {
          logger.log(`  🔒 ${skill.name} (v${skill.version})`, 'yellow');
        } else {
          const color = installedText ? 'green' : 'reset';
          const installed = installedText ? `[${installedText}]` : '';
          logger.log(`  ${skill.name} (v${skill.version}) ${installed}`, color);
        }
        console.log(`     ${skill.description}`);

        if (skill.category) {
          console.log(`     Category: ${skill.category}`);
        }
      });
      console.log('');
    }

    // Show commands
    if (commands.length > 0) {
      logger.log('Commands:', 'bright');
      commands.forEach(cmd => {
        const globalMark = globalInstalledNames.includes(cmd.name) ? '✓ global' : '';
        const projectMark = projectInstalledNames.includes(cmd.name) ? '✓ project' : '';
        const installedText = [globalMark, projectMark].filter(Boolean).join(', ');

        if (cmd.locked) {
          logger.log(`  🔒 ${cmd.name} (v${cmd.version})`, 'yellow');
        } else {
          const color = installedText ? 'green' : 'reset';
          const installed = installedText ? `[${installedText}]` : '';
          logger.log(`  ${cmd.name} (v${cmd.version}) ${installed}`, color);
        }
        console.log(`     ${cmd.description}`);

        if (cmd.category) {
          console.log(`     Category: ${cmd.category}`);
        }
      });
      console.log('');
    }

    // Show packages
    if (packages.length > 0) {
      logger.log('Packages:', 'bright');
      packages.forEach(pkg => {
        const globalMark = globalInstalledNames.includes(pkg.name) ? '✓ global' : '';
        const projectMark = projectInstalledNames.includes(pkg.name) ? '✓ project' : '';
        const installedText = [globalMark, projectMark].filter(Boolean).join(', ');

        if (pkg.locked) {
          logger.log(`  🔒 ${pkg.name} (v${pkg.version})`, 'yellow');
        } else {
          const color = installedText ? 'green' : 'reset';
          const installed = installedText ? `[${installedText}]` : '';
          logger.log(`  ${pkg.name} (v${pkg.version}) ${installed}`, color);
        }
        console.log(`     ${pkg.description}`);

        if (pkg.category) {
          console.log(`     Category: ${pkg.category}`);
        }

        if (pkg.artifacts) {
          console.log(`     Includes: ${pkg.artifacts.length} artifact(s)`);
        }
      });
      console.log('');
    }

    // Show install hint for uninstalled items
    const hasUninstalled = results.some(r =>
      !globalInstalledNames.includes(r.name) &&
      !projectInstalledNames.includes(r.name) &&
      !r.locked
    );

    if (hasUninstalled) {
      logger.log('To install:', 'bright');
      logger.info('  ccm install --skill <name> --global');
      logger.info('  ccm install --package <name> --project');
      console.log('');
    }

  } catch (error) {
    logger.error(`Search failed: ${error.message}`);
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { search };
