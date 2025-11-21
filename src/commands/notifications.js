/**
 * Notifications Command
 *
 * Enable/disable update notifications
 * Show notification status
 *
 * Author: Vladimir K.S.
 */

const updateChecker = require('../lib/update-checker');
const logger = require('../utils/logger');

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const flags = {
    action: null, // 'on', 'off', 'status'
    check: false
  };

  if (args.length === 0) {
    flags.action = 'status';
    return flags;
  }

  const arg = args[0].toLowerCase();

  if (arg === 'on' || arg === 'enable') {
    flags.action = 'on';
  } else if (arg === 'off' || arg === 'disable') {
    flags.action = 'off';
  } else if (arg === 'status' || arg === 'st') {
    flags.action = 'status';
  } else if (arg === 'check') {
    flags.check = true;
  }

  return flags;
}

/**
 * Show notification status
 */
function showStatus() {
  const status = updateChecker.getNotificationStatus();

  console.log('');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  logger.log('  Update Notifications Status', 'bright');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  console.log('');

  logger.log('Status:', 'bright');
  console.log(
    `  ${status.enabled ? logger.colors.green + '✓ Enabled' : logger.colors.yellow + '✗ Disabled'}${logger.colors.reset}`
  );
  console.log('');

  if (status.current_version) {
    logger.log('Versions:', 'bright');
    console.log(`  Current: ${logger.colors.cyan}${status.current_version}${logger.colors.reset}`);

    if (status.latest_version) {
      const isUpToDate =
        updateChecker.compareVersions(status.current_version, status.latest_version) >= 0;
      console.log(
        `  Latest:  ${logger.colors.cyan}${status.latest_version}${logger.colors.reset} ${isUpToDate ? logger.colors.green + '(up to date)' + logger.colors.reset : logger.colors.yellow + '(update available)' + logger.colors.reset}`
      );
    }
    console.log('');
  }

  if (status.last_check) {
    const lastCheck = new Date(status.last_check);
    logger.log('Last Check:', 'bright');
    console.log(`  ${logger.colors.dim}${lastCheck.toLocaleString()}${logger.colors.reset}`);
    console.log('');
  }

  if (status.last_notification) {
    const lastNotif = new Date(status.last_notification);
    logger.log('Last Notification:', 'bright');
    console.log(`  ${logger.colors.dim}${lastNotif.toLocaleString()}${logger.colors.reset}`);
    console.log('');
  }

  logger.log('Usage:', 'bright');
  console.log('  ccm notifications on      Enable notifications');
  console.log('  ccm notifications off     Disable notifications');
  console.log('  ccm notifications check   Check for updates now');
  console.log('');
}

/**
 * Main notifications command handler
 */
async function notifications(args) {
  const flags = parseArgs(args);

  // Enable notifications
  if (flags.action === 'on') {
    updateChecker.enableNotifications();
    console.log('');
    logger.log('✓ Update notifications enabled', 'green');
    console.log('  You will receive notifications when updates are available');
    console.log('');
    return;
  }

  // Disable notifications
  if (flags.action === 'off') {
    updateChecker.disableNotifications();
    console.log('');
    logger.log('✓ Update notifications disabled', 'yellow');
    console.log('  Background checks will still run but no notifications will be shown');
    console.log('');
    return;
  }

  // Check for updates now
  if (flags.check) {
    console.log('');
    logger.progress('Checking for updates...');

    try {
      const result = await updateChecker.checkForUpdates();

      logger.clearLine();

      if (result.update_available) {
        logger.log('✓ Update Available', 'yellow');
        console.log('');
        console.log(
          `  Current: ${logger.colors.cyan}${result.current_version}${logger.colors.reset}`
        );
        console.log(
          `  Latest:  ${logger.colors.green}${result.latest_version}${logger.colors.reset}`
        );
        console.log('');
        logger.log('To update:', 'bright');
        logger.log('  npm install -g @vladimir-ks/claude-context-manager@latest', 'cyan');
        console.log('');
      } else if (result.checked) {
        logger.log('✓ Up to Date', 'green');
        console.log('');
        console.log(
          `  Current version: ${logger.colors.cyan}${result.current_version}${logger.colors.reset}`
        );
        console.log('');
      } else {
        logger.log('✗ Check Failed', 'red');
        console.log('');
        console.log(`  Reason: ${result.reason || result.error || 'Unknown'}`);
        console.log('');
      }
    } catch (error) {
      logger.clearLine();
      logger.log('✗ Check Failed', 'red');
      console.log('');
      console.log(`  Error: ${error.message}`);
      console.log('');
    }

    return;
  }

  // Show status (default)
  showStatus();
}

module.exports = {
  notifications
};
