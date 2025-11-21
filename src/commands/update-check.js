/**
 * Update Check Command
 *
 * Check for artifact version updates without installing them
 * Shows what changed and provides update instructions
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const registry = require('../lib/registry');
const logger = require('../utils/logger');

/**
 * Extract relevant changelog entries for an artifact
 * @param {string} artifactName - Name of the artifact
 * @param {string} oldVersion - Current installed version
 * @param {string} newVersion - New available version
 * @returns {string} Formatted changelog excerpt
 */
function extractChangelog(artifactName, oldVersion, newVersion) {
  try {
    const changelogPath = path.join(__dirname, '..', '..', 'ARTIFACT_CHANGELOG.md');

    if (!fs.existsSync(changelogPath)) {
      return 'Changelog not available';
    }

    const content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');

    // Find entries for this artifact between versions
    const relevantEntries = [];
    let inRelevantSection = false;

    for (const line of lines) {
      // Check if this is a header for our artifact
      if (line.startsWith(`## [${artifactName}]`)) {
        // Check if this version is relevant (between old and new)
        if (line.includes(newVersion)) {
          inRelevantSection = true;
          relevantEntries.push(line);
        }
      } else if (line.startsWith('## [')) {
        // Different artifact, stop if we were in relevant section
        inRelevantSection = false;
      } else if (inRelevantSection && line.trim()) {
        relevantEntries.push(line);

        // Stop after "---" separator
        if (line.trim() === '---') {
          break;
        }
      }
    }

    if (relevantEntries.length > 0) {
      return relevantEntries.join('\n');
    }

    return 'No detailed changelog available';
  } catch (error) {
    return `Error reading changelog: ${error.message}`;
  }
}

/**
 * Main update check logic
 */
async function checkUpdates() {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check if package.json has artifacts section
    if (!packageJson.artifacts) {
      logger.info('No artifact tracking available yet');
      logger.info('This feature will be available in future versions');
      return;
    }

    const reg = registry.load();
    const updates = [];

    // Check skills
    if (packageJson.artifacts.skills) {
      for (const [skillName, metadata] of Object.entries(packageJson.artifacts.skills)) {
        const globalArtifacts = reg.installations.global.artifacts || [];
        const installed = globalArtifacts.find(a => a.name === skillName && a.type === 'skill');

        if (installed && installed.version !== metadata.version) {
          updates.push({
            type: 'skill',
            name: skillName,
            oldVersion: installed.version,
            newVersion: metadata.version,
            checksum: metadata.checksum,
            lastUpdated: metadata.lastUpdated
          });
        }
      }
    }

    // Check commands
    if (packageJson.artifacts.commands) {
      for (const [commandName, metadata] of Object.entries(packageJson.artifacts.commands)) {
        const globalArtifacts = reg.installations.global.artifacts || [];
        const installed = globalArtifacts.find(
          a => a.name === commandName && a.type === 'command'
        );

        if (installed && installed.version !== metadata.version) {
          updates.push({
            type: 'command',
            name: commandName,
            oldVersion: installed.version,
            newVersion: metadata.version,
            checksum: metadata.checksum,
            lastUpdated: metadata.lastUpdated
          });
        }
      }
    }

    if (updates.length === 0) {
      console.log('');
      logger.success('✓ All artifacts are up to date');
      console.log('');
      return;
    }

    // Show updates with details
    console.log('');
    logger.info('═══════════════════════════════════════════════════════');
    logger.bright('Artifact Updates Available');
    logger.info('═══════════════════════════════════════════════════════');
    console.log('');

    logger.bright(`${updates.length} artifact(s) have new versions:\n`);

    updates.forEach((update, index) => {
      const icon = update.type === 'skill' ? '📦' : '⚡';
      logger.cyan(`${icon} ${update.name}`);
      logger.yellow(`   Version: ${update.oldVersion} → ${update.newVersion}`);
      logger.dim(`   Last updated: ${update.lastUpdated}`);
      console.log('');

      // Extract and show changelog
      const changelog = extractChangelog(update.name, update.oldVersion, update.newVersion);

      if (changelog !== 'No detailed changelog available' && changelog !== 'Changelog not available') {
        logger.dim('   What changed:');
        const changelogLines = changelog.split('\n').slice(0, 10); // Show first 10 lines
        changelogLines.forEach(line => {
          if (line.trim()) {
            logger.dim(`   ${line}`);
          }
        });
        console.log('');
      }

      if (index < updates.length - 1) {
        logger.dim('   ─────────────────────────────────────────────');
        console.log('');
      }
    });

    // Show update instructions
    logger.info('═══════════════════════════════════════════════════════');
    logger.bright('How to Update');
    logger.info('═══════════════════════════════════════════════════════');
    console.log('');

    logger.yellow('Option 1: Update all artifacts at once');
    logger.cyan('  ccm update --all --global');
    console.log('');

    logger.yellow('Option 2: Update specific artifacts');
    updates.forEach(update => {
      if (update.type === 'skill') {
        logger.cyan(`  ccm update --skill ${update.name} --global`);
      } else {
        logger.cyan(`  ccm update --command ${update.name} --global`);
      }
    });
    console.log('');

    logger.dim('For full changelog, see:');
    const changelogPath = path.join(__dirname, '..', '..', 'ARTIFACT_CHANGELOG.md');
    logger.dim(`  ${changelogPath}`);
    console.log('');
  } catch (error) {
    logger.error('Failed to check for updates');
    logger.error(error.message);

    if (process.env.CCM_DEBUG) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

/**
 * Entry point
 * @param {Array} _args - Command line arguments (unused)
 */
async function main(_args) {
  await checkUpdates();
}

module.exports = { main };
