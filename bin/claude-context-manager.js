#!/usr/bin/env node

/**
 * Claude Context Manager - CLI Entry Point
 *
 * Command router for managing Claude Code artifacts (skills, commands, agents)
 * Supports free and premium tiers with subscription-based access
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Command modules
const installCmd = require('../src/commands/install');
const listCmd = require('../src/commands/list');
const statusCmd = require('../src/commands/status');
const initCmd = require('../src/commands/init');
const searchCmd = require('../src/commands/search');
const updateCmd = require('../src/commands/update');
const removeCmd = require('../src/commands/remove');
const activateCmd = require('../src/commands/activate');

const VERSION = '0.2.7';
const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const CONFIG_FILE = path.join(HOME_DIR, 'config.json');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showVersion() {
  log(`\nClaude Context Manager v${VERSION}`, 'bright');
  log('Context Engineering Platform for Claude Code\n', 'dim');
}

function showHelp() {
  showVersion();

  log('Usage:', 'bright');
  console.log('  ccm <command> [options]');
  console.log('  claude-context-manager <command> [options]');
  console.log('');

  log('Commands:', 'bright');
  console.log('  list, ls              List available artifacts');
  console.log('  install, i            Install artifact(s) to target location');
  console.log('  update, up            Update installed artifacts');
  console.log('  status, st            Show installation status');
  console.log('  activate              Activate premium license');
  console.log('  init                  Initialize project with Claude Code artifacts');
  console.log('  remove, rm            Uninstall artifact');
  console.log('  search                Search available artifacts');
  console.log('  help, --help, -h      Show this help message');
  console.log('  version, --version, -v Show version information');
  console.log('');

  log('Examples:', 'bright');
  console.log('  # List all available artifacts');
  log('  ccm list', 'cyan');
  console.log('');
  console.log('  # Install core essentials globally');
  log('  ccm install --package core-essentials --global', 'cyan');
  console.log('');
  console.log('  # Install specific skill to current project');
  log('  ccm install --skill managing-claude-context --project', 'cyan');
  console.log('');
  console.log('  # Check installation status');
  log('  ccm status --global', 'cyan');
  console.log('');
  console.log('  # Activate premium license');
  log('  ccm activate YOUR_LICENSE_KEY', 'cyan');
  console.log('');

  log('Tiers:', 'bright');
  log('  FREE', 'green');
  console.log('    - Core essentials (managing-claude-context skill)');
  console.log('    - Basic commands and tools');
  console.log('    - Community support');
  console.log('');
  log('  PREMIUM - $9/month', 'yellow');
  console.log('    - Professional skills, commands, and agents');
  console.log('    - Priority support');
  console.log('    - Regular updates with new packages');
  console.log('');
  log('  TEAM - $29/month (5 users)', 'magenta');
  console.log('    - Everything in Premium');
  console.log('    - Team collaboration features');
  console.log('    - Shared package libraries');
  console.log('');

  log('Documentation:', 'bright');
  log('  https://github.com/vladks/claude-context-manager', 'blue');
  console.log('');

  log('Support:', 'bright');
  console.log('  Issues: https://github.com/vladks/claude-context-manager/issues');
  console.log('  Email:  vlad@vladks.com');
  console.log('  Fund:   See CONTRIBUTING.md for donation options');
  console.log('');
}

function checkHomeDirectory() {
  if (!fs.existsSync(HOME_DIR)) {
    log('\n✗ Home directory not found!', 'yellow');
    console.log(`  Expected: ${HOME_DIR}`);
    console.log('');
    console.log('This usually means the postinstall script failed.');
    console.log('Try reinstalling:');
    log('  npm install -g @vladks/claude-context-manager --force\n', 'cyan');
    return false;
  }
  return true;
}

// Legacy function - kept for potential future use
function notImplemented(cmd) {
  log(`\n✗ Command "${cmd}" is not yet implemented`, 'yellow');
  console.log('');
  console.log('This command is planned for a future release.');
  console.log('');
  log('Run "ccm help" to see available commands.', 'bright');
  console.log('');
  log('Watch for updates:', 'bright');
  log('  https://github.com/vladks/claude-context-manager/releases', 'blue');
  console.log('');
}

// Main execution
try {
  // Handle version flag
  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion();
    process.exit(0);
  }

  // Handle help flag
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Check home directory exists
  if (!checkHomeDirectory()) {
    process.exit(1);
  }

  // Route commands
  const commandArgs = args.slice(1); // Remove command name, pass rest as args

  switch (command) {
    case 'list':
    case 'ls':
      listCmd.list(commandArgs);
      break;

    case 'install':
    case 'i':
      installCmd.install(commandArgs);
      break;

    case 'update':
    case 'up':
      updateCmd.update(commandArgs);
      break;

    case 'status':
    case 'st':
      statusCmd.status(commandArgs);
      break;

    case 'activate':
      activateCmd.activate(commandArgs);
      break;

    case 'init':
      initCmd.init(commandArgs);
      break;

    case 'remove':
    case 'rm':
      removeCmd.remove(commandArgs);
      break;

    case 'search':
      searchCmd.search(commandArgs);
      break;

    default:
      log(`\n✗ Unknown command: ${command}`, 'yellow');
      console.log('');
      console.log('Run "ccm help" to see available commands.');
      console.log('');
      process.exit(1);
  }

} catch (error) {
  log('\n✗ Error:', 'yellow');
  console.error(error.message);
  console.error('');
  console.error('Please report this issue at:');
  console.error('https://github.com/vladks/claude-context-manager/issues');
  console.error('');
  process.exit(1);
}
