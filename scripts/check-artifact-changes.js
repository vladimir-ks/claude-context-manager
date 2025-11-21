#!/usr/bin/env node

/**
 * Artifact Change Detection Script
 *
 * Purpose: Detect checksum mismatches between package.json and actual artifacts
 * Used by: CI/CD workflows to prevent releases with unprocessed artifact changes
 *
 * Exit codes:
 *   0 - All checksums match
 *   1 - Checksum mismatch detected (blocks release)
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Calculate directory checksum (same logic as src/utils/file-ops.js)
 */
function calculateDirectoryChecksum(dirPath) {
  const hash = crypto.createHash('sha256');

  function hashDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        hash.update(entry.name + ':dir');
        hashDirectory(fullPath);
      } else if (entry.isFile()) {
        hash.update(entry.name + ':file');
        const content = fs.readFileSync(fullPath);
        hash.update(content);
      }
    }
  }

  hashDirectory(dirPath);
  return hash.digest('hex');
}

/**
 * Calculate file checksum
 */
function calculateFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Main detection logic
 */
function checkArtifactChanges() {
  const rootDir = path.join(__dirname, '..');
  const packageJsonPath = path.join(rootDir, 'package.json');

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.artifacts) {
    console.log(`${YELLOW}⚠️  No artifacts section found in package.json${RESET}`);
    console.log('This is expected for initial setup.');
    process.exit(0);
  }

  const mismatches = [];

  // Check skills
  if (packageJson.artifacts.skills) {
    console.log('Checking skills...');
    for (const [skillName, metadata] of Object.entries(packageJson.artifacts.skills)) {
      const skillPath = path.join(rootDir, '.claude/skills', skillName);

      if (!fs.existsSync(skillPath)) {
        mismatches.push({
          type: 'skill',
          name: skillName,
          issue: 'NOT_FOUND',
          expected: metadata.checksum,
          actual: null
        });
        continue;
      }

      const actualChecksum = calculateDirectoryChecksum(skillPath);

      if (actualChecksum !== metadata.checksum) {
        mismatches.push({
          type: 'skill',
          name: skillName,
          issue: 'CHECKSUM_MISMATCH',
          expected: metadata.checksum,
          actual: actualChecksum
        });
      } else {
        console.log(`  ✓ ${skillName}`);
      }
    }
  }

  // Check commands
  if (packageJson.artifacts.commands) {
    console.log('Checking commands...');
    for (const [commandName, metadata] of Object.entries(packageJson.artifacts.commands)) {
      const commandPath = path.join(rootDir, '.claude/commands', `${commandName}.md`);

      if (!fs.existsSync(commandPath)) {
        mismatches.push({
          type: 'command',
          name: commandName,
          issue: 'NOT_FOUND',
          expected: metadata.checksum,
          actual: null
        });
        continue;
      }

      const actualChecksum = calculateFileChecksum(commandPath);

      if (actualChecksum !== metadata.checksum) {
        mismatches.push({
          type: 'command',
          name: commandName,
          issue: 'CHECKSUM_MISMATCH',
          expected: metadata.checksum,
          actual: actualChecksum
        });
      } else {
        console.log(`  ✓ ${commandName}`);
      }
    }
  }

  // Report results
  console.log('');

  if (mismatches.length === 0) {
    console.log(`${GREEN}✅ All artifact checksums match!${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Artifact checksum mismatches detected!${RESET}`);
    console.log('');
    console.log('The following artifacts have changed without version processing:');
    console.log('');

    mismatches.forEach(({ type, name, issue, expected, actual }) => {
      console.log(`  ${RED}✗${RESET} ${type}: ${name}`);
      console.log(`    Issue: ${issue}`);
      if (issue === 'CHECKSUM_MISMATCH') {
        console.log(`    Expected: ${expected}`);
        console.log(`    Actual:   ${actual}`);
      }
      console.log('');
    });

    console.log(`${YELLOW}═══════════════════════════════════════════════════════════${RESET}`);
    console.log(`${YELLOW}ACTION REQUIRED:${RESET}`);
    console.log('');
    console.log('Artifacts have been modified without processing.');
    console.log('');
    console.log('To fix this, run the artifact package manager:');
    console.log('');
    console.log('  1. If you are an AI agent orchestrating this release:');
    console.log('');
    console.log('     Use the Task tool to invoke the artifact manager:');
    console.log('');
    console.log('     Task({');
    console.log('       prompt: "Process all changed artifacts, analyze diffs, decide');
    console.log('                version bumps, archive old versions, update checksums,');
    console.log('                and commit changes.",');
    console.log('       subagent_type: "general-purpose"');
    console.log('     })');
    console.log('');
    console.log('     Inside the task, invoke the command:');
    console.log('     SlashCommand({ command: "/ccm-artifact-package-manager" })');
    console.log('');
    console.log('  2. If you are running this manually:');
    console.log('');
    console.log('     Invoke the command directly in Claude Code:');
    console.log('     /ccm-artifact-package-manager');
    console.log('');
    console.log('The command will:');
    console.log('  • Analyze git diffs for each changed artifact');
    console.log('  • Decide version action (minor update, patch, minor, major)');
    console.log('  • Archive old versions from git history');
    console.log('  • Update package.json with new checksums and version history');
    console.log('  • Update ARTIFACT_CHANGELOG.md');
    console.log('  • Commit all changes');
    console.log('');
    console.log(`${YELLOW}═══════════════════════════════════════════════════════════${RESET}`);

    process.exit(1);
  }
}

// Run check
try {
  checkArtifactChanges();
} catch (error) {
  console.error(`${RED}Error during artifact check:${RESET}`, error.message);
  process.exit(1);
}
