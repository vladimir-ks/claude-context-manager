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

  const normalized = path.normalize(filePath);

  // Block obvious traversal
  if (normalized.includes('..')) {
    return false;
  }

  // If allowed paths specified, check if within them
  if (allowedBasePaths.length > 0) {
    const isWithinAllowed = allowedBasePaths.some(basePath => {
      const normalizedBase = path.normalize(basePath);
      return normalized.startsWith(normalizedBase);
    });

    if (!isWithinAllowed) {
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

  // Check for traversal
  if (location.includes('..')) {
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
    os.homedir(),  // User's home directory
    path.join(__dirname, '..', '..'),  // Package installation directory
    process.cwd()  // Current working directory
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
