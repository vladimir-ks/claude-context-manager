/**
 * Backup Manager
 *
 * Handles backup creation, restoration, and cleanup for CCM artifacts
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const config = require('../utils/config');
const fileOps = require('../utils/file-ops');
const registry = require('./registry');

/**
 * Get backup directory for an artifact
 * @param {string} artifactName - Artifact name
 * @returns {string} Backup directory path
 */
function getBackupDir(artifactName) {
  const homeDir = config.getHomeDir();
  return path.join(homeDir, 'backups', artifactName);
}

/**
 * Generate timestamp string for backup
 * @returns {string} Timestamp in format YYYY-MM-DD_HH-MM-SS
 */
function generateTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
}

/**
 * Create backup of artifact
 * @param {string} artifactPath - Full path to artifact
 * @param {string} artifactName - Artifact name
 * @param {string} sourceLocation - Source location identifier ('global' or project path)
 * @param {Object} metadata - Additional metadata { version_before, version_after, backup_reason }
 * @returns {string} Backup directory path
 */
function createBackup(artifactPath, artifactName, sourceLocation, metadata = {}) {
  const timestamp = generateTimestamp();
  const backupBaseDir = getBackupDir(artifactName);
  const backupDir = path.join(backupBaseDir, timestamp);

  // Create backup directory structure
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o755 });

  // Determine location-specific subdirectory
  let locationDir;
  if (sourceLocation === 'global') {
    locationDir = 'global';
  } else {
    // Use sanitized project path
    locationDir = sourceLocation.replace(/\//g, '_');
  }

  const backupArtifactDir = path.join(backupDir, locationDir);
  fs.mkdirSync(backupArtifactDir, { recursive: true, mode: 0o755 });

  // Copy artifact
  try {
    const destPath = path.join(backupArtifactDir, path.basename(artifactPath));

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found: ${artifactPath}`);
    }

    const stats = fs.statSync(artifactPath);
    if (stats.isDirectory()) {
      fileOps.copyDirectory(artifactPath, destPath);
    } else {
      fileOps.copyFile(artifactPath, destPath);
    }

    // Calculate size
    const size = calculateDirectorySize(destPath);

    // Get artifact info from registry
    const artifact = registry.getArtifact(sourceLocation, artifactName);

    // Create metadata file
    const metadataPath = path.join(backupDir, 'metadata.json');
    const backupMetadata = {
      artifact_name: artifactName,
      artifact_type: artifact ? artifact.type : 'unknown',
      version_before: metadata.version_before || (artifact ? artifact.version : 'unknown'),
      version_after: metadata.version_after || null,
      source_location: sourceLocation,
      source_path: artifactPath,
      backup_timestamp: new Date().toISOString(),
      backup_reason: metadata.backup_reason || 'manual',
      checksum_before: artifact ? artifact.checksum : null,
      user_modified: artifact ? artifact.user_modified : false,
      file_count: countFiles(destPath),
      total_size_bytes: size
    };

    fs.writeFileSync(metadataPath, JSON.stringify(backupMetadata, null, 2));

    return backupDir;
  } catch (error) {
    // Cleanup failed backup
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    throw new Error(`Backup creation failed: ${error.message}`);
  }
}

/**
 * Calculate total size of directory
 * @param {string} dirPath - Directory path
 * @returns {number} Size in bytes
 */
function calculateDirectorySize(dirPath) {
  let totalSize = 0;

  const calculateSize = (p) => {
    const stats = fs.statSync(p);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(p);
      files.forEach(file => {
        calculateSize(path.join(p, file));
      });
    } else {
      totalSize += stats.size;
    }
  };

  calculateSize(dirPath);
  return totalSize;
}

/**
 * Count files in directory
 * @param {string} dirPath - Directory path
 * @returns {number} File count
 */
function countFiles(dirPath) {
  let count = 0;

  const countFilesRecursive = (p) => {
    const stats = fs.statSync(p);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(p);
      files.forEach(file => {
        countFilesRecursive(path.join(p, file));
      });
    } else {
      count++;
    }
  };

  countFilesRecursive(dirPath);
  return count;
}

/**
 * List all backups for an artifact
 * @param {string} artifactName - Artifact name
 * @returns {Array} List of backups { timestamp, metadata, path }
 */
function listBackups(artifactName) {
  const backupBaseDir = getBackupDir(artifactName);

  if (!fs.existsSync(backupBaseDir)) {
    return [];
  }

  const backups = [];
  const dirs = fs.readdirSync(backupBaseDir);

  dirs.forEach(dir => {
    const backupPath = path.join(backupBaseDir, dir);
    const stats = fs.statSync(backupPath);

    if (stats.isDirectory()) {
      const metadataPath = path.join(backupPath, 'metadata.json');
      let metadata = {};

      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        } catch (error) {
          // Invalid metadata, skip
          metadata = { error: 'Invalid metadata' };
        }
      }

      backups.push({
        timestamp: dir,
        path: backupPath,
        metadata: metadata,
        size: metadata.total_size_bytes || 0,
        version: metadata.version_before || 'unknown'
      });
    }
  });

  // Sort by timestamp (newest first)
  backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return backups;
}

/**
 * Restore artifact from backup
 * @param {string} artifactName - Artifact name
 * @param {string} backupTimestamp - Backup timestamp
 * @param {string} targetLocation - Target location ('global' or project path)
 * @param {string} targetPath - Full path where to restore
 * @returns {Object} Restore result { success, restored_from, restored_to }
 */
function restoreBackup(artifactName, backupTimestamp, targetLocation, targetPath) {
  const backupDir = path.join(getBackupDir(artifactName), backupTimestamp);

  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup not found: ${backupTimestamp}`);
  }

  // Load metadata
  const metadataPath = path.join(backupDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    throw new Error('Backup metadata not found');
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  // Find backed up artifact
  let locationDir;
  if (metadata.source_location === 'global') {
    locationDir = 'global';
  } else {
    locationDir = metadata.source_location.replace(/\//g, '_');
  }

  const backupArtifactPath = path.join(backupDir, locationDir, artifactName);

  if (!fs.existsSync(backupArtifactPath)) {
    throw new Error(`Backup artifact not found in backup: ${backupArtifactPath}`);
  }

  // Create backup of current state before restoring
  if (fs.existsSync(targetPath)) {
    try {
      createBackup(targetPath, artifactName, targetLocation, {
        backup_reason: 'pre_restore',
        version_before: metadata.version_after || 'unknown'
      });
    } catch (error) {
      // Non-fatal, log and continue
      console.warn(`Warning: Could not create pre-restore backup: ${error.message}`);
    }
  }

  // Restore from backup
  try {
    // Remove current if exists
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true, mode: 0o755 });
    }

    // Copy from backup
    const stats = fs.statSync(backupArtifactPath);
    if (stats.isDirectory()) {
      fileOps.copyDirectory(backupArtifactPath, targetPath);
    } else {
      fileOps.copyFile(backupArtifactPath, targetPath);
    }

    return {
      success: true,
      restored_from: backupTimestamp,
      restored_to: targetPath,
      version: metadata.version_before
    };
  } catch (error) {
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * Cleanup old backups based on retention policy
 * @param {string} artifactName - Artifact name (optional, if null cleans all)
 * @param {Object} retentionPolicy - Policy { max_backups, max_age_days }
 * @param {boolean} dryRun - If true, return what would be deleted without deleting
 * @returns {Array} Deleted (or would-be-deleted) backup timestamps
 */
function cleanupOldBackups(artifactName = null, retentionPolicy = null, dryRun = false) {
  // Get retention policy from registry if not provided
  if (!retentionPolicy) {
    const backupConfig = registry.getBackupConfig();
    retentionPolicy = {
      max_backups: backupConfig.max_backups_per_artifact,
      max_age_days: backupConfig.retention_days
    };
  }

  const deleted = [];
  const artifactsToClean = artifactName ? [artifactName] : getAllBackupArtifacts();

  artifactsToClean.forEach(artifact => {
    const backups = listBackups(artifact);

    backups.forEach((backup, index) => {
      let shouldDelete = false;

      // Keep newest N backups
      if (index >= retentionPolicy.max_backups) {
        shouldDelete = true;
      }

      // Delete backups older than N days
      if (backup.metadata.backup_timestamp) {
        const backupDate = new Date(backup.metadata.backup_timestamp);
        const now = new Date();
        const ageDays = (now - backupDate) / (1000 * 60 * 60 * 24);

        if (ageDays > retentionPolicy.max_age_days) {
          shouldDelete = true;
        }
      }

      if (shouldDelete) {
        if (!dryRun) {
          // Actually delete the backup
          try {
            fs.rmSync(backup.path, { recursive: true, force: true });
            deleted.push({
              artifact: artifact,
              timestamp: backup.timestamp,
              reason: index >= retentionPolicy.max_backups ? 'max_backups_exceeded' : 'max_age_exceeded'
            });
          } catch (error) {
            // Log but continue
            console.warn(`Failed to delete backup ${backup.timestamp}: ${error.message}`);
          }
        } else {
          // Dry run - just add to list without deleting
          deleted.push({
            artifact: artifact,
            timestamp: backup.timestamp,
            reason: index >= retentionPolicy.max_backups ? 'max_backups_exceeded' : 'max_age_exceeded'
          });
        }
      }
    });
  });

  return deleted;
}

/**
 * Get list of all artifacts with backups
 * @returns {Array} Artifact names
 */
function getAllBackupArtifacts() {
  const homeDir = config.getHomeDir();
  const backupsDir = path.join(homeDir, 'backups');

  if (!fs.existsSync(backupsDir)) {
    return [];
  }

  const artifacts = fs.readdirSync(backupsDir)
    .filter(name => {
      const artifactPath = path.join(backupsDir, name);
      return fs.statSync(artifactPath).isDirectory();
    });

  return artifacts;
}

/**
 * Get backup statistics
 * @returns {Object} Stats { total_artifacts, total_backups, total_size, oldest_backup, newest_backup }
 */
function getBackupStatistics() {
  const artifacts = getAllBackupArtifacts();
  let totalBackups = 0;
  let totalSize = 0;
  let oldestDate = null;
  let newestDate = null;

  artifacts.forEach(artifact => {
    const backups = listBackups(artifact);
    totalBackups += backups.length;

    backups.forEach(backup => {
      totalSize += backup.size || 0;

      if (backup.metadata.backup_timestamp) {
        const date = new Date(backup.metadata.backup_timestamp);
        if (!oldestDate || date < oldestDate) {
          oldestDate = date;
        }
        if (!newestDate || date > newestDate) {
          newestDate = date;
        }
      }
    });
  });

  return {
    total_artifacts: artifacts.length,
    total_backups: totalBackups,
    total_size_bytes: totalSize,
    total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
    oldest_backup: oldestDate ? oldestDate.toISOString() : null,
    newest_backup: newestDate ? newestDate.toISOString() : null
  };
}

/**
 * Delete specific backup
 * @param {string} artifactName - Artifact name
 * @param {string} backupTimestamp - Backup timestamp to delete
 */
function deleteBackup(artifactName, backupTimestamp) {
  const backupPath = path.join(getBackupDir(artifactName), backupTimestamp);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupTimestamp}`);
  }

  fs.rmSync(backupPath, { recursive: true, force: true });
}

/**
 * Delete all backups for an artifact
 * @param {string} artifactName - Artifact name
 */
function deleteAllBackups(artifactName) {
  const backupBaseDir = getBackupDir(artifactName);

  if (fs.existsSync(backupBaseDir)) {
    fs.rmSync(backupBaseDir, { recursive: true, force: true });
  }
}

/**
 * ===== NEW SMART BACKUP SYSTEM =====
 * Simplified backup system using .ccm-backup/ directory
 */

/**
 * Get .ccm-backup directory for location
 * @param {string} location - 'global' or project path
 * @returns {string} Backup directory path
 */
function getCcmBackupDir(location) {
  if (location === 'global') {
    const homeDir = config.getHomeDir();
    // Global: ~/.claude/.ccm-backup/
    return path.join(homeDir, '..', '.claude', '.ccm-backup');
  } else {
    // Project: <project>/.claude/.ccm-backup/
    return path.join(location, '.claude', '.ccm-backup');
  }
}

/**
 * Generate compact timestamp: YYMMDD-hh-mm
 * @returns {string} Compact timestamp
 */
function generateCompactTimestamp() {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(-2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${YY}${MM}${DD}-${hh}-${mm}`;
}

