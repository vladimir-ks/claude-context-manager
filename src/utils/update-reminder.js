/**
 * Update Reminder Utility
 *
 * Shows non-blocking update reminder on every command
 * Reads cached update state (no network calls)
 * Gracefully degrades if cache missing/corrupt
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const UPDATE_STATE_FILE = path.join(HOME_DIR, 'update-state.json');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

/**
 * Load update state from disk (silent on errors)
 * @returns {Object|null} Update state object or null
 */
function loadUpdateStateQuiet() {
  try {
    if (!fs.existsSync(UPDATE_STATE_FILE)) {
      return null;
    }

    const content = fs.readFileSync(UPDATE_STATE_FILE, 'utf8');
    const state = JSON.parse(content);

    // Validate required fields
    if (!state.current_version || !state.latest_version) {
      return null;
    }

    return state;
  } catch (error) {
    // Silent fail - don't interrupt commands
    return null;
  }
}

/**
 * Compare semantic versions
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
  try {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  } catch (error) {
    return 0; // Invalid versions, treat as equal
  }
}

/**
 * Get update reminder message if update available
 * @returns {string|null} Formatted reminder string or null if no update
 */
function getUpdateReminder() {
  const state = loadUpdateStateQuiet();

  if (!state) {
    return null; // No state file or invalid
  }

  const currentVersion = state.current_version;
  const latestVersion = state.latest_version;

  // Compare versions
  const comparison = compareVersions(latestVersion, currentVersion);

  if (comparison <= 0) {
    // No update available or same version
    return null;
  }

  // Format reminder
  const reminder = `
${colors.bright}Claude Context Manager v${currentVersion}${colors.reset}

${colors.yellow}⚠️  UPDATE AVAILABLE: v${latestVersion}${colors.reset}
${colors.dim}    Run: npm install -g @vladimir-ks/claude-context-manager@latest${colors.reset}

${colors.cyan}─────────────────────────────────────────${colors.reset}
`;

  return reminder;
}

module.exports = {
  getUpdateReminder
};
