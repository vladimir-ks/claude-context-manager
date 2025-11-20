#!/usr/bin/env node

/**
 * Background Update Checker Script
 *
 * Runs periodically to check for CCM updates
 * Called by platform-specific schedulers (LaunchAgent, cron, Task Scheduler)
 *
 * Author: Vladimir K.S.
 */

const updateChecker = require('../../src/lib/update-checker');

// Run update check
(async () => {
  try {
    const result = await updateChecker.checkForUpdates();

    // Log result to file for debugging
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const logDir = path.join(os.homedir(), '.claude-context-manager', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o755 });
    }

    const logFile = path.join(logDir, 'update-checker.log');
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(result)}\n`;

    fs.appendFileSync(logFile, logEntry);

    process.exit(0);
  } catch (error) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const logDir = path.join(os.homedir(), '.claude-context-manager', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o755 });
    }

    const logFile = path.join(logDir, 'update-checker.log');
    const logEntry = `${new Date().toISOString()} - ERROR: ${error.message}\n`;

    fs.appendFileSync(logFile, logEntry);

    process.exit(1);
  }
})();
