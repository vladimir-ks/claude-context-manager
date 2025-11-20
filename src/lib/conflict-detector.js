/**
 * Conflict Detector
 *
 * Detects conflicts and user modifications in CCM artifacts
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const registry = require('./registry');
const config = require('../utils/config');

/**
 * Calculate SHA256 checksum for a file
 * @param {string} filePath - Path to file
 * @returns {string} SHA256 checksum
 */
function calculateFileChecksum(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    throw new Error('Use calculateDirectoryChecksum for directories');
  }

  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);

  return hashSum.digest('hex');
}

/**
 * Calculate combined checksum for directory
 * Includes all file contents and structure
 * @param {string} dirPath - Directory path
 * @returns {string} Combined SHA256 checksum
 */
function calculateDirectoryChecksum(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) {
    throw new Error('Use calculateFileChecksum for files');
  }

  // Collect all file paths and contents recursively
  const files = [];

  function collectFiles(dir, basePath = '') {
    const entries = fs.readdirSync(dir);

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(basePath, entry);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        collectFiles(fullPath, relativePath);
      } else {
        files.push({
          path: relativePath,
          content: fs.readFileSync(fullPath)
        });
      }
    });
  }

  collectFiles(dirPath);

  // Sort by path for consistent ordering
  files.sort((a, b) => a.path.localeCompare(b.path));

  // Calculate combined checksum
  const hashSum = crypto.createHash('sha256');

  files.forEach(file => {
    // Include path in hash for structure verification
    hashSum.update(file.path);
    hashSum.update(file.content);
  });

  return hashSum.digest('hex');
}

/**
 * Calculate checksum for artifact (file or directory)
 * @param {string} artifactPath - Path to artifact
 * @returns {string} SHA256 checksum
 */