/**
 * Check if file was modified by user (smart detection)
 * @param {string} filePath - Path to file
 * @param {string} installedAt - ISO timestamp when file was installed
 * @param {string} registryChecksum - Checksum from registry
 * @returns {boolean} True if file was modified by user
 */
function isFileModified(filePath, installedAt, registryChecksum) {
  if (!fs.existsSync(filePath)) {
    return false; // File doesn't exist, can't be modified
  }

  // Check 1: Checksum comparison
  const crypto = require('crypto');
  const content = fs.readFileSync(filePath, 'utf8');
  const currentChecksum = crypto.createHash('sha256').update(content).digest('hex');

  if (currentChecksum === registryChecksum) {
    return false; // Checksum matches, file unchanged
  }

  // Check 2: Modification date (file modified after install?)
  const stats = fs.statSync(filePath);
  const installedDate = new Date(installedAt);

  if (stats.mtime > installedDate) {
    return true; // File modified after installation
  }

  return false; // Checksum changed but mtime doesn't indicate modification (edge case)
}

/**
 * Create smart backup - only if file was modified
 * @param {string} filePath - Full path to file
 * @param {string} location - 'global' or project path
 * @param {Object} metadata - Metadata { reason, version, installedAt, registryChecksum }
 * @returns {Object|null} { created: boolean, backupPath: string, reason: string } or null if not needed
 */
