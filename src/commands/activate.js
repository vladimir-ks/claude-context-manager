/**
 * Activate Command
 *
 * Activate premium tier license (STUB for v0.2.0)
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const license = require('../lib/license');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    key: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key') {
      flags.key = args[++i];
    } else if (!args[i].startsWith('--')) {
      // First non-flag argument is the key
      if (!flags.key) {
        flags.key = args[i];
      }
    }
  }

  return flags;
}

/**
 * Activate command handler
 * @param {Array} args - Command line arguments
 */
async function activate(args) {
  try {
    const flags = parseFlags(args);

    // Show banner
    logger.log('\n╔═══════════════════════════════════════════════════════════╗', 'bright');
    logger.log('║   Claude Context Manager - Premium Tier Activation       ║', 'bright');
    logger.log('╚═══════════════════════════════════════════════════════════╝\n', 'bright');

    // Check if key provided
    if (!flags.key) {
      logger.warn('Premium tier launching Q1 2025!\n');
      logger.log('The premium tier will include:', 'bright');
      logger.log('  • Advanced skills for specialized workflows', 'reset');
      logger.log('  • Premium commands and integrations', 'reset');
      logger.log('  • Priority support and updates', 'reset');
      logger.log('  • Exclusive content and packages', 'reset');
      console.log('');
      logger.info('Usage: ccm activate <license-key>');
      logger.info('Example: ccm activate --key YOUR-LICENSE-KEY');
      console.log('');
      logger.log('Stay tuned for updates at:', 'bright');
      logger.log('  https://github.com/vladks/claude-context-manager', 'reset');
      console.log('');
      process.exit(0);
    }

    // Attempt validation (stub always fails)
    logger.progress('Validating license key...');
    const result = await license.validateLicense(flags.key);

    if (!result.valid) {
      console.log('');
      logger.warn(result.message || 'License validation not available yet');
      console.log('');
      logger.log('Premium tier launching Q1 2025!', 'bright');
      logger.log('  • Stay tuned for updates', 'reset');
      logger.log('  • https://github.com/vladks/claude-context-manager', 'reset');
      console.log('');
      process.exit(0);
    }

    // If validation succeeds (won't happen in v0.2.0)
    logger.success('License activated successfully!');
    logger.log(`  Tier: ${result.tier}`, 'green');
    logger.log(`  Valid until: ${result.expires || 'Lifetime'}`, 'green');
    console.log('');

    // Update config
    const cfg = config.readConfig();
    cfg.license = {
      key: flags.key,
      tier: result.tier,
      activated_at: new Date().toISOString(),
      expires: result.expires || null
    };
    config.writeConfig(cfg);

    logger.success('Premium features are now available!');
    logger.info('Run "ccm list" to see all available artifacts');
    console.log('');

  } catch (error) {
    logger.error(`Activation failed: ${error.message}`);
    console.log('');
    logger.info('For support, visit:');
    logger.info('  https://github.com/vladks/claude-context-manager/issues');
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { activate };