function calculateArtifactChecksum(artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}`);
  }

  const stats = fs.statSync(artifactPath);

  if (stats.isDirectory()) {
    return calculateDirectoryChecksum(artifactPath);
  } else {
    return calculateFileChecksum(artifactPath);
  }
}

/**
 * Detect if artifact was modified by user
 * Compares current checksum with registry checksum
 * @param {string} artifactPath - Full path to artifact
 * @param {string} location - Location ('global' or project path)
 * @param {string} artifactName - Artifact name
 * @returns {Object} { modified, current_checksum, registry_checksum, modification_checksum }
 */
function detectUserModification(artifactPath, location, artifactName) {
  if (!fs.existsSync(artifactPath)) {
    return {
      modified: false,
      exists: false,
      current_checksum: null,
      registry_checksum: null,
      modification_checksum: null
    };
  }

  // Get artifact from registry
  const artifact = registry.getArtifact(location, artifactName);

  if (!artifact) {
    return {
      modified: false,
      exists: true,
      not_in_registry: true,
      current_checksum: calculateArtifactChecksum(artifactPath),
      registry_checksum: null,
      modification_checksum: null
    };
  }

  // Calculate current checksum
  const currentChecksum = calculateArtifactChecksum(artifactPath);

  // If artifact was previously marked as modified, compare with modification checksum
  if (artifact.user_modified && artifact.modification_checksum) {
    return {
      modified: currentChecksum !== artifact.checksum,
      previously_modified: true,
      current_checksum: currentChecksum,
      registry_checksum: artifact.checksum,
      modification_checksum: artifact.modification_checksum,
      matches_original: currentChecksum === artifact.checksum,
      matches_modification: currentChecksum === artifact.modification_checksum
    };
  }

  // Compare with original registry checksum
  const isModified = currentChecksum !== artifact.checksum;

  return {
    modified: isModified,
    current_checksum: currentChecksum,
    registry_checksum: artifact.checksum,
    modification_checksum: null
  };
}

/**
 * Find all modified artifacts in a location
 * @param {string} location - Location to check ('global' or project path)
 * @returns {Array} Modified artifacts { name, type, path, current_checksum, registry_checksum }
 */
function findModifiedArtifacts(location) {
  const reg = registry.load();
  const modified = [];

  let artifacts = [];

  if (location === 'global') {
    if (reg.installations.global.artifacts) {
      artifacts = reg.installations.global.artifacts;
    }
  } else {
    // Find project
    const project = reg.installations.projects.find(p => p.project_path === location);
    if (project && project.artifacts) {
      artifacts = project.artifacts;
    }
  }

  artifacts.forEach(artifact => {
    // Construct artifact path
    let artifactPath;
    if (location === 'global') {
      const homeDir = require('../utils/config').getHomeDir();
      if (artifact.type === 'skill') {
        artifactPath = path.join(homeDir, 'skills', artifact.name);
      } else if (artifact.type === 'command') {
        artifactPath = path.join(homeDir, 'commands', artifact.name);
      }
    } else {
      if (artifact.type === 'skill') {
        artifactPath = path.join(location, '.claude', 'skills', artifact.name);
      } else if (artifact.type === 'command') {
        artifactPath = path.join(location, '.claude', 'commands', artifact.name);
      }
    }

    if (artifactPath) {
      const result = detectUserModification(artifactPath, location, artifact.name);

      if (result.modified) {
        modified.push({
          name: artifact.name,
          type: artifact.type,
          path: artifactPath,
          location: location,
          current_checksum: result.current_checksum,
          registry_checksum: result.registry_checksum,
          modification_checksum: result.modification_checksum,
          previously_modified: result.previously_modified || false
        });
      }
    }
  });

  return modified;
}

/**
 * Detect conflicts before installation
 * @param {Array} artifactNames - Artifact names to install
 * @param {Array} targetLocations - Target locations for installation
 * @param {Object} artifactMetadata - Metadata for artifacts being installed
 * @returns {Array} Conflicts { name, location, conflict_type, details }
 */
function detectConflicts(artifactNames, targetLocations, artifactMetadata = {}) {
  const conflicts = [];

  artifactNames.forEach(artifactName => {
    targetLocations.forEach(location => {
      const artifact = registry.getArtifact(location, artifactName);

      if (artifact) {
        // Artifact exists - check for conflicts

        // Construct artifact path
        let artifactPath;
        if (location === 'global') {
          const homeDir = require('../utils/config').getHomeDir();
          if (artifact.type === 'skill') {
            artifactPath = path.join(homeDir, 'skills', artifact.name);
          } else if (artifact.type === 'command') {
            artifactPath = path.join(homeDir, 'commands', artifact.name);
          }
        } else {
          if (artifact.type === 'skill') {
            artifactPath = path.join(location, '.claude', 'skills', artifact.name);
          } else if (artifact.type === 'command') {
            artifactPath = path.join(location, '.claude', 'commands', artifact.name);
          }
        }

        // Check if artifact exists on disk
        if (artifactPath && fs.existsSync(artifactPath)) {
          // Check for user modifications
          const modCheck = detectUserModification(artifactPath, location, artifactName);

          if (modCheck.modified) {
            conflicts.push({
              name: artifactName,
              location: location,
              conflict_type: 'user_modified',
              details: {
                current_version: artifact.version,
                new_version: artifactMetadata[artifactName]?.version || 'unknown',
                current_checksum: modCheck.current_checksum,
                registry_checksum: modCheck.registry_checksum,
                previously_modified: modCheck.previously_modified || false,
                path: artifactPath
              }
            });
          } else {
            // No user modifications, but will be overwritten
            conflicts.push({
              name: artifactName,
              location: location,
              conflict_type: 'overwrite',
              details: {
                current_version: artifact.version,
                new_version: artifactMetadata[artifactName]?.version || 'unknown',
                path: artifactPath
              }
            });
          }
        } else {
          // In registry but not on disk
          conflicts.push({
            name: artifactName,
            location: location,
            conflict_type: 'missing_on_disk',
            details: {
              registry_version: artifact.version,
              expected_path: artifactPath
            }
          });
        }
      }
      // No conflict if artifact doesn't exist
    });
  });

  return conflicts;
}

/**
 * Generate human-readable conflict report
 * @param {Array} conflicts - Conflicts from detectConflicts
 * @returns {Object} Report { summary, details }
 */
function generateConflictReport(conflicts) {
  const userModified = conflicts.filter(c => c.conflict_type === 'user_modified');
  const willOverwrite = conflicts.filter(c => c.conflict_type === 'overwrite');
  const missingOnDisk = conflicts.filter(c => c.conflict_type === 'missing_on_disk');

  const report = {
    summary: {
      total_conflicts: conflicts.length,
      user_modified: userModified.length,
      will_overwrite: willOverwrite.length,
      missing_on_disk: missingOnDisk.length
    },
    details: {
      user_modified: userModified.map(c => ({
        artifact: c.name,
        location: c.location === 'global' ? 'Global (~/.claude)' : c.location,
        version: `${c.details.current_version} → ${c.details.new_version}`,
        warning: 'User modifications detected - backup recommended'
      })),
      will_overwrite: willOverwrite.map(c => ({
        artifact: c.name,
        location: c.location === 'global' ? 'Global (~/.claude)' : c.location,
        version: `${c.details.current_version} → ${c.details.new_version}`,
        info: 'Will be replaced with new version'
      })),
      missing_on_disk: missingOnDisk.map(c => ({
        artifact: c.name,
        location: c.location === 'global' ? 'Global (~/.claude)' : c.location,
        warning: 'In registry but file not found on disk',
        expected_path: c.details.expected_path
      }))
    }
  };

  return report;
}

/**
 * Mark artifact as user-modified in registry
 * @param {string} location - Location ('global' or project path)
 * @param {string} artifactName - Artifact name
 * @param {string} currentChecksum - Current checksum of modified artifact
 */
function markAsModified(location, artifactName, currentChecksum) {
  registry.markArtifactModified(location, artifactName, currentChecksum);
}

/**
 * Clear user-modified flag after resolving conflict
 * @param {string} location - Location ('global' or project path)
 * @param {string} artifactName - Artifact name
 */
function clearModifiedFlag(location, artifactName) {
  const reg = config.readRegistry();

  // Find artifact in registry
  let artifact;
  if (location === 'global') {
    artifact = reg.installations.global.artifacts.find(a => a.name === artifactName);
  } else {
    const project = reg.installations.projects.find(p => p.path === location);
    if (project) {
      artifact = project.artifacts.find(a => a.name === artifactName);
    }
  }

  if (artifact) {
    artifact.user_modified = false;
    artifact.modification_checksum = null;
    config.writeRegistry(reg);
  }
}

/**
 * Update artifact checksum after installation
 * @param {string} location - Location ('global' or project path)
 * @param {string} artifactName - Artifact name
 * @param {string} artifactPath - Full path to artifact
 */
function updateArtifactChecksum(location, artifactName, artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    return;
  }

  const reg = config.readRegistry();

  // Find artifact in registry
  let artifact;
  if (location === 'global') {
    artifact = reg.installations.global.artifacts.find(a => a.name === artifactName);
  } else {
    const project = reg.installations.projects.find(p => p.path === location);
    if (project) {
      artifact = project.artifacts.find(a => a.name === artifactName);
    }
  }

  if (artifact) {
    const newChecksum = calculateArtifactChecksum(artifactPath);
    artifact.checksum = newChecksum;
    artifact.user_modified = false;
    artifact.modification_checksum = null;
    artifact.updated_at = new Date().toISOString();
    config.writeRegistry(reg);
  }
}

/**
 * Validate artifact integrity
 * Check if artifact on disk matches registry
 * @param {string} location - Location ('global' or project path)
 * @param {string} artifactName - Artifact name
 * @returns {Object} { valid, reason }
 */
function validateArtifactIntegrity(location, artifactName) {
  const artifact = registry.getArtifact(location, artifactName);

  if (!artifact) {
    return {
      valid: false,
      reason: 'not_in_registry'
    };
  }

  // Construct artifact path
  let artifactPath;
  if (location === 'global') {
    const homeDir = require('../utils/config').getHomeDir();
    if (artifact.type === 'skill') {
      artifactPath = path.join(homeDir, 'skills', artifact.name);
    } else if (artifact.type === 'command') {
      artifactPath = path.join(homeDir, 'commands', artifact.name);
    }
  } else {
    if (artifact.type === 'skill') {
      artifactPath = path.join(location, '.claude', 'skills', artifact.name);
    } else if (artifact.type === 'command') {
      artifactPath = path.join(location, '.claude', 'commands', artifact.name);
    }
  }

  if (!artifactPath || !fs.existsSync(artifactPath)) {
    return {
      valid: false,
      reason: 'missing_on_disk',
      expected_path: artifactPath
    };
  }

  const modCheck = detectUserModification(artifactPath, location, artifactName);

  if (modCheck.modified) {
    return {
      valid: false,
      reason: 'user_modified',
      current_checksum: modCheck.current_checksum,
      registry_checksum: modCheck.registry_checksum
    };
  }

  return {
    valid: true,
    checksum: modCheck.current_checksum
  };
}

// Export all functions
module.exports = {
  calculateFileChecksum,
  calculateDirectoryChecksum,
  calculateArtifactChecksum,
  detectUserModification,
  findModifiedArtifacts,
  detectConflicts,
  generateConflictReport,
  markAsModified,
  clearModifiedFlag,
  updateArtifactChecksum,
  validateArtifactIntegrity
};