function createSmartBackup(filePath, location, metadata = {}) {
  const fileName = path.basename(filePath);

  // Smart detection: Only backup if modified
  const isModified = isFileModified(
    filePath,
    metadata.installedAt,
    metadata.registryChecksum
  );

  if (!isModified) {
    return { created: false, reason: 'unchanged', fileName };
  }

  // File was modified - create backup
  const backupDir = getCcmBackupDir(location);
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o755 });

  const timestamp = generateCompactTimestamp();
  const backupFileName = `${timestamp}-${fileName}`;
  const backupPath = path.join(backupDir, backupFileName);
  const metadataPath = path.join(backupDir, `${timestamp}-${fileName}.json`);

  // Copy file to backup
  fs.copyFileSync(filePath, backupPath);

  // Create metadata JSON
  const backupMetadata = {
    original_path: filePath,
    location: location,
    backup_timestamp: new Date().toISOString(),
    reason: metadata.reason || 'pre_update',
    version_before: metadata.version || 'unknown',
    file_size: fs.statSync(filePath).size,
    installed_at: metadata.installedAt,
    checksum_before: metadata.registryChecksum
  };

  fs.writeFileSync(metadataPath, JSON.stringify(backupMetadata, null, 2));

  return {
    created: true,
    backupPath,
    fileName,
    reason: 'modified'
  };
}

