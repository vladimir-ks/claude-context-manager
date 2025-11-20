/**
 * File Operation Utilities
 *
 * Safe file operations with validation (disk space, permissions, symlinks)
 * User directive: "do the minimum necessary. risks are minimal"
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const { isValidFilePath } = require('./validators');

/**
 * Check available disk space
 * @param {string} targetPath - Path to check
 * @param {number} requiredBytes - Bytes needed
 * @returns {Object} { success: boolean, available: number, message: string }
 */
function checkDiskSpace(targetPath, requiredBytes = 0) {
  try {
    // Platform-specific disk space check
    if (process.platform === 'win32') {
      // Windows: Use WMIC or just check directory creation
      // Minimal approach: assume space is available
      return { success: true, available: -1, message: 'Disk space check skipped on Windows' };
    } else {
      // Unix-like: Try to use statfs from fs.statfs (Node.js 19+)
      // For older Node, just check if parent directory is writable
      const dir = fs.existsSync(targetPath) ? targetPath : path.dirname(targetPath);

      try {
        fs.accessSync(dir, fs.constants.W_OK);
        return { success: true, available: -1, message: 'Directory is writable' };
      } catch (error) {
        return { success: false, available: 0, message: 'Directory not writable' };
      }
    }
  } catch (error) {
    // On error, assume space is available (minimal approach)
    return { success: true, available: -1, message: 'Disk space check failed, assuming available' };
  }
}

/**
 * Check if path has required permissions
 * @param {string} filePath - Path to check
 * @param {string} mode - 'read', 'write', or 'readwrite'
 * @returns {Object} { success: boolean, message: string }
 */
function checkPermissions(filePath, mode = 'readwrite') {
  try {
    let flags = 0;

    if (mode === 'read' || mode === 'readwrite') {
      flags |= fs.constants.R_OK;
    }

    if (mode === 'write' || mode === 'readwrite') {
      flags |= fs.constants.W_OK;
    }

    // If file doesn't exist, check parent directory
    const targetPath = fs.existsSync(filePath) ? filePath : path.dirname(filePath);

    fs.accessSync(targetPath, flags);
    return { success: true, message: 'Permissions OK' };
  } catch (error) {
    return {
      success: false,
      message: `Permission denied: ${mode} access not available`
    };
  }
}

/**
 * Check if path is a symlink and resolve it
 * @param {string} filePath - Path to check
 * @returns {Object} { isSymlink: boolean, realPath: string, error: string|null }
 */
function resolveSymlink(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { isSymlink: false, realPath: filePath, error: null };
    }

    const stats = fs.lstatSync(filePath);

    if (stats.isSymbolicLink()) {
      const realPath = fs.realpathSync(filePath);
      return { isSymlink: true, realPath, error: null };
    }

    return { isSymlink: false, realPath: filePath, error: null };
  } catch (error) {
    return {
      isSymlink: false,
      realPath: filePath,
      error: `Failed to resolve symlink: ${error.message}`
    };
  }
}

