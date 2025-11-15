/**
 * Logger Utility
 *
 * Provides colored console output with consistent formatting
 * for Claude Context Manager CLI
 *
 * Author: Vladimir K.S.
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log message with color
 * @param {string} message - Message to display
 * @param {string} color - Color name: 'reset', 'bright', 'dim', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'red'
 */
function log(message, color = 'reset') {
  // Convert message to string if not already
  const msg = message == null ? '' : String(message);

  // Validate color, default to reset if invalid
  const selectedColor = colors[color] || colors.reset;

  console.log(`${selectedColor}${msg}${colors.reset}`);
}

/**
 * Success message (green with checkmark)
 * @param {string} message - Success message
 */
function success(message) {
  const msg = message == null ? '' : String(message);
  log(`✓ ${msg}`, 'green');
}

/**
 * Error message (red with X)
 * @param {string} message - Error message
 */
function error(message) {
  const msg = message == null ? '' : String(message);
  log(`✗ ${msg}`, 'red');
}

/**
 * Warning message (yellow with warning triangle)
 * @param {string} message - Warning message
 */
function warn(message) {
  const msg = message == null ? '' : String(message);
  log(`⚠ ${msg}`, 'yellow');
}

/**
 * Info message (cyan with info icon)
 * @param {string} message - Info message
 */
function info(message) {
  const msg = message == null ? '' : String(message);
  log(`ℹ ${msg}`, 'cyan');
}

/**
 * Progress indicator (dim with hourglass)
 * @param {string} message - Progress message
 */
function progress(message) {
  const msg = message == null ? '' : String(message);
  log(`⏳ ${msg}`, 'dim');
}

// Export all functions
module.exports = {
  log,
  success,
  error,
  warn,
  info,
  progress,
  colors // Export colors for advanced usage
};
