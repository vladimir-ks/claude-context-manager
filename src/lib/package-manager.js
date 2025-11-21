/**
 * Package Manager
 *
 * Install, update, and remove artifacts
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const fileOps = require('../utils/file-ops');
const config = require('../utils/config');

/**
 * Install artifact to target location
 * @param {string} sourcePath - Source artifact path (in repository or cache)
 * @param {string} targetPath - Destination path (~/.claude/skills/... or project/.claude/skills/...)
 * @param {Object} _metadata - Artifact metadata { name, type, version, ... }
 * @returns {Object} Installation result { success: true, checksum: '...', backup_path: '...' }
 */
function installArtifact(sourcePath, targetPath, _metadata) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Source artifact not found: ${sourcePath}\n\nThis may mean:\n1. The artifact was removed from the package\n2. The package installation is corrupted\n\nTry reinstalling: npm install -g @vladimir-ks/claude-context-manager --force`
    );
  }

  let backupPath = null;

  try {
    // Check if target already exists
    if (fs.existsSync(targetPath)) {
      // Create backup before overwriting
      const backupDir = path.join(config.getHomeDir(), 'backups');
      backupPath = fileOps.createBackup(targetPath, backupDir);
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true, mode: 0o755 });
    }

    // Check if source is file or directory
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      // Copy entire directory
      fileOps.copyDirectory(sourcePath, targetPath);
    } else {
      // Copy single file
      fileOps.copyFile(sourcePath, targetPath);
    }

    // Calculate checksum of installed artifact
    let checksum;
    if (stats.isDirectory()) {
      checksum = fileOps.calculateDirectoryChecksum(targetPath);
    } else {
      checksum = fileOps.calculateChecksum(targetPath);
    }

    return {
      success: true,
      checksum: checksum,
      backup_path: backupPath
    };
  } catch (error) {
    // If installation failed and we created a backup, consider restoring
    if (error.code === 'ENOSPC') {
      throw new Error(
        `Insufficient disk space to install artifact\nSource: ${sourcePath}\nTarget: ${targetPath}\n\nFree up space and try again.`
      );
    }

    if (error.code === 'EACCES') {
      throw new Error(
        `Permission denied installing artifact\nTarget: ${targetPath}\n\nCheck directory permissions:\nls -la ${path.dirname(targetPath)}`
      );
    }

    throw error;
  }
}

/**
 * Uninstall artifact from target location
 * @param {string} targetPath - Artifact installation path
 * @param {Object} options - { backup: true|false }
 * @returns {Object} Uninstall result { success: true, backup_path: '...' }
 */
function uninstallArtifact(targetPath, options = {}) {
  const { backup = true } = options;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Artifact not found at target path: ${targetPath}`);
  }

  let backupPath = null;

  try {
    // Create backup if requested
    if (backup) {
      const backupDir = path.join(config.getHomeDir(), 'backups');
      const _artifactName = path.basename(targetPath);
      backupPath = fileOps.createBackup(targetPath, backupDir);
    }

    // Remove target
    fs.rmSync(targetPath, { recursive: true, force: true });

    return {
      success: true,
      backup_path: backupPath
    };
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(
        `Permission denied removing artifact\nTarget: ${targetPath}\n\nCheck directory permissions.`
      );
    }

    throw error;
  }
}

/**
 * Create backup of artifact before update
 * @param {string} artifactPath - Path to artifact
 * @param {string} _artifactName - Artifact name (for backup directory naming)
 * @returns {string} Backup directory path
 */
function backupArtifact(artifactPath, _artifactName) {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found for backup: ${artifactPath}`);
  }

  try {
    const backupDir = path.join(config.getHomeDir(), 'backups');
    return fileOps.createBackup(artifactPath, backupDir);
  } catch (error) {
    if (error.code === 'ENOSPC') {
      throw new Error(
        `Insufficient disk space for backup\nArtifact: ${artifactPath}\n\nFree up space and try again.`
      );
    }

    throw error;
  }
}

/**
 * Validate installation (check files exist and checksums match)
 * @param {string} targetPath - Installation path
 * @param {string} expectedChecksum - Expected checksum
 * @returns {Object} Validation result { valid: true|false, message: '...' }
 */
function validateInstallation(targetPath, expectedChecksum) {
  if (!fs.existsSync(targetPath)) {
    return {
      valid: false,
      message: `Installation path not found: ${targetPath}`
    };
  }

  try {
    // Calculate current checksum
    const stats = fs.statSync(targetPath);
    let actualChecksum;

    if (stats.isDirectory()) {
      actualChecksum = fileOps.calculateDirectoryChecksum(targetPath);
    } else {
      actualChecksum = fileOps.calculateChecksum(targetPath);
    }

    // Compare checksums
    if (actualChecksum === expectedChecksum) {
      return {
        valid: true,
        message: 'Installation valid - checksum matches'
      };
    } else {
      return {
        valid: false,
        message: 'Installation corrupted - checksum mismatch'
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `Validation failed: ${error.message}`
    };
  }
}

// Export all functions
module.exports = {
  installArtifact,
  uninstallArtifact,
  backupArtifact,
  validateInstallation
};
