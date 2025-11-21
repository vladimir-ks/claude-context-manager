#!/usr/bin/env node

/**
 * Uninstall Background Update Checker Service
 *
 * Removes platform-specific schedulers
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const platform = os.platform();

/**
 * Uninstall macOS LaunchAgent
 */
function uninstallMacOS() {
  const homeDir = os.homedir();
  const plistPath = path.join(
    homeDir,
    'Library',
    'LaunchAgents',
    'com.vladks.claude-context-manager.update-checker.plist'
  );

  if (!fs.existsSync(plistPath)) {
    console.log('✓ LaunchAgent not installed');
    return true;
  }

  try {
    // Unload LaunchAgent
    execSync(`launchctl unload "${plistPath}" 2>/dev/null`, { stdio: 'ignore' });
  } catch (error) {
    // Already unloaded or not running
  }

  // Remove plist file
  try {
    fs.unlinkSync(plistPath);
    console.log('✓ macOS LaunchAgent uninstalled');
    return true;
  } catch (error) {
    console.log('✗ Failed to remove LaunchAgent file');
    return false;
  }
}

/**
 * Uninstall Linux systemd user service
 */
function uninstallLinuxSystemd() {
  const homeDir = os.homedir();
  const systemdDir = path.join(homeDir, '.config', 'systemd', 'user');
  const servicePath = path.join(systemdDir, 'ccm-update-checker.service');
  const timerPath = path.join(systemdDir, 'ccm-update-checker.timer');

  if (!fs.existsSync(servicePath) && !fs.existsSync(timerPath)) {
    return false; // Not installed
  }

  try {
    // Stop and disable timer
    execSync('systemctl --user stop ccm-update-checker.timer 2>/dev/null', { stdio: 'ignore' });
    execSync('systemctl --user disable ccm-update-checker.timer 2>/dev/null', { stdio: 'ignore' });

    // Remove files
    if (fs.existsSync(servicePath)) fs.unlinkSync(servicePath);
    if (fs.existsSync(timerPath)) fs.unlinkSync(timerPath);

    execSync('systemctl --user daemon-reload', { stdio: 'ignore' });

    console.log('✓ Linux systemd service uninstalled');
    return true;
  } catch (error) {
    console.log('⚠ Failed to fully uninstall systemd service');
    return false;
  }
}

/**
 * Uninstall Linux cron job
 */
function uninstallLinuxCron() {
  try {
    // Get existing crontab
    let existingCron = '';
    try {
      existingCron = execSync('crontab -l 2>/dev/null', { encoding: 'utf8' });
    } catch (error) {
      console.log('✓ No crontab entries found');
      return true;
    }

    // Check if entry exists
    if (!existingCron.includes('update-checker.js')) {
      return false; // Not installed
    }

    // Remove entry
    const lines = existingCron.split('\n').filter(line => !line.includes('update-checker.js'));

    const newCron = lines.join('\n');

    // Write to temp file and install
    const tmpFile = path.join(os.tmpdir(), 'ccm-crontab.tmp');
    fs.writeFileSync(tmpFile, newCron);

    execSync(`crontab ${tmpFile}`, { stdio: 'inherit' });
    fs.unlinkSync(tmpFile);

    console.log('✓ Linux cron job uninstalled');
    return true;
  } catch (error) {
    console.log('✗ Failed to uninstall cron job');
    return false;
  }
}

/**
 * Uninstall Windows Task Scheduler task
 */
function uninstallWindows() {
  try {
    // Check if task exists
    execSync('schtasks /query /tn "CCMUpdateChecker" 2>nul', { stdio: 'ignore' });

    // Delete task
    execSync('schtasks /delete /tn "CCMUpdateChecker" /f', { stdio: 'inherit' });

    console.log('✓ Windows Task Scheduler task uninstalled');
    return true;
  } catch (error) {
    if (error.message.includes('cannot find')) {
      console.log('✓ Task not installed');
      return true;
    }
    console.log('✗ Failed to uninstall Windows task');
    return false;
  }
}

// Main uninstallation
console.log('\nUninstalling CCM Background Update Checker...\n');

let success = false;

if (platform === 'darwin') {
  success = uninstallMacOS();
} else if (platform === 'linux') {
  const systemdResult = uninstallLinuxSystemd();
  const cronResult = uninstallLinuxCron();
  success = systemdResult || cronResult;

  if (!systemdResult && !cronResult) {
    console.log('✓ No background services found');
    success = true;
  }
} else if (platform === 'win32') {
  success = uninstallWindows();
} else {
  console.log(`✗ Unsupported platform: ${platform}`);
  process.exit(1);
}

if (success) {
  console.log('\n✓ Background update checker uninstalled\n');
} else {
  console.log('\n⚠ Uninstallation completed with warnings\n');
}

process.exit(success ? 0 : 1);
