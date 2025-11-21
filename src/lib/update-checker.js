/**
 * Update Checker - Background update checking system
 *
 * Checks for CCM updates every 8 hours
 * Shows system notification once per 24 hours if update available
 * User can disable with: ccm notifications off
 *
 * Author: Vladimir K.S.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const UPDATE_STATE_FILE = path.join(HOME_DIR, 'update-state.json');
const NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load update state from disk
 */
function loadUpdateState() {
  if (!fs.existsSync(UPDATE_STATE_FILE)) {
    return {
      last_check: null,
      last_notification: null,
      latest_version: null,
      current_version: null,
      notifications_enabled: true
    };
  }

  try {
    const content = fs.readFileSync(UPDATE_STATE_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return {
      last_check: null,
      last_notification: null,
      latest_version: null,
      current_version: null,
      notifications_enabled: true
    };
  }
}

/**
 * Save update state to disk
 */
function saveUpdateState(state) {
  if (!fs.existsSync(HOME_DIR)) {
    fs.mkdirSync(HOME_DIR, { recursive: true, mode: 0o755 });
  }

  fs.writeFileSync(UPDATE_STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o644 });
}

/**
 * Get current installed version
 */
function getCurrentVersion() {
  try {
    const packageJson = require('../../package.json');
    return packageJson.version;
  } catch (error) {
    return null;
  }
}

/**
 * Check NPM registry for latest version
 */
function checkLatestVersion() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'registry.npmjs.org',
      port: 443,
      path: '/@vladimir-ks/claude-context-manager/latest',
      method: 'GET',
      headers: {
        'User-Agent': 'Claude-Context-Manager-Update-Checker'
      }
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);

          // NPM registry can return different structures
          // /latest endpoint returns: { version: "x.y.z", ... }
          // OR full package data: { "dist-tags": { "latest": "x.y.z" }, ... }
          let version = null;

          if (json.version) {
            version = json.version;
          } else if (json['dist-tags'] && json['dist-tags'].latest) {
            version = json['dist-tags'].latest;
          }

          if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
            reject(new Error('Invalid version format from NPM registry'));
            return;
          }

          resolve(version);
        } catch (error) {
          reject(new Error('Failed to parse NPM response'));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Compare semantic versions
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Escape string for shell command (prevent injection)
 */
function escapeShellArg(arg) {
  // Remove any quotes and backslashes, replace with safe characters
  return arg.replace(/["'\\$`]/g, '');
}

/**
 * Show system notification
 */
function showNotification(title, message) {
  const platform = os.platform();

  // Escape title and message to prevent command injection
  const safeTitle = escapeShellArg(title);
  const safeMessage = escapeShellArg(message);

  try {
    if (platform === 'darwin') {
      // macOS - use osascript with properly escaped strings
      const script = `display notification "${safeMessage}" with title "${safeTitle}"`;
      execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
    } else if (platform === 'linux') {
      // Linux - check if notify-send exists first
      try {
        execSync('which notify-send', { stdio: 'ignore' });
        execSync(`notify-send "${safeTitle}" "${safeMessage}"`, { stdio: 'ignore' });
      } catch (error) {
        // notify-send not available, skip notification
      }
    } else if (platform === 'win32') {
      // Windows - simplified PowerShell notification (more reliable)
      // Use msg command instead of complex Toast notifications
      const msgCommand = `msg * /TIME:10 "${safeTitle}: ${safeMessage}"`;
      execSync(msgCommand, { stdio: 'ignore' });
    }
  } catch (error) {
    // Notification failed, silently ignore
  }
}

/**
 * Check for updates and notify if necessary
 */
async function checkForUpdates() {
  const state = loadUpdateState();

  // Check if notifications are disabled
  if (!state.notifications_enabled) {
    return {
      checked: false,
      reason: 'notifications_disabled'
    };
  }

  const currentVersion = getCurrentVersion();

  if (!currentVersion) {
    return {
      checked: false,
      reason: 'version_unknown'
    };
  }

  try {
    const latestVersion = await checkLatestVersion();

    // Update state
    state.last_check = new Date().toISOString();
    state.current_version = currentVersion;
    state.latest_version = latestVersion;

    // Check if update available
    const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;

    if (updateAvailable) {
      // Check notification cooldown
      const now = Date.now();
      const lastNotification = state.last_notification
        ? new Date(state.last_notification).getTime()
        : 0;
      const cooldownExpired = now - lastNotification >= NOTIFICATION_COOLDOWN;

      if (cooldownExpired) {
        // Show notification
        showNotification(
          'CCM Update Available',
          `Version ${latestVersion} is available (you have ${currentVersion}). Run 'npm install -g @vladimir-ks/claude-context-manager@latest' to update.`
        );

        state.last_notification = new Date().toISOString();
      }

      saveUpdateState(state);

      return {
        checked: true,
        update_available: true,
        current_version: currentVersion,
        latest_version: latestVersion,
        notified: cooldownExpired
      };
    } else {
      saveUpdateState(state);

      return {
        checked: true,
        update_available: false,
        current_version: currentVersion,
        latest_version: latestVersion
      };
    }
  } catch (error) {
    return {
      checked: false,
      reason: 'check_failed',
      error: error.message
    };
  }
}

/**
 * Enable notifications
 */
function enableNotifications() {
  const state = loadUpdateState();
  state.notifications_enabled = true;
  saveUpdateState(state);
}

/**
 * Disable notifications
 */
function disableNotifications() {
  const state = loadUpdateState();
  state.notifications_enabled = false;
  saveUpdateState(state);
}

/**
 * Get notification status
 */
function getNotificationStatus() {
  const state = loadUpdateState();
  return {
    enabled: state.notifications_enabled,
    last_check: state.last_check,
    last_notification: state.last_notification,
    current_version: state.current_version,
    latest_version: state.latest_version
  };
}

module.exports = {
  checkForUpdates,
  enableNotifications,
  disableNotifications,
  getNotificationStatus,
  getCurrentVersion,
  checkLatestVersion,
  compareVersions
};
