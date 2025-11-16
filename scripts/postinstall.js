#!/usr/bin/env node

/**
 * Claude Context Manager - Post-Install Script
 *
 * Sets up ~/.claude-context-manager/ directory structure on first install
 * Initializes configuration and registry files
 * Displays welcome message with getting started instructions
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const CONFIG_FILE = path.join(HOME_DIR, 'config.json');
const REGISTRY_FILE = path.join(HOME_DIR, 'registry.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    return true;
  }
  return false;
}

function createConfig() {
  const config = {
    version: '0.1.0',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    license: {
      key: null,
      tier: 'free',
      activated: null,
      expires: null,
      last_validated: null
    },
    api: {
      endpoint: 'https://api.claude-context-manager.com/v1',
      timeout: 10000,
      retry_attempts: 3
    },
    preferences: {
      check_updates_on_list: true,
      auto_backup_on_update: true,
      confirm_premium_installs: false,
      cache_ttl_hours: 24
    },
    analytics: {
      enabled: false,
      anonymous_usage: false
    }
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function createRegistry() {
  const registry = {
    version: '0.1.0',
    source_repository: process.cwd(),
    installations: {
      global: {
        location: path.join(os.homedir(), '.claude'),
        artifacts: [],
        packages: []
      },
      projects: []
    }
  };

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), { mode: 0o644 });
}

function createLibraryMetadata() {
  const libraryDir = path.join(HOME_DIR, 'library');
  const freeDir = path.join(libraryDir, 'free');
  const premiumDir = path.join(libraryDir, 'premium');

  createDirectory(freeDir);
  createDirectory(premiumDir);

  // Free tier artifacts metadata
  const freeSkills = {
    skills: [
      {
        name: 'managing-claude-context',
        version: '0.1.0',
        description: 'Master skill for AI context engineering',
        tier: 'free',
        category: 'development',
        size_bytes: null,
        dependencies: [],
        source_path: '.claude/skills/managing-claude-context/'
      }
    ]
  };

  const freePackages = {
    packages: [
      {
        name: 'core-essentials',
        version: '0.1.0',
        description: 'Managing-claude-context skill + essential commands',
        tier: 'free',
        category: 'development',
        artifacts: [
          { type: 'skill', name: 'managing-claude-context' }
        ],
        definition_path: 'packages/core-essentials.json'
      }
    ]
  };

  // Premium tier placeholders (shows what's available after activation)
  const premiumSkills = {
    skills: [
      {
        name: 'advanced-pdf',
        version: '1.0.0',
        description: 'Advanced PDF processing with OCR and security features',
        tier: 'premium',
        category: 'document-processing',
        locked: true
      },
      {
        name: 'enterprise-automation',
        version: '1.2.0',
        description: 'Comprehensive workflow automation suite',
        tier: 'premium',
        category: 'automation',
        locked: true
      }
    ]
  };

  fs.writeFileSync(
    path.join(freeDir, 'skills.json'),
    JSON.stringify(freeSkills, null, 2)
  );

  fs.writeFileSync(
    path.join(freeDir, 'packages.json'),
    JSON.stringify(freePackages, null, 2)
  );

  fs.writeFileSync(
    path.join(premiumDir, 'skills.json'),
    JSON.stringify(premiumSkills, null, 2)
  );
}

function installGlobalCommands() {
  const globalCommands = path.join(os.homedir(), '.claude', 'commands');
  const sourceCommands = path.join(__dirname, '..', '.claude', 'commands');

  // Create global commands directory if doesn't exist
  if (!fs.existsSync(globalCommands)) {
    fs.mkdirSync(globalCommands, { recursive: true, mode: 0o755 });
  }

  // Check if source commands directory exists
  if (!fs.existsSync(sourceCommands)) {
    log('⚠ No commands found in package', 'yellow');
    return;
  }

  // Copy all commands from package to global directory
  const commands = fs.readdirSync(sourceCommands).filter(f => f.endsWith('.md'));

  if (commands.length === 0) {
    log('⚠ No command files found in package', 'yellow');
    return;
  }

  let installedCount = 0;
  commands.forEach(commandFile => {
    const source = path.join(sourceCommands, commandFile);
    const dest = path.join(globalCommands, commandFile);

    try {
      fs.copyFileSync(source, dest);
      fs.chmodSync(dest, 0o644);  // Readable by all
      installedCount++;
    } catch (error) {
      log(`⚠ Failed to install ${commandFile}: ${error.message}`, 'yellow');
    }
  });

  if (installedCount > 0) {
    log(`✓ Installed ${installedCount} command(s) globally`, 'green');
    log(`  ${globalCommands}/`, 'cyan');
  }
}

function installClaudeAdditions() {
  const claudeDir = path.join(os.homedir(), '.claude');
  const sourceAdditionsDir = path.join(__dirname, '..', 'ccm-claude-md-prefix');
  const claudeMdFile = path.join(claudeDir, 'CLAUDE.md');

  // Create .claude directory if doesn't exist
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true, mode: 0o755 });
  }

  // Check if source prefix directory exists
  if (!fs.existsSync(sourceAdditionsDir)) {
    log('⚠ No CCM prefix files found in package', 'yellow');
    return;
  }

  // Copy all .md files directly to ~/.claude/
  const prefixFiles = fs.readdirSync(sourceAdditionsDir).filter(f => f.endsWith('.md'));

  if (prefixFiles.length === 0) {
    log('⚠ No .md files found in ccm-claude-md-prefix/', 'yellow');
    return;
  }

  let copiedCount = 0;
  prefixFiles.forEach(file => {
    const source = path.join(sourceAdditionsDir, file);
    const dest = path.join(claudeDir, file);

    try {
      fs.copyFileSync(source, dest);
      fs.chmodSync(dest, 0o644);
      copiedCount++;
    } catch (error) {
      log(`⚠ Failed to copy ${file}: ${error.message}`, 'yellow');
    }
  });

  if (copiedCount === 0) {
    return;
  }

  log(`✓ Installed ${copiedCount} CCM file(s) to ~/.claude/`, 'green');

  // Generate @ references with --- separators
  const fileReferences = prefixFiles
    .map(file => `@./${file}`)
    .join('\n\n---\n\n');

  // Build CCM header with separators and final separator
  const ccmHeader = `${fileReferences}

---

`;

  let existingContent = '';
  let isNewFile = false;

  // Read existing CLAUDE.md or create new
  if (fs.existsSync(claudeMdFile)) {
    existingContent = fs.readFileSync(claudeMdFile, 'utf8');

    // Check if CCM references already present (check for any ccm- file)
    if (existingContent.includes('@./ccm-')) {
      log('ℹ CCM references already in CLAUDE.md', 'cyan');
      return;
    }

    // Create backup
    const backupFile = path.join(claudeDir, `CLAUDE.md.backup-${Date.now()}`);
    fs.copyFileSync(claudeMdFile, backupFile);
    log(`✓ Created backup: ${path.basename(backupFile)}`, 'green');
  } else {
    isNewFile = true;
  }

  // Write new CLAUDE.md with prepended references
  const newContent = ccmHeader + existingContent;
  fs.writeFileSync(claudeMdFile, newContent, { mode: 0o644 });

  if (isNewFile) {
    log('✓ Created ~/.claude/CLAUDE.md with CCM references', 'green');
  } else {
    log('✓ Prepended CCM references to ~/.claude/CLAUDE.md', 'green');
  }

  log('  You can modify or remove these references anytime', 'cyan');
}

function showWelcomeMessage() {
  console.log('');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  log('  Claude Context Manager v0.2.1', 'bright');
  log('  Context Engineering Platform for Claude Code', 'blue');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  log('✓ Installation complete!', 'green');
  console.log('');

  log('Home directory created:', 'bright');
  log(`  ${HOME_DIR}`, 'cyan');
  console.log('');

  log('Getting Started:', 'bright');
  log('  1. List available artifacts:', 'yellow');
  log('     ccm list', 'cyan');
  console.log('');
  log('  2. Install core essentials globally:', 'yellow');
  log('     ccm install --package core-essentials --global', 'cyan');
  console.log('');
  log('  3. Check installation status:', 'yellow');
  log('     ccm status --global', 'cyan');
  console.log('');
  log('  4. Initialize a project:', 'yellow');
  log('     cd /path/to/your/project', 'cyan');
  log('     ccm init', 'cyan');
  console.log('');

  log('Premium Tier:', 'bright');
  log('  - Professional-grade skills, commands, and agents', 'yellow');
  log('  - Priority support and regular updates', 'yellow');
  log('  - $9/month individual | $29/month team', 'yellow');
  console.log('');
  log('  Activate premium:', 'bright');
  log('     ccm activate YOUR_LICENSE_KEY', 'cyan');
  console.log('');

  log('Support:', 'bright');
  log('  - Documentation: https://github.com/vladks/claude-context-manager', 'blue');
  log('  - Issues: https://github.com/vladks/claude-context-manager/issues', 'blue');
  log('  - Donations: See CONTRIBUTING.md', 'blue');
  log('  - Email: vlad@vladks.com', 'blue');
  console.log('');

  log('═════════════════════════════════════════════════════════════', 'cyan');
  console.log('');
}

// Main execution
try {
  log('\nSetting up Claude Context Manager...', 'bright');

  // Create main directory
  const isNewInstall = createDirectory(HOME_DIR);

  // Create subdirectories
  createDirectory(path.join(HOME_DIR, 'cache'));
  createDirectory(path.join(HOME_DIR, 'backups'));

  // Create config if doesn't exist
  if (!fs.existsSync(CONFIG_FILE)) {
    createConfig();
    log('✓ Created configuration file', 'green');
  }

  // Create registry if doesn't exist
  if (!fs.existsSync(REGISTRY_FILE)) {
    createRegistry();
    log('✓ Created registry file', 'green');
  }

  // Create library metadata
  createLibraryMetadata();
  log('✓ Initialized artifact library', 'green');

  // Install all commands globally
  installGlobalCommands();

  // Install Claude additions and prepend to CLAUDE.md
  installClaudeAdditions();

  // Show welcome message only on fresh install
  if (isNewInstall) {
    showWelcomeMessage();
  } else {
    log('✓ Updated existing installation', 'green');
    log(`  Home: ${HOME_DIR}\n`, 'cyan');
  }

} catch (error) {
  log('\n✗ Error during setup:', 'red');
  console.error(error.message);
  console.error('\nPlease report this issue at:');
  console.error('https://github.com/vladks/claude-context-manager/issues\n');
  process.exit(1);
}
