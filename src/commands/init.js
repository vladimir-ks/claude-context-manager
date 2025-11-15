/**
 * Init Command
 *
 * Initialize project with Claude Code artifacts
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const installCommand = require('./install');
const logger = require('../utils/logger');
const config = require('../utils/config');

/**
 * Prompt user for confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} True if yes, false if no
 */
function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes' || normalized === '');
    });
  });
}

/**
 * Init command handler
 * @param {Array} args - Command line arguments
 */
async function init(args) {
  try {
    // 1. Determine project path
    let projectPath = process.cwd();

    // Check if path provided as argument
    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('--')) {
        projectPath = args[i];
        break;
      }
    }

    // Check for --package flag
    let packageName = 'core-essentials';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--package') {
        packageName = args[++i];
      }
    }

    logger.log('\nInitializing Claude Code in current project...\n', 'bright');
    logger.info(`Project: ${projectPath}`);

    // 2. Check if .claude/ exists
    const claudeDir = config.getProjectClaudeDir(projectPath);
    const claudeDirExists = fs.existsSync(claudeDir);

    if (claudeDirExists) {
      logger.warn('.claude/ directory already exists');
      const proceed = await promptUser('Overwrite existing artifacts? (y/N): ');

      if (!proceed) {
        logger.info('Installation cancelled');
        process.exit(0);
      }
      console.log('');
    } else {
      logger.info('Creating .claude/ directory...');
      fs.mkdirSync(claudeDir, { recursive: true, mode: 0o755 });
      logger.success(`Created ${claudeDir}`);
      console.log('');
    }

    // 3. Recommend package
    logger.log(`Recommended package: ${packageName}`, 'bright');
    logger.info('✓ Managing-claude-context skill + 14 commands');
    console.log('');

    // 4. Prompt for confirmation
    const confirmInstall = await promptUser('Proceed with installation? (Y/n): ');

    if (!confirmInstall) {
      logger.info('Installation cancelled');
      process.exit(0);
    }

    console.log('');

    // 5. Install package using install command
    logger.log(`Installing ${packageName} to project...\n`, 'bright');

    // Build args for install command
    const installArgs = [
      '--package', packageName,
      '--project', projectPath
    ];

    // Call install command
    await installCommand.install(installArgs);

    // 6. Show next steps
    console.log('');
    logger.log('Next steps:', 'bright');
    console.log('  1. Open project in Claude Code');
    console.log('  2. Try: /managing-claude-context:create-edit-skill');
    console.log('  3. Check: .claude/skills/managing-claude-context/QUICK_START.md');
    console.log('');

  } catch (error) {
    logger.error(`Project initialization failed: ${error.message}`);

    if (error.code === 'EACCES') {
      logger.info('Permission denied creating .claude/ directory');
      logger.info('Check directory permissions');
    }

    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { init };
