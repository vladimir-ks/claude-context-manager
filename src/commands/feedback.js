/**
 * Feedback Command
 *
 * Submit feedback, bug reports, and feature requests to GitHub
 * with duplicate detection and rate limiting
 *
 * Author: Vladimir K.S.
 */

const githubApi = require('../lib/github-api');
const rateLimiter = require('../lib/rate-limiter');
const logger = require('../utils/logger');
const packageJson = require('../../package.json');
const os = require('os');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Parse command line arguments
 *
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseArgs(args) {
  const flags = {
    message: null,
    includeSystemInfo: false,
    force: false,
    status: false,
    list: false,
    retry: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--include-system-info') {
      flags.includeSystemInfo = true;
    } else if (arg === '--force') {
      flags.force = true;
    } else if (arg === '--status') {
      flags.status = true;
    } else if (arg === '--list') {
      flags.list = true;
    } else if (arg === '--retry') {
      flags.retry = true;
    } else if (!arg.startsWith('--') && !flags.message) {
      flags.message = arg;
    }
  }

  return flags;
}

/**
 * Show rate limit status
 */
function showStatus() {
  const stats = rateLimiter.getStatistics();
  const rateLimit = rateLimiter.checkRateLimit();

  console.log('');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  logger.log('  Feedback System Status', 'bright');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  console.log('');

  logger.log('Rate Limit:', 'bright');
  console.log(`  Current: ${colors.cyan}${rateLimit.current}${colors.reset}/${rateLimit.limit} submissions`);
  console.log(`  Remaining: ${colors.green}${rateLimit.remaining}${colors.reset} submissions`);

  if (rateLimit.resets_at) {
    console.log(`  Resets: ${colors.yellow}${rateLimit.resets_at.toLocaleString()}${colors.reset}`);
  } else {
    console.log(`  Resets: ${colors.dim}No active window${colors.reset}`);
  }

  console.log('');
  logger.log('Statistics:', 'bright');
  console.log(`  Total submissions: ${colors.cyan}${stats.total_submissions}${colors.reset}`);
  console.log(`  Last 24 hours: ${colors.cyan}${stats.last_24_hours}${colors.reset}`);
  console.log(`  Last 7 days: ${colors.cyan}${stats.last_7_days}${colors.reset}`);
  console.log(`  Duplicates found: ${colors.yellow}${stats.duplicates_found}${colors.reset}`);
  console.log('');
}

/**
 * List recent submissions
 */
function listSubmissions() {
  const recent = rateLimiter.getRecentSubmissions(10);

  console.log('');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  logger.log('  Recent Feedback Submissions', 'bright');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  console.log('');

  if (recent.length === 0) {
    logger.log('No submissions found.', 'dim');
    console.log('');
    return;
  }

  recent.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleString();

    console.log(`${colors.bright}${index + 1}.${colors.reset} ${entry.message}`);
    console.log(`   ${colors.dim}${dateStr}${colors.reset}`);

    if (entry.was_duplicate) {
      console.log(`   ${colors.yellow}[Duplicate]${colors.reset} ${entry.issue_url}`);
    } else if (entry.issue_url) {
      console.log(`   ${colors.green}[New Issue]${colors.reset} ${entry.issue_url}`);
    }

    console.log('');
  });
}

/**
 * Submit feedback
 *
 * @param {string} message - Feedback message
 * @param {Object} options - Submission options
 */
