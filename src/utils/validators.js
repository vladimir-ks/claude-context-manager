/**
 * Input Validation Utilities
 *
 * Minimal validation helpers to prevent common security issues
 * User directive: "do the minimum necessary. risks are minimal"
 *
 * Author: Vladimir K.S.
 */

const path = require('path');
const os = require('os');

/**
 * Validate artifact name
 * Allows: alphanumeric, dash, underscore, dot
 * Blocks: path traversal, special chars
 *
 * @param {string} name - Artifact name to validate
 * @returns {boolean} True if valid
 */
function isValidArtifactName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Check length
  if (name.length < 1 || name.length > 100) {
    return false;
  }

  // Allow alphanumeric, dash, underscore, dot only
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(name)) {
    return false;
  }

  // Block path traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return false;
  }

  // Block hidden files
  if (name.startsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Validate file path - check for traversal attempts
 *
 * @param {string} filePath - Path to validate
 * @param {string[]} allowedBasePaths - Array of allowed base directories
 * @returns {boolean} True if valid
 */
function isValidFilePath(filePath, allowedBasePaths = []) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }

  // Use path.resolve to normalize and resolve any .. or . segments
  const resolved = path.resolve(filePath);

  // If allowed paths specified, check if within them
  if (allowedBasePaths.length > 0) {
    const isWithinAllowed = allowedBasePaths.some(basePath => {
      const resolvedBase = path.resolve(basePath);
      // Check if resolved path starts with resolved base
      // This prevents traversal attacks including URL-encoded variants
      return resolved.startsWith(resolvedBase + path.sep) || resolved === resolvedBase;
    });

    if (!isWithinAllowed) {
      return false;
    }
  } else {
    // If no allowed paths specified, block paths with .. traversal
    // This catches obvious traversal attempts when no base paths given
    if (filePath.includes('..')) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize string for GitHub API
 * Remove potentially dangerous characters
 *
 * @param {string} input - String to sanitize
 * @param {number} maxLength - Maximum length (default 10000)
 * @returns {string} Sanitized string
 */
function sanitizeForGitHub(input, maxLength = 10000) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim to max length
  let sanitized = input.substring(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Validate artifact type
 *
 * @param {string} type - Artifact type
 * @returns {boolean} True if valid
 */
function isValidArtifactType(type) {
  const validTypes = ['skill', 'command', 'agent', 'package', 'command_group'];
  return validTypes.includes(type);
}

/**
 * Validate location
 *
 * @param {string} location - Installation location
 * @returns {boolean} True if valid
 */
function isValidLocation(location) {
  if (!location || typeof location !== 'string') {
    return false;
  }

  // 'global' is always valid
  if (location === 'global') {
    return true;
  }

  // Otherwise should be absolute path
  if (!path.isAbsolute(location)) {
    return false;
  }

  // Use path.resolve to check for traversal (handles URL-encoded and other variants)
  const resolved = path.resolve(location);
  const normalized = path.normalize(location);

  // If resolve changed the path significantly, it contained traversal
  if (resolved !== path.resolve(normalized)) {
    return false;
  }

  return true;
}

/**
 * Get default allowed base paths for file operations
 *
 * @returns {string[]} Array of allowed base paths
 */
function getDefaultAllowedPaths() {
  return [
    os.homedir(), // User's home directory
    path.join(__dirname, '..', '..'), // Package installation directory
    process.cwd() // Current working directory
  ];
}

module.exports = {
  isValidArtifactName,
  isValidFilePath,
  sanitizeForGitHub,
  isValidArtifactType,
  isValidLocation,
  getDefaultAllowedPaths
};
