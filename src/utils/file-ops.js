/**
 * File Operations Utility
 *
 * File operations for copying artifacts, creating backups, calculating checksums
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Copy single file with permissions preserved
 * @param {string} source - Source file path
 * @param {string} dest - Destination file path
 * @throws {Error} If source doesn't exist or copy fails
 */
function copyFile(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source file not found: ${source}`);
  }

  // Ensure destination directory exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true, mode: 0o755 });
  }

  try {
    // Copy file
    fs.copyFileSync(source, dest);

    // Copy permissions (mode)
    const stats = fs.statSync(source);
    fs.chmodSync(dest, stats.mode);
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied copying file\nSource: ${source}\nDest: ${dest}\n\nCheck permissions on destination directory.`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`Insufficient disk space to copy file\nSource: ${source}\nDest: ${dest}`);
    }
    throw error;
  }
}

/**
 * Copy directory recursively
 * @param {string} source - Source directory path
 * @param {string} dest - Destination directory path
 * @throws {Error} If source doesn't exist or copy fails
 */
function copyDirectory(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source directory not found: ${source}`);
  }

  const stats = fs.statSync(source);
  if (!stats.isDirectory()) {
    throw new Error(`Source is not a directory: ${source}`);
  }

  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true, mode: 0o755 });
  }

  try {
    // Read source directory
    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursive copy for directories
        copyDirectory(sourcePath, destPath);
      } else if (entry.isSymbolicLink()) {
        // Follow symlinks and copy actual files
        const realPath = fs.realpathSync(sourcePath);
        if (fs.statSync(realPath).isDirectory()) {
          copyDirectory(realPath, destPath);
        } else {
          copyFile(realPath, destPath);
        }
      } else {
        // Copy regular files
        copyFile(sourcePath, destPath);
      }
    }
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied copying directory\nSource: ${source}\nDest: ${dest}\n\nCheck permissions.`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`Insufficient disk space to copy directory\nSource: ${source}\nDest: ${dest}`);
    }
    throw error;
  }
}

/**
 * Calculate SHA256 checksum of file
 * @param {string} filePath - File to hash
 * @returns {string} Hex-encoded SHA256 hash
 * @throws {Error} If file doesn't exist or read fails
 */
function calculateChecksum(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found for checksum calculation: ${filePath}`);
  }

  try {
    const data = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied reading file for checksum: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Calculate SHA256 checksum of directory (hash of all file hashes concatenated)
 * @param {string} dirPath - Directory to hash
 * @returns {string} Hex-encoded SHA256 hash
 * @throws {Error} If directory doesn't exist
 */
function calculateDirectoryChecksum(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found for checksum calculation: ${dirPath}`);
  }

  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }

  const files = [];

  // Recursively collect all file paths
  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        collectFiles(fullPath);
      } else if (entry.isSymbolicLink()) {
        // Follow symlinks
        const realPath = fs.realpathSync(fullPath);
        if (fs.statSync(realPath).isDirectory()) {
          collectFiles(realPath);
        } else {
          files.push(realPath);
        }
      } else {
        files.push(fullPath);
      }
    }
  }

  collectFiles(dirPath);

  // Sort for consistent ordering
  files.sort();

  // Calculate combined hash
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    const fileHash = calculateChecksum(file);
    hash.update(fileHash);
  }

  return hash.digest('hex');
}

/**
 * Create timestamped backup of file or directory
 * @param {string} sourcePath - File or directory to backup
 * @param {string} backupDir - Backup storage directory (usually ~/.claude-context-manager/backups/)
 * @returns {string} Path to created backup
 * @throws {Error} If backup creation fails
 */
function createBackup(sourcePath, backupDir) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source not found for backup: ${sourcePath}`);
  }

  try {
    // Create timestamped backup directory
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')     // Replace colons
      .replace(/\..+/, '')    // Remove milliseconds
      .replace('T', '_');     // Replace T with underscore

    const sourceName = path.basename(sourcePath);
    const backupPath = path.join(backupDir, sourceName, timestamp);

    // Ensure backup directory exists
    fs.mkdirSync(backupPath, { recursive: true, mode: 0o755 });

    // Copy source to backup
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      // Copy entire directory
      const destPath = path.join(backupPath, sourceName);
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy single file
      const destPath = path.join(backupPath, sourceName);
      copyFile(sourcePath, destPath);
    }

    return backupPath;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied creating backup\nSource: ${sourcePath}\nBackup dir: ${backupDir}`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`Insufficient disk space for backup\nSource: ${sourcePath}\nBackup dir: ${backupDir}`);
    }
    throw error;
  }
}

/**
 * Validate checksum matches expected value
 * @param {string} filePath - File to validate
 * @param {string} expectedChecksum - Expected SHA256 hash
 * @returns {boolean} True if matches, false otherwise
 */
function validateChecksum(filePath, expectedChecksum) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const actualChecksum = calculateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  } catch (error) {
    // If any error occurs during validation, consider it invalid
    return false;
  }
}

// Export all functions
module.exports = {
  copyFile,
  copyDirectory,
  calculateChecksum,
  calculateDirectoryChecksum,
  createBackup,
  validateChecksum
};