async function submitFeedback(message, options = {}) {
  const {
    includeSystemInfo = false,
    force = false
  } = options;

  console.log('');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  logger.log('  Submitting Feedback', 'bright');
  logger.log('═══════════════════════════════════════════════════════', 'cyan');
  console.log('');

  // Check rate limit
  const rateLimit = rateLimiter.checkRateLimit(force);

  if (!rateLimit.can_submit) {
    logger.log('✗ Rate Limit Exceeded', 'red');
    console.log('');
    console.log(`You've submitted ${rateLimit.current} feedback reports in the last 24 hours.`);
    console.log('Please wait before submitting more feedback.');
    console.log('');
    console.log(`Window resets: ${colors.yellow}${rateLimit.resets_at.toLocaleString()}${colors.reset}`);
    console.log('');
    logger.log('For critical issues, use:', 'bright');
    logger.log(`  ccm feedback "message" --force`, 'cyan');
    console.log('');
    return;
  }

  if (force) {
    logger.log('⚠ Force mode enabled (bypassing rate limit)', 'yellow');
    console.log('');
  }

  // Check for duplicates
  logger.progress('Checking for duplicate issues...');

  let duplicate = null;
  try {
    duplicate = await githubApi.findDuplicateIssue(message);
  } catch (error) {
    // Continue even if duplicate check fails
    logger.clearLine();
    logger.log('⚠ Duplicate check failed, continuing...', 'yellow');
  }

  logger.clearLine();

  if (duplicate) {
    // Duplicate found
    logger.log('✓ Similar Issue Found', 'yellow');
    console.log('');
    console.log(`Your feedback matches an existing issue:`);
    console.log('');
    console.log(`  ${colors.bright}Issue #${duplicate.number}:${colors.reset} ${duplicate.title}`);
    console.log(`  ${colors.blue}${duplicate.url}${colors.reset}`);
    console.log('');
    console.log(`Match type: ${colors.cyan}${duplicate.match_type}${colors.reset} (similarity: ${Math.round(duplicate.similarity * 100)}%)`);
    console.log('');
    console.log('The issue is currently being investigated.');
    console.log('Add your experience to the discussion if it differs.');
    console.log('');

    // Log as duplicate submission
    rateLimiter.logSubmission({
      message: message,
      issue_number: duplicate.number,
      issue_url: duplicate.url,
      was_duplicate: true
    });

    return;
  }

  // Create new issue
  logger.progress('Creating new issue on GitHub...');

  const systemInfo = {
    ccmVersion: packageJson.version,
    nodeVersion: process.version,
    platform: `${os.platform()} ${os.release()}`,
    includeSystemInfo: includeSystemInfo
  };

  try {
    const issueBody = githubApi.generateIssueBody(message, systemInfo);

    // Extract short title from message (first sentence or first 50 chars)
    let title = message;
    const firstSentence = message.match(/^[^.!?]+[.!?]/);
    if (firstSentence) {
      title = firstSentence[0];
    } else if (message.length > 50) {
      title = message.substring(0, 50) + '...';
    }

    const issue = await githubApi.createIssue({
      title: title.trim(),
      body: issueBody,
      labels: ['user-feedback', 'needs-triage']
    });

    logger.clearLine();
    logger.log('✓ Feedback Submitted Successfully', 'green');
    console.log('');
    console.log(`Issue created: ${colors.bright}#${issue.number}${colors.reset}`);
    console.log(`URL: ${colors.blue}${issue.url}${colors.reset}`);
    console.log('');
    console.log('Thank you for your feedback!');
    console.log('You will receive updates on this issue via GitHub.');
    console.log('');

    // Log submission
    rateLimiter.logSubmission({
      message: message,
      issue_number: issue.number,
      issue_url: issue.url,
      was_duplicate: false
    });

  } catch (error) {
    logger.clearLine();
    logger.log('✗ Failed to Submit Feedback', 'red');
    console.log('');
    console.log(`Error: ${error.message}`);
    console.log('');
    logger.log('Your feedback has been saved locally.', 'yellow');
    logger.log('You can retry later with:', 'bright');
    logger.log('  ccm feedback --retry', 'cyan');
    console.log('');

    // Log failed submission (doesn't count against rate limit)
    // Store in separate failed submissions log for retry
  }
}

/**
 * Main feedback command handler
 *
 * @param {Array} args - Command line arguments
 */
async function feedback(args) {
  const flags = parseArgs(args);

  // Show status
  if (flags.status) {
    showStatus();
    return;
  }

  // List submissions
  if (flags.list) {
    listSubmissions();
    return;
  }

  // Submit feedback
  if (flags.message) {
    await submitFeedback(flags.message, {
      includeSystemInfo: flags.includeSystemInfo,
      force: flags.force
    });
    return;
  }

  // No arguments - show help
  console.log('');
  logger.log('CCM Feedback System', 'bright');
  console.log('');
  logger.log('Usage:', 'bright');
  console.log('  ccm feedback <message>         Submit feedback');
  console.log('  ccm feedback --status          Show rate limit status');
  console.log('  ccm feedback --list            List recent submissions');
  console.log('');
  logger.log('Options:', 'bright');
  console.log('  --include-system-info          Include Node, OS, CCM version');
  console.log('  --force                        Bypass rate limit (critical issues only)');
  console.log('  --retry                        Retry previously failed submission');
  console.log('');
  logger.log('Examples:', 'bright');
  console.log('  ccm feedback "Installation failed with CCM_ERR_002"');
  console.log('  ccm feedback "Feature request: add backup browsing" --include-system-info');
  console.log('  ccm feedback "Registry corrupted - data loss" --force');
  console.log('');
  logger.log('Rate Limit:', 'bright');
  console.log('  3 submissions per 24 hours');
  console.log('  Critical issues can bypass with --force');
  console.log('');
}

module.exports = {
  feedback
};
