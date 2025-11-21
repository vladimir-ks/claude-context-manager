#!/usr/bin/env node

/**
 * Pre-Uninstall Hook
 *
 * Warns user about registry loss and orphaned artifacts before NPM package uninstall
 * Offers to remove all artifacts while registry still exists
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const REGISTRY_FILE = path.join(HOME_DIR, 'registry.json');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Prompt user for input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Load registry
 */
function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Get all installed artifacts from registry
 */
function getInstalledArtifacts(registry) {
  const artifacts = {
    global: [],
    projects: []
  };

  // Global artifacts
  if (registry.installations.global && registry.installations.global.artifacts) {
    artifacts.global = registry.installations.global.artifacts.map(a => ({
      name: a.name,
      type: a.type,
      location: 'global'
    }));
  }

  // Project artifacts
  if (registry.installations.projects) {
    registry.installations.projects.forEach(project => {
      if (project.artifacts && project.artifacts.length > 0) {
        artifacts.projects.push({
          path: project.path,
          artifacts: project.artifacts.map(a => ({
            name: a.name,
            type: a.type
          }))
        });
      }
    });
  }

  return artifacts;
}

/**
 * Remove artifact
 */
function removeArtifact(artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    return;
  }

  // Check if path is a symlink to prevent TOCTOU attacks
  // Use lstatSync to get info about the link itself, not what it points to
  const stats = fs.lstatSync(artifactPath);
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing to remove symlink: ${artifactPath}`);
  }

  fs.rmSync(artifactPath, { recursive: true, force: true });
}

/**
 * Remove all artifacts
 */
function removeAllArtifacts(artifacts, registry) {
  let removedCount = 0;
  let failedCount = 0;

  // Remove global artifacts
  if (artifacts.global.length > 0) {
    const homeDir = path.join(os.homedir(), '.claude');

    artifacts.global.forEach(artifact => {
      try {
        let artifactPath;
        if (artifact.type === 'skill') {
          artifactPath = path.join(homeDir, 'skills', artifact.name);
        } else if (artifact.type === 'command') {
          artifactPath = path.join(homeDir, 'commands', artifact.name);
        }

        if (artifactPath) {
          removeArtifact(artifactPath);

          // Remove from registry
          if (registry.installations.global && registry.installations.global.artifacts) {
            registry.installations.global.artifacts = registry.installations.global.artifacts.filter(
              a => a.name !== artifact.name
            );
          }

          log(`  ✓ Removed: ${artifact.name} (global)`, 'green');
          removedCount++;
        }
      } catch (error) {
        log(`  ✗ Failed: ${artifact.name} (${error.message})`, 'red');
        failedCount++;
      }
    });
  }

  // Remove project artifacts
  artifacts.projects.forEach(project => {
    project.artifacts.forEach(artifact => {
      try {
        let artifactPath;
        if (artifact.type === 'skill') {
          artifactPath = path.join(project.path, '.claude', 'skills', artifact.name);
        } else if (artifact.type === 'command') {
          artifactPath = path.join(project.path, '.claude', 'commands', artifact.name);
        }

        if (artifactPath) {
          removeArtifact(artifactPath);

          // Remove from registry
          const projectEntry = registry.installations.projects.find(p => p.path === project.path);
          if (projectEntry && projectEntry.artifacts) {
            projectEntry.artifacts = projectEntry.artifacts.filter(a => a.name !== artifact.name);
          }

          log(`  ✓ Removed: ${artifact.name} (${project.path})`, 'green');
          removedCount++;
        }
      } catch (error) {
        log(`  ✗ Failed: ${artifact.name} (${error.message})`, 'red');
        failedCount++;
      }
    });
  });

  // Save updated registry
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
  } catch (error) {
    log(`  ⚠ Warning: Failed to update registry: ${error.message}`, 'yellow');
  }

  return { removedCount, failedCount };
}

/**
 * Main pre-uninstall logic
 */
async function main() {
  try {
    // Load registry
    const registry = loadRegistry();

    if (!registry) {
      // No registry found, nothing to warn about
      process.exit(0);
    }

    // Get all installed artifacts
    const artifacts = getInstalledArtifacts(registry);

    const totalGlobal = artifacts.global.length;
    const totalProjects = artifacts.projects.reduce(
      (sum, p) => sum + p.artifacts.length,
      0
    );
    const totalArtifacts = totalGlobal + totalProjects;

    if (totalArtifacts === 0) {
      // No artifacts installed, nothing to warn about
      process.exit(0);
    }

    // Show warning
    console.log('');
    log('═══════════════════════════════════════════════════════════', 'yellow');
    log('⚠️  WARNING: Complete CCM Removal Detected', 'bright');
    log('═══════════════════════════════════════════════════════════', 'yellow');
    console.log('');

    log('You are about to uninstall Claude Context Manager.', 'yellow');
    console.log('');

    log('Currently installed artifacts:', 'bright');
    console.log('');

    // Show global artifacts
    if (totalGlobal > 0) {
      log('  Global (~/.claude/):', 'cyan');
      artifacts.global.forEach(artifact => {
        console.log(`    • ${artifact.name} (${artifact.type})`);
      });
      console.log('');
    }

    // Show project artifacts
    if (artifacts.projects.length > 0) {
      log('  Projects:', 'cyan');
      artifacts.projects.forEach(project => {
        console.log(`    • ${project.path}`);
        project.artifacts.forEach(artifact => {
          console.log(`      - ${artifact.name} (${artifact.type})`);
        });
      });
      console.log('');
    }

    // Show critical warning
    log('⚠️  CRITICAL WARNING:', 'red');
    console.log('');
    log('If you proceed without removing artifacts:', 'yellow');
    log('  • Registry will be deleted (~/.claude-context-manager/)', 'yellow');
    log('  • You will LOSE TRACK of all artifact installation locations', 'yellow');
    log('  • You will have to MANUALLY FIND AND DELETE artifacts later', 'yellow');
    console.log('');

    log('Recommended action:', 'bright');
    log('  1. Remove all artifacts NOW (while registry exists)', 'cyan');
    log('  2. Then uninstall will proceed safely', 'cyan');
    console.log('');

    // Prompt for action
    log('What would you like to do?', 'bright');
    console.log('  [1] Remove all artifacts, then uninstall (recommended)');
    console.log('  [2] Uninstall anyway (artifacts will be orphaned)');
    console.log('  [3] Cancel uninstall');
    console.log('');

    const answer = await prompt('Your choice (1/2/3): ');

    switch (answer) {
      case '1':
        // Remove all artifacts
        console.log('');
        log('Removing all artifacts...', 'bright');
        console.log('');

        const results = removeAllArtifacts(artifacts, registry);

        console.log('');
        log('═══════════════════════════════════════════════════════', 'cyan');

        if (results.removedCount > 0) {
          log(`✓ Removed ${results.removedCount} artifact(s)`, 'green');
        }

        if (results.failedCount > 0) {
          log(`⚠ Failed to remove ${results.failedCount} artifact(s)`, 'yellow');
        }

        log('Proceeding with uninstall...', 'cyan');
        console.log('');

        // Exit 0 - allow uninstall to proceed
        process.exit(0);

      case '2':
        // Proceed without removing artifacts
        console.log('');
        log('⚠️  Proceeding with uninstall', 'yellow');
        log('⚠️  Artifacts will remain in the system', 'yellow');
        log('⚠️  You will need to remove them manually later', 'yellow');
        console.log('');

        // Exit 0 - allow uninstall to proceed
        process.exit(0);

      case '3':
        // Cancel uninstall
        console.log('');
        log('✓ Uninstall cancelled', 'green');
        console.log('');

        // Exit 1 - block uninstall
        process.exit(1);

      default:
        // Invalid choice, cancel to be safe
        console.log('');
        log('⚠️  Invalid choice. Cancelling uninstall for safety.', 'yellow');
        console.log('');

        // Exit 1 - block uninstall
        process.exit(1);
    }
  } catch (error) {
    // On any error, allow uninstall to proceed (don't block)
    console.error('Pre-uninstall check failed:', error.message);
    process.exit(0);
  }
}

// Run main
main().catch(error => {
  console.error('Fatal error in pre-uninstall:', error);
  process.exit(0); // Don't block uninstall on fatal errors
});
