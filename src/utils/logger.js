/**
 * Logger Utility
 *
 * Provides colored console output with consistent formatting
 * and optional debug file logging with auto-cleanup
 * for Claude Context Manager CLI
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Debug logging configuration
const DEBUG_ENABLED = process.env.CCM_DEBUG === 'true' || process.env.CCM_DEBUG === '1';
const LOG_DIR = path.join(os.homedir(), '.claude-context-manager', 'logs');
const LOG_RETENTION_DAYS = 7; // Keep logs for 7 days
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB per log file

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
  // Use process.stdout.write to avoid newline (allows clearLine to work)
  process.stdout.write(`${colors.dim}⏳ ${msg}${colors.reset}`);
}

/**
 * Clear current line (useful after progress indicator)
 * Uses ANSI escape code to clear line and move cursor to beginning
 */
function clearLine() {
  // \r moves cursor to start of line, \x1b[K clears from cursor to end of line
  process.stdout.write('\r\x1b[K');
}

/**
 * Write debug message to log file (only if CCM_DEBUG=true)
 * @param {string} level - Log level: 'debug', 'info', 'warn', 'error'
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
function debugLog(level, message, data = null) {
  if (!DEBUG_ENABLED) return;

  try {
    // Ensure log directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true, mode: 0o755 });
    }

    // Generate log file path (one file per day)
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(LOG_DIR, `ccm-${date}.log`);

    // Check log file size, rotate if needed
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        // Rotate log
        const rotatedFile = path.join(LOG_DIR, `ccm-${date}-${Date.now()}.log`);
        fs.renameSync(logFile, rotatedFile);
      }
    }

    // Format log entry
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      logEntry += `\n  Data: ${JSON.stringify(data, null, 2)}`;
    }

    logEntry += '\n';

    // Append to log file
    fs.appendFileSync(logFile, logEntry, { mode: 0o644 });

  } catch (error) {
    // Silently ignore logging errors (don't break the app)
  }
}

/**
 * Clean up old log files (keep only last N days)
 */
function cleanupOldLogs() {
  try {
    if (!fs.existsSync(LOG_DIR)) return;

    const now = Date.now();
    const retentionMs = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const files = fs.readdirSync(LOG_DIR);

    files.forEach(file => {
      if (!file.startsWith('ccm-') || !file.endsWith('.log')) return;

      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > retentionMs) {
        fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    // Silently ignore cleanup errors
  }
}

/**
 * Log debug message
 * @param {string} message - Debug message
 * @param {Object} data - Additional data
 */
function debug(message, data = null) {
  if (DEBUG_ENABLED) {
    debugLog('debug', message, data);
    // Also log to console in debug mode
    log(`[DEBUG] ${message}`, 'dim');
    if (data) {
      console.log(data);
    }
  }
}

// Run cleanup on load (async, non-blocking)
if (DEBUG_ENABLED) {
  setImmediate(cleanupOldLogs);
}

// Export all functions
module.exports = {
  log,
  success,
  error,
  warn,
  info,
  progress,
  clearLine,
  debug,
  debugLog,
  cleanupOldLogs,
  colors // Export colors for advanced usage
};