/**
 * Clean up old backups from .ccm-backup/ directory
 * @param {string} location - 'global' or project path
 * @param {number} retentionDays - Delete backups older than this many days (default 90)
 * @returns {Array} List of deleted backups
 */
function cleanupOldCcmBackups(location, retentionDays = 90) {
  const backupDir = getCcmBackupDir(location);

  if (!fs.existsSync(backupDir)) {
    return []; // No backups to clean
  }

  const deleted = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const files = fs.readdirSync(backupDir);

  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime < cutoffDate) {
      try {
        fs.unlinkSync(filePath);
        deleted.push({ file, age_days: Math.floor((Date.now() - stats.mtime) / (1000 * 60 * 60 * 24)) });
      } catch (error) {
        console.warn(`Failed to delete backup ${file}: ${error.message}`);
      }
    }
  }

  return deleted;
}

/**
 * List all backups in .ccm-backup directory
 * @param {string} location - 'global' or project path
 * @returns {Array} List of backup files with metadata
 */
function listCcmBackups(location) {
  const backupDir = getCcmBackupDir(location);

  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const files = fs.readdirSync(backupDir);
  const backups = [];

  for (const file of files) {
    if (file.endsWith('.json')) continue; // Skip metadata files

    const filePath = path.join(backupDir, file);
    const metadataPath = `${filePath}.json`;
    const stats = fs.statSync(filePath);

    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      try {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      } catch (error) {
        // Invalid metadata
      }
    }

    backups.push({
      file,
      path: filePath,
      size: stats.size,
      created: stats.mtime,
      metadata
    });
  }

  // Sort by creation date (newest first)
  backups.sort((a, b) => b.created - a.created);

  return backups;
}

// Export all functions
module.exports = {
  // Old backup system (keep for compatibility)
  createBackup,
  listBackups,
  restoreBackup,
  cleanupOldBackups,
  getAllBackupArtifacts,
  getBackupStatistics,
  deleteBackup,
  deleteAllBackups,
  getBackupDir,
  // New smart backup system
  getCcmBackupDir,
  generateCompactTimestamp,
  isFileModified,
  createSmartBackup,
  cleanupOldCcmBackups,
  listCcmBackups
};