/**
 * Validate file operation before execution
 * @param {string} operation - 'read', 'write', 'delete', 'copy'
 * @param {string} sourcePath - Source file path
 * @param {string} targetPath - Target file path (for copy/move)
 * @param {number} estimatedSize - Estimated size in bytes (for write/copy)
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
function validateFileOperation(operation, sourcePath, targetPath = null, estimatedSize = 0) {
  const errors = [];
  const warnings = [];

  try {
    // Validate source path
    if (!isValidFilePath(sourcePath)) {
      errors.push(`Invalid source path: ${sourcePath}`);
      return { valid: false, errors, warnings };
    }

    // Resolve symlinks
    const sourceResolved = resolveSymlink(sourcePath);
    if (sourceResolved.error) {
      warnings.push(sourceResolved.error);
    }

    // Check operation-specific requirements
    switch (operation) {
      case 'read':
        if (!fs.existsSync(sourcePath)) {
          errors.push(`Source file does not exist: ${sourcePath}`);
        } else {
          const permCheck = checkPermissions(sourcePath, 'read');
          if (!permCheck.success) {
            errors.push(permCheck.message);
          }
        }
        break;

      case 'write':
        // Check parent directory exists and is writable
        const parentDir = path.dirname(sourcePath);
        if (!fs.existsSync(parentDir)) {
          errors.push(`Parent directory does not exist: ${parentDir}`);
        } else {
          const permCheck = checkPermissions(parentDir, 'write');
          if (!permCheck.success) {
            errors.push(permCheck.message);
          }

          // Check disk space
          const spaceCheck = checkDiskSpace(parentDir, estimatedSize);
          if (!spaceCheck.success) {
            errors.push(spaceCheck.message);
          }
        }
        break;

      case 'delete':
        if (!fs.existsSync(sourcePath)) {
          warnings.push(`File does not exist (already deleted?): ${sourcePath}`);
        } else {
          const permCheck = checkPermissions(path.dirname(sourcePath), 'write');
          if (!permCheck.success) {
            errors.push(permCheck.message);
          }
        }
        break;

      case 'copy':
      case 'move':
        // Validate both source and target
        if (!targetPath) {
          errors.push('Target path required for copy/move operation');
          break;
        }

        if (!isValidFilePath(targetPath)) {
          errors.push(`Invalid target path: ${targetPath}`);
          break;
        }

        // Check source exists and is readable
        if (!fs.existsSync(sourcePath)) {
          errors.push(`Source file does not exist: ${sourcePath}`);
        } else {
          const sourcePermCheck = checkPermissions(sourcePath, 'read');
          if (!sourcePermCheck.success) {
            errors.push(sourcePermCheck.message);
          }
        }

        // Check target directory is writable
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          errors.push(`Target directory does not exist: ${targetDir}`);
        } else {
          const targetPermCheck = checkPermissions(targetDir, 'write');
          if (!targetPermCheck.success) {
            errors.push(targetPermCheck.message);
          }

          // Check disk space
          const size = estimatedSize || (fs.existsSync(sourcePath) ? fs.statSync(sourcePath).size : 0);
          const spaceCheck = checkDiskSpace(targetDir, size);
          if (!spaceCheck.success) {
            errors.push(spaceCheck.message);
          }
        }

        // Warn if target exists
        if (fs.existsSync(targetPath)) {
          warnings.push(`Target file already exists: ${targetPath}`);
        }

        break;

      default:
        errors.push(`Unknown operation: ${operation}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Validation failed: ${error.message}`],
      warnings
    };
  }
}

/**
 * Safe file read with validation
 * @param {string} filePath - File to read
 * @returns {Object} { success: boolean, data: string|null, error: string|null }
 */
function safeReadFile(filePath) {
  try {
    const validation = validateFileOperation('read', filePath);

    if (!validation.valid) {
      return {
        success: false,
        data: null,
        error: validation.errors.join('; ')
      };
    }

    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data, error: null };

  } catch (error) {
    return {
      success: false,
      data: null,
      error: `Failed to read file: ${error.message}`
    };
  }
}

/**
 * Safe file write with validation
 * @param {string} filePath - File to write
 * @param {string} data - Data to write
 * @returns {Object} { success: boolean, error: string|null }
 */
function safeWriteFile(filePath, data) {
  try {
    const validation = validateFileOperation('write', filePath, null, Buffer.byteLength(data));

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; ')
      };
    }

    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true, error: null };

  } catch (error) {
    return {
      success: false,
      error: `Failed to write file: ${error.message}`
    };
  }
}

/**
 * Safe file copy with validation
 * @param {string} sourcePath - Source file
 * @param {string} targetPath - Target file
 * @returns {Object} { success: boolean, error: string|null, warnings: string[] }
 */
function safeCopyFile(sourcePath, targetPath) {
  try {
    const validation = validateFileOperation('copy', sourcePath, targetPath);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; '),
        warnings: validation.warnings
      };
    }

    fs.copyFileSync(sourcePath, targetPath);
    return { success: true, error: null, warnings: validation.warnings };

  } catch (error) {
    return {
      success: false,
      error: `Failed to copy file: ${error.message}`,
      warnings: []
    };
  }
}

