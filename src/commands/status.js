/**
 * Status Command
 *
 * Show installation status (what's installed where)
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const registry = require('../lib/registry');
const config = require('../utils/config');
const fileOps = require('../utils/file-ops');
const logger = require('../utils/logger');

/**
 * Parse command line flags
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed flags
 */
function parseFlags(args) {
  const flags = {
    scope: 'all'    // 'global', 'project', 'all'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--global' || args[i] === '-g') {
      flags.scope = 'global';
    } else if (args[i] === '--project' || args[i] === '-p') {
      flags.scope = 'project';
    }
  }

  return flags;
}

/**
 * Check if artifact files still exist and calculate checksum
 * @param {string} artifactPath - Path to installed artifact
 * @param {Object} artifact - Artifact metadata from registry
 * @returns {Object} { exists: bool, modified: bool, currentChecksum: string }
 */
function checkArtifactStatus(artifactPath, artifact) {
  if (!fs.existsSync(artifactPath)) {
    return { exists: false, modified: false, currentChecksum: null };
  }

  try {
    const stats = fs.statSync(artifactPath);
    let currentChecksum;

    if (stats.isDirectory()) {
      currentChecksum = fileOps.calculateDirectoryChecksum(artifactPath);
    } else {
      currentChecksum = fileOps.calculateChecksum(artifactPath);
    }

    const modified = currentChecksum !== artifact.checksum;

    return { exists: true, modified, currentChecksum };
  } catch (error) {
    return { exists: true, modified: false, currentChecksum: null };
  }
}

/**
 * Status command handler
 * @param {Array} args - Command line arguments
 */
async function status(args) {
  try {
    const flags = parseFlags(args);

    logger.log('\nInstallation Status:\n', 'bright');

    let totalGlobal = 0;
    let totalProject = 0;

    // Show global installations
    if (flags.scope === 'all' || flags.scope === 'global') {
      logger.log('Global (~/.claude/):', 'bright');

      const globalArtifacts = registry.getInstalledArtifacts('global');
      const globalPackages = registry.getInstalledPackages('global');

      if (globalArtifacts.length === 0 && globalPackages.length === 0) {
        logger.info('  No global installations');
      } else {
        // Show artifacts
        globalArtifacts.forEach(artifact => {
          const artifactPath = path.join(
            config.getGlobalClaudeDir(),
            `${artifact.type}s`,
            artifact.name
          );

          const status = checkArtifactStatus(artifactPath, artifact);

          logger.log(`  ✓ ${artifact.name} (${artifact.type}) v${artifact.version}`, 'green');
          console.log(`     Installed: ${new Date(artifact.installed_at).toLocaleString()}`);

          if (status.exists) {
            if (status.modified) {
              logger.warn(`     Modified: Yes (checksum mismatch)`);
              logger.warn(`     ⚠ Local changes detected - run 'ccm update --global' to sync`);
            } else {
              logger.info(`     Modified: No (checksum matches)`);
            }
          } else {
            logger.error(`     ✗ Files not found at expected location`);
          }

          if (artifact.source_path) {
            console.log(`     Source: ${artifact.source_path}`);
          }
        });

        // Show packages
        if (globalPackages.length > 0) {
          console.log('');
          globalPackages.forEach(pkg => {
            logger.log(`  ✓ ${pkg.name} (package) v${pkg.version}`, 'green');
            console.log(`     Installed: ${new Date(pkg.installed_at).toLocaleString()}`);
            if (pkg.artifacts) {
              console.log(`     Includes: ${pkg.artifacts.length} artifact(s)`);
            }
          });
        }

        totalGlobal = globalArtifacts.length;
      }

      console.log('');
    }

    // Show project installations
    if (flags.scope === 'all' || flags.scope === 'project') {
      const projects = registry.getAllProjects();

      if (projects.length === 0) {
        if (flags.scope === 'project') {
          // Check if current directory has .claude/
          const currentClaudeDir = config.getProjectClaudeDir(process.cwd());
          if (fs.existsSync(currentClaudeDir)) {
            logger.warn('Current project has .claude/ but no registry entry');
            logger.info('  Run "ccm init" to register installations');
            console.log('');
          } else {
            logger.info('No project installations');
            logger.info('  Run "ccm init" in a project to get started');
            console.log('');
          }
        }
      } else {
        projects.forEach(project => {
          logger.log(`Project (${project.path}):', 'bright`);

          const artifacts = project.artifacts || [];
          const packages = project.packages || [];

          if (artifacts.length === 0 && packages.length === 0) {
            logger.info('  No installations');
          } else {
            // Show artifacts
            artifacts.forEach(artifact => {
              const artifactPath = path.join(
                project.location,
                `${artifact.type}s`,
                artifact.name
              );

              const status = checkArtifactStatus(artifactPath, artifact);

              logger.log(`  ✓ ${artifact.name} (${artifact.type}) v${artifact.version}`, 'green');
              console.log(`     Installed: ${new Date(artifact.installed_at).toLocaleString()}`);

              if (status.exists) {
                if (status.modified) {
                  logger.warn(`     Modified: Yes (checksum mismatch)`);
                } else {
                  logger.info(`     Modified: No`);
                }
              } else {
                logger.error(`     ✗ Files not found`);
              }
            });

            // Show packages
            if (packages.length > 0) {
              console.log('');
              packages.forEach(pkg => {
                logger.log(`  ✓ ${pkg.name} (package) v${pkg.version}`, 'green');
                console.log(`     Installed: ${new Date(pkg.installed_at).toLocaleString()}`);
                if (pkg.artifacts) {
                  console.log(`     Includes: ${pkg.artifacts.length} artifact(s)`);
                }
              });
            }

            totalProject += artifacts.length;
          }

          console.log('');
        });
      }
    }

    // Show summary
    if (flags.scope === 'all') {
      logger.log('Summary:', 'bright');
      console.log(`  Global: ${totalGlobal} installation(s)`);
      console.log(`  Projects: ${totalProject} installation(s)`);
      console.log('');
    }

  } catch (error) {
    logger.error(`Failed to retrieve status: ${error.message}`);
    console.log('');
    process.exit(1);
  }
}

// Export
module.exports = { status };
