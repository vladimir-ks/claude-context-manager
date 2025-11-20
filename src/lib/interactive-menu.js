/**
 * Interactive Menu System
 *
 * Provides reusable menu prompts using Inquirer.js for CCM CLI
 *
 * Author: Vladimir K.S.
 */

const select = require('@inquirer/select').default;
const checkbox = require('@inquirer/checkbox').default;
const confirm = require('@inquirer/confirm').default;
const input = require('@inquirer/input').default;
const fs = require('fs');
const path = require('path');

/**
 * Detect if current directory is a git repository
 * @returns {boolean}
 */
function isGitRepo() {
  try {
    const cwd = process.cwd();
    let currentDir = cwd;

    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, '.git'))) {
        return true;
      }
      currentDir = path.dirname(currentDir);
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Detect default installation location based on context
 * @returns {string} 'global', 'project', or 'both'
 */
function detectDefaultLocation() {
  const cwd = process.cwd();
  const homeDir = require('os').homedir();

  // If at home directory, default to global
  if (cwd === homeDir) {
    return 'global';
  }

  // If in git repo, default to project
  if (isGitRepo()) {
    return 'project';
  }

  // Otherwise default to global
  return 'global';
}

/**
 * Prompt: Select installation type (global/project/both)
 * @returns {Promise<string>} Selected installation type
 */
async function selectInstallType() {
  const defaultLocation = detectDefaultLocation();
  const isGit = isGitRepo();

  const choices = [
    { name: 'Global (~/.claude)', value: 'global' },
    {
      name: 'Current project (.claude)',
      value: 'project',
      disabled: !isGit ? 'Not a git repository' : false
    },
    {
      name: 'Both locations',
      value: 'both',
      disabled: !isGit ? 'Not a git repository' : false
    }
  ];

  const answer = await select({
    message: 'Where would you like to install?',
    choices,
    default: defaultLocation
  });

  return answer;
}

/**
 * Prompt: Select package type (solutions/individual)
 * @returns {Promise<string>} 'solutions' or 'individual'
 */
async function selectPackageType() {
  const answer = await select({
    message: 'What would you like to install?',
    choices: [
      { name: 'Solutions (curated packages)', value: 'solutions' },
      { name: 'Individual artifacts', value: 'individual' }
    ],
    default: 'solutions'
  });

  return answer;
}

/**
 * Prompt: Select packages (solutions) to install
 * @param {Array} availablePackages - List of package objects { name, description, locked }
 * @returns {Promise<Array>} Selected package names
 */
async function selectPackages(availablePackages) {
  const choices = availablePackages.map(pkg => ({
    name: `${pkg.name} - ${pkg.description}`,
    value: pkg.name,
    disabled: pkg.locked ? '🔒 Premium' : false
  }));

  if (choices.length === 0) {
    console.log('\nNo packages available.');
    return [];
  }

  const selected = await checkbox({
    message: 'Select packages to install (Space to select, Enter to confirm):',
    choices,
    required: true,
    pageSize: 10
  });

  return selected;
}

/**
 * Prompt: Select individual artifacts to install
 * @param {Array} availableArtifacts - List of artifact objects { name, type, description, locked }
 * @returns {Promise<Array>} Selected artifact names
 */
async function selectArtifacts(availableArtifacts) {
  // Group by type
  const skills = availableArtifacts.filter(a => a.type === 'skill');
  const commands = availableArtifacts.filter(a => a.type === 'command');

  const choices = [
    ...skills.length > 0 ? [{ name: '─── Skills ───', value: 'separator-skills', disabled: true }] : [],
    ...skills.map(a => ({
      name: `${a.name} - ${a.description}`,
      value: a.name,
      disabled: a.locked ? '🔒 Premium' : false
    })),
    ...commands.length > 0 ? [{ name: '─── Commands ───', value: 'separator-commands', disabled: true }] : [],
    ...commands.map(a => ({
      name: `${a.name} - ${a.description}`,
      value: a.name,
      disabled: a.locked ? '🔒 Premium' : false
    }))
  ];

  if (choices.length === 0) {
    console.log('\nNo artifacts available.');
    return [];
  }

  const selected = await checkbox({
    message: 'Select artifacts to install (Space to select, Enter to confirm):',
    choices,
    required: true,
    pageSize: 15
  });

  return selected;
}

/**
 * Prompt: Confirm backup before installation
 * @param {Array} conflicts - List of conflicting artifacts { name, location }
 * @returns {Promise<string>} 'backup', 'overwrite', or 'cancel'
 */
async function confirmBackup(conflicts) {
  if (conflicts.length === 0) {
    return 'no-backup'; // No conflicts, no backup needed
  }

  console.log(`\n⚠️  ${conflicts.length} artifact(s) will be overwritten:`);
  conflicts.forEach(c => {
    console.log(`   - ${c.name} (${c.location})`);
  });
  console.log('');

  const answer = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Create backup before installing (recommended)', value: 'backup' },
      { name: 'Overwrite without backup (risky)', value: 'overwrite' },
      { name: 'Cancel installation', value: 'cancel' }
    ],
    default: 'backup'
  });

  return answer;
}

/**
 * Prompt: Confirm action with yes/no
 * @param {string} message - Confirmation message
 * @param {boolean} defaultValue - Default answer (default: true)
 * @returns {Promise<boolean>}
 */
async function confirmAction(message, defaultValue = true) {
  const answer = await confirm({
    message,
    default: defaultValue
  });

  return answer;
}