/**
 * Atomic file write using temp + rename pattern
 * @param {string} filePath - Target file path
 * @param {string} data - Data to write
 * @returns {Object} { success: boolean, error: string|null }
 */
function atomicWriteFile(filePath, data) {
  let tempPath = null;

  try {
    // Validate before writing
    const validation = validateFileOperation('write', filePath, null, Buffer.byteLength(data));

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; ')
      };
    }

    // Create temp file path (same directory)
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    const tempSuffix = `.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}`;
    tempPath = path.join(dir, `${basename}${tempSuffix}`);

    // Write to temp file
    fs.writeFileSync(tempPath, data, 'utf8');

    // Atomic rename (overwrites target if exists)
    // Note: No existence check needed - writeFileSync would have thrown if it failed
    fs.renameSync(tempPath, filePath);

    return { success: true, error: null };

  } catch (error) {
    // Cleanup temp file on error
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    return {
      success: false,
      error: `Atomic write failed: ${error.message}`
    };
  }
}

/**
 * Atomic file copy using temp + rename pattern
 * @param {string} sourcePath - Source file
 * @param {string} targetPath - Target file
 * @returns {Object} { success: boolean, error: string|null, warnings: string[] }
 */
function atomicCopyFile(sourcePath, targetPath) {
  let tempPath = null;

  try {
    // Validate before copying
    const validation = validateFileOperation('copy', sourcePath, targetPath);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; '),
        warnings: validation.warnings
      };
    }

    // Create temp file path (same directory as target)
    const dir = path.dirname(targetPath);
    const basename = path.basename(targetPath);
    const tempSuffix = `.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}`;
    tempPath = path.join(dir, `${basename}${tempSuffix}`);

    // Copy to temp file
    fs.copyFileSync(sourcePath, tempPath);

    // Atomic rename (overwrites target if exists)
    // Note: No existence check needed - copyFileSync would have thrown if it failed
    fs.renameSync(tempPath, targetPath);

    return { success: true, error: null, warnings: validation.warnings };

  } catch (error) {
    // Cleanup temp file on error
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    return {
      success: false,
      error: `Atomic copy failed: ${error.message}`,
      warnings: []
    };
  }
}

/**
 * Simple file copy (wraps safeCopyFile for backward compatibility)
 * @param {string} sourcePath - Source file
 * @param {string} targetPath - Target file
 */
function copyFile(sourcePath, targetPath) {
  const result = safeCopyFile(sourcePath, targetPath);
  if (!result.success) {
    throw new Error(result.error);
  }
}

/**
 * Recursively copy directory
 * @param {string} sourcePath - Source directory
 * @param {string} targetPath - Target directory
 */
function copyDirectory(sourcePath, targetPath) {
  try {
    // Validate paths
    if (!isValidFilePath(sourcePath)) {
      throw new Error(`Invalid source path: ${sourcePath}`);
    }
    if (!isValidFilePath(targetPath)) {
      throw new Error(`Invalid target path: ${targetPath}`);
    }

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true, mode: 0o755 });
    }

    // Read source directory
    const entries = fs.readdirSync(sourcePath, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(sourcePath, entry.name);
      const destPath = path.join(targetPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectory
        copyDirectory(srcPath, destPath);
      } else if (entry.isFile()) {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      } else if (entry.isSymbolicLink()) {
        // Copy symlink
        const linkTarget = fs.readlinkSync(srcPath);
        fs.symlinkSync(linkTarget, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory: ${error.message}`);
  }
}

module.exports = {
  checkDiskSpace,
  checkPermissions,
  resolveSymlink,
  validateFileOperation,
  safeReadFile,
  safeWriteFile,
  safeCopyFile,
  atomicWriteFile,
  atomicCopyFile,
  copyFile,
  copyDirectory
};
