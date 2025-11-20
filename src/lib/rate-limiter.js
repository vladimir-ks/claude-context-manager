/**
 * Rate Limiter for Feedback System
 *
 * Tracks feedback submissions and enforces rate limits
 * - 3 submissions per 24 hours
 * - Local tracking in ~/.claude-context-manager/feedback-log.json
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const FEEDBACK_LOG_FILE = path.join(HOME_DIR, 'feedback-log.json');

const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const RATE_LIMIT_COUNT = 3;
const LOG_RETENTION_DAYS = 30;

/**
 * Load feedback log from disk
 *
 * @returns {Object} Feedback log
 */
function loadLog() {
  if (!fs.existsSync(FEEDBACK_LOG_FILE)) {
    return {
      submissions: [],
      rate_limit: {
        window_start: null,
        count: 0,
        limit: RATE_LIMIT_COUNT
      }
    };
  }

  try {
    const content = fs.readFileSync(FEEDBACK_LOG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Log corrupted, return fresh log
    return {
      submissions: [],
      rate_limit: {
        window_start: null,
        count: 0,
        limit: RATE_LIMIT_COUNT
      }
    };
  }
}

/**
 * Save feedback log to disk
 *
 * @param {Object} log - Feedback log
 */
function saveLog(log) {
  // Ensure directory exists
  if (!fs.existsSync(HOME_DIR)) {
    fs.mkdirSync(HOME_DIR, { recursive: true, mode: 0o755 });
  }

  fs.writeFileSync(
    FEEDBACK_LOG_FILE,
    JSON.stringify(log, null, 2),
    { mode: 0o644 }
  );
}

/**
 * Clean up old log entries (older than 30 days)
 *
 * @param {Object} log - Feedback log
 */
function cleanupOldEntries(log) {
  const cutoffDate = new Date(Date.now() - (LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000));

  log.submissions = log.submissions.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= cutoffDate;
  });
}

/**
 * Check if rate limit is exceeded
 *
 * @param {boolean} force - Force submission (bypass rate limit)
 * @returns {Object} Rate limit status
 */
function checkRateLimit(force = false) {
  const log = loadLog();
  const now = Date.now();

  // Clean up old entries first
  cleanupOldEntries(log);

  // Get submissions in current window (last 24 hours)
  const windowStart = now - RATE_LIMIT_WINDOW;
  const recentSubmissions = log.submissions.filter(entry => {
    const entryTime = new Date(entry.timestamp).getTime();
    return entryTime >= windowStart;
  });

  const currentCount = recentSubmissions.length;
  const remaining = Math.max(0, RATE_LIMIT_COUNT - currentCount);
  const exceeded = currentCount >= RATE_LIMIT_COUNT;

  // Calculate when window resets
  let resetsAt = null;
  if (recentSubmissions.length > 0) {
    const oldestSubmission = new Date(recentSubmissions[0].timestamp).getTime();
    resetsAt = new Date(oldestSubmission + RATE_LIMIT_WINDOW);
  }

  return {
    exceeded: exceeded && !force,
    current: currentCount,
    limit: RATE_LIMIT_COUNT,
    remaining: remaining,
    resets_at: resetsAt,
    can_submit: !exceeded || force,
    force_used: force
  };
}

/**
 * Log successful feedback submission
 *
 * @param {Object} submission - Submission details
 * @param {string} submission.message - Feedback message
 * @param {number} submission.issue_number - GitHub issue number
 * @param {string} submission.issue_url - GitHub issue URL
 * @param {boolean} submission.was_duplicate - Whether issue was duplicate
 */
function logSubmission(submission) {
  const log = loadLog();

  const entry = {
    timestamp: new Date().toISOString(),
    message: submission.message.substring(0, 100), // Truncate long messages
    issue_number: submission.issue_number || null,
    issue_url: submission.issue_url || null,
    was_duplicate: submission.was_duplicate || false
  };

  log.submissions.push(entry);

  // Update rate limit counters
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  const recentCount = log.submissions.filter(s => {
    const entryTime = new Date(s.timestamp).getTime();
    return entryTime >= windowStart;
  }).length;

  log.rate_limit.count = recentCount;
  log.rate_limit.window_start = new Date(windowStart).toISOString();

  // Clean up old entries
  cleanupOldEntries(log);

  saveLog(log);
}

/**
 * Get recent submissions
 *
 * @param {number} limit - Maximum number of submissions to return
 * @returns {Array} Recent submissions
 */
function getRecentSubmissions(limit = 10) {
  const log = loadLog();

  // Sort by timestamp descending
  const sorted = log.submissions.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return sorted.slice(0, limit);
}

/**
 * Get feedback statistics
 *
 * @returns {Object} Statistics
 */
function getStatistics() {
  const log = loadLog();
  const now = Date.now();

  // Total submissions
  const total = log.submissions.length;

  // Submissions in last 24 hours
  const windowStart = now - RATE_LIMIT_WINDOW;
  const last24h = log.submissions.filter(s => {
    return new Date(s.timestamp).getTime() >= windowStart;
  }).length;

  // Submissions in last 7 days
  const last7Days = log.submissions.filter(s => {
    return new Date(s.timestamp).getTime() >= (now - (7 * 24 * 60 * 60 * 1000));
  }).length;

  // Duplicate count
  const duplicates = log.submissions.filter(s => s.was_duplicate).length;

  return {
    total_submissions: total,
    last_24_hours: last24h,
    last_7_days: last7Days,
    duplicates_found: duplicates,
    rate_limit: {
      current: last24h,
      limit: RATE_LIMIT_COUNT,
      remaining: Math.max(0, RATE_LIMIT_COUNT - last24h)
    }
  };
}

/**
 * Reset rate limit (for testing or admin purposes)
 */
function resetRateLimit() {
  const log = loadLog();

  log.rate_limit = {
    window_start: null,
    count: 0,
    limit: RATE_LIMIT_COUNT
  };

  saveLog(log);
}

/**
 * Clear all feedback log (for testing or admin purposes)
 */
function clearLog() {
  const log = {
    submissions: [],
    rate_limit: {
      window_start: null,
      count: 0,
      limit: RATE_LIMIT_COUNT
    }
  };

  saveLog(log);
}

module.exports = {
  checkRateLimit,
  logSubmission,
  getRecentSubmissions,
  getStatistics,
  resetRateLimit,
  clearLog,
  RATE_LIMIT_COUNT,
  RATE_LIMIT_WINDOW
};