/**
 * Prompt: Select locations for multi-location artifact
 * @param {string} artifactName - Artifact name
 * @param {Array} locations - Available locations ['global', '/path/to/project1', ...]
 * @returns {Promise<Array>} Selected locations
 */
async function selectLocations(artifactName, locations) {
  const choices = locations.map(loc => {
    let name = loc;
    if (loc === 'global') {
      name = 'Global (~/.claude)';
    } else {
      name = loc; // Project path
    }

    return {
      name,
      value: loc,
      checked: true // All selected by default
    };
  });

  const selected = await checkbox({
    message: `Select locations to remove '${artifactName}' from:`,
    choices,
    required: true
  });

  return selected;
}

/**
 * Prompt: Select items to uninstall
 * @param {Array} installedArtifacts - List of installed artifacts { name, type, locations }
 * @returns {Promise<Array>} Selected artifact names
 */
async function selectItemsToUninstall(installedArtifacts) {
  const choices = installedArtifacts.map(artifact => {
    const locationCount = artifact.locations ? artifact.locations.length : 1;
    const locationSuffix = locationCount > 1 ? ` (${locationCount} locations)` : '';

    return {
      name: `${artifact.name}${locationSuffix}`,
      value: artifact.name
    };
  });

  if (choices.length === 0) {
    console.log('\nNo artifacts installed.');
    return [];
  }

  const selected = await checkbox({
    message: 'Select items to uninstall (Space to select, Enter to confirm):',
    choices,
    required: true,
    pageSize: 15
  });

  return selected;
}

/**
 * Prompt: Select items to update
 * @param {Array} updatableArtifacts - List of artifacts with updates { name, currentVersion, newVersion, locations }
 * @returns {Promise<Array>} Selected artifact names
 */
async function selectItemsToUpdate(updatableArtifacts) {
  const choices = updatableArtifacts.map(artifact => {
    const versionInfo = `v${artifact.currentVersion} → v${artifact.newVersion}`;
    const locationCount = artifact.locations ? artifact.locations.length : 1;
    const locationSuffix = locationCount > 1 ? ` (${locationCount} locations)` : '';

    return {
      name: `${artifact.name} ${versionInfo}${locationSuffix}`,
      value: artifact.name,
      checked: true // All selected by default
    };
  });

  if (choices.length === 0) {
    console.log('\nNo updates available.');
    return [];
  }

  const selected = await checkbox({
    message: 'Select items to update (Space to select, Enter to confirm):',
    choices,
    required: false, // Allow empty selection
    pageSize: 15
  });

  return selected;
}

/**
 * Prompt: Select backup to restore
 * @param {Array} backups - List of backups { timestamp, version, size, path }
 * @returns {Promise<string>} Selected backup timestamp
 */
async function selectBackup(backups) {
  const choices = backups.map(backup => {
    // Convert timestamp format: YYYY-MM-DD_HH-MM-SS -> YYYY-MM-DDTHH:MM:SS
    const [datePart, timePart] = backup.timestamp.split('_');
    const isoString = `${datePart}T${timePart.replace(/-/g, ':')}`;
    const date = new Date(isoString).toLocaleString();
    const version = backup.version || 'unknown';
    const size = backup.size ? `${(backup.size / 1024).toFixed(1)}KB` : '';

    return {
      name: `${date} - v${version} ${size}`,
      value: backup.timestamp
    };
  });

  if (choices.length === 0) {
    console.log('\nNo backups available.');
    return null;
  }

  const selected = await select({
    message: 'Select backup to restore:',
    choices,
    pageSize: 10
  });

  return selected;
}

/**
 * Prompt: Select update scope
 * @returns {Promise<string>} 'global', 'project', 'all', or 'specific'
 */
async function selectUpdateScope() {
  const isGit = isGitRepo();

  const choices = [
    { name: 'Global only (~/.claude)', value: 'global' },
    {
      name: 'Current project only',
      value: 'project',
      disabled: !isGit ? 'Not a git repository' : false
    },
    { name: 'All installations', value: 'all' },
    { name: 'Specific artifact', value: 'specific' }
  ];

  const answer = await select({
    message: 'What would you like to update?',
    choices,
    default: 'all'
  });

  return answer;
}

/**
 * Prompt: Select uninstall scope
 * @returns {Promise<string>} 'global', 'project', or 'all'
 */
async function selectUninstallScope() {
  const isGit = isGitRepo();

  const choices = [
    { name: 'Global only (~/.claude)', value: 'global' },
    {
      name: 'Current project only',
      value: 'project',
      disabled: !isGit ? 'Not a git repository' : false
    },
    { name: 'All locations', value: 'all' }
  ];

  const answer = await select({
    message: 'Uninstall from:',
    choices,
    default: 'global'
  });

  return answer;
}

/**
 * Prompt: Input text
 * @param {string} message - Prompt message
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>}
 */
async function inputText(message, defaultValue = '') {
  const answer = await input({
    message,
    default: defaultValue
  });

  return answer;
}

// Export all functions
module.exports = {
  isGitRepo,
  detectDefaultLocation,
  selectInstallType,
  selectPackageType,
  selectPackages,
  selectArtifacts,
  confirmBackup,
  confirmAction,
  selectLocations,
  selectItemsToUninstall,
  selectItemsToUpdate,
  selectBackup,
  selectUpdateScope,
  selectUninstallScope,
  inputText
};
