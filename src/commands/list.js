/**
 * List Command
 *
 * Display available artifacts (skills, commands, packages)
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
    tier: 'all', // 'free', 'premium', 'all'
    type: 'all' // 'skill', 'command', 'package', 'all'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tier') {
      flags.tier = args[++i];
    } else if (args[i] === '--type') {
      flags.type = args[++i];
    }
  }

  return flags;
}

/**
 * List command handler
 * @param {Array} args - Command line arguments
 */
async function list(args) {
  try {
    const flags = parseFlags(args);

    // Load catalog
    logger.progress('Loading catalog...');
    const cat = catalog.loadCatalog();

    // Load registry to check installed status
    const globalInstalled = registry.getInstalledArtifacts('global');
    const globalInstalledNames = globalInstalled.map(a => a.name);

    const globalPackages = registry.getInstalledPackages('global');
    const globalPackageNames = globalPackages.map(p => p.name);

    // Filter by tier and type
    const skills = flags.type === 'all' || flags.type === 'skill' ? cat.skills : [];
    const commands = flags.type === 'all' || flags.type === 'command' ? cat.commands : [];
    const packages = flags.type === 'all' || flags.type === 'package' ? cat.packages : [];

    // Show free tier
    if (flags.tier === 'all' || flags.tier === 'free') {
      const freeSkills = skills.filter(s => s.tier === 'free');
      const freeCommands = commands.filter(c => c.tier === 'free');
      const freePackages = packages.filter(p => p.tier === 'free');

      logger.log('\nAvailable Artifacts (Free Tier):\n', 'bright');

      // Skills
      if (freeSkills.length > 0) {
        logger.log('Skills:', 'bright');
        freeSkills.forEach(skill => {
          const mark = globalInstalledNames.includes(skill.name) ? '✓' : ' ';
          const installedText = globalInstalledNames.includes(skill.name)
            ? '[INSTALLED globally]'
            : '';
          const color = mark === '✓' ? 'green' : 'reset';

          logger.log(`  ${mark} ${skill.name} (v${skill.version}) ${installedText}`, color);
          console.log(`     ${skill.description}`);
        });
        console.log('');
      }

      // Commands
      if (freeCommands.length > 0) {
        logger.log('Commands:', 'bright');
        freeCommands.forEach(cmd => {
          const mark = globalInstalledNames.includes(cmd.name) ? '✓' : ' ';
          const installedText = globalInstalledNames.includes(cmd.name)
            ? '[INSTALLED globally]'
            : '';
          const color = mark === '✓' ? 'green' : 'reset';

          logger.log(`  ${mark} ${cmd.name} (v${cmd.version}) ${installedText}`, color);
          console.log(`     ${cmd.description}`);
        });
        console.log('');
      }

      // Packages
      if (freePackages.length > 0) {
        logger.log('Packages:', 'bright');
        freePackages.forEach(pkg => {
          const mark = globalPackageNames.includes(pkg.name) ? '✓' : ' ';
          const installedText = globalPackageNames.includes(pkg.name) ? '[INSTALLED globally]' : '';
          const color = mark === '✓' ? 'green' : 'reset';

          logger.log(`  ${mark} ${pkg.name} (v${pkg.version}) ${installedText}`, color);
          console.log(`     ${pkg.description}`);
          if (pkg.artifacts) {
            console.log(`     Includes: ${pkg.artifacts.length} artifact(s)`);
          }
        });
        console.log('');
      }

      if (freeSkills.length === 0 && freeCommands.length === 0 && freePackages.length === 0) {
        logger.info('No free tier artifacts found');
        console.log('');
      }
    }

    // Show premium tier
    if (flags.tier === 'all' || flags.tier === 'premium') {
      const premiumSkills = skills.filter(s => s.tier === 'premium');
      const premiumCommands = commands.filter(c => c.tier === 'premium');
      const premiumPackages = packages.filter(p => p.tier === 'premium');

      if (premiumSkills.length > 0 || premiumCommands.length > 0 || premiumPackages.length > 0) {
        logger.log('Premium Artifacts:', 'bright');

        // Check if user has premium access
        const hasLocked =
          premiumSkills.some(s => s.locked) ||
          premiumCommands.some(c => c.locked) ||
          premiumPackages.some(p => p.locked);

        if (hasLocked) {
          logger.log('(Locked - Activate license with "ccm activate LICENSE_KEY")\n', 'dim');
        }

        // Skills
        if (premiumSkills.length > 0) {
          logger.log('Skills:', 'bright');
          premiumSkills.forEach(skill => {
            if (skill.locked) {
              logger.log(`  🔒 ${skill.name} (v${skill.version})`, 'yellow');
            } else {
              const mark = globalInstalledNames.includes(skill.name) ? '✓' : ' ';
              const installedText = globalInstalledNames.includes(skill.name)
                ? '[INSTALLED globally]'
                : '';
              const color = mark === '✓' ? 'green' : 'reset';
              logger.log(`  ${mark} ${skill.name} (v${skill.version}) ${installedText}`, color);
            }
            console.log(`     ${skill.description}`);
          });
          console.log('');
        }

        // Commands
        if (premiumCommands.length > 0) {
          logger.log('Commands:', 'bright');
          premiumCommands.forEach(cmd => {
            if (cmd.locked) {
              logger.log(`  🔒 ${cmd.name} (v${cmd.version})`, 'yellow');
            } else {
              const mark = globalInstalledNames.includes(cmd.name) ? '✓' : ' ';
              const installedText = globalInstalledNames.includes(cmd.name)
                ? '[INSTALLED globally]'
                : '';
              const color = mark === '✓' ? 'green' : 'reset';
              logger.log(`  ${mark} ${cmd.name} (v${cmd.version}) ${installedText}`, color);
            }
            console.log(`     ${cmd.description}`);
          });
          console.log('');
        }

        // Packages
        if (premiumPackages.length > 0) {
          logger.log('Packages:', 'bright');
          premiumPackages.forEach(pkg => {
            if (pkg.locked) {
              logger.log(`  🔒 ${pkg.name} (v${pkg.version})`, 'yellow');
            } else {
              const mark = globalPackageNames.includes(pkg.name) ? '✓' : ' ';
              const installedText = globalPackageNames.includes(pkg.name)
                ? '[INSTALLED globally]'
                : '';
              const color = mark === '✓' ? 'green' : 'reset';
              logger.log(`  ${mark} ${pkg.name} (v${pkg.version}) ${installedText}`, color);
            }
            console.log(`     ${pkg.description}`);
          });
          console.log('');
        }

        // Show upgrade message if locked items exist
        if (hasLocked) {
          logger.log('Upgrade to Premium: $9/month', 'bright');
          logger.log('  Run "ccm activate LICENSE_KEY" to unlock premium artifacts\n', 'cyan');
        }
      }
    }
  } catch (error) {
    logger.error(`Failed to load catalog: ${error.message}`);
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { list };
